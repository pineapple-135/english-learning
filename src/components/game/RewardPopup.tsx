import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Coins, Zap } from 'lucide-react';

export interface RewardPopupProps {
  /** 唯一标识，变化时显示弹窗 */
  trigger: number | string;
  /** 获得的 XP */
  xp?: number;
  /** 获得的金币 */
  coins?: number;
  /** 获得的宝石 */
  gems?: number;
  /** 标题 */
  title?: string;
  /** 自动消失毫秒，默认 2800 */
  duration?: number;
  /** 关闭回调 */
  onClose?: () => void;
}

const RewardPopup: React.FC<RewardPopupProps> = ({
  trigger,
  xp = 0,
  coins = 0,
  gems = 0,
  title = '奖励到手！',
  duration = 2800,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger === 0 || trigger === '') return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(t);
  }, [trigger, duration, onClose]);

  const rewards: { icon: typeof Star; value: number; color: string; label: string }[] = [];
  if (xp > 0) rewards.push({ icon: Zap, value: xp, color: 'text-primary-600 bg-primary-50', label: 'XP' });
  if (coins > 0) rewards.push({ icon: Coins, value: coins, color: 'text-amber-600 bg-amber-50', label: '金币' });
  if (gems > 0) rewards.push({ icon: Star, value: gems, color: 'text-cyan-600 bg-cyan-50', label: '宝石' });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-dark-900/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setVisible(false);
            onClose?.();
          }}
        >
          <motion.div
            className="relative w-[88%] max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-2xl"
            initial={{ scale: 0.6, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.7, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部渐变 */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary-100/70 to-transparent" />

            <button
              onClick={() => {
                setVisible(false);
                onClose?.();
              }}
              className="absolute right-3 top-3 z-10 rounded-full p-1 text-dark-400 hover:bg-dark-100 hover:text-dark-700"
              aria-label="关闭"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative text-center">
              <motion.div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-3xl shadow-lg"
                initial={{ rotate: -30, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 14 }}
              >
                🎉
              </motion.div>
              <h3 className="mt-4 text-xl font-extrabold text-dark-900">{title}</h3>
              <p className="mt-1 text-sm text-dark-500">继续加油，冒险者！</p>

              <div className="mt-5 space-y-2.5">
                {rewards.map((r, i) => (
                  <motion.div
                    key={r.label}
                    className="flex items-center justify-between rounded-xl bg-dark-50 px-4 py-2.5"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.12 }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${r.color}`}>
                        <r.icon className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium text-dark-700">{r.label}</span>
                    </div>
                    <motion.span
                      className="text-lg font-extrabold text-dark-900"
                      initial={{ scale: 0.6 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.12, type: 'spring', stiffness: 300 }}
                    >
                      +{r.value}
                    </motion.span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RewardPopup;
