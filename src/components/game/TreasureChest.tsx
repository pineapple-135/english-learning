import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Gem, X } from 'lucide-react';
import { TreasureChest as TreasureChestType } from '../../types';

export interface TreasureChestProps {
  chest: TreasureChestType;
  /** 打开回调，返回实际获得的奖励 */
  onOpen?: (chest: TreasureChestType, reward: { coins: number; gems: number }) => void;
  /** 是否禁用（已打开过） */
  disabled?: boolean;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getGradient(type: TreasureChestType['type']): string {
  switch (type) {
    case 'legendary':
      return 'from-rose-500 via-amber-400 to-yellow-300';
    case 'large':
      return 'from-purple-500 to-indigo-600';
    case 'medium':
      return 'from-sky-500 to-blue-600';
    case 'small':
    default:
      return 'from-amber-500 to-orange-600';
  }
}

function getChestEmoji(type: TreasureChestType['type']): string {
  switch (type) {
    case 'legendary':
      return '🥇';
    case 'large':
      return '🎁';
    case 'medium':
      return '📦';
    case 'small':
    default:
      return '🧰';
  }
}

const TreasureChest: React.FC<TreasureChestProps> = ({ chest, onOpen, disabled }) => {
  const [opened, setOpened] = useState(chest.opened);
  const [reward, setReward] = useState<{ coins: number; gems: number } | null>(null);
  const [showReward, setShowReward] = useState(false);

  const handleOpen = () => {
    if (opened || disabled) return;
    const r = {
      coins: randomBetween(chest.rewards.coinsMin, chest.rewards.coinsMax),
      gems: randomBetween(chest.rewards.gemsMin, chest.rewards.gemsMax),
    };
    setReward(r);
    setOpened(true);
    setShowReward(true);
    onOpen?.(chest, r);
    setTimeout(() => setShowReward(false), 3500);
  };

  const gradient = getGradient(chest.type);
  const emoji = getChestEmoji(chest.type);

  return (
    <div className="relative">
      <motion.button
        onClick={handleOpen}
        disabled={opened || disabled}
        className={`relative flex h-28 w-full flex-col items-center justify-center gap-1 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg transition-all disabled:cursor-not-allowed ${
          opened ? 'opacity-70 grayscale-[0.4]' : 'hover:shadow-xl'
        }`}
        whileHover={!opened ? { scale: 1.03, rotate: -1 } : undefined}
        whileTap={!opened ? { scale: 0.96 } : undefined}
        animate={
          !opened
            ? { y: [0, -4, 0] }
            : undefined
        }
        transition={
          !opened
            ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
            : undefined
        }
      >
        <motion.span
          className="text-4xl drop-shadow"
          animate={opened ? { rotate: [-10, 0, 10, 0], scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.6 }}
        >
          {opened ? '✨' : emoji}
        </motion.span>
        <span className="text-xs font-semibold text-white drop-shadow">
          {opened ? '已开启' : chest.name}
        </span>
        {!opened && (
          <span className="absolute -right-1 -top-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-accent-600 shadow">
            可开启
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {showReward && reward && (
          <motion.div
            className="absolute inset-x-0 -top-2 z-20 mx-auto w-[90%] -translate-y-full"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
          >
            <div className="relative rounded-xl border border-amber-200 bg-white p-3 shadow-xl">
              <button
                onClick={() => setShowReward(false)}
                className="absolute right-1.5 top-1.5 text-dark-400 hover:text-dark-700"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="flex items-center justify-around">
                {reward.coins > 0 && (
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-amber-500" />
                    <span className="font-bold text-amber-700">+{reward.coins}</span>
                  </div>
                )}
                {reward.gems > 0 && (
                  <div className="flex items-center gap-1">
                    <Gem className="h-4 w-4 text-cyan-500" />
                    <span className="font-bold text-cyan-700">+{reward.gems}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TreasureChest;
