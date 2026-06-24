import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export interface StreakFlameProps {
  /** 连胜天数 */
  streak: number;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否显示文字 */
  showLabel?: boolean;
}

const sizeMap = {
  sm: { icon: 'h-4 w-4', text: 'text-xs', pad: 'px-2 py-0.5' },
  md: { icon: 'h-5 w-5', text: 'text-sm', pad: 'px-2.5 py-1' },
  lg: { icon: 'h-7 w-7', text: 'text-base', pad: 'px-3 py-1.5' },
};

/** 根据连胜天数返回火焰强度等级 */
function getIntensity(streak: number): {
  color: string;
  glow: string;
  scale: number;
  label: string;
} {
  if (streak <= 0) return { color: 'text-dark-300', glow: '', scale: 1, label: '未开始' };
  if (streak < 3) return { color: 'text-orange-400', glow: 'drop-shadow-[0_0_4px_rgba(251,146,60,0.5)]', scale: 1, label: '起步' };
  if (streak < 7) return { color: 'text-orange-500', glow: 'drop-shadow-[0_0_6px_rgba(249,115,22,0.65)]', scale: 1.05, label: '渐入佳境' };
  if (streak < 30) return { color: 'text-orange-600', glow: 'drop-shadow-[0_0_10px_rgba(234,88,12,0.75)]', scale: 1.12, label: '火热' };
  if (streak < 100) return { color: 'text-rose-500', glow: 'drop-shadow-[0_0_14px_rgba(244,63,94,0.85)]', scale: 1.22, label: '炽热' };
  return { color: 'text-rose-600', glow: 'drop-shadow-[0_0_18px_rgba(225,29,72,0.95)]', scale: 1.35, label: '传奇' };
}

const StreakFlame: React.FC<StreakFlameProps> = ({
  streak,
  size = 'md',
  showLabel = true,
}) => {
  const s = sizeMap[size];
  const intensity = getIntensity(streak);
  const active = streak > 0;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full ${
        active ? 'bg-orange-50' : 'bg-dark-100'
      } ${s.pad}`}
      title={intensity.label}
    >
      <motion.div
        animate={
          active
            ? {
                scale: [intensity.scale, intensity.scale * 1.15, intensity.scale],
                rotate: [0, -3, 3, 0],
              }
            : { scale: 1 }
        }
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`${intensity.color} ${intensity.glow}`}
      >
        <Flame className={s.icon} fill={active ? 'currentColor' : 'none'} />
      </motion.div>
      {showLabel && (
        <span
          className={`font-bold ${s.text} ${
            active ? 'text-orange-700' : 'text-dark-500'
          }`}
        >
          {streak}
          <span className="ml-0.5 font-medium text-dark-500">天</span>
        </span>
      )}
    </div>
  );
};

export default StreakFlame;
