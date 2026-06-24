import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Castle,
  Lock,
  CheckCircle2,
  Star,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Zap,
  Coins,
  Sparkles,
  Trophy,
  Swords,
  Target,
  RotateCcw,
  Lightbulb,
  Crown,
  ChevronRight,
  PencilLine,
  AlertCircle,
  RefreshCw,
  ListChecks,
  X,
  ScrollText,
} from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { grammarTopics } from '../data/grammar';
import { GrammarTopic, GrammarExercise } from '../types';
import ProgressBar from '../components/ui/ProgressBar';
import RewardPopup from '../components/game/RewardPopup';
import Confetti from '../components/ui/Confetti';

// ===== 类型定义 =====
type View = 'dungeon-map' | 'learn' | 'practice' | 'boss' | 'result';

interface BossResult {
  correct: number;
  total: number;
  conquered: boolean;
  xp: number;
  coins: number;
}

// ===== 工具函数 =====
function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,!?;:]+$/, '');
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// 判断用户答案是否正确
function isExerciseCorrect(ex: GrammarExercise, userAnswer: string): boolean {
  if (!userAnswer.trim()) return false;
  const a = norm(userAnswer);
  const b = norm(ex.answer);
  if (a === b) return true;
  // 多种可接受答案：用 / 分隔
  const alternatives = ex.answer
    .split('/')
    .map((s) => norm(s))
    .filter(Boolean);
  if (alternatives.includes(a)) return true;
  // 包含关系（用户答案包含在标准答案中，允许略简）
  if (b.includes(a) && a.length >= b.length * 0.6) return true;
  return false;
}

// 题型中文名
const EX_TYPE_LABEL: Record<GrammarExercise['type'], string> = {
  'fill-blank': '填空题',
  'error-correction': '改错题',
  'transformation': '句型转换',
  'multiple-choice': '选择题',
};

// 题型图标
const EX_TYPE_ICON: Record<GrammarExercise['type'], typeof PencilLine> = {
  'fill-blank': PencilLine,
  'error-correction': AlertCircle,
  'transformation': RefreshCw,
  'multiple-choice': ListChecks,
};

// 题型主题色
const EX_TYPE_GRADIENT: Record<GrammarExercise['type'], string> = {
  'fill-blank': 'from-blue-500 to-cyan-500',
  'error-correction': 'from-rose-500 to-pink-500',
  'transformation': 'from-purple-500 to-fuchsia-500',
  'multiple-choice': 'from-amber-500 to-orange-500',
};

// 难度星级
function renderDifficulty(level: number) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${
            i < level
              ? 'fill-amber-400 text-amber-400'
              : 'fill-dark-100 text-dark-200'
          }`}
        />
      ))}
    </div>
  );
}

// 高亮规则文本中的关键术语
function renderHighlightedRule(rule: string) {
  // 用顿号、分号、句号切分，给关键片段高亮
  // 简单策略：括号内的内容、含"注意"的句子高亮
  const segments = rule.split(/([。；])/);
  return segments.map((seg, idx) => {
    const isNote = /注意|FCE|考点|重点/.test(seg);
    const hasParen = /[（(]/.test(seg);
    if (isNote) {
      return (
        <span
          key={idx}
          className="rounded bg-amber-100 px-1 py-0.5 text-amber-800"
        >
          {seg}
        </span>
      );
    }
    if (hasParen) {
      return (
        <span key={idx} className="font-semibold text-purple-700">
          {seg}
        </span>
      );
    }
    return <span key={idx}>{seg}</span>;
  });
}

// 高亮例句中的关键语法结构
function renderHighlightedSentence(sentence: string) {
  // 简单策略：高亮含动词的短语（have been / will be / had been / would have / should 等）
  const patterns = [
    /\b(have been|has been|had been|will be|will have|would have|should have|would rather|it is|it's|were|was|had|has|have)\b/gi,
    /\b(if|when|by the time|unless|provided that)\b/gi,
    /\b(should|would|could|might|must|shall|may|can)\b/gi,
  ];
  let parts: { text: string; highlight: boolean }[] = [{ text: sentence, highlight: false }];
  patterns.forEach((pattern) => {
    const newParts: { text: string; highlight: boolean }[] = [];
    parts.forEach((p) => {
      if (p.highlight) {
        newParts.push(p);
        return;
      }
      let lastIndex = 0;
      const matches = [...p.text.matchAll(pattern)];
      matches.forEach((m) => {
        const start = m.index ?? 0;
        const end = start + m[0].length;
        if (start > lastIndex) {
          newParts.push({ text: p.text.slice(lastIndex, start), highlight: false });
        }
        newParts.push({ text: m[0], highlight: true });
        lastIndex = end;
      });
      if (lastIndex < p.text.length) {
        newParts.push({ text: p.text.slice(lastIndex), highlight: false });
      }
    });
    parts = newParts;
  });
  return parts.map((p, idx) =>
    p.highlight ? (
      <span key={idx} className="rounded bg-primary-100 px-1 font-bold text-primary-700">
        {p.text}
      </span>
    ) : (
      <span key={idx}>{p.text}</span>
    ),
  );
}

// ===== 主组件 =====
const GrammarPage: React.FC = () => {
  const { state, helperFunctions } = useStore();
  const { user } = state;

  const [view, setView] = useState<View>('dungeon-map');
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [exercises, setExercises] = useState<GrammarExercise[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [rewardTrigger, setRewardTrigger] = useState(0);
  const [rewardData, setRewardData] = useState({ xp: 0, coins: 0, title: '奖励到手！' });
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [bossResult, setBossResult] = useState<BossResult | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeTopic = useMemo(
    () => grammarTopics.find((t) => t.id === activeTopicId) ?? null,
    [activeTopicId],
  );

  // 语法点是否已完成（用 user.unlockedThemes + grammar- 前缀标记）
  const grammarCompletedKey = (topicId: string) => `grammar-${topicId}`;
  const isTopicCompleted = useCallback(
    (topicId: string) => user.unlockedThemes.includes(grammarCompletedKey(topicId)),
    [user.unlockedThemes],
  );

  // 清理定时器
  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  const currentExercise = exercises[currentIdx];
  const progress =
    exercises.length > 0 ? (currentIdx / exercises.length) * 100 : 0;

  // ===== 进入语法点学习 =====
  const handleEnterTopic = (topic: GrammarTopic) => {
    setActiveTopicId(topic.id);
    setView('learn');
  };

  // ===== 开始练习 =====
  const handleStartPractice = () => {
    if (!activeTopic) return;
    setExercises(activeTopic.exercises);
    setCurrentIdx(0);
    setCorrectCount(0);
    setSelectedOption(null);
    setInputValue('');
    setFeedback(null);
    setView('practice');
  };

  // ===== 开始 Boss 战（从 exercises 随机抽 3-5 题） =====
  const handleStartBoss = () => {
    if (!activeTopic) return;
    const pool = activeTopic.exercises;
    const n = Math.min(Math.max(3, Math.ceil(pool.length * 0.8)), 5);
    const qs = shuffle(pool).slice(0, n);
    setExercises(qs);
    setCurrentIdx(0);
    setCorrectCount(0);
    setSelectedOption(null);
    setInputValue('');
    setFeedback(null);
    setView('boss');
  };

  // ===== 提交答案 =====
  const handleSubmit = (answer: string) => {
    if (!currentExercise || feedback) return;
    const correct = isExerciseCorrect(currentExercise, answer);
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      setCorrectCount((c) => c + 1);
      if (view === 'practice') {
        helperFunctions.addXP(3);
        helperFunctions.addCoins(4);
      }
    }
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      goToNext();
    }, 2200);
  };

  const handleSelectOption = (opt: string) => {
    if (feedback) return;
    setSelectedOption(opt);
    handleSubmit(opt);
  };

  const handleInputSubmit = () => {
    if (!inputValue.trim() || feedback) return;
    handleSubmit(inputValue.trim());
  };

  const goToNext = useCallback(() => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    if (currentIdx < exercises.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setInputValue('');
      setFeedback(null);
    } else {
      finishSession();
    }
  }, [currentIdx, exercises.length]);

  // ===== 完成练习 / Boss 战 =====
  const finishSession = () => {
    if (view === 'practice') {
      // 练习完成 -> 进入 Boss 战
      handleStartBoss();
      return;
    }

    // Boss 战完成
    const total = exercises.length;
    const conquered = correctCount === total;
    const xpReward = conquered ? 60 : correctCount * 8;
    const coinReward = conquered ? 90 : correctCount * 12;

    helperFunctions.addXP(xpReward);
    helperFunctions.addCoins(coinReward);
    helperFunctions.updateSkill('grammar', conquered ? 6 : 2);
    helperFunctions.updateStreak();

    if (conquered && activeTopic) {
      const key = grammarCompletedKey(activeTopic.id);
      if (!user.unlockedThemes.includes(key)) {
        helperFunctions.unlockTheme(key);
      }
      helperFunctions.unlockAchievement(`grammar-boss-${activeTopic.id}`);
      setConfettiTrigger((t) => t + 1);
    }

    setRewardData({
      xp: xpReward,
      coins: coinReward,
      title: conquered ? '地下城通关！' : '挑战完成',
    });
    setBossResult({ correct: correctCount, total, conquered, xp: xpReward, coins: coinReward });
    setRewardTrigger((t) => t + 1);
    setView('result');
  };

  // ===== 返回地图 =====
  const handleBackToMap = () => {
    setView('dungeon-map');
    setActiveTopicId(null);
    setExercises([]);
    setCurrentIdx(0);
    setCorrectCount(0);
    setBossResult(null);
  };

  // ===== 重新挑战 Boss =====
  const handleRetryBoss = () => {
    if (!activeTopic) return;
    handleStartBoss();
    setBossResult(null);
  };

  // ===== 渲染：地下城地图 =====
  const renderDungeonMap = () => {
    const completedCount = grammarTopics.filter((t) => isTopicCompleted(t.id)).length;
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {grammarTopics.map((topic, idx) => {
            const completed = isTopicCompleted(topic.id);
            const isActive = activeTopicId === topic.id;
            return (
              <motion.button
                key={topic.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleEnterTopic(topic)}
                className={`relative overflow-hidden rounded-2xl border p-5 text-left shadow-sm transition-all ${
                  completed
                    ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-md'
                    : isActive
                      ? 'border-primary-300 bg-gradient-to-br from-primary-50 to-white shadow-md ring-2 ring-primary-200'
                      : 'border-dark-100 bg-white hover:border-primary-200 hover:shadow-md'
                }`}
              >
                {/* 顶部装饰色条 */}
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-purple-500 to-fuchsia-500" />

                {/* 背景大图标 */}
                <div
                  className="pointer-events-none absolute -right-4 -top-4 text-7xl opacity-10"
                  aria-hidden
                >
                  🏰
                </div>

                {/* 完成徽章 */}
                {completed && (
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 px-2.5 py-1 text-[10px] font-bold text-white shadow">
                    <Crown className="h-3 w-3" />
                    已通关
                  </div>
                )}

                <div className="relative flex items-start gap-4">
                  {/* 关卡编号 */}
                  <div
                    className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-sm ${
                      completed
                        ? 'bg-gradient-to-br from-purple-500 to-fuchsia-500'
                        : 'bg-gradient-to-br from-slate-600 to-slate-800'
                    }`}
                  >
                    {completed ? (
                      <Trophy className="h-7 w-7" />
                    ) : (
                      <span className="text-xl font-extrabold">{idx + 1}</span>
                    )}
                  </div>

                  {/* 关卡信息 */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-dark-900">
                        {topic.name}
                      </h3>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-dark-400">
                        {topic.nameEn}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="badge bg-purple-50 text-[10px] text-purple-700">
                        <ScrollText className="h-3 w-3" />
                        {topic.category}
                      </span>
                      {renderDifficulty(topic.difficulty)}
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-dark-500">
                      {topic.description}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-dark-400">
                      <span className="flex items-center gap-1">
                        <ListChecks className="h-3 w-3" />
                        {topic.exercises.length} 道练习
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {topic.examples.length} 个例句
                      </span>
                      {completed ? (
                        <span className="flex items-center gap-1 text-purple-600">
                          <CheckCircle2 className="h-3 w-3" />
                          通关
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-primary-600">
                          <Sparkles className="h-3 w-3" />
                          可挑战
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="mt-1 h-5 w-5 flex-shrink-0 text-dark-300" />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* 通关进度 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card flex flex-col items-center gap-4 p-5 sm:flex-row"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white shadow">
            <Castle className="h-6 w-6" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="text-xs text-dark-400">地下城通关进度</div>
            <div className="text-base font-bold text-dark-900">
              {completedCount} / {grammarTopics.length} 个关卡
            </div>
          </div>
          <div className="w-full sm:w-48">
            <ProgressBar
              value={(completedCount / grammarTopics.length) * 100}
              color="from-purple-500 to-fuchsia-500"
              height="h-2.5"
              showLabel
              label="总进度"
            />
          </div>
        </motion.div>
      </div>
    );
  };

  // ===== 渲染：学习界面 =====
  const renderLearn = () => {
    if (!activeTopic) return null;
    const completed = isTopicCompleted(activeTopic.id);
    return (
      <div className="space-y-5">
        {/* 主题头部 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-fuchsia-500 to-rose-500 p-5 text-white shadow-lg"
        >
          <div className="pointer-events-none absolute -right-8 -top-8 text-9xl opacity-20">
            🏰
          </div>
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-medium text-white/80">
              <Castle className="h-3.5 w-3.5" />
              {activeTopic.nameEn}
              <span className="rounded-full bg-white/20 px-2 py-0.5">
                {activeTopic.category}
              </span>
              {completed && (
                <span className="ml-1 flex items-center gap-1 rounded-full bg-white/25 px-2 py-0.5">
                  <Crown className="h-3 w-3" /> 已通关
                </span>
              )}
            </div>
            <h2 className="mt-1 text-2xl font-extrabold">{activeTopic.name}</h2>
            <p className="mt-1 text-sm text-white/90">{activeTopic.description}</p>
            <div className="mt-3 flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1">
                难度
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < activeTopic.difficulty
                        ? 'fill-white text-white'
                        : 'fill-white/20 text-white/20'
                    }`}
                  />
                ))}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1">
                <ListChecks className="h-3 w-3" />
                {activeTopic.exercises.length} 道练习
              </span>
            </div>
          </div>
        </motion.div>

        {/* 规则讲解 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card overflow-hidden"
        >
          <div className="flex items-center gap-2 border-b border-dark-100 bg-dark-50/60 px-5 py-3">
            <BookOpen className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-bold text-dark-800">规则讲解</span>
          </div>
          <div className="p-5">
            <p className="text-sm leading-7 text-dark-700">
              {renderHighlightedRule(activeTopic.rule)}
            </p>
          </div>
        </motion.div>

        {/* 例句分析 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card overflow-hidden"
        >
          <div className="flex items-center gap-2 border-b border-dark-100 bg-dark-50/60 px-5 py-3">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-bold text-dark-800">例句分析</span>
            <span className="ml-auto text-[11px] text-dark-400">
              高亮结构为关键语法点
            </span>
          </div>
          <div className="space-y-3 p-5">
            {activeTopic.examples.map((ex, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                className="rounded-xl border border-dark-100 bg-gradient-to-br from-dark-50/40 to-white p-3.5"
              >
                <div className="text-sm font-semibold leading-relaxed text-dark-900">
                  <span className="mr-2 text-primary-500">EN</span>
                  {renderHighlightedSentence(ex.sentence)}
                </div>
                <div className="mt-1.5 text-xs leading-relaxed text-dark-500">
                  <span className="mr-2 font-semibold text-accent-500">CN</span>
                  {ex.translation}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 开始挑战按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card flex flex-col items-center gap-4 p-5 sm:flex-row sm:justify-between"
        >
          <div className="text-center sm:text-left">
            <div className="text-base font-bold text-dark-900">
              准备好挑战这座地下城了吗？
            </div>
            <div className="text-xs text-dark-500">
              完成练习后挑战 Boss 战，通关获得丰厚奖励
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button onClick={handleStartPractice} className="btn-primary">
              <PencilLine className="h-4 w-4" />
              开始练习
            </button>
            <button
              onClick={handleStartBoss}
              className="btn-accent"
              title="直接挑战 Boss"
            >
              <Swords className="h-4 w-4" />
              直接 Boss 战
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  // ===== 渲染：练习 / Boss 题目卡片 =====
  const renderExerciseCard = (isBoss: boolean) => {
    if (!currentExercise) return null;
    const ExIcon = EX_TYPE_ICON[currentExercise.type];
    const gradient = EX_TYPE_GRADIENT[currentExercise.type];
    const total = exercises.length;
    const isChoice = currentExercise.type === 'multiple-choice' && currentExercise.options;

    return (
      <div className="space-y-4">
        {/* 顶部状态条 */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (advanceTimer.current) clearTimeout(advanceTimer.current);
              setView('learn');
              setCurrentIdx(0);
              setFeedback(null);
              setSelectedOption(null);
              setInputValue('');
            }}
            className="flex items-center gap-1 text-sm text-dark-500 transition-colors hover:text-dark-700"
          >
            <ArrowLeft className="h-4 w-4" /> 退出
          </button>
          <div className="flex items-center gap-2">
            <span
              className={`badge text-[10px] ${
                isBoss
                  ? 'bg-accent-50 text-accent-700'
                  : 'bg-primary-50 text-primary-700'
              }`}
            >
              {isBoss ? <Swords className="h-3 w-3" /> : <Target className="h-3 w-3" />}
              {isBoss ? 'BOSS 战' : '练习模式'}
            </span>
            <div className="text-sm font-bold text-dark-700">
              第 <span className="text-primary-600">{currentIdx + 1}</span> / {total} 题
            </div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar
              value={progress}
              color={isBoss ? 'from-accent-500 to-rose-500' : 'from-purple-500 to-fuchsia-500'}
              height="h-2"
            />
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-success-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {correctCount}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentExercise.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="card overflow-hidden p-0"
          >
            {/* 题型头部 */}
            <div className={`bg-gradient-to-r ${gradient} px-5 py-3 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExIcon className="h-4 w-4" />
                  <span className="text-sm font-bold">
                    {EX_TYPE_LABEL[currentExercise.type]}
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-white/70">
                  {currentExercise.type}
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {/* 题干 */}
              <div className="rounded-xl bg-dark-50 p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-dark-400">
                  题目
                </div>
                <p className="mt-1.5 text-base font-semibold leading-relaxed text-dark-900">
                  {currentExercise.question}
                </p>
              </div>

              {/* 答题区 */}
              <div className="mt-5">
                {isChoice && currentExercise.options ? (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {currentExercise.options.map((opt, idx) => {
                      const isSelected = selectedOption === opt;
                      const isAnswer = norm(opt) === norm(currentExercise.answer);
                      const showCorrect = feedback && isAnswer;
                      const showWrong = feedback && isSelected && !isAnswer;
                      return (
                        <motion.button
                          key={idx}
                          onClick={() => handleSelectOption(opt)}
                          disabled={!!feedback}
                          whileTap={{ scale: 0.98 }}
                          className={`relative flex items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all ${
                            showCorrect
                              ? 'border-success-500 bg-success-50'
                              : showWrong
                                ? 'border-danger-500 bg-danger-50'
                                : isSelected
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-dark-200 bg-white hover:border-primary-300 hover:bg-primary-50/40'
                          }`}
                        >
                          <span
                            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                              showCorrect
                                ? 'bg-success-500 text-white'
                                : showWrong
                                  ? 'bg-danger-500 text-white'
                                  : isSelected
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-dark-100 text-dark-600'
                            }`}
                          >
                            {showCorrect ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : showWrong ? (
                              <X className="h-4 w-4" />
                            ) : (
                              String.fromCharCode(65 + idx)
                            )}
                          </span>
                          <span className="text-sm font-medium text-dark-800">
                            {opt}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs text-dark-500">
                      <PencilLine className="h-3.5 w-3.5" />
                      {currentExercise.type === 'fill-blank' &&
                        '请输入空白处应填的内容（括号内为提示）'}
                      {currentExercise.type === 'error-correction' &&
                        '请输入改正后的部分（如：have seen → saw）'}
                      {currentExercise.type === 'transformation' &&
                        '请输入转换后的完整句子'}
                    </div>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleInputSubmit();
                      }}
                      disabled={!!feedback}
                      placeholder="输入你的答案..."
                      autoFocus
                      className={`input ${
                        feedback === 'correct'
                          ? 'border-success-500 bg-success-50 text-success-700'
                          : feedback === 'wrong'
                            ? 'border-danger-500 bg-danger-50 text-danger-700'
                            : ''
                      }`}
                    />
                    {!feedback && (
                      <button
                        onClick={handleInputSubmit}
                        disabled={!inputValue.trim()}
                        className="btn-primary mt-3 w-full"
                      >
                        确认提交
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 反馈区 */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div
                      className={`rounded-xl p-4 ${
                        feedback === 'correct' ? 'bg-success-50' : 'bg-danger-50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {feedback === 'correct' ? (
                          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success-600" />
                        ) : (
                          <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-danger-600" />
                        )}
                        <div className="flex-1">
                          <div
                            className={`text-sm font-bold ${
                              feedback === 'correct'
                                ? 'text-success-700'
                                : 'text-danger-700'
                            }`}
                          >
                            {feedback === 'correct' ? '回答正确！' : '回答错误'}
                          </div>
                          {feedback === 'wrong' && (
                            <div className="mt-1 text-xs text-dark-700">
                              <span className="font-semibold">参考答案：</span>
                              <span className="text-success-700">
                                {currentExercise.answer}
                              </span>
                            </div>
                          )}
                          <div className="mt-2 rounded-lg bg-white/70 p-2.5 text-xs leading-relaxed text-dark-700">
                            <span className="font-bold text-primary-600">解析：</span>
                            {currentExercise.explanation}
                          </div>
                          {feedback === 'correct' && view === 'practice' && (
                            <div className="mt-2 flex items-center gap-3 text-[11px] font-bold">
                              <span className="flex items-center gap-1 text-primary-600">
                                <Zap className="h-3 w-3" />+3 XP
                              </span>
                              <span className="flex items-center gap-1 text-amber-600">
                                <Coins className="h-3 w-3" />+4 金币
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 底部提示 */}
        <div className="text-center text-xs text-dark-400">
          {isBoss
            ? '🔥 Boss 战：全部答对才能通关地下城'
            : '练习模式：答错也可继续，掌握语法点即可'}
        </div>
      </div>
    );
  };

  // ===== 渲染：结果页 =====
  const renderResult = () => {
    if (!bossResult || !activeTopic) return null;
    return (
      <div className="mx-auto max-w-xl">
        <Confetti trigger={confettiTrigger} duration={3000} count={120} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="card overflow-hidden"
        >
          {/* 顶部色带 */}
          <div
            className={`bg-gradient-to-r ${
              bossResult.conquered
                ? 'from-purple-500 via-fuchsia-500 to-rose-500'
                : 'from-primary-500 to-accent-500'
            } p-6 text-center text-white`}
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 220, delay: 0.1 }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-5xl backdrop-blur-sm"
            >
              {bossResult.conquered ? '👑' : '📜'}
            </motion.div>
            <h2 className="mt-3 text-2xl font-extrabold">
              {bossResult.conquered ? '地下城通关！' : '挑战完成'}
            </h2>
            <p className="mt-1 text-sm text-white/90">
              {bossResult.conquered
                ? `你已击败「${activeTopic.name}」的语法 Boss`
                : '继续努力，下次一定能通关！'}
            </p>
          </div>

          <div className="p-5 sm:p-6">
            {/* 答题统计 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-dark-50 p-3 text-center">
                <div className="text-xs text-dark-400">答对</div>
                <div className="text-xl font-extrabold text-success-600">
                  {bossResult.correct}
                </div>
              </div>
              <div className="rounded-xl bg-dark-50 p-3 text-center">
                <div className="text-xs text-dark-400">总题数</div>
                <div className="text-xl font-extrabold text-dark-900">
                  {bossResult.total}
                </div>
              </div>
              <div className="rounded-xl bg-dark-50 p-3 text-center">
                <div className="text-xs text-dark-400">正确率</div>
                <div className="text-xl font-extrabold text-primary-600">
                  {Math.round((bossResult.correct / bossResult.total) * 100)}%
                </div>
              </div>
            </div>

            {/* 获得奖励 */}
            <div className="mt-4 rounded-xl border border-dark-100 bg-dark-50/60 p-4">
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-dark-500">
                获得奖励
              </div>
              <div className="flex items-center justify-around">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                    <Zap className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[10px] text-dark-400">XP</div>
                    <div className="text-base font-extrabold text-dark-900">
                      +{bossResult.xp}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                    <Coins className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[10px] text-dark-400">金币</div>
                    <div className="text-base font-extrabold text-dark-900">
                      +{bossResult.coins}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[10px] text-dark-400">语法</div>
                    <div className="text-base font-extrabold text-dark-900">
                      +{bossResult.conquered ? 6 : 2}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 通关提示 */}
            {bossResult.conquered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 rounded-xl bg-gradient-to-r from-purple-50 to-fuchsia-50 p-4 text-center"
              >
                <Crown className="mx-auto h-7 w-7 text-purple-500" />
                <div className="mt-1 text-sm font-bold text-purple-700">
                  语法 Boss 已被击败！
                </div>
                <div className="mt-0.5 text-xs text-purple-600">
                  关卡徽章已获得，继续探索下一座地下城
                </div>
              </motion.div>
            )}

            {/* 操作按钮 */}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button onClick={handleBackToMap} className="btn-primary flex-1">
                <Castle className="h-4 w-4" />
                返回地下城
              </button>
              {!bossResult.conquered && (
                <button onClick={handleRetryBoss} className="btn-ghost flex-1">
                  <RotateCcw className="h-4 w-4" />
                  再战 Boss
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  // ===== 主渲染 =====
  return (
    <div className="space-y-5">
      {/* 大标题（仅 dungeon-map 视图显示） */}
      {view === 'dungeon-map' && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-fuchsia-500 to-rose-500 p-5 text-white shadow-lg sm:p-6"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 left-1/4 h-32 w-32 rounded-full bg-rose-300/20 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Castle className="h-5 w-5" />
              </span>
              <h1 className="text-xl font-extrabold sm:text-2xl">语法挑战</h1>
            </div>
            <p className="mt-2 text-sm text-white/90">
              攻克语法地下城，击败每个语法 Boss
            </p>
          </div>
        </motion.section>
      )}

      {/* 非地图视图的返回条 */}
      {view !== 'dungeon-map' && view !== 'result' && activeTopic && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={() => {
              if (advanceTimer.current) clearTimeout(advanceTimer.current);
              setView('learn');
            }}
            className="flex items-center gap-1 text-sm font-medium text-dark-600 transition-colors hover:text-primary-600"
          >
            <ArrowLeft className="h-4 w-4" />
            返回规则讲解
          </button>
          <div className="flex items-center gap-2 text-xs text-dark-500">
            <span className="text-lg">🏰</span>
            <span className="font-semibold text-dark-700">{activeTopic.name}</span>
          </div>
        </motion.div>
      )}

      {/* 视图切换 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'dungeon-map' && renderDungeonMap()}
          {view === 'learn' && renderLearn()}
          {(view === 'practice' || view === 'boss') &&
            renderExerciseCard(view === 'boss')}
          {view === 'result' && renderResult()}
        </motion.div>
      </AnimatePresence>

      {/* 奖励弹窗 */}
      <RewardPopup
        trigger={rewardTrigger}
        xp={rewardData.xp}
        coins={rewardData.coins}
        title={rewardData.title}
        duration={2600}
      />
    </div>
  );
};

export default GrammarPage;
