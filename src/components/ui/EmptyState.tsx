import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  /** Lucide 图标组件 */
  icon?: LucideIcon;
  /** emoji 图标（与 icon 二选一） */
  emoji?: string;
  /** 标题 */
  title: string;
  /** 描述文字 */
  description?: string;
  /** 操作按钮文字 */
  actionText?: string;
  /** 操作按钮回调 */
  onAction?: () => void;
  /** 是否使用主色按钮 */
  primaryAction?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  emoji,
  title,
  description,
  actionText,
  onAction,
  primaryAction = true,
}) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-dark-200 bg-white/60 px-6 py-14 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 text-4xl"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {Icon ? <Icon className="h-9 w-9 text-primary-500" /> : <span>{emoji ?? '📭'}</span>}
      </motion.div>
      <h3 className="mt-5 text-lg font-bold text-dark-800">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-dark-500">{description}</p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className={primaryAction ? 'btn-primary mt-6' : 'btn-ghost mt-6'}
        >
          {actionText}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
