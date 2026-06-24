import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Trophy,
  Lock,
  Coins,
  Gem,
  Zap,
  Sparkles,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { achievements } from '../data/gameData';
import { Achievement } from '../types';
import ProgressBar from '../components/ui/ProgressBar';

type CategoryKey = 'all' | Achievement['category'];

const CATEGORY_TABS: {
  key: CategoryKey;
  label: string;
  icon: string;
}[] = [
  { key: 'all', label: '全部', icon: '🎯' },
  { key: 'milestone', label: '学习里程碑', icon: '⭐' },
  { key: 'persistence', label: '坚持类', icon: '🔥' },
  { key: 'skill', label: '技能类', icon: '📚' },
  { key: 'challenge', label: '特殊挑战', icon: '🏆' },
  { key: 'collection', label: '收藏类', icon: '🎖️' },
];

const CATEGORY_GRADIENTS: Record<Achievement['category'], string> = {
  milestone: 'from-violet-400 to-purple-500',
  persistence: 'from-orange-400 to-rose-500',
  skill: 'from-blue-400 to-cyan-500',
  challenge: 'from-amber-400 to-orange-500',
  collection: 'from-emerald-400 to-teal-500',
};

const CATEGORY_LABELS: Record<Achievement['category'], string> = {
  milestone: '里程碑',
  persistence: '坚持',
  skill: '技能',
  challenge: '挑战',
  collection: '收藏',
};

const Achievements: React.FC = () => {
  const { state } = useStore();
  const { user } = state;

  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // 标记成就是否已解锁
  const achievementsWithStatus = useMemo(() => {
    return achievements.map((a) => ({
      ...a,
      unlocked: user.achievements.includes(a.id),
    }));
  }, [user.achievements]);

  // 分类筛选
  const filteredAchievements = useMemo(() => {
    if (activeCategory === 'all') return achievementsWithStatus;
    return achievementsWithStatus.filter((a) => a.category === activeCategory);
  }, [achievementsWithStatus, activeCategory]);

  // 统计概览
  const stats = useMemo(() => {
    const total = achievements.length;
    const unlocked = achievementsWithStatus.filter((a) => a.unlocked).length;
    const progressPct = total > 0 ? Math.round((unlocked / total) * 100) : 0;
    // 总奖励统计（按已解锁计算）
    const totalCoins = achievementsWithStatus
      .filter((a) => a.unlocked)
      .reduce((sum, a) => sum + (a.reward.coins ?? 0), 0);
    const totalGems = achievementsWithStatus
      .filter((a) => a.unlocked)
      .reduce((sum, a) => sum + (a.reward.gems ?? 0), 0);
    const totalXp = achievementsWithStatus
      .filter((a) => a.unlocked)
      .reduce((sum, a) => sum + (a.reward.xp ?? 0), 0);
    // 全部奖励（含未解锁）
    const allCoins = achievements.reduce((s, a) => s + (a.reward.coins ?? 0), 0);
    const allGems = achievements.reduce((s, a) => s + (a.reward.gems ?? 0), 0);
    const allXp = achievements.reduce((s, a) => s + (a.reward.xp ?? 0), 0);
    return {
      total,
      unlocked,
      progressPct,
      totalCoins,
      totalGems,
      totalXp,
      allCoins,
      allGems,
      allXp,
    };
  }, [achievementsWithStatus]);

  // 最近解锁的成就（按 user.achievements 顺序，取最后 4 个）
  const recentUnlocked = useMemo(() => {
    return user.achievements
      .slice(-4)
      .reverse()
      .map((id) => achievements.find((a) => a.id === id))
      .filter((a): a is Achievement => Boolean(a));
  }, [user.achievements]);

  const activeTabMeta = CATEGORY_TABS.find((t) => t.key === activeCategory)!;

  return (
    <div className="space-y-6">
      {/* ===== 1. 页面标题 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-5 text-white shadow-lg sm:p-6"
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-yellow-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm ring-2 ring-white/30 sm:h-16 sm:w-16">
            🏅
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">成就殿堂</h1>
            <p className="mt-0.5 text-sm text-white/90">收集徽章，记录你的冒险足迹</p>
          </div>
          <div className="hidden shrink-0 rounded-2xl bg-white/20 px-4 py-2.5 text-center backdrop-blur-sm sm:block">
            <div className="text-[11px] font-medium text-white/80">已解锁</div>
            <div className="text-2xl font-extrabold">
              {stats.unlocked}
              <span className="text-base font-medium text-white/80">/{stats.total}</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ===== 2. 成就统计概览 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="card p-5"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Trophy className="h-4 w-4" />
          </div>
          <h2 className="text-base font-bold text-dark-900">成就进度</h2>
          <span className="badge bg-emerald-50 text-emerald-600">
            {stats.progressPct}%
          </span>
        </div>

        <ProgressBar
          value={stats.progressPct}
          color="from-emerald-500 to-cyan-500"
          height="h-3"
          showLabel
          label={`${stats.unlocked} / ${stats.total} 已解锁`}
        />

        {/* 奖励统计 */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-3 text-center ring-1 ring-amber-100">
            <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-dark-500">
              <Coins className="h-3 w-3 text-amber-500" />
              金币
            </div>
            <div className="mt-1 text-lg font-extrabold text-amber-600">
              {stats.totalCoins.toLocaleString()}
            </div>
            <div className="text-[10px] text-dark-400">
              / {stats.allCoins.toLocaleString()}
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-cyan-50 to-sky-50 p-3 text-center ring-1 ring-cyan-100">
            <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-dark-500">
              <Gem className="h-3 w-3 text-cyan-500" />
              宝石
            </div>
            <div className="mt-1 text-lg font-extrabold text-cyan-600">
              {stats.totalGems.toLocaleString()}
            </div>
            <div className="text-[10px] text-dark-400">
              / {stats.allGems.toLocaleString()}
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 p-3 text-center ring-1 ring-violet-100">
            <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-dark-500">
              <Zap className="h-3 w-3 text-violet-500" />
              经验
            </div>
            <div className="mt-1 text-lg font-extrabold text-violet-600">
              {stats.totalXp.toLocaleString()}
            </div>
            <div className="text-[10px] text-dark-400">
              / {stats.allXp.toLocaleString()}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ===== 3. 最近解锁 ===== */}
      {recentUnlocked.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="card overflow-hidden p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-dark-900">最近解锁</h2>
            <span className="badge bg-amber-50 text-amber-600">
              {recentUnlocked.length} 个
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {recentUnlocked.map((ach, i) => (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50/60 to-transparent px-3 py-2.5"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${CATEGORY_GRADIENTS[ach.category]} text-2xl shadow-sm`}
                >
                  {ach.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-bold text-dark-900">{ach.name}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success-500" />
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-dark-500">
                    <span className="inline-flex items-center gap-0.5">
                      <Sparkles className="h-2.5 w-2.5" />
                      {CATEGORY_LABELS[ach.category]}
                    </span>
                    <span className="text-dark-300">·</span>
                    <span className="text-success-600">已解锁</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ===== 4. 分类筛选 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <div className="mb-3 flex items-center gap-2 px-1">
          <Filter className="h-3.5 w-3.5 text-dark-500" />
          <span className="text-xs font-bold text-dark-600">分类筛选</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_TABS.map((tab) => {
            const active = tab.key === activeCategory;
            const count =
              tab.key === 'all'
                ? achievementsWithStatus.length
                : achievementsWithStatus.filter((a) => a.category === tab.key).length;
            const unlockedCount =
              tab.key === 'all'
                ? achievementsWithStatus.filter((a) => a.unlocked).length
                : achievementsWithStatus.filter((a) => a.category === tab.key && a.unlocked).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md'
                    : 'bg-white text-dark-600 ring-1 ring-dark-100 hover:bg-dark-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0 text-[10px] ${
                    active ? 'bg-white/25' : 'bg-dark-100 text-dark-500'
                  }`}
                >
                  {unlockedCount}/{count}
                </span>
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* ===== 5. 成就卡片网格 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredAchievements.map((ach, i) => (
              <AchievementCard
                key={ach.id}
                achievement={ach}
                index={i}
                isHovered={hoveredId === ach.id}
                onHoverChange={(h) => setHoveredId(h ? ach.id : null)}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredAchievements.length === 0 && (
          <div className="rounded-2xl border border-dashed border-dark-200 bg-white/60 px-6 py-10 text-center text-sm text-dark-500">
            该分类暂无成就
          </div>
        )}
      </motion.section>

      {/* ===== 6. 底部说明 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4"
      >
        <div className="flex items-start gap-2 text-xs text-dark-600">
          <Award className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          <p>
            完成学习任务、保持连胜、攻克挑战均可解锁成就。每个成就都会带来
            <span className="font-bold text-amber-600">金币</span>、
            <span className="font-bold text-cyan-600">宝石</span>或
            <span className="font-bold text-violet-600">经验</span>奖励，已解锁的成就会在
            <span className="font-bold text-dark-800"> 最近解锁 </span>
            中展示。未解锁的成就会显示为问号，努力达成条件吧！
          </p>
        </div>
      </motion.section>
    </div>
  );
};

// ===== 成就卡片 =====
const AchievementCard: React.FC<{
  achievement: Achievement;
  index: number;
  isHovered: boolean;
  onHoverChange: (hovered: boolean) => void;
}> = ({ achievement, index, isHovered, onHoverChange }) => {
  const unlocked = achievement.unlocked;
  const gradient = CATEGORY_GRADIENTS[achievement.category];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-2xl border p-4 transition-all ${
        unlocked
          ? 'border-dark-100 bg-white shadow-sm hover:shadow-md'
          : 'border-dark-100 bg-dark-50/40'
      }`}
    >
      {/* 已解锁卡片右上角光晕 */}
      {unlocked && (
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-amber-200/40 to-transparent blur-2xl" />
      )}

      <div className="relative flex items-start gap-3">
        {/* 徽章图标 */}
        <motion.div
          className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-sm ${
            unlocked
              ? `bg-gradient-to-br ${gradient} ring-2 ring-white/60`
              : 'bg-dark-200 grayscale'
          }`}
          animate={isHovered && unlocked ? { rotate: [0, -6, 6, 0], scale: 1.06 } : {}}
          transition={{ duration: 0.4 }}
        >
          {unlocked ? (
            achievement.icon
          ) : (
            <span className="text-dark-400">
              <Lock className="h-5 w-5" />
            </span>
          )}
          {unlocked && (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-success-500 ring-2 ring-white">
              <CheckCircle2 className="h-3 w-3 text-white" />
            </span>
          )}
        </motion.div>

        {/* 文案 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3
              className={`truncate text-sm font-extrabold ${
                unlocked ? 'text-dark-900' : 'text-dark-500'
              }`}
            >
              {unlocked ? achievement.name : '???'}
            </h3>
            <span
              className={`badge px-1.5 py-0 text-[10px] ${
                unlocked
                  ? 'bg-dark-100 text-dark-600'
                  : 'bg-dark-100 text-dark-400'
              }`}
            >
              {CATEGORY_LABELS[achievement.category]}
            </span>
          </div>
          <p
            className={`mt-1 line-clamp-2 text-xs leading-relaxed ${
              unlocked ? 'text-dark-600' : 'text-dark-400'
            }`}
          >
            {unlocked ? achievement.description : '解锁后查看详情'}
          </p>
        </div>
      </div>

      {/* 解锁条件 / 奖励 */}
      <div className="mt-3 space-y-2 border-t border-dark-100 pt-3">
        {/* 解锁条件 */}
        <div className="flex items-start gap-1.5 text-[11px]">
          <span className="font-bold text-dark-500">条件：</span>
          <span className={`flex-1 ${unlocked ? 'text-dark-600' : 'text-dark-500'}`}>
            {achievement.requirement}
          </span>
        </div>

        {/* 奖励 */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-dark-500">奖励：</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {achievement.reward.coins && (
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  unlocked
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-dark-100 text-dark-400'
                }`}
              >
                <Coins className="h-2.5 w-2.5" />
                {achievement.reward.coins}
              </span>
            )}
            {achievement.reward.gems && (
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  unlocked
                    ? 'bg-cyan-50 text-cyan-600'
                    : 'bg-dark-100 text-dark-400'
                }`}
              >
                <Gem className="h-2.5 w-2.5" />
                {achievement.reward.gems}
              </span>
            )}
            {achievement.reward.xp && (
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  unlocked
                    ? 'bg-violet-50 text-violet-600'
                    : 'bg-dark-100 text-dark-400'
                }`}
              >
                <Zap className="h-2.5 w-2.5" />
                {achievement.reward.xp}
              </span>
            )}
          </div>
        </div>

        {/* 状态标签 */}
        <div className="pt-1">
          {unlocked ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success-600">
              <CheckCircle2 className="h-3 w-3" />
              已解锁
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-dark-400">
              <Lock className="h-3 w-3" />
              未解锁
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Achievements;
