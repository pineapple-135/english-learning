import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Gamepad2,
  Target,
  GraduationCap,
  ArrowRight,
  Play,
  CheckCircle2,
  CalendarClock,
} from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { STORAGE_KEY } from '../store/StoreContext';

interface Feature {
  icon: typeof Gamepad2;
  title: string;
  titleEn: string;
  description: string;
  gradient: string;
  iconBg: string;
}

const features: Feature[] = [
  {
    icon: Gamepad2,
    title: '游戏化学习',
    titleEn: 'Gamified Learning',
    description: 'XP、等级、连胜、宝箱与成就系统，让每一次学习都像打怪升级一样上瘾。',
    gradient: 'from-primary-500 to-purple-500',
    iconBg: 'from-primary-400 to-purple-500',
  },
  {
    icon: Target,
    title: '个性化计划',
    titleEn: 'Personalized Plan',
    description: '根据入学测评结果智能匹配三阶段学习路径，从筑基到冲刺全程量身定制。',
    gradient: 'from-accent-500 to-rose-500',
    iconBg: 'from-accent-400 to-rose-500',
  },
  {
    icon: GraduationCap,
    title: '考试导向',
    titleEn: 'Exam Oriented',
    description: '紧扣 FCE 考试大纲，全真模考、错题回顾、高频词汇，助你一次通关。',
    gradient: 'from-cyan-500 to-blue-500',
    iconBg: 'from-cyan-400 to-blue-500',
  },
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useStore();
  const [hasUserData, setHasUserData] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.user) setHasUserData(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // 已经完成测评的用户直接显示"继续学习"
  const showContinue = hasUserData || state.user.assessmentCompleted;

  const handleStart = () => navigate('/assessment');
  const handleContinue = () => navigate('/');

  return (
    <div className="relative min-h-screen overflow-hidden gradient-bg">
      {/* 装饰性背景光斑 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/20 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-accent-300/30 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-purple-300/30 blur-3xl"
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      {/* 漂浮的装饰 emoji */}
      <div className="pointer-events-none absolute inset-0 hidden sm:block">
        {[
          { emoji: '📚', top: '12%', left: '8%', delay: 0 },
          { emoji: '✏️', top: '22%', right: '10%', delay: 1.2 },
          { emoji: '🎧', top: '60%', left: '6%', delay: 0.6 },
          { emoji: '📖', top: '68%', right: '8%', delay: 1.8 },
          { emoji: '🏆', top: '40%', left: '14%', delay: 2.4 },
          { emoji: '⚡', top: '48%', right: '16%', delay: 0.9 },
        ].map((d, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl opacity-30"
            style={{ top: d.top, left: (d as any).left, right: (d as any).right }}
            animate={{ y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
            transition={{
              duration: 5 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: d.delay,
            }}
          >
            {d.emoji}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-8 sm:px-8 sm:py-12">
        {/* 顶部 Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-3"
        >
          <motion.div
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 shadow-xl"
            whileHover={{ scale: 1.08, rotate: 6 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="h-7 w-7 text-primary-600" />
          </motion.div>
          <div className="flex flex-col leading-tight">
            <span className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md">
              EnglishQuest
            </span>
            <span className="text-[11px] font-medium text-white/80">FCE 冒险之旅</span>
          </div>
        </motion.div>

        {/* 主体内容 */}
        <div className="flex flex-1 flex-col items-center justify-center py-10">
          {/* Slogan */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-center"
          >
            <motion.div
              className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 backdrop-blur-sm"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              <span className="text-lg">🎯</span>
              <span className="text-sm font-semibold text-white">为 FCE 考生打造的冒险式学习</span>
            </motion.div>

            <h1 className="text-balance text-3xl font-extrabold leading-tight text-white drop-shadow-md sm:text-5xl sm:leading-tight">
              让每一个英语学习者
              <br />
              都能像玩游戏一样
              <br />
              <span className="bg-gradient-to-r from-yellow-200 to-amber-100 bg-clip-text text-transparent">
                期待每天的学习
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-balance text-sm text-white/90 sm:text-base">
              把枯燥的备考变成一场冒险：升级打怪、解锁成就、挑战连胜，在 10 周内系统通关 FCE。
            </p>
          </motion.div>

          {/* 特色卡片 */}
          <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.4 + i * 0.15 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="group relative overflow-hidden rounded-2xl bg-white/95 p-5 shadow-xl backdrop-blur-sm sm:p-6"
                >
                  {/* 顶部渐变条 */}
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${f.gradient}`}
                  />
                  <motion.div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.iconBg} text-white shadow-lg`}
                    whileHover={{ rotate: 8, scale: 1.1 }}
                  >
                    <Icon className="h-6 w-6" />
                  </motion.div>
                  <h3 className="mt-4 text-lg font-bold text-dark-900">{f.title}</h3>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-dark-400">
                    {f.titleEn}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-dark-600">
                    {f.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* 行动按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-10 flex w-full max-w-md flex-col items-center gap-3 sm:mt-12"
          >
            <motion.button
              onClick={handleStart}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="group relative w-full overflow-hidden rounded-2xl bg-white px-8 py-4 text-base font-extrabold text-primary-700 shadow-2xl transition-all"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-primary-100 to-accent-100 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative flex items-center justify-center gap-2">
                <Play className="h-5 w-5 fill-primary-600 text-primary-600" />
                开始冒险
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </motion.button>

            {showContinue && (
              <motion.button
                onClick={handleContinue}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/15 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm ring-1 ring-white/40 transition-all hover:bg-white/25"
              >
                <CheckCircle2 className="h-4 w-4" />
                继续学习
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            )}
          </motion.div>

          {/* 流程提示 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-white/80"
          >
            <span className="flex items-center gap-1">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold">
                1
              </span>
              能力测评
            </span>
            <span className="text-white/40">→</span>
            <span className="flex items-center gap-1">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold">
                2
              </span>
              制定计划
            </span>
            <span className="text-white/40">→</span>
            <span className="flex items-center gap-1">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold">
                3
              </span>
              每日冒险
            </span>
            <span className="text-white/40">→</span>
            <span className="flex items-center gap-1">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold">
                4
              </span>
              通关 FCE
            </span>
          </motion.div>
        </div>

        {/* 底部 FCE 考试信息 */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-md ring-1 ring-white/20"
        >
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <CalendarClock className="h-5 w-5 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-sm font-bold text-white">FCE 考试信息</div>
                <div className="text-[11px] text-white/80">
                  Cambridge English: First (B2 First)
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-white/85 sm:text-xs">
              <span>📝 阅读 · 写作</span>
              <span>🎧 听力</span>
              <span>🗣️ 口语</span>
              <span>🎯 CEFR B2</span>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
};

export default Onboarding;
