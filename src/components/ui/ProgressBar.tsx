import React from 'react';
import { motion } from 'framer-motion';

export interface ProgressBarProps {
  /** 进度值 0-100 */
  value: number;
  /** 颜色（Tailwind 渐变 from-to） */
  color?: string;
  /** 高度（Tailwind h-* 类，默认 h-2.5） */
  height?: string;
  /** 是否显示文字标签 */
  showLabel?: boolean;
  /** 自定义标签文字 */
  label?: string;
  /** 是否带动画（默认 true） */
  animate?: boolean;
  /** 追踪条背景色 */
  trackColor?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'from-primary-500 to-accent-500',
  height = 'h-2.5',
  showLabel = false,
  label,
  animate = true,
  trackColor = 'bg-dark-200',
}) => {
  const clamped = Math.max(0, Math.min(100, value));

  const bar = (
    <div
      className={`relative w-full overflow-hidden rounded-full ${trackColor} ${height}`}
    >
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${color} shadow-sm`}
        initial={animate ? { width: 0 } : false}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="h-full w-full rounded-full bg-gradient-to-r from-white/30 to-transparent opacity-60" />
      </motion.div>
    </div>
  );

  if (!showLabel) return bar;

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between text-xs font-medium text-dark-600">
        <span>{label ?? ''}</span>
        <span>{Math.round(clamped)}%</span>
      </div>
      {bar}
    </div>
  );
};

export default ProgressBar;
