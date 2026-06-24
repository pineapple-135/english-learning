import React from 'react';
import { motion } from 'framer-motion';
import { getLevelName } from '../../utils/helpers';

export interface LevelBadgeProps {
  level: number;
  /** 尺寸：sm/md/lg */
  size?: 'sm' | 'md' | 'lg';
  /** 是否显示等级名称（在徽章下方） */
  showName?: boolean;
  /** 是否带光晕动画 */
  glow?: boolean;
}

const sizeMap = {
  sm: { box: 'h-9 w-9', text: 'text-sm', ring: 'ring-4' },
  md: { box: 'h-14 w-14', text: 'text-xl', ring: 'ring-[6px]' },
  lg: { box: 'h-20 w-20', text: 'text-3xl', ring: 'ring-8' },
};

/** 根据等级范围返回渐变背景（Tailwind from-to 类） */
function getGradient(level: number): string {
  if (level >= 91) return 'from-rose-400 to-purple-600';
  if (level >= 71) return 'from-amber-400 to-orange-600';
  if (level >= 46) return 'from-cyan-400 to-blue-600';
  if (level >= 26) return 'from-emerald-400 to-teal-600';
  if (level >= 11) return 'from-violet-400 to-indigo-600';
  return 'from-slate-300 to-slate-500';
}

function getRingColor(level: number): string {
  if (level >= 91) return 'ring-rose-100';
  if (level >= 71) return 'ring-amber-100';
  if (level >= 46) return 'ring-cyan-100';
  if (level >= 26) return 'ring-emerald-100';
  if (level >= 11) return 'ring-violet-100';
  return 'ring-slate-100';
}

const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  size = 'md',
  showName = false,
  glow = true,
}) => {
  const s = sizeMap[size];
  const gradient = getGradient(level);
  const ring = getRingColor(level);

  return (
    <div className="inline-flex flex-col items-center">
      <motion.div
        className={`relative flex ${s.box} items-center justify-center rounded-full bg-gradient-to-br ${gradient} ${s.ring} ${ring} shadow-lg ${
          glow ? 'ring-opacity-60' : ''
        }`}
        whileHover={{ scale: 1.06, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        initial={glow ? { boxShadow: '0 0 0 rgba(99,102,241,0)' } : false}
        animate={
          glow
            ? {
                boxShadow: [
                  '0 0 8px rgba(99,102,241,0.4)',
                  '0 0 22px rgba(249,115,22,0.55)',
                  '0 0 8px rgba(99,102,241,0.4)',
                ],
              }
            : undefined
        }
        transition={glow ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        {/* 内部高光 */}
        <span className="absolute inset-1 rounded-full bg-white/20" />
        <span className={`relative font-extrabold text-white drop-shadow ${s.text}`}>
          {level}
        </span>
        {/* 顶部小星 */}
        <span
          className={`absolute -top-1 right-0 text-[10px] ${
            size === 'lg' ? 'text-base' : ''
          }`}
        >
          ⭐
        </span>
      </motion.div>
      {showName && (
        <span className="mt-2 text-xs font-semibold text-dark-600">
          {getLevelName(level)}
        </span>
      )}
    </div>
  );
};

export default LevelBadge;
