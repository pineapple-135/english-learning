import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Gem, CalendarClock } from 'lucide-react';
import { useStore } from '../../store/StoreContext';
import {
  getLevelName,
  getLevelProgress,
  getXpForLevel,
  daysUntil,
  formatNumber,
} from '../../utils/helpers';
import LevelBadge from '../game/LevelBadge';
import StreakFlame from '../game/StreakFlame';
import ProgressBar from '../ui/ProgressBar';

const Header: React.FC = () => {
  const { state } = useStore();
  const { user } = state;
  const required = getXpForLevel(user.level);
  const progress = getLevelProgress(user.level, user.xp);

  const examDays = user.examDate ? daysUntil(user.examDate) : null;
  const examLabel =
    examDays === null
      ? null
      : examDays > 0
      ? `距 FCE 还有 ${examDays} 天`
      : examDays === 0
      ? 'FCE 考试今天！'
      : 'FCE 已结束';

  return (
    <header className="sticky top-0 z-20 border-b border-dark-100 bg-white/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:gap-4 sm:px-6">
        {/* 等级徽章 + 名称（桌面端显示名称） */}
        <div className="flex items-center gap-3">
          <LevelBadge level={user.level} size="sm" glow />
          <div className="hidden sm:block">
            <div className="text-xs text-dark-500">等级</div>
            <div className="text-sm font-bold text-dark-900">
              {getLevelName(user.level)}
            </div>
          </div>
        </div>

        {/* XP 进度条 */}
        <div className="flex-1 min-w-0 max-w-md">
          <div className="flex items-center justify-between text-[11px] font-medium text-dark-500">
            <span className="hidden sm:inline">经验值</span>
            <span>
              <span className="font-bold text-primary-600">{formatNumber(user.xp)}</span>
              <span className="text-dark-300"> / {formatNumber(required)} XP</span>
            </span>
          </div>
          <div className="mt-1">
            <ProgressBar
              value={progress}
              height="h-2"
              color="from-primary-500 to-accent-500"
            />
          </div>
        </div>

        {/* 资源区 */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* 连胜火焰 */}
          <StreakFlame streak={user.streak} size="sm" />

          {/* 金币 */}
          <div
            className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1"
            title="金币"
          >
            <Coins className="h-4 w-4 text-amber-500" fill="currentColor" />
            <span className="text-sm font-bold text-amber-700">
              {formatNumber(user.coins)}
            </span>
          </div>

          {/* 宝石 */}
          <div
            className="flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1"
            title="宝石"
          >
            <Gem className="h-4 w-4 text-cyan-500" fill="currentColor" />
            <span className="text-sm font-bold text-cyan-700">
              {formatNumber(user.gems)}
            </span>
          </div>

          {/* FCE 倒计时 */}
          {examLabel && (
            <motion.div
              className="hidden md:flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              title={user.examDate ?? ''}
            >
              <CalendarClock className="h-4 w-4 text-rose-500" />
              <span className="text-xs font-bold text-rose-700">{examLabel}</span>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
