import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Medal,
  Crown,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  Info,
  TrendingUp,
  Users,
  Calendar,
  Heart,
} from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { leaderboardData, rankTiers } from '../data/gameData';
import {
  getRankColor,
  getRankGradient,
  getLevelName,
  getLevelIcon,
  formatNumber,
} from '../utils/helpers';
import { LeaderboardEntry } from '../types';
import ProgressBar from '../components/ui/ProgressBar';
import StreakFlame from '../components/game/StreakFlame';

type TabKey = 'weekly' | 'monthly' | 'friends';

const TABS: { key: TabKey; label: string; icon: typeof Users; desc: string }[] = [
  {
    key: 'weekly',
    label: '周榜',
    icon: Users,
    desc: '按等级相近分组，每组 30 人，Top 5 升段',
  },
  {
    key: 'monthly',
    label: '月榜',
    icon: Calendar,
    desc: '全站排名，Top 100 强者云集',
  },
  {
    key: 'friends',
    label: '好友榜',
    icon: Heart,
    desc: '与好友互相追赶，共同进步',
  },
];

// 段位图标映射
const RANK_ICONS: Record<string, string> = {
  青铜学徒: '🥉',
  白银探索者: '🥈',
  黄金行者: '🥇',
  铂金骑士: '💎',
  钻石战士: '🔷',
  宗师语言家: '👑',
  传奇大师: '🌟',
};

// 每段位所需的段位点数（用于进度计算）
const POINTS_PER_TIER = 100;

// 基于字符串的伪随机数（保持稳定，避免每次渲染都变）
function seededRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// 为排行榜每行生成稳定的排名变化（-3..+3）
function getRankDelta(id: string): number {
  const r = seededRandom(id);
  const val = r % 7; // 0..6
  return val - 3; // -3..+3
}

const Leaderboard: React.FC = () => {
  const { state } = useStore();
  const { user } = state;
  const [activeTab, setActiveTab] = useState<TabKey>('weekly');

  // 将当前用户构造成 LeaderboardEntry
  const currentUserEntry: LeaderboardEntry = useMemo(
    () => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      level: user.level,
      xp: user.xp + user.level * 100, // 累计 XP 用于和榜单比较
      streak: user.streak,
      rankTier: user.rankTier,
      isCurrentUser: true,
    }),
    [user],
  );

  // 合并当前用户与榜单数据
  const mergedList = useMemo(() => {
    // 去重：若榜单中已含同 id 则替换，否则加入
    const map = new Map<string, LeaderboardEntry>();
    [...leaderboardData, currentUserEntry].forEach((e) => map.set(e.id, e));
    return Array.from(map.values());
  }, [currentUserEntry]);

  // 按 Tab 生成展示列表
  const displayList = useMemo(() => {
    const sorted = [...mergedList].sort((a, b) => b.xp - a.xp);

    if (activeTab === 'monthly') {
      // 全站 Top 100
      return sorted.slice(0, 100);
    }

    if (activeTab === 'friends') {
      // 好友榜：取与当前用户相近的 8 位 + 自己
      const others = sorted.filter((e) => !e.isCurrentUser);
      // 稳定采样：基于 id 哈希取 8 个
      const picked = others
        .map((e) => ({ e, k: seededRandom(e.id) % 1000 }))
        .sort((a, b) => a.k - b.k)
        .slice(0, 8)
        .map((x) => x.e);
      return [...picked, currentUserEntry].sort((a, b) => b.xp - a.xp);
    }

    // weekly：按等级相近分组（每组 30 人），找出当前用户所在组
    const userLevel = currentUserEntry.level;
    // 按等级差距排序，取前 30
    const byLevelDistance = [...sorted].sort((a, b) => {
      const da = Math.abs(a.level - userLevel);
      const db = Math.abs(b.level - userLevel);
      if (da !== db) return da - db;
      return b.xp - a.xp;
    });
    const group = byLevelDistance.slice(0, 30);
    // 组内按 XP 排序
    return group.sort((a, b) => b.xp - a.xp);
  }, [mergedList, activeTab, currentUserEntry]);

  // 当前用户在本榜中的排名
  const currentUserRank = useMemo(() => {
    const idx = displayList.findIndex((e) => e.isCurrentUser);
    return idx >= 0 ? idx + 1 : null;
  }, [displayList]);

  // 段位信息
  const currentTierIndex = rankTiers.indexOf(user.rankTier);
  const nextTier = rankTiers[currentTierIndex + 1] ?? null;
  const rankProgressPct =
    nextTier !== null
      ? Math.min(100, Math.round((user.rankPoints % POINTS_PER_TIER) / POINTS_PER_TIER * 100))
      : 100;
  const pointsToNext =
    nextTier !== null
      ? Math.max(0, POINTS_PER_TIER - (user.rankPoints % POINTS_PER_TIER))
      : 0;

  const activeTabMeta = TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="space-y-6">
      {/* ===== 1. 页面标题 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-5 text-white shadow-lg sm:p-6"
      >
        <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-yellow-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm ring-2 ring-white/30 sm:h-16 sm:w-16">
            🏆
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">排行榜</h1>
            <p className="mt-0.5 text-sm text-white/90">与全球学习者一较高下</p>
          </div>
          {currentUserRank !== null && (
            <div className="hidden shrink-0 rounded-2xl bg-white/20 px-4 py-2.5 text-center backdrop-blur-sm sm:block">
              <div className="text-[11px] font-medium text-white/80">我的当前排名</div>
              <div className="text-2xl font-extrabold">#{currentUserRank}</div>
            </div>
          )}
        </div>
      </motion.section>

      {/* ===== 2. 排行榜类型切换 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-dark-100">
          {TABS.map((tab) => {
            const active = tab.key === activeTab;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-sm font-bold transition-all sm:px-3 sm:py-3 ${
                  active
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                    : 'text-dark-600 hover:bg-dark-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 flex items-center justify-center gap-1 text-center text-xs text-dark-500">
          <Info className="h-3 w-3" />
          {activeTabMeta.desc}
        </p>
      </motion.section>

      {/* ===== 3. 段位展示 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card overflow-hidden p-5 sm:p-6"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {/* 段位徽章 */}
          <div className="flex items-center gap-4">
            <motion.div
              className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${getRankGradient(
                user.rankTier,
              )} text-4xl shadow-lg ring-4 ring-white/60`}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="drop-shadow">{RANK_ICONS[user.rankTier] ?? '🎖️'}</span>
            </motion.div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-dark-400">
                当前段位
              </div>
              <div className={`text-xl font-extrabold ${getRankColor(user.rankTier)}`}>
                {user.rankTier}
              </div>
              <div className="mt-0.5 text-xs text-dark-500">
                段位点 <span className="font-bold text-dark-800">{user.rankPoints}</span>
                {nextTier !== null && (
                  <>
                    {' '}· 距 <span className="font-bold">{nextTier}</span> 还差{' '}
                    <span className="font-bold text-orange-600">{pointsToNext}</span> 点
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 段位进度条 */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-dark-700">
                <TrendingUp className="h-3.5 w-3.5" />
                段位进度
              </span>
              <span className="font-semibold text-dark-500">{rankProgressPct}%</span>
            </div>
            <ProgressBar
              value={rankProgressPct}
              color={getRankGradient(user.rankTier)}
              height="h-3"
            />
            <div className="flex items-center justify-between text-[11px] text-dark-400">
              <span className="inline-flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full bg-gradient-to-br ${getRankGradient(user.rankTier)}`} />
                {user.rankTier}
              </span>
              {nextTier !== null ? (
                <span className="inline-flex items-center gap-1">
                  {nextTier}
                  <span className={`h-2 w-2 rounded-full bg-gradient-to-br ${getRankGradient(nextTier)}`} />
                </span>
              ) : (
                <span className="font-bold text-rose-500">已达最高段位</span>
              )}
            </div>
          </div>
        </div>

        {/* 段位阶层一览 */}
        <div className="mt-5 grid grid-cols-4 gap-2 border-t border-dark-100 pt-4 sm:grid-cols-7">
          {rankTiers.map((tier, i) => {
            const reached = i <= currentTierIndex;
            const isCurrent = tier === user.rankTier;
            return (
              <div
                key={tier}
                className={`flex flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-center transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-b from-orange-50 to-amber-50 ring-2 ring-orange-200'
                    : reached
                      ? 'bg-dark-50'
                      : 'bg-dark-50/40 opacity-50'
                }`}
              >
                <span className="text-lg">{RANK_ICONS[tier]}</span>
                <span className={`text-[10px] font-bold leading-tight ${reached ? 'text-dark-700' : 'text-dark-400'}`}>
                  {tier}
                </span>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* ===== 4. 排行榜列表 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="card overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-dark-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-bold text-dark-900">
              {activeTabMeta.label} · Top {displayList.length}
            </span>
          </div>
          {currentUserRank !== null && (
            <span className="badge bg-primary-50 text-primary-600">
              我 #{currentUserRank}
            </span>
          )}
        </div>

        <div className="divide-y divide-dark-50">
          <AnimatePresence mode="popLayout">
            {displayList.map((entry, idx) => {
              const rank = idx + 1;
              const delta = getRankDelta(entry.id);
              return (
                <LeaderboardRow
                  key={entry.id}
                  entry={entry}
                  rank={rank}
                  delta={delta}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ===== 5. 段位规则说明 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <Info className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-dark-900">段位与升降规则</h3>
        </div>
        <ul className="space-y-2 text-xs text-dark-600">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
            <span>
              段位从低到高：
              <span className="font-semibold text-dark-800">
                青铜 → 白银 → 黄金 → 铂金 → 钻石 → 宗师 → 传奇
              </span>
              ，每个段位需累计 100 段位点方可晋级。
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
            <span>
              <span className="font-semibold text-dark-800">周榜</span>：按等级相近分 30 人一组，
              <span className="font-bold text-success-600">前 5 名升段</span>，
              <span className="font-bold text-rose-600">末 5 名降段</span>。
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
            <span>
              <span className="font-semibold text-dark-800">月榜</span>：每月末根据全站排名结算，
              <span className="font-bold text-success-600">Top 100</span> 可获得专属奖励与段位加成。
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
            <span>
              完成任务、模考、连胜均可获得段位点，<span className="font-semibold text-dark-800">连胜 7 天</span>额外加成 +20%。
            </span>
          </li>
        </ul>
      </motion.section>
    </div>
  );
};

// ===== 单行 =====
const LeaderboardRow: React.FC<{
  entry: LeaderboardEntry;
  rank: number;
  delta: number;
}> = ({ entry, rank, delta }) => {
  const isMe = !!entry.isCurrentUser;
  const isTop1 = rank === 1;
  const isTop2 = rank === 2;
  const isTop3 = rank === 3;
  const isTop5 = rank <= 5;

  // 排名徽章样式
  const rankBadge = isTop1
    ? 'bg-gradient-to-br from-yellow-300 to-amber-500 text-white shadow-md ring-2 ring-yellow-200'
    : isTop2
      ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-white shadow-md ring-2 ring-slate-200'
      : isTop3
        ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-md ring-2 ring-amber-200'
        : 'bg-dark-100 text-dark-600';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: Math.min(rank * 0.02, 0.4) }}
      className={`relative flex items-center gap-3 px-4 py-3 transition-colors sm:px-5 sm:py-3.5 ${
        isMe
          ? 'bg-gradient-to-r from-primary-50 via-primary-50/40 to-transparent'
          : 'hover:bg-dark-50/60'
      }`}
    >
      {/* 当前用户左侧条 */}
      {isMe && (
        <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary-500 to-accent-500" />
      )}

      {/* 排名 */}
      <div className="flex w-10 shrink-0 flex-col items-center gap-1">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-extrabold ${rankBadge}`}
        >
          {isTop1 ? '👑' : isTop2 ? '🥈' : isTop3 ? '🥉' : rank}
        </div>
        {/* 排名变化 */}
        <div className="flex items-center gap-0.5 text-[10px] font-bold">
          {delta > 0 ? (
            <span className="inline-flex items-center text-success-600">
              <ArrowUp className="h-2.5 w-2.5" />
              {delta}
            </span>
          ) : delta < 0 ? (
            <span className="inline-flex items-center text-rose-500">
              <ArrowDown className="h-2.5 w-2.5" />
              {Math.abs(delta)}
            </span>
          ) : (
            <span className="inline-flex items-center text-dark-400">
              <Minus className="h-2.5 w-2.5" />
            </span>
          )}
        </div>
      </div>

      {/* 头像 */}
      <div
        className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl ring-2 ${
          isMe
            ? 'bg-primary-100 ring-primary-300'
            : isTop3
              ? 'bg-amber-50 ring-amber-200'
              : 'bg-dark-50 ring-dark-100'
        }`}
      >
        {entry.avatar}
        {isTop5 && (
          <span className="absolute -right-1 -top-1 text-xs">⭐</span>
        )}
      </div>

      {/* 用户信息 */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`truncate text-sm font-bold ${
              isMe ? 'text-primary-700' : 'text-dark-900'
            }`}
          >
            {entry.name}
          </span>
          {isMe && (
            <span className="badge bg-primary-100 px-1.5 py-0 text-[10px] text-primary-700">
              我
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-dark-500">
          <span className="inline-flex items-center gap-0.5">
            <Sparkles className="h-2.5 w-2.5 text-primary-400" />
            Lv.{entry.level}
          </span>
          <span className="text-dark-300">·</span>
          <span className="truncate">{getLevelName(entry.level)} {getLevelIcon(entry.level)}</span>
          <span className="text-dark-300">·</span>
          <StreakFlame streak={entry.streak} size="sm" showLabel />
        </div>
      </div>

      {/* 段位徽章 */}
      <div className="hidden shrink-0 sm:block">
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${getRankGradient(
            entry.rankTier,
          )} px-2.5 py-1 text-[11px] font-bold text-white shadow-sm`}
        >
          <span>{RANK_ICONS[entry.rankTier] ?? '🎖️'}</span>
          {entry.rankTier}
        </span>
      </div>

      {/* XP */}
      <div className="w-16 shrink-0 text-right sm:w-20">
        <div className="text-sm font-extrabold text-dark-900">{formatNumber(entry.xp)}</div>
        <div className="text-[10px] text-dark-400">XP</div>
      </div>
    </motion.div>
  );
};

export default Leaderboard;
