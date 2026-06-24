import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  Flame,
  Star,
  Play,
  CalendarClock,
  Settings2,
  ChevronRight,
  Zap,
  Coins,
  BookOpen,
  PenTool,
  BookText,
  Headphones,
  Sparkles,
  AlertCircle,
  Gift,
} from 'lucide-react';
import { useStore } from '../store/StoreContext';
import {
  getLevelName,
  getRankGradient,
  getSkillName,
  getSkillIcon,
  getSkillHex,
  daysUntil,
  formatNumber,
  getTodayString,
} from '../utils/helpers';
import { SkillType, DailyTask, TreasureChest as TreasureChestType } from '../types';
import ProgressBar from '../components/ui/ProgressBar';
import StatCard from '../components/ui/StatCard';
import RadarChartSkill from '../components/ui/RadarChartSkill';
import LevelBadge from '../components/game/LevelBadge';
import StreakFlame from '../components/game/StreakFlame';
import TreasureChest from '../components/game/TreasureChest';
import RewardPopup from '../components/game/RewardPopup';

// 模块 -> 路由映射
const moduleRoutes: Record<SkillType, string> = {
  vocabulary: '/vocabulary',
  grammar: '/grammar',
  reading: '/reading',
  listening: '/listening',
  writing: '/study-plan',
  speaking: '/study-plan',
};

// 快捷入口配置
const quickEntries: {
  to: string;
  label: string;
  desc: string;
  icon: typeof BookOpen;
  gradient: string;
}[] = [
  {
    to: '/vocabulary',
    label: '词汇冒险',
    desc: '掌握 FCE 核心词汇',
    icon: BookOpen,
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    to: '/grammar',
    label: '语法挑战',
    desc: '攻克重点语法考点',
    icon: PenTool,
    gradient: 'from-purple-500 to-fuchsia-500',
  },
  {
    to: '/reading',
    label: '阅读探索',
    desc: '提升阅读理解能力',
    icon: BookText,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    to: '/listening',
    label: '听力训练',
    desc: '磨耳朵练就语感',
    icon: Headphones,
    gradient: 'from-cyan-500 to-teal-500',
  },
];

// 每日宝箱配置
const dailyChest: TreasureChestType = {
  id: 'daily-chest',
  type: 'medium',
  name: '每日宝箱',
  icon: '📦',
  description: '完成全部每日任务后可开启',
  rewards: { coinsMin: 30, coinsMax: 60, gemsMin: 3, gemsMax: 8 },
  opened: false,
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state, helperFunctions } = useStore();
  const { user, todayTasks } = state;

  const [rewardTrigger, setRewardTrigger] = useState(0);
  const [rewardData, setRewardData] = useState<{ xp: number; coins: number; gems: number }>({
    xp: 0,
    coins: 0,
    gems: 0,
  });
  const [chestOpened, setChestOpened] = useState(false);

  // 今日任务完成情况
  const completedCount = todayTasks.filter((t) => t.completed).length;
  const totalCount = todayTasks.length;
  const todayProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  // FCE 倒计时
  const examDays = user.examDate ? daysUntil(user.examDate) : null;

  // 30 天学习日历
  const calendarDays = useMemo(() => {
    const days: { date: string; studied: boolean; dayLabel: string }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      days.push({
        date: dateStr,
        studied: !!user.studyCalendar[dateStr],
        dayLabel: `${m}/${day}`,
      });
    }
    return days;
  }, [user.studyCalendar]);

  const studiedDays = calendarDays.filter((d) => d.studied).length;

  // 总学习时长格式化
  const studyTimeLabel = useMemo(() => {
    const mins = user.totalStudyTime;
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m > 0 ? `${h}h${m}m` : `${h}h`;
    }
    return `${mins}m`;
  }, [user.totalStudyTime]);

  // 未完成测评的提示
  if (!user.assessmentCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-md"
      >
        <div className="card overflow-hidden p-6 text-center">
          <motion.div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-lg"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <AlertCircle className="h-8 w-8" />
          </motion.div>
          <h2 className="mt-4 text-xl font-bold text-dark-900">先完成能力测评</h2>
          <p className="mt-2 text-sm text-dark-500">
            完成入学能力测评后，我们会为你量身定制三阶段学习计划，正式开启 FCE 冒险之旅。
          </p>
          <button
            onClick={() => navigate('/assessment')}
            className="btn-primary mt-6 w-full"
          >
            <Sparkles className="h-4 w-4" />
            前往测评
          </button>
        </div>
      </motion.div>
    );
  }

  const handleStartTask = (task: DailyTask) => {
    if (task.completed) return;
    navigate(moduleRoutes[task.module]);
  };

  const handleOpenChest = (
    _chest: TreasureChestType,
    reward: { coins: number; gems: number },
  ) => {
    if (chestOpened) return;
    setChestOpened(true);
    helperFunctions.addCoins(reward.coins);
    helperFunctions.addGems(reward.gems);
    setRewardData({ xp: 50, coins: reward.coins, gems: reward.gems });
    setRewardTrigger((t) => t + 1);
  };

  return (
    <div className="space-y-6">
      {/* ===== 1. 欢迎栏 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-purple-600 to-accent-500 p-5 text-white shadow-lg sm:p-6"
      >
        {/* 装饰光斑 */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-1/4 h-32 w-32 rounded-full bg-accent-300/20 blur-2xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* 头像 */}
            <motion.div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm ring-2 ring-white/40"
              whileHover={{ scale: 1.08, rotate: 5 }}
            >
              {user.avatar}
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold sm:text-2xl">
                  欢迎回来，{user.name}！
                </h1>
                <StreakFlame streak={user.streak} size="sm" />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/90 sm:text-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 backdrop-blur-sm">
                  <Star className="h-3 w-3" />
                  Lv.{user.level} · {getLevelName(user.level)}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${getRankGradient(
                    user.rankTier,
                  )} px-2.5 py-0.5 font-semibold shadow-sm`}
                >
                  <Sparkles className="h-3 w-3" />
                  {user.rankTier}
                </span>
              </div>
            </div>
          </div>

          {/* 等级徽章 */}
          <div className="hidden sm:block">
            <LevelBadge level={user.level} size="md" glow />
          </div>
        </div>
      </motion.section>

      {/* ===== 2. FCE 倒计时卡片 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        {examDays !== null ? (
          <div className="card card-hover relative overflow-hidden p-5 sm:p-6">
            <div className="pointer-events-none absolute -right-6 -top-6 text-7xl opacity-10">
              🎓
            </div>
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                  <CalendarClock className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs font-medium text-dark-500">FCE 考试倒计时</div>
                  <div className="mt-0.5 flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-dark-900 sm:text-4xl">
                      {examDays > 0 ? examDays : 0}
                    </span>
                    <span className="text-sm font-medium text-dark-600">天</span>
                    {examDays === 0 && (
                      <span className="ml-1 badge bg-rose-50 text-rose-600">今天考试！</span>
                    )}
                    {examDays !== null && examDays < 0 && (
                      <span className="ml-1 badge bg-dark-100 text-dark-600">已结束</span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-dark-400">
                    考试日期：{user.examDate}
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="btn-ghost shrink-0"
              >
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">修改</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-between gap-3 p-5 sm:flex-row sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                <CalendarClock className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-dark-900">还没有设置考试日期</div>
                <div className="mt-0.5 text-xs text-dark-500">
                  设置 FCE 考试日期，开启专属倒计时
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="btn-primary shrink-0 w-full sm:w-auto"
            >
              <Settings2 className="h-4 w-4" />
              设置考试日期
            </button>
          </div>
        )}
      </motion.section>

      {/* ===== 3. 今日任务区 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card p-5 sm:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-dark-900">今日学习任务</h2>
          </div>
          <span className="text-sm font-semibold text-dark-500">
            <span className="font-extrabold text-primary-600">{completedCount}</span>
            <span className="text-dark-300"> / {totalCount}</span>
          </span>
        </div>

        <div className="mt-3">
          <ProgressBar
            value={todayProgress}
            height="h-3"
            color="from-primary-500 to-accent-500"
            showLabel
            label="今日完成进度"
          />
        </div>

        {/* 任务卡片列表 */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {todayTasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.12 + idx * 0.05 }}
              className={`relative overflow-hidden rounded-xl border p-4 transition-all ${
                task.completed
                  ? 'border-success-200 bg-success-50/50'
                  : 'border-dark-100 bg-white hover:border-primary-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* 模块图标 */}
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${
                    task.completed ? 'bg-success-100' : 'bg-dark-50'
                  }`}
                  style={!task.completed ? { color: getSkillHex(task.module) } : undefined}
                >
                  {task.icon || getSkillIcon(task.module)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-bold text-dark-900">
                      {task.title}
                    </h3>
                    <span
                      className="badge shrink-0"
                      style={{
                        backgroundColor: `${getSkillHex(task.module)}15`,
                        color: getSkillHex(task.module),
                      }}
                    >
                      {getSkillName(task.module)}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-dark-500">
                    {task.description}
                  </p>

                  {/* 奖励信息 */}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-medium">
                    <span className="inline-flex items-center gap-0.5 text-dark-500">
                      <Clock className="h-3 w-3" />
                      {task.estimatedMinutes}分钟
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-primary-600">
                      <Zap className="h-3 w-3" />
                      +{task.xpReward} XP
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-amber-600">
                      <Coins className="h-3 w-3" />
                      +{task.coinReward}
                    </span>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="mt-3 flex justify-end">
                {task.completed ? (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-success-100 px-3 py-1.5 text-xs font-bold text-success-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    已完成
                  </span>
                ) : (
                  <button
                    onClick={() => handleStartTask(task)}
                    className="btn-primary px-3 py-1.5 text-xs"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    开始
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 全部完成 → 每日宝箱 */}
        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className="mt-5 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4"
          >
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md"
                  animate={{ rotate: [-5, 5, -5, 0], scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Gift className="h-5 w-5" />
                </motion.div>
                <div>
                  <div className="text-sm font-bold text-dark-900">
                    🎉 今日任务全部完成！
                  </div>
                  <div className="text-xs text-dark-600">
                    开启每日宝箱，领取专属奖励
                  </div>
                </div>
              </div>
              {chestOpened ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-success-100 px-3 py-1.5 text-xs font-bold text-success-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  宝箱已开启
                </span>
              ) : (
                <TreasureChest
                  chest={{ ...dailyChest, opened: chestOpened }}
                  onOpen={handleOpenChest}
                  disabled={chestOpened}
                />
              )}
            </div>
          </motion.div>
        )}
      </motion.section>

      {/* ===== 4. 数据概览卡片 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <h2 className="mb-3 px-1 text-base font-bold text-dark-800">数据概览</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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
            label="连胜天数"
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
        </div>
      </motion.section>

      {/* ===== 5 & 6. 能力雷达图 + 学习日历 ===== */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* 能力雷达图 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
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
                当前 {user.cefrLevel}
              </span>
            )}
          </div>
          <RadarChartSkill skills={user.skills} size={300} color="#6366f1" />
          {/* 技能数值列表 */}
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {(Object.keys(user.skills) as SkillType[]).map((sk) => (
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

        {/* 学习日历热力图 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
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
              近30天 · <span className="font-extrabold text-cyan-600">{studiedDays}</span> 天
            </span>
          </div>

          {/* 热力图：5 行 x 6 列 */}
          <div className="grid grid-cols-6 gap-1.5">
            {calendarDays.map((d, i) => (
              <motion.div
                key={d.date}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: 0.3 + i * 0.012 }}
                whileHover={{ scale: 1.18, zIndex: 5 }}
                title={`${d.dayLabel}${d.studied ? ' · 已学习' : ' · 未学习'}`}
                className={`aspect-square rounded-md transition-all ${
                  d.studied
                    ? 'bg-gradient-to-br from-primary-500 to-accent-500 shadow-sm'
                    : 'bg-dark-100 hover:bg-dark-200'
                }`}
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
                : '今日还未学习，快去完成第一个任务吧'}
            </span>
          </div>
        </motion.section>
      </div>

      {/* ===== 7. 快捷入口 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-dark-800">快捷入口</h2>
          <button
            onClick={() => navigate('/study-plan')}
            className="flex items-center gap-0.5 text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            学习计划
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {quickEntries.map((entry, idx) => {
            const Icon = entry.icon;
            return (
              <motion.button
                key={entry.to}
                onClick={() => navigate(entry.to)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.32 + idx * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${entry.gradient} p-4 text-left text-white shadow-md transition-shadow hover:shadow-xl`}
              >
                <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/15 blur-xl transition-all group-hover:scale-125" />
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-3 text-sm font-bold">{entry.label}</div>
                  <div className="mt-0.5 text-[11px] text-white/85">{entry.desc}</div>
                  <div className="mt-2 flex items-center gap-0.5 text-[11px] font-semibold text-white/90">
                    进入
                    <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* 奖励弹窗（宝箱） */}
      <RewardPopup
        trigger={rewardTrigger}
        xp={rewardData.xp}
        coins={rewardData.coins}
        gems={rewardData.gems}
        title="每日宝箱已开启！"
        duration={3000}
      />
    </div>
  );
};

export default Dashboard;
