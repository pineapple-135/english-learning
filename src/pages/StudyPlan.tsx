import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarClock,
  Target,
  ChevronDown,
  CheckCircle2,
  Circle,
  Clock,
  Coins,
  Zap,
  Flag,
  Sparkles,
  ArrowRight,
  BookOpen,
  Headphones,
  PenTool,
  BookText,
  Mic,
  Trophy,
  TrendingUp,
  CalendarPlus,
  Lock,
} from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { studyPlans } from '../data/gameData';
import { StudyPlan as StudyPlanType, SkillType, CEFRLevel } from '../types';
import {
  getSkillName,
  getSkillIcon,
  daysUntil,
  formatDate,
} from '../utils/helpers';
import ProgressBar from '../components/ui/ProgressBar';

// 模块 -> lucide 图标
const moduleLucideIcon: Record<SkillType, typeof BookOpen> = {
  vocabulary: BookOpen,
  grammar: PenTool,
  reading: BookText,
  listening: Headphones,
  writing: PenTool,
  speaking: Mic,
};

// 模块颜色（Tailwind 渐变）
const moduleGradient: Record<SkillType, string> = {
  vocabulary: 'from-indigo-500 to-purple-500',
  grammar: 'from-purple-500 to-fuchsia-500',
  reading: 'from-blue-500 to-cyan-500',
  listening: 'from-cyan-500 to-teal-500',
  writing: 'from-rose-500 to-pink-500',
  speaking: 'from-orange-500 to-amber-500',
};

// 阶段主题色
const phaseTheme: Record<
  number,
  { gradient: string; accent: string; ring: string; chip: string }
> = {
  1: {
    gradient: 'from-indigo-500 via-purple-500 to-fuchsia-500',
    accent: 'text-indigo-600',
    ring: 'ring-indigo-200',
    chip: 'bg-indigo-50 text-indigo-700',
  },
  2: {
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    accent: 'text-cyan-600',
    ring: 'ring-cyan-200',
    chip: 'bg-cyan-50 text-cyan-700',
  },
  3: {
    gradient: 'from-orange-500 via-accent-500 to-rose-500',
    accent: 'text-accent-600',
    ring: 'ring-accent-200',
    chip: 'bg-accent-50 text-accent-700',
  },
};

// 根据用户状态推断里程碑是否完成
function isMilestoneCompleted(
  milestoneId: string,
  assessmentCompleted: boolean,
  cefrLevel: CEFRLevel | null,
): boolean {
  if (!assessmentCompleted) return false;
  // 入门测评完成
  if (milestoneId === 'p1-m1') return true;
  // 阶段达成
  const cefrRank: CEFRLevel[] = ['A1', 'A2', 'B1', 'B1+', 'B2', 'B2+', 'C1'];
  const rank = cefrLevel ? cefrRank.indexOf(cefrLevel) : -1;
  if (milestoneId === 'p1-m5') return rank >= cefrRank.indexOf('B1');
  if (milestoneId === 'p2-m5') return rank >= cefrRank.indexOf('B2');
  if (milestoneId === 'p3-m5') return rank >= cefrRank.indexOf('B2+');
  return false;
}

const StudyPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, helperFunctions } = useStore();
  const { user } = state;

  const [expandedPhase, setExpandedPhase] = useState<number | null>(1);
  const [examDateInput, setExamDateInput] = useState('');

  // 当前阶段（studyPlanPhase 为 0 时默认处于第一阶段）
  const currentPhase = user.assessmentCompleted
    ? Math.max(1, user.studyPlanPhase)
    : 0;

  // FCE 倒计时
  const examDays = user.examDate ? daysUntil(user.examDate) : null;

  // 处理后的学习计划（含完成状态 & 进度）
  const plans = useMemo(() => {
    return studyPlans.map((plan) => {
      const milestones = plan.milestones.map((m) => ({
        ...m,
        completed: isMilestoneCompleted(m.id, user.assessmentCompleted, user.cefrLevel),
      }));
      const completedCount = milestones.filter((m) => m.completed).length;
      const progress =
        milestones.length > 0
          ? Math.round((completedCount / milestones.length) * 100)
          : 0;
      return { ...plan, milestones, progress };
    });
  }, [user.assessmentCompleted, user.cefrLevel]);

  // 今日推荐任务（取当前阶段的 dailyTasks）
  const todayTasks = useMemo(() => {
    if (currentPhase === 0) return [];
    const plan = plans.find((p) => p.phase === currentPhase);
    return plan?.dailyTasks ?? [];
  }, [currentPhase, plans]);

  const handleSetExamDate = () => {
    if (!examDateInput) return;
    helperFunctions.setExamDate(examDateInput);
    setExamDateInput('');
  };

  const handleClearExamDate = () => {
    helperFunctions.setExamDate('');
  };

  const togglePhase = (phase: number) => {
    setExpandedPhase((prev) => (prev === phase ? null : phase));
  };

  return (
    <div className="space-y-6">
      {/* ===== 页面标题 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-purple-600 to-accent-500 p-5 text-white shadow-lg sm:p-6"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-1/4 h-32 w-32 rounded-full bg-accent-300/20 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Target className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-extrabold sm:text-2xl">学习计划</h1>
          </div>
          <p className="mt-2 text-sm text-white/90">
            你的个性化 FCE 备考之旅 · 三阶段系统通关
          </p>
        </div>
      </motion.section>

      {/* ===== FCE 倒计时 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        {user.examDate && examDays !== null ? (
          <div className="card overflow-hidden">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-rose-500 text-white shadow-lg"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <CalendarClock className="h-7 w-7" />
                </motion.div>
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-dark-400">
                    距离 FCE 考试还有
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className={`text-3xl font-extrabold ${
                        examDays <= 30
                          ? 'text-accent-600'
                          : examDays <= 60
                            ? 'text-primary-600'
                            : 'text-dark-900'
                      }`}
                    >
                      {examDays}
                    </span>
                    <span className="text-sm font-medium text-dark-500">天</span>
                  </div>
                  <div className="text-xs text-dark-500">
                    考试日期：{formatDate(user.examDate)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 sm:flex-none">
                  <button
                    onClick={handleClearExamDate}
                    className="btn-ghost w-full text-xs sm:w-auto"
                  >
                    修改日期
                  </button>
                </div>
              </div>
            </div>
            {examDays <= 0 && (
              <div className="border-t border-dark-100 bg-accent-50 px-5 py-2.5 text-center text-sm font-medium text-accent-700">
                🎉 考试日已到，祝你考试顺利！
              </div>
            )}
          </div>
        ) : (
          <div className="card p-5">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
                <CalendarPlus className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="text-sm font-bold text-dark-900">
                  设置你的 FCE 考试日期
                </div>
                <div className="text-xs text-dark-500">
                  设置后将显示倒计时，帮你合理安排复习节奏
                </div>
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <input
                  type="date"
                  value={examDateInput}
                  onChange={(e) => setExamDateInput(e.target.value)}
                  className="input flex-1 py-2 text-sm sm:w-44"
                />
                <button
                  onClick={handleSetExamDate}
                  disabled={!examDateInput}
                  className="btn-primary text-sm"
                >
                  设置
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.section>

      {/* ===== 三阶段计划 ===== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-dark-900">
            <Flag className="h-5 w-5 text-primary-500" />
            三阶段学习路径
          </h2>
          <span className="text-xs text-dark-400">
            当前阶段：第 {currentPhase === 0 ? '-' : currentPhase} 阶段
          </span>
        </div>

        {plans.map((plan, idx) => {
          const theme = phaseTheme[plan.phase];
          const isCurrent = plan.phase === currentPhase;
          const isPast = currentPhase !== 0 && plan.phase < currentPhase;
          const isLocked = currentPhase === 0 && plan.phase > 1;
          const isExpanded = expandedPhase === plan.phase;

          return (
            <motion.div
              key={plan.phase}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + idx * 0.08 }}
              className={`card overflow-hidden transition-all ${
                isCurrent ? `ring-2 ${theme.ring} shadow-md` : ''
              }`}
            >
              {/* 顶部色条 */}
              <div className={`h-1.5 bg-gradient-to-r ${theme.gradient}`} />

              <button
                onClick={() => togglePhase(plan.phase)}
                className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-dark-50/50"
              >
                {/* 阶段编号 */}
                <div
                  className={`relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.gradient} text-white shadow-md`}
                >
                  {isPast ? (
                    <CheckCircle2 className="h-7 w-7" />
                  ) : isLocked ? (
                    <Lock className="h-6 w-6" />
                  ) : (
                    <span className="text-2xl font-extrabold">{plan.phase}</span>
                  )}
                  {isCurrent && (
                    <motion.span
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary-600 shadow"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    >
                      ★
                    </motion.span>
                  )}
                </div>

                {/* 阶段信息 */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-dark-900">
                      {plan.name}
                    </h3>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-dark-400">
                      {plan.nameEn}
                    </span>
                    {isCurrent && (
                      <span
                        className={`badge ${theme.chip} text-[10px]`}
                      >
                        进行中
                      </span>
                    )}
                    {isPast && (
                      <span className="badge bg-green-50 text-green-600 text-[10px]">
                        已完成
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-dark-500">
                    {plan.description}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-dark-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {plan.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {plan.milestones.filter((m) => m.completed).length}/
                      {plan.milestones.length} 里程碑
                    </span>
                  </div>
                </div>

                {/* 展开图标 */}
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 text-dark-400"
                >
                  <ChevronDown className="h-5 w-5" />
                </motion.div>
              </button>

              {/* 进度条 */}
              <div className="px-5 pb-3">
                <ProgressBar
                  value={plan.progress}
                  color={theme.gradient}
                  height="h-1.5"
                  showLabel
                  label="阶段进度"
                />
              </div>

              {/* 里程碑列表（展开时） */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-dark-100 bg-dark-50/40 p-5">
                      <div className="mb-3 text-xs font-bold uppercase tracking-wider text-dark-500">
                        阶段里程碑
                      </div>
                      <div className="space-y-2.5">
                        {plan.milestones.map((m, mIdx) => (
                          <motion.div
                            key={m.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 + mIdx * 0.05 }}
                            className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                              m.completed
                                ? 'border-green-200 bg-green-50/60'
                                : 'border-dark-200 bg-white'
                            }`}
                          >
                            {m.completed ? (
                              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                            ) : (
                              <Circle className="mt-0.5 h-5 w-5 flex-shrink-0 text-dark-300" />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm font-bold ${
                                    m.completed
                                      ? 'text-green-700'
                                      : 'text-dark-800'
                                  }`}
                                >
                                  {m.name}
                                </span>
                                <span className="badge bg-dark-100 text-[10px] text-dark-500">
                                  {m.target}
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs leading-relaxed text-dark-500">
                                {m.description}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </section>

      {/* ===== 今日推荐任务 ===== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-dark-900">
            <Sparkles className="h-5 w-5 text-accent-500" />
            今日推荐任务
          </h2>
          <span className="text-xs text-dark-400">
            来自第 {currentPhase === 0 ? 1 : currentPhase} 阶段
          </span>
        </div>

        {todayTasks.length === 0 ? (
          <div className="card p-8 text-center">
            <Trophy className="mx-auto h-10 w-10 text-dark-300" />
            <p className="mt-3 text-sm text-dark-500">
              请先完成入学测评，获取今日推荐任务
            </p>
            <button
              onClick={() => navigate('/assessment')}
              className="btn-primary mt-4 text-sm"
            >
              前往测评
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {todayTasks.map((task, idx) => {
              const Icon = moduleLucideIcon[task.module];
              const gradient = moduleGradient[task.module];
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.06 }}
                  whileHover={{ y: -2 }}
                  className="card card-hover p-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-xl shadow-sm`}
                    >
                      {task.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-bold text-dark-900">
                          {task.title}
                        </h3>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="badge bg-dark-100 text-[10px] text-dark-600">
                          <Icon className="h-3 w-3" />
                          {getSkillName(task.module)}
                        </span>
                        <span className="flex items-center gap-0.5 text-[11px] text-dark-400">
                          <Clock className="h-3 w-3" />
                          {task.estimatedMinutes}分钟
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-dark-500">
                        {task.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2 border-t border-dark-100 pt-2.5">
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-primary-600">
                          <Zap className="h-3 w-3" />+{task.xpReward} XP
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-accent-600">
                          <Coins className="h-3 w-3" />+{task.coinReward}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* ===== 能力概览（CEFR 等级提示）===== */}
      {user.cefrLevel && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="card flex items-center gap-4 p-5"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-dark-400">当前英语水平</div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-dark-900">
                {user.cefrLevel}
              </span>
              <span className="text-xs text-dark-500">
                目标：B2+（超越 FCE 通过线）
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="btn-ghost text-xs"
          >
            返回首页
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </motion.section>
      )}
    </div>
  );
};

export default StudyPlanPage;
