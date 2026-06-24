import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  /** Lucide 图标组件 */
  icon: LucideIcon;
  /** 标签文字 */
  label: string;
  /** 主数值 */
  value: string | number;
  /** 图标和强调色（Tailwind 文本/背景类前缀，如 'primary', 'accent', 'success'） */
  color?: 'primary' | 'accent' | 'success' | 'danger' | 'cyan' | 'purple';
  /** 趋势数值（正负） */
  trend?: number;
  /** 趋势后缀文字 */
  trendLabel?: string;
  /** 副标题 */
  subtitle?: string;
}

const colorMap: Record<
  string,
  { bg: string; text: string; ring: string }
> = {
  primary: { bg: 'bg-primary-50', text: 'text-primary-600', ring: 'ring-primary-100' },
  accent: { bg: 'bg-accent-50', text: 'text-accent-600', ring: 'ring-accent-100' },
  success: { bg: 'bg-green-50', text: 'text-green-600', ring: 'ring-green-100' },
  danger: { bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-100' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', ring: 'ring-cyan-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-100' },
};

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  color = 'primary',
  trend,
  trendLabel,
  subtitle,
}) => {
  const c = colorMap[color] ?? colorMap.primary;
  const trendUp = typeof trend === 'number' && trend >= 0;
  const trendDown = typeof trend === 'number' && trend < 0;

  return (
    <motion.div
      className="card card-hover p-4 sm:p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ring-4 ${c.bg} ${c.ring}`}
        >
          <Icon className={`h-5 w-5 ${c.text}`} />
        </div>
        {(trendUp || trendDown) && (
          <span
            className={`badge ${
              trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}
          >
            {trendUp ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trendUp ? '+' : ''}
            {trend}
            {trendLabel ? ` ${trendLabel}` : ''}
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-dark-900 sm:text-3xl">{value}</div>
        <div className="mt-0.5 text-sm font-medium text-dark-500">{label}</div>
        {subtitle && <div className="mt-1 text-xs text-dark-400">{subtitle}</div>}
      </div>
    </motion.div>
  );
};

export default StatCard;
