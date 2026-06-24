import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  UserState,
  DailyTask,
  SkillType,
  CEFRLevel,
  GameItem,
} from '../types';
import { studyPlans, shopItems } from '../data/gameData';

// ===== Storage Key =====
const STORAGE_KEY = 'englishquest_user';

// ===== 初始用户状态 =====
const initialUserState: UserState = {
  id: 'user-default',
  name: '冒险者',
  avatar: '🦊',
  level: 1,
  xp: 0,
  coins: 100,
  gems: 10,
  streak: 0,
  lastStudyDate: null,
  membership: 'free',
  examDate: null,
  dailyGoalMinutes: 30,
  totalStudyTime: 0,
  totalTasksCompleted: 0,
  skills: {
    vocabulary: 50,
    grammar: 50,
    reading: 50,
    listening: 50,
    writing: 50,
    speaking: 50,
  },
  cefrLevel: null,
  assessmentCompleted: false,
  studyPlanPhase: 0,
  rankTier: '青铜学徒',
  rankPoints: 0,
  inventory: [],
  achievements: [],
  unlockedThemes: [],
  studyCalendar: {},
  shieldCount: 1,
};

// ===== 从 studyPlans 第一阶段初始化今日任务 =====
function initTodayTasks(): DailyTask[] {
  const phase1 = studyPlans.find((p) => p.phase === 1);
  if (!phase1) return [];
  return phase1.dailyTasks.map((task) => ({ ...task, completed: false }));
}

// ===== State 接口 =====
export interface State {
  user: UserState;
  todayTasks: DailyTask[];
}

const initialState: State = {
  user: initialUserState,
  todayTasks: initTodayTasks(),
};

// ===== Action 类型 =====
export type Action =
  | { type: 'COMPLETE_TASK'; taskId: string }
  | { type: 'ADD_XP'; amount: number }
  | { type: 'ADD_COINS'; amount: number }
  | { type: 'SPEND_COINS'; amount: number }
  | { type: 'ADD_GEMS'; amount: number }
  | { type: 'SPEND_GEMS'; amount: number }
  | { type: 'UPDATE_STREAK' }
  | { type: 'UPDATE_SKILL'; skill: SkillType; delta: number }
  | {
      type: 'COMPLETE_ASSESSMENT';
      cefrLevel: CEFRLevel;
      skills: Record<SkillType, number>;
    }
  | { type: 'SET_EXAM_DATE'; date: string }
  | { type: 'SET_DAILY_GOAL'; minutes: number }
  | { type: 'BUY_ITEM'; item: GameItem }
  | { type: 'USE_ITEM'; itemId: string }
  | { type: 'UNLOCK_ACHIEVEMENT'; achievementId: string }
  | { type: 'UNLOCK_THEME'; themeId: string }
  | { type: 'UPDATE_STUDY_PLAN_PHASE'; phase: number }
  | { type: 'UPDATE_RANK'; rankTier: string; rankPoints: number }
  | { type: 'RESET_USER' }
  | { type: 'LOAD_STATE'; state: State };

// ===== 工具函数 =====
function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysBetween(prev: string, today: string): number {
  const p = new Date(prev + 'T00:00:00');
  const t = new Date(today + 'T00:00:00');
  return Math.round((t.getTime() - p.getTime()) / (1000 * 60 * 60 * 24));
}

function clampSkill(value: number): number {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

// 升级计算：每级需要 level*100 XP，可连续升级
function applyXP(user: UserState, amount: number): UserState {
  let { level, xp } = user;
  xp += amount;
  while (xp >= level * 100) {
    xp -= level * 100;
    level += 1;
  }
  return { ...user, level, xp };
}

// 连胜更新：比较上次学习日期和今天
function applyStreak(user: UserState): UserState {
  const today = todayStr();
  if (user.lastStudyDate === today) {
    // 今天已记录，不重复增加
    return user;
  }
  let newStreak = user.streak;
  if (user.lastStudyDate) {
    const diff = daysBetween(user.lastStudyDate, today);
    if (diff === 1) {
      newStreak = user.streak + 1;
    } else if (diff === 2) {
      // 断签一天，若有护盾则保护，连胜+1，消耗一个护盾
      if (user.shieldCount > 0) {
        newStreak = user.streak + 1;
        return {
          ...user,
          streak: newStreak,
          lastStudyDate: today,
          shieldCount: user.shieldCount - 1,
        };
      }
      newStreak = 0;
    } else {
      // 断签超过一天，归零
      newStreak = 0;
    }
  } else {
    // 首次学习
    newStreak = 1;
  }
  return { ...user, streak: newStreak, lastStudyDate: today };
}

// ===== Reducer =====
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.state;

    case 'COMPLETE_TASK': {
      const task = state.todayTasks.find((t) => t.id === action.taskId);
      if (!task || task.completed) return state;

      // 标记任务完成
      const todayTasks = state.todayTasks.map((t) =>
        t.id === action.taskId ? { ...t, completed: true } : t,
      );

      // 更新用户状态：增加 XP/金币、技能值、连胜、学习日历
      let newUser = { ...state.user };
      newUser = applyXP(newUser, task.xpReward);
      newUser = {
        ...newUser,
        coins: newUser.coins + task.coinReward,
        totalStudyTime: newUser.totalStudyTime + task.estimatedMinutes,
        totalTasksCompleted: newUser.totalTasksCompleted + 1,
      };
      // 技能值增加 2-5 点（基于任务 xpReward 取模映射）
      const skillDelta = 2 + (task.xpReward % 4); // 2..5
      const skills = {
        ...newUser.skills,
        [task.module]: clampSkill(newUser.skills[task.module] + skillDelta),
      };
      newUser = { ...newUser, skills };
      // 连胜与日历
      newUser = applyStreak(newUser);
      newUser = {
        ...newUser,
        studyCalendar: { ...newUser.studyCalendar, [todayStr()]: true },
      };

      return { ...state, user: newUser, todayTasks };
    }

    case 'ADD_XP': {
      return { ...state, user: applyXP(state.user, action.amount) };
    }

    case 'ADD_COINS':
      return {
        ...state,
        user: { ...state.user, coins: state.user.coins + action.amount },
      };

    case 'SPEND_COINS': {
      if (state.user.coins < action.amount) return state;
      return {
        ...state,
        user: { ...state.user, coins: state.user.coins - action.amount },
      };
    }

    case 'ADD_GEMS':
      return {
        ...state,
        user: { ...state.user, gems: state.user.gems + action.amount },
      };

    case 'SPEND_GEMS': {
      if (state.user.gems < action.amount) return state;
      return {
        ...state,
        user: { ...state.user, gems: state.user.gems - action.amount },
      };
    }

    case 'UPDATE_STREAK':
      return { ...state, user: applyStreak(state.user) };

    case 'UPDATE_SKILL':
      return {
        ...state,
        user: {
          ...state.user,
          skills: {
            ...state.user.skills,
            [action.skill]: clampSkill(
              state.user.skills[action.skill] + action.delta,
            ),
          },
        },
      };

    case 'COMPLETE_ASSESSMENT':
      return {
        ...state,
        user: {
          ...state.user,
          assessmentCompleted: true,
          cefrLevel: action.cefrLevel,
          skills: { ...action.skills },
        },
      };

    case 'SET_EXAM_DATE':
      return {
        ...state,
        user: { ...state.user, examDate: action.date },
      };

    case 'SET_DAILY_GOAL':
      return {
        ...state,
        user: { ...state.user, dailyGoalMinutes: action.minutes },
      };

    case 'BUY_ITEM': {
      const { item } = action;
      if (item.currency === 'coins' && state.user.coins < item.price) return state;
      if (item.currency === 'gems' && state.user.gems < item.price) return state;

      const newUser = { ...state.user };
      if (item.currency === 'coins') {
        newUser.coins -= item.price;
      } else {
        newUser.gems -= item.price;
      }
      // 购买护盾道具时直接增加 shieldCount
      if (item.id === 'item-shield') {
        newUser.shieldCount = newUser.shieldCount + 1;
      }
      newUser.inventory = [...newUser.inventory, item];
      return { ...state, user: newUser };
    }

    case 'USE_ITEM': {
      const idx = state.user.inventory.findIndex((i) => i.id === action.itemId);
      if (idx === -1) return state;
      const inventory = [...state.user.inventory];
      inventory.splice(idx, 1);
      return { ...state, user: { ...state.user, inventory } };
    }

    case 'UNLOCK_ACHIEVEMENT': {
      if (state.user.achievements.includes(action.achievementId)) return state;
      return {
        ...state,
        user: {
          ...state.user,
          achievements: [...state.user.achievements, action.achievementId],
        },
      };
    }

    case 'UNLOCK_THEME': {
      if (state.user.unlockedThemes.includes(action.themeId)) return state;
      return {
        ...state,
        user: {
          ...state.user,
          unlockedThemes: [...state.user.unlockedThemes, action.themeId],
        },
      };
    }

    case 'UPDATE_STUDY_PLAN_PHASE':
      return {
        ...state,
        user: { ...state.user, studyPlanPhase: action.phase },
      };

    case 'UPDATE_RANK':
      return {
        ...state,
        user: {
          ...state.user,
          rankTier: action.rankTier,
          rankPoints: action.rankPoints,
        },
      };

    case 'RESET_USER':
      return {
        user: { ...initialUserState },
        todayTasks: initTodayTasks(),
      };

    default:
      return state;
  }
}

// ===== Context 类型 =====
interface StoreContextValue {
  state: State;
  dispatch: React.Dispatch<Action>;
  helperFunctions: {
    completeTask: (taskId: string) => void;
    addXP: (amount: number) => void;
    addCoins: (amount: number) => void;
    spendCoins: (amount: number) => void;
    addGems: (amount: number) => void;
    spendGems: (amount: number) => void;
    updateStreak: () => void;
    updateSkill: (skill: SkillType, delta: number) => void;
    completeAssessment: (
      cefrLevel: CEFRLevel,
      skills: Record<SkillType, number>,
    ) => void;
    setExamDate: (date: string) => void;
    setDailyGoal: (minutes: number) => void;
    buyItem: (item: GameItem) => void;
    useItem: (itemId: string) => void;
    unlockAchievement: (achievementId: string) => void;
    unlockTheme: (themeId: string) => void;
    updateStudyPlanPhase: (phase: number) => void;
    updateRank: (rankTier: string, rankPoints: number) => void;
    resetUser: () => void;
  };
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

// ===== localStorage 加载 =====
function loadFromStorage(): State | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as State;
    // 基本校验
    if (!parsed.user || !Array.isArray(parsed.todayTasks)) return null;
    // 合并默认字段，避免老数据缺字段
    return {
      user: { ...initialUserState, ...parsed.user },
      todayTasks: parsed.todayTasks,
    };
  } catch {
    return null;
  }
}

// ===== Provider 组件 =====
export const StoreProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    if (typeof window === 'undefined') return init;
    const loaded = loadFromStorage();
    return loaded ?? init;
  });

  // 状态变化自动保存到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 忽略写入错误（如配额超出）
    }
  }, [state]);

  // helperFunctions
  const completeTask = useCallback(
    (taskId: string) => dispatch({ type: 'COMPLETE_TASK', taskId }),
    [],
  );
  const addXP = useCallback(
    (amount: number) => dispatch({ type: 'ADD_XP', amount }),
    [],
  );
  const addCoins = useCallback(
    (amount: number) => dispatch({ type: 'ADD_COINS', amount }),
    [],
  );
  const spendCoins = useCallback(
    (amount: number) => dispatch({ type: 'SPEND_COINS', amount }),
    [],
  );
  const addGems = useCallback(
    (amount: number) => dispatch({ type: 'ADD_GEMS', amount }),
    [],
  );
  const spendGems = useCallback(
    (amount: number) => dispatch({ type: 'SPEND_GEMS', amount }),
    [],
  );
  const updateStreak = useCallback(() => dispatch({ type: 'UPDATE_STREAK' }), []);
  const updateSkill = useCallback(
    (skill: SkillType, delta: number) =>
      dispatch({ type: 'UPDATE_SKILL', skill, delta }),
    [],
  );
  const completeAssessment = useCallback(
    (cefrLevel: CEFRLevel, skills: Record<SkillType, number>) =>
      dispatch({ type: 'COMPLETE_ASSESSMENT', cefrLevel, skills }),
    [],
  );
  const setExamDate = useCallback(
    (date: string) => dispatch({ type: 'SET_EXAM_DATE', date }),
    [],
  );
  const setDailyGoal = useCallback(
    (minutes: number) => dispatch({ type: 'SET_DAILY_GOAL', minutes }),
    [],
  );
  const buyItem = useCallback(
    (item: GameItem) => dispatch({ type: 'BUY_ITEM', item }),
    [],
  );
  const useItem = useCallback(
    (itemId: string) => dispatch({ type: 'USE_ITEM', itemId }),
    [],
  );
  const unlockAchievement = useCallback(
    (achievementId: string) =>
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', achievementId }),
    [],
  );
  const unlockTheme = useCallback(
    (themeId: string) => dispatch({ type: 'UNLOCK_THEME', themeId }),
    [],
  );
  const updateStudyPlanPhase = useCallback(
    (phase: number) => dispatch({ type: 'UPDATE_STUDY_PLAN_PHASE', phase }),
    [],
  );
  const updateRank = useCallback(
    (rankTier: string, rankPoints: number) =>
      dispatch({ type: 'UPDATE_RANK', rankTier, rankPoints }),
    [],
  );
  const resetUser = useCallback(() => dispatch({ type: 'RESET_USER' }), []);

  const helperFunctions = useMemo(
    () => ({
      completeTask,
      addXP,
      addCoins,
      spendCoins,
      addGems,
      spendGems,
      updateStreak,
      updateSkill,
      completeAssessment,
      setExamDate,
      setDailyGoal,
      buyItem,
      useItem,
      unlockAchievement,
      unlockTheme,
      updateStudyPlanPhase,
      updateRank,
      resetUser,
    }),
    [
      completeTask,
      addXP,
      addCoins,
      spendCoins,
      addGems,
      spendGems,
      updateStreak,
      updateSkill,
      completeAssessment,
      setExamDate,
      setDailyGoal,
      buyItem,
      useItem,
      unlockAchievement,
      unlockTheme,
      updateStudyPlanPhase,
      updateRank,
      resetUser,
    ],
  );

  const value = useMemo(
    () => ({ state, dispatch, helperFunctions }),
    [state, helperFunctions],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};

// ===== useStore Hook =====
export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
}

// ===== 导出便捷常量 =====
export { initialUserState, STORAGE_KEY, shopItems };
