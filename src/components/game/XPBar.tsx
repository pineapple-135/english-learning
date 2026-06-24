import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { getLevelName, getLevelProgress, getXpForLevel } from '../../utils/helpers';
import LevelBadge from './LevelBadge';

export interface XPBarProps {
  level: number;
  xp: number;
  /** 是否显示等级徽章（默认 true） */
  showBadge?: boolean;
  /** 是否显示等级名称 */
  showName?: boolean;
  /** 紧凑模式（隐藏副文本） */
  compact?: boolean;
}

const XPBar: React.FC<XPBarProps> = ({
  level,
  xp,
  showBadge = true,
  showName = true,
  compact = false,
}) => {
  const required = getXpForLevel(level);
  const progress = getLevelProgress(level, xp);

  return (
    <div className="flex items-center gap-3">
      {showBadge && <LevelBadge level={level} size={compact ? 'sm' : 'md'} glow={false} />}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          {showName && (
            <span className="truncate text-sm font-semibold text-dark-800">
              {getLevelName(level)}
            </span>
          )}
          <span className="shrink-0 text-xs font-medium text-dark-500">
            <span className="text-primary-600 font-bold">{xp}</span>
            <span className="mx-0.5 text-dark-300">/</span>
            <span>{required} XP</span>
          </span>
        </div>
        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-dark-200">
          <motion.div
            className="relative h-full rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-accent-500 shadow-sm"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* 流动高光 */}
            <motion.span
              className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              animate={{ x: ['-100%', '300%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>
        {!compact && (
          <div className="mt-1 flex items-center gap-1 text-[11px] text-dark-400">
            <Sparkles className="h-3 w-3 text-accent-500" />
            <span>距离下一级还差 {Math.max(0, required - xp)} XP</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default XPBar;
