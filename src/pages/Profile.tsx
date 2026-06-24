import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  Clock,
  CheckCircle2,
  Flame,
  Star,
  Trophy,
  Pencil,
  Crown,
  CalendarClock,
  Target,
  Sparkles,
  Zap,
  BookText,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  ChevronRight,
  Award,
  X,
  Save,
  Settings2,
} from 'lucide-react';
import { useStore } from '../store/StoreContext';
import {
  getLevelName,
  getLevelIcon,
  getRankGradient,
  getXpForLevel,
  getLevelProgress,
  getSkillName,
  getSkillIcon,
  getSkillHex,
  ALL_SKILLS,
  formatNumber,
  daysUntil,
  getTodayString,
} from '../utils/helpers';
import { SkillType, MembershipTier } from '../types';
import StatCard from '../components/ui/StatCard';
import ProgressBar from '../components/ui/ProgressBar';
import RadarChartSkill from '../components/ui/RadarChartSkill';
import LevelBadge from '../components/game/LevelBadge';
import StreakFlame from '../components/game/StreakFlame';
import {
  ExamRecord,
  MistakeRecord,
} from './ExamCenter';

// localStorage keys（与 ExamCenter 保持一致）
const EXAM_HISTORY_KEY = 'englishquest_exam_history';
const MISTAKES_KEY = 'englishquest_mistakes';

function readExamHistory(): ExamRecord[] {
  try {
    const raw = localStorage.getItem(EXAM_HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as ExamRecord[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function readMistakes(): MistakeRecord[] {
  try {
    const raw = localStorage.getItem(MISTAKES_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as MistakeRecord[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// 会员方案
const membershipPlans: {
  tier: MembershipTier;
  name: string;
  price: string;
  icon: string;
  gradient: string;
  features: string[];
  current?: boolean;
}[] = [
  {
    tier: 'free',
    name: '免费版',
    price: '¥0',
    icon: '🌱',
    gradient: 'from-slate-400 to-slate-600',
    features: ['每日 3 个任务', '基础词汇库', '社区排行榜', '学习日历'],
  },
  {
    tier: 'premium',
    name: '尊享版',
    price: '¥29/月',
    icon: '⭐',
    gradient: 'from-primary-500 to-purple-600',
    features: ['无限任务与模考', '全真听力音频', '错题本智能分析', '专属 AI 写作批改', '去除广告'],
  },
  {
    tier: 'sprint',
    name: '冲刺版',
    price: '¥99/3月',
    icon: '🚀',
    gradient: 'from-rose-500 to-amber-500',
    features: ['尊享版全部功能', '1对1 AI 口语陪练', '考前 30 天冲刺计划', '名师押题模考', '优先客服支持'],
  },
];

const membershipLabel: Record<MembershipTier, string> = {
  free: '免费版',
  premium: '尊享版',
  sprint: '冲刺版',
};

const dailyGoalOptions = [15, 30, 45, 60];

// ===== 主组件 =====

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch, helperFunctions } = useStore();
  const { user } = state;

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showMistakes, setShowMistakes] = useState(false);
  const [nameError, setNameError] = useState('');

  // 学习数据
  const examHistory = useMemo(() => readExamHistory(), [user, showMistakes]);
  const mistakes = useMemo(() => readMistakes(), [user, showMistakes]);

  const examCount = examHistory.length;
  const bestScore = examHistory.reduce((m, r) => Math.max(m, r.score), 0);
  const avgScore =
    examCount > 0
      ? Math.round(examHistory.reduce((a, r) => a + r.score, 0) / examCount)
      : 0;

  // 学习时长格式化
  const studyTimeLabel = useMemo(() => {
    const mins = user.totalStudyTime;
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m > 0 ? `${h}h${m}m` : `${h}h`;
    }
    return `${mins}m`;
  }, [user.totalStudyTime]);

  // XP 进度
  const xpForNext = getXpForLevel(user.level);
  const xpProgress = getLevelProgress(user.level, user.xp);

  // 90 天学习日历
  const calendarDays = useMemo(() => {
    const days: { date: string; studied: boolean; label: string; isToday: boolean }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = getTodayString();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      days.push({
        date: dateStr,
        studied: !!user.studyCalendar[dateStr],
        label: `${m}/${day}`,
        isToday: dateStr === todayStr,
      });
    }
    return days;
  }, [user.studyCalendar]);

  const studiedDays90 = calendarDays.filter((d) => d.studied).length;

  // 学习趋势数据（按周聚合最近 12 周）
  const weeklyData = useMemo(() => {
    const weeks: { weekLabel: string; studyDays: number; accuracy: number; accuracyCount: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let w = 11; w >= 0; w--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - w * 7 - 6);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      let studyDays = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        if (d > today) break;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        if (user.studyCalendar[`${y}-${m}-${day}`]) studyDays++;
      }
      // 周内有模考则记录正确率
      const weekExams = examHistory.filter((r) => {
        const rd = new Date(r.date);
        return rd >= weekStart && rd <= new Date(weekEnd.getTime() + 86400000);
      });
      const acc =
        weekExams.length > 0
          ? Math.round(weekExams.reduce((a, r) => a + r.correctRate, 0) / weekExams.length)
          : 0;
      weeks.push({
        weekLabel: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        studyDays,
        accuracy: acc,
        accuracyCount: weekExams.length,
      });
    }
    return weeks;
  }, [user.studyCalendar, examHistory]);

  // 模考成绩趋势
  const examTrend = useMemo(() => {
    return examHistory
      .slice(-10)
      .map((r, i) => ({
        idx: i + 1,
        title: `第${i + 1}次`,
        score: r.score,
        date: new Date(r.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
      }));
  }, [examHistory]);

  // 考试倒计时
  const examDays = user.examDate ? daysUntil(user.examDate) : null;

  // 平均能力值
  const avgSkill = useMemo(() => {
    const values = Object.values(user.skills) as number[];
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }, [user.skills]);

  // ===== 事件处理 =====
  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed.length < 1) {
      setNameError('昵称不能为空');
      return;
    }
    if (trimmed.length > 16) {
      setNameError('昵称不能超过 16 个字符');
      return;
    }
    setNameError('');
    // StoreContext 未暴露专门的 SET_NAME，使用 LOAD_STATE 派发整 state
    // （localStorage 由 StoreProvider 的 useEffect 自动写回）
    dispatch({
      type: 'LOAD_STATE',
      state: { ...state, user: { ...state.user, name: trimmed } },
    });
    setEditingName(false);
  };

  const handleExamDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      helperFunctions.setExamDate(e.target.value);
    }
  };

  const handleDailyGoal = (mins: number) => {
    helperFunctions.setDailyGoal(mins);
  };

  const handleReset = () => {
    helperFunctions.resetUser();
    // 同时清理模考历史与错题本
    localStorage.removeItem(EXAM_HISTORY_KEY);
    localStorage.removeItem(MISTAKES_KEY);
    setShowResetConfirm(false);
    setTimeout(() => window.location.reload(), 100);
  };

  // ===== 渲染 =====
  return (
    <div className="space-y-6">
      {/* ===== 1. 个人信息卡片 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-purple-600 to-accent-500 p-5 text-white shadow-lg sm:p-6"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-1/4 h-32 w-32 rounded-full bg-amber-300/20 blur-2xl" />

        <div className="relative">
          {/* 顶部：头像 + 信息 + 等级徽章 */}
          <div className="flex items-start gap-4">
            {/* 头像 */}
            <motion.div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-4xl backdrop-blur-sm ring-2 ring-white/40 sm:h-20 sm:w-20 sm:text-5xl"
              whileHover={{ scale: 1.08, rotate: 5 }}
            >
              {user.avatar}
            </motion.div>

            {/* 用户信息 */}
            <div className="min-w-0 flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') {
                        setEditingName(false);
                        setNameInput(user.name);
                        setNameError('');
                      }
                    }}
                    autoFocus
                    maxLength={16}
                    className="w-full max-w-[180px] rounded-lg bg-white/20 px-2.5 py-1 text-lg font-extrabold text-white placeholder-white/60 outline-none ring-2 ring-white/40 backdrop-blur-sm focus:bg-white/30"
                    placeholder="输入昵称"
                  />
                  <button
                    onClick={handleSaveName}
                    className="rounded-lg bg-white/20 p-1.5 transition-colors hover:bg-white/30"
                    title="保存"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false);
                      setNameInput(user.name);
                      setNameError('');
                    }}
                    className="rounded-lg bg-white/20 p-1.5 transition-colors hover:bg-white/30"
                    title="取消"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-xl font-extrabold sm:text-2xl">
                    {user.name}
                  </h1>
                  <button
                    onClick={() => {
                      setEditingName(true);
                      setNameInput(user.name);
                    }}
                    className="rounded-lg bg-white/15 p-1.5 transition-colors hover:bg-white/25"
                    title="编辑昵称"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {nameError && (
                <p className="mt-1 text-xs text-rose-200">{nameError}</p>
              )}

              {/* 等级名 + 段位 */}
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-white/90 sm:text-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 backdrop-blur-sm">
                  <Star className="h-3 w-3" />
                  Lv.{user.level} · {getLevelName(user.level)} {getLevelIcon(user.level)}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${getRankGradient(user.rankTier)} px-2.5 py-0.5 font-semibold shadow-sm`}
                >
                  <Sparkles className="h-3 w-3" />
                  {user.rankTier}
                </span>
              </div>

              {/* 会员 + 连胜 */}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold ${
                    user.membership === 'free'
                      ? 'bg-white/15 text-white/90'
                      : user.membership === 'premium'
                        ? 'bg-amber-300/30 text-amber-100 ring-1 ring-amber-200/40'
                        : 'bg-rose-300/30 text-rose-100 ring-1 ring-rose-200/40'
                  }`}
                >
                  <Crown className="h-3 w-3" />
                  {membershipLabel[user.membership]}
                </span>
                <StreakFlame streak={user.streak} size="sm" />
              </div>
            </div>

            {/* 等级徽章 */}
            <div className="hidden shrink-0 sm:block">
              <LevelBadge level={user.level} size="md" glow />
            </div>
          </div>

          {/* XP 进度条 */}
          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-xs text-white/90">
              <span className="inline-flex items-center gap-1 font-semibold">
                <Zap className="h-3.5 w-3.5" />
                经验值
              </span>
              <span>
                <span className="font-extrabold">{user.xp}</span> / {xpForNext} XP
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
              <motion.div
                className="h-full rounded-full bg-white shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-white/80">
              <span>距下一级还需 {Math.max(0, xpForNext - user.xp)} XP</span>
              <span>金币 {user.coins} · 宝石 {user.gems}</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ===== 2. 学习数据看板 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <h2 className="mb-3 px-1 text-base font-bold text-dark-800">学习数据看板</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          <StatCard
            icon={Clock}
            label="总学习时长"
            value={studyTimeLabel}
            color="primary"
            subtitle={`目标 ${user.dailyGoalMinutes} 分钟/天`}
          />
          <StatCard
            icon={CheckCircle2}
            label="完成任务数"
            value={formatNumber(user.totalTasksCompleted)}
            color="success"
            subtitle="累计已完成"
          />
          <StatCard
            icon={Flame}
            label="当前连胜"
            value={`${user.streak} 天`}
            color="accent"
            subtitle={user.streak > 0 ? '继续保持！' : '今天开始连胜'}
          />
          <StatCard
            icon={Star}
            label="当前等级"
            value={`Lv.${user.level}`}
            color="purple"
            subtitle={getLevelName(user.level)}
          />
          <StatCard
            icon={Trophy}
            label="模考次数"
            value={`${examCount} 次`}
            color="cyan"
            subtitle={examCount > 0 ? `平均 ${avgScore} 分` : '尚未模考'}
          />
          <StatCard
            icon={Award}
            label="模考最高分"
            value={bestScore > 0 ? `${bestScore}` : '-'}
            color="danger"
            subtitle={
              bestScore >= 160
                ? '已通过 FCE 通过线'
                : bestScore > 0
                  ? `距 160 差 ${160 - bestScore}`
                  : '快去参加模考'
            }
          />
        </div>
      </motion.section>

      {/* ===== 3 & 4. 能力雷达图 + 90 天学习日历 ===== */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* 能力雷达图 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="card p-5 lg:col-span-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-dark-900">六维能力雷达</h2>
            </div>
            {user.cefrLevel && (
              <span className="badge bg-purple-50 text-purple-600">
                {user.cefrLevel} · 均值 {avgSkill}
              </span>
            )}
          </div>
          <RadarChartSkill skills={user.skills} size={300} color="#6366f1" />
          {/* 技能数值列表 */}
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {ALL_SKILLS.map((sk) => (
              <div
                key={sk}
                className="rounded-lg bg-dark-50 px-2 py-1.5 text-center"
              >
                <div className="text-[11px] font-medium text-dark-500">
                  {getSkillIcon(sk)} {getSkillName(sk)}
                </div>
                <div
                  className="text-sm font-extrabold"
                  style={{ color: getSkillHex(sk) }}
                >
                  {user.skills[sk]}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 90 天学习日历热力图 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="card p-5 lg:col-span-2"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                <Flame className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-dark-900">学习日历</h2>
            </div>
            <span className="text-xs font-semibold text-dark-500">
              近90天 · <span className="font-extrabold text-cyan-600">{studiedDays90}</span> 天
            </span>
          </div>

          {/* 热力图：90 天，13 行 x 7 列大致 */}
          <div className="grid grid-flow-col grid-rows-7 gap-1">
            {calendarDays.map((d, i) => (
              <motion.div
                key={d.date}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.2 + i * 0.004 }}
                whileHover={{ scale: 1.3, zIndex: 5 }}
                title={`${d.label}${d.studied ? ' · 已学习' : ' · 未学习'}`}
                className={`aspect-square rounded-sm transition-all ${
                  d.studied
                    ? 'bg-gradient-to-br from-primary-500 to-accent-500 shadow-sm'
                    : 'bg-dark-100 hover:bg-dark-200'
                } ${d.isToday ? 'ring-2 ring-amber-400' : ''}`}
              />
            ))}
          </div>

          {/* 图例 */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-dark-400">
            <span>少</span>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-dark-100" />
              <div className="h-3 w-3 rounded-sm bg-primary-200" />
              <div className="h-3 w-3 rounded-sm bg-primary-400" />
              <div className="h-3 w-3 rounded-sm bg-gradient-to-br from-primary-500 to-accent-500" />
            </div>
            <span>多</span>
          </div>

          {/* 今日状态 */}
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-dark-50 px-3 py-2">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                user.studyCalendar[getTodayString()] ? 'bg-success-500' : 'bg-dark-300'
              }`}
            />
            <span className="text-xs font-medium text-dark-600">
              {user.studyCalendar[getTodayString()]
                ? '今日已学习，继续保持'
                : '今日还未学习，快去开启第一个任务吧'}
            </span>
          </div>
        </motion.section>
      </div>

      {/* ===== 5. 学习趋势 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="card p-5"
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <TrendingUp className="h-4 w-4" />
          </div>
          <h2 className="text-base font-bold text-dark-900">学习趋势</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* 模考成绩趋势 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-dark-700">模考成绩趋势</span>
              <span className="text-[11px] text-dark-400">
                {examTrend.length > 0 ? `最近 ${examTrend.length} 次` : '暂无模考记录'}
              </span>
            </div>
            {examTrend.length > 0 ? (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={examTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="title"
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={[120, 190]}
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(v: number) => [`${v} 分`, '剑桥量表']}
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fill="url(#scoreGradient)"
                      dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart icon={<Trophy className="h-8 w-8" />} text="完成模考后可查看成绩趋势" />
            )}
            {/* FCE 通过线提示 */}
            {examTrend.length > 0 && (
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-dark-500">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-primary-500" /> 剑桥量表分
                </span>
                <span className="ml-auto">通过线 160 分</span>
              </div>
            )}
          </div>

          {/* 每周学习天数趋势 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-dark-700">每周学习天数</span>
              <span className="text-[11px] text-dark-400">最近 12 周</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="weekLabel"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 7]}
                    ticks={[0, 1, 2, 3, 4, 5, 6, 7]}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(v: number) => [`${v} 天`, '学习天数']}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="studyDays"
                    fill="#f97316"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-[11px] text-dark-500">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-accent-500" /> 学习天数
              </span>
              <span className="ml-auto">
                本周 {weeklyData[weeklyData.length - 1]?.studyDays ?? 0} 天
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ===== 6. 设置区域 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="card p-5"
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dark-100 text-dark-600">
            <Settings2 className="h-4 w-4" />
          </div>
          <h2 className="text-base font-bold text-dark-900">设置</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* FCE 考试日期 */}
          <div className="rounded-xl border border-dark-100 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                <CalendarClock className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-dark-900">FCE 考试日期</div>
                <div className="text-[11px] text-dark-500">设置后开启专属倒计时</div>
              </div>
              {examDays !== null && (
                <span
                  className={`badge ${
                    examDays > 30
                      ? 'bg-primary-50 text-primary-600'
                      : examDays > 7
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {examDays > 0 ? `还剩 ${examDays} 天` : examDays === 0 ? '今天' : '已结束'}
                </span>
              )}
            </div>
            <input
              type="date"
              value={user.examDate ?? ''}
              onChange={handleExamDateChange}
              className="input mt-3"
            />
            {user.examDate && (
              <button
                onClick={() => helperFunctions.setExamDate('')}
                className="mt-2 text-[11px] text-dark-400 transition-colors hover:text-rose-500"
              >
                清除日期
              </button>
            )}
          </div>

          {/* 每日学习目标 */}
          <div className="rounded-xl border border-dark-100 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
                <Target className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-dark-900">每日学习目标</div>
                <div className="text-[11px] text-dark-500">
                  当前目标：{user.dailyGoalMinutes} 分钟/天
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {dailyGoalOptions.map((mins) => {
                const active = user.dailyGoalMinutes === mins;
                return (
                  <button
                    key={mins}
                    onClick={() => handleDailyGoal(mins)}
                    className={`rounded-lg py-2 text-sm font-bold transition-all ${
                      active
                        ? 'bg-primary-600 text-white shadow-sm ring-1 ring-primary-200'
                        : 'bg-dark-50 text-dark-600 hover:bg-dark-100'
                    }`}
                  >
                    {mins}
                    <span className="ml-0.5 text-[10px] font-medium">min</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 会员升级 */}
        <div className="mt-4 rounded-xl border border-dark-100 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
              <Crown className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-dark-900">会员升级</div>
              <div className="text-[11px] text-dark-500">
                当前：<span className="font-semibold text-dark-700">{membershipLabel[user.membership]}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {membershipPlans.map((plan) => {
              const isCurrent = plan.tier === user.membership;
              return (
                <div
                  key={plan.tier}
                  className={`relative overflow-hidden rounded-xl border-2 p-3.5 transition-all ${
                    isCurrent
                      ? 'border-primary-300 bg-primary-50/40'
                      : 'border-dark-100 bg-white hover:border-primary-200'
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute right-2 top-2 badge bg-primary-100 text-primary-700">
                      当前
                    </span>
                  )}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${plan.gradient} text-xl shadow-sm`}
                  >
                    {plan.icon}
                  </div>
                  <div className="mt-2 text-sm font-extrabold text-dark-900">
                    {plan.name}
                  </div>
                  <div className="text-base font-extrabold text-primary-600">
                    {plan.price}
                  </div>
                  <ul className="mt-2 space-y-1">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-1.5 text-[11px] text-dark-600"
                      >
                        <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-success-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    disabled={isCurrent}
                    onClick={() => navigate('/shop')}
                    className={`mt-3 w-full rounded-lg py-1.5 text-xs font-bold transition-all ${
                      isCurrent
                        ? 'cursor-not-allowed bg-dark-100 text-dark-400'
                        : plan.tier === 'free'
                          ? 'bg-dark-100 text-dark-600 hover:bg-dark-200'
                          : `bg-gradient-to-r ${plan.gradient} text-white hover:opacity-90`
                    }`}
                  >
                    {isCurrent ? '当前方案' : plan.tier === 'free' ? '基础版' : '立即升级'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 重置进度 */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/40 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-500">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="text-sm font-bold text-dark-900">重置全部进度</div>
              <div className="text-[11px] text-dark-500">
                将清除等级、连胜、技能值、模考历史与错题本，操作不可恢复
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="rounded-lg bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-200"
          >
            <RotateCcw className="mr-1 inline h-3.5 w-3.5" />
            重置
          </button>
        </div>
      </motion.section>

      {/* ===== 7. 错题本入口 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="card card-hover cursor-pointer p-5"
        onClick={() => mistakes.length > 0 && setShowMistakes(true)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-md">
            <BookText className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-dark-900">错题本</h2>
              <span className="badge bg-rose-50 text-rose-600">
                {mistakes.length} 题
              </span>
            </div>
            <div className="mt-0.5 text-xs text-dark-500">
              {mistakes.length > 0
                ? `最近错题：${new Date(mistakes[mistakes.length - 1].date).toLocaleDateString('zh-CN')}`
                : '尚无错题记录，继续保持！'}
            </div>
          </div>
          {mistakes.length > 0 && (
            <ChevronRight className="h-5 w-5 text-dark-400" />
          )}
        </div>

        {/* 最近 3 条错题预览 */}
        {mistakes.length > 0 && (
          <div className="mt-3 space-y-2 border-t border-dark-100 pt-3">
            {mistakes.slice(-3).reverse().map((m) => (
              <div
                key={m.id}
                className="rounded-lg bg-rose-50/40 px-3 py-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMistakes(true);
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="badge"
                    style={{
                      backgroundColor: `${getSkillHex(m.skill)}15`,
                      color: getSkillHex(m.skill),
                    }}
                  >
                    {getSkillIcon(m.skill)} {getSkillName(m.skill)}
                  </span>
                  <span className="text-[10px] text-dark-400">
                    {new Date(m.date).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <div className="mt-1 line-clamp-1 text-xs text-dark-700">
                  {m.question.replace(/\n/g, ' ')}
                </div>
                <div className="mt-0.5 text-[11px]">
                  <span className="text-rose-600">你的答案：{m.userAnswer || '（未作答）'}</span>
                  <span className="ml-2 text-success-600">正确：{m.correctAnswer}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      {/* ===== 错题本弹窗 ===== */}
      <AnimatePresence>
        {showMistakes && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-dark-900/50 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMistakes(false)}
          >
            <motion.div
              className="relative max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-dark-100 bg-white/95 px-5 py-3.5 backdrop-blur">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                    <BookText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-dark-900">错题本</div>
                    <div className="text-[11px] text-dark-500">
                      共 {mistakes.length} 题错题
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowMistakes(false)}
                  className="rounded-lg p-1.5 text-dark-400 transition-colors hover:bg-dark-100 hover:text-dark-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* 错题列表 */}
              <div className="max-h-[70vh] space-y-3 overflow-y-auto p-4">
                {mistakes.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-100">
                      <CheckCircle2 className="h-8 w-8 text-success-600" />
                    </div>
                    <div className="text-sm font-bold text-dark-800">暂无错题</div>
                    <div className="text-xs text-dark-500">继续努力，保持正确率！</div>
                  </div>
                ) : (
                  [...mistakes].reverse().map((m, i) => (
                    <div
                      key={m.id}
                      className="rounded-xl border border-rose-100 bg-rose-50/30 p-3.5"
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="badge bg-rose-100 text-rose-700">
                          错 #{mistakes.length - i}
                        </span>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: `${getSkillHex(m.skill)}15`,
                            color: getSkillHex(m.skill),
                          }}
                        >
                          {getSkillIcon(m.skill)} {getSkillName(m.skill)}
                        </span>
                        <span className="badge bg-dark-100 text-dark-600">
                          {m.sectionName}
                        </span>
                        <span className="ml-auto text-[10px] text-dark-400">
                          {new Date(m.date).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap text-xs leading-relaxed text-dark-800">
                        {m.question}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-rose-100/60 px-2.5 py-1.5">
                          <div className="text-[10px] font-bold text-rose-600">你的答案</div>
                          <div className="mt-0.5 text-xs font-semibold text-dark-800">
                            {m.userAnswer || '（未作答）'}
                          </div>
                        </div>
                        <div className="rounded-lg bg-success-100/60 px-2.5 py-1.5">
                          <div className="text-[10px] font-bold text-success-600">正确答案</div>
                          <div className="mt-0.5 text-xs font-semibold text-dark-800">
                            {m.correctAnswer}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 rounded-lg bg-white/70 px-2.5 py-1.5 text-[11px] leading-relaxed text-dark-600">
                        <span className="font-bold text-primary-600">解析：</span>
                        {m.explanation}
                      </div>
                      <div className="mt-1.5 text-[10px] text-dark-400">
                        来源：{m.examTitle}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 重置确认弹窗 ===== */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
              initial={{ scale: 0.85, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100">
                <AlertTriangle className="h-7 w-7 text-rose-500" />
              </div>
              <h3 className="mt-4 text-center text-lg font-extrabold text-dark-900">
                确认重置全部进度？
              </h3>
              <p className="mt-2 text-center text-xs text-dark-500">
                此操作将清除：等级（Lv.{user.level}）、连胜（{user.streak} 天）、技能值、金币、
                成就、模考历史与错题本。<span className="font-bold text-rose-500">不可恢复！</span>
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="btn-ghost flex-1"
                >
                  取消
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-rose-600 active:scale-95"
                >
                  确认重置
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===== 子组件 =====

const EmptyChart: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-xl bg-dark-50/60 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dark-100 text-dark-400">
      {icon}
    </div>
    <div className="text-xs text-dark-500">{text}</div>
  </div>
);

export default Profile;
