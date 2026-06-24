import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  Gem,
  ShoppingBag,
  Backpack,
  Check,
  X,
  AlertCircle,
  Sparkles,
  PackageOpen,
  Zap,
} from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { shopItems } from '../data/gameData';
import { GameItem } from '../types';
import Confetti from '../components/ui/Confetti';

type CategoryKey = 'coins' | 'gems';

const CATEGORY_TABS: {
  key: CategoryKey;
  label: string;
  icon: typeof Coins;
  gradient: string;
}[] = [
  {
    key: 'coins',
    label: '金币商品',
    icon: Coins,
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    key: 'gems',
    label: '宝石商品',
    icon: Gem,
    gradient: 'from-cyan-400 to-sky-500',
  },
];

// 道具使用效果提示
const ITEM_USE_EFFECTS: Record<string, string> = {
  'item-shield': '🛡️ 连胜护盾已激活！下次断签将自动保护连胜。',
  'item-time-freeze': '⏸️ 时间冻结已准备就绪，下次限时练习可冻结 30 秒。',
  'item-xp-potion': '⚗️ 经验药水已使用！1 小时内任务经验翻倍。',
  'item-hint-card': '💡 提示卡 ×3 已装备，可在难题中使用。',
  'item-revive': '💖 复活卡已就绪，下次答错可继续挑战。',
  'item-double-coins': '💰 双倍金币卡已激活！2 小时内金币奖励翻倍。',
  'item-skip-ticket': '🎫 跳题券已装备，可跳过一道难题。',
  'item-energy-restore': '⚡ 体力已恢复满值！继续挑战高难度关卡。',
};

const Shop: React.FC = () => {
  const { state, helperFunctions } = useStore();
  const { user } = state;

  const [activeCategory, setActiveCategory] = useState<CategoryKey>('coins');
  const [confirmItem, setConfirmItem] = useState<GameItem | null>(null);
  const [purchaseTrigger, setPurchaseTrigger] = useState(0);
  const [purchaseSuccess, setPurchaseSuccess] = useState<GameItem | null>(null);
  const [useToast, setUseToast] = useState<{ itemId: string; msg: string } | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // 按货币分类
  const itemsByCategory = useMemo(() => {
    return shopItems.filter((i) => i.currency === activeCategory);
  }, [activeCategory]);

  // 已拥有的道具计数（id -> count）
  const ownedCount = useMemo(() => {
    const map = new Map<string, number>();
    user.inventory.forEach((item) => {
      map.set(item.id, (map.get(item.id) ?? 0) + 1);
    });
    return map;
  }, [user.inventory]);

  // 检查能否购买
  const canAfford = (item: GameItem): boolean => {
    if (ownedCount.has(item.id)) return false;
    return item.currency === 'coins'
      ? user.coins >= item.price
      : user.gems >= item.price;
  };

  // 货币不足
  const isTooExpensive = (item: GameItem): boolean => {
    return item.currency === 'coins'
      ? user.coins < item.price
      : user.gems < item.price;
  };

  // 点击购买
  const handleClickBuy = (item: GameItem) => {
    if (ownedCount.has(item.id)) {
      setErrorToast('该道具已拥有，可在背包中查看使用');
      setTimeout(() => setErrorToast(null), 2200);
      return;
    }
    if (isTooExpensive(item)) {
      setErrorToast(
        item.currency === 'coins' ? '金币不足，多完成任务赚取金币吧' : '宝石不足，挑战成就可获得宝石',
      );
      setTimeout(() => setErrorToast(null), 2200);
      return;
    }
    setConfirmItem(item);
  };

  // 确认购买
  const handleConfirmBuy = () => {
    if (!confirmItem) return;
    const item = confirmItem;
    // 调用 store 购买
    helperFunctions.buyItem(item);
    setConfirmItem(null);
    setPurchaseSuccess(item);
    setPurchaseTrigger((t) => t + 1);
    setTimeout(() => setPurchaseSuccess(null), 2200);
  };

  // 使用道具
  const handleUseItem = (item: GameItem) => {
    helperFunctions.useItem(item.id);
    const msg = ITEM_USE_EFFECTS[item.id] ?? `✨ 已使用 ${item.name}`;
    setUseToast({ itemId: item.id, msg });
    setTimeout(() => setUseToast(null), 2400);
  };

  // 货币展示
  const CurrencyDisplay: React.FC = () => (
    <div className="grid grid-cols-2 gap-3">
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-4 text-white shadow-md"
        whileHover={{ y: -2 }}
      >
        <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/15 blur-xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-2xl backdrop-blur-sm">
            🪙
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-white/85">金币</div>
            <div className="truncate text-2xl font-extrabold tabular-nums">
              {user.coins.toLocaleString()}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 p-4 text-white shadow-md"
        whileHover={{ y: -2 }}
      >
        <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/15 blur-xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-2xl backdrop-blur-sm">
            💎
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-white/85">宝石</div>
            <div className="truncate text-2xl font-extrabold tabular-nums">
              {user.gems.toLocaleString()}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 庆祝粒子 */}
      <Confetti trigger={purchaseTrigger} duration={2000} count={70} />

      {/* ===== 1. 页面标题 + 货币 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-5 text-white shadow-lg sm:p-6">
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-pink-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm ring-2 ring-white/30 sm:h-16 sm:w-16">
              🛒
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">冒险商店</h1>
              <p className="mt-0.5 text-sm text-white/90">用金币和宝石兑换冒险道具</p>
            </div>
            <div className="hidden shrink-0 rounded-2xl bg-white/20 px-4 py-2.5 text-center backdrop-blur-sm sm:block">
              <div className="text-[11px] font-medium text-white/80">已拥有道具</div>
              <div className="text-2xl font-extrabold">{user.inventory.length}</div>
            </div>
          </div>
        </div>

        <CurrencyDisplay />
      </motion.section>

      {/* ===== 2. 分类切换 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-dark-100">
          {CATEGORY_TABS.map((tab) => {
            const active = tab.key === activeCategory;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className={`relative flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
                  active
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-md`
                    : 'text-dark-600 hover:bg-dark-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* ===== 3. 道具卡片网格 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {itemsByCategory.map((item, i) => {
              const owned = ownedCount.has(item.id);
              const tooExpensive = isTooExpensive(item);
              const disabled = owned || tooExpensive;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  whileHover={{ y: -4 }}
                  className={`card relative flex flex-col overflow-hidden p-4 ${
                    owned ? 'ring-1 ring-success-200' : ''
                  }`}
                >
                  {/* 已拥有角标 */}
                  {owned && (
                    <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-success-100 px-2 py-0.5 text-[10px] font-bold text-success-700">
                      <Check className="h-2.5 w-2.5" />
                      已拥有
                    </div>
                  )}

                  {/* 图标 */}
                  <div
                    className={`mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-sm ${
                      item.currency === 'coins'
                        ? 'bg-gradient-to-br from-amber-50 to-orange-100 ring-1 ring-amber-100'
                        : 'bg-gradient-to-br from-cyan-50 to-sky-100 ring-1 ring-cyan-100'
                    }`}
                  >
                    {item.icon}
                  </div>

                  {/* 名称 + 描述 */}
                  <h3 className="text-sm font-extrabold text-dark-900">{item.name}</h3>
                  <p className="mt-1 line-clamp-3 flex-1 text-xs leading-relaxed text-dark-500">
                    {item.description}
                  </p>

                  {/* 价格 + 购买按钮 */}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="text-lg">
                        {item.currency === 'coins' ? '🪙' : '💎'}
                      </span>
                      <span
                        className={`text-base font-extrabold tabular-nums ${
                          tooExpensive && !owned ? 'text-rose-500' : 'text-dark-900'
                        }`}
                      >
                        {item.price}
                      </span>
                    </div>

                    <button
                      onClick={() => handleClickBuy(item)}
                      disabled={disabled}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                        owned
                          ? 'cursor-not-allowed bg-success-50 text-success-600'
                          : tooExpensive
                            ? 'cursor-not-allowed bg-dark-100 text-dark-400'
                            : item.currency === 'coins'
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm hover:shadow-md'
                              : 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-sm hover:shadow-md'
                      }`}
                    >
                      {owned ? (
                        <span className="inline-flex items-center gap-1">
                          <Check className="h-3 w-3" /> 已拥有
                        </span>
                      ) : tooExpensive ? (
                        <span className="inline-flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> 不足
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <ShoppingBag className="h-3 w-3" /> 购买
                        </span>
                      )}
                    </button>
                  </div>

                  {/* 货币不足提示 */}
                  {tooExpensive && !owned && (
                    <div className="mt-2 rounded-lg bg-rose-50 px-2 py-1 text-center text-[10px] font-medium text-rose-600">
                      {item.currency === 'coins'
                        ? `还差 ${item.price - user.coins} 金币`
                        : `还差 ${item.price - user.gems} 宝石`}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ===== 4. 我的背包 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="card overflow-hidden p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <Backpack className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-dark-900">我的背包</h2>
          </div>
          <span className="badge bg-primary-50 text-primary-600">
            {user.inventory.length} 件道具
          </span>
        </div>

        {user.inventory.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-dark-50/60 px-6 py-10 text-center">
            <PackageOpen className="h-10 w-10 text-dark-300" />
            <div className="text-sm font-bold text-dark-700">背包空空如也</div>
            <div className="text-xs text-dark-500">购买道具后会出现在这里</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* 按道具 id 聚合显示 */}
            {Array.from(ownedCount.entries()).map(([itemId, count]) => {
              const item = shopItems.find((s) => s.id === itemId);
              if (!item) return null;
              return (
                <motion.div
                  key={itemId}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative flex items-center gap-3 rounded-xl border border-dark-100 bg-white p-3"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
                      item.currency === 'coins'
                        ? 'bg-amber-50 ring-1 ring-amber-100'
                        : 'bg-cyan-50 ring-1 ring-cyan-100'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-bold text-dark-900">
                        {item.name}
                      </span>
                      {count > 1 && (
                        <span className="badge bg-dark-100 px-1.5 py-0 text-[10px] text-dark-600">
                          ×{count}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 line-clamp-1 text-[11px] text-dark-500">
                      {item.description}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUseItem(item)}
                    className="shrink-0 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
                  >
                    <Zap className="mr-1 inline h-3 w-3" />
                    使用
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.section>

      {/* ===== 购买确认弹窗 ===== */}
      <AnimatePresence>
        {confirmItem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmItem(null)}
          >
            <motion.div
              className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl"
              initial={{ scale: 0.85, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`relative px-5 py-6 text-center text-white ${
                  confirmItem.currency === 'coins'
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                    : 'bg-gradient-to-br from-cyan-400 to-sky-500'
                }`}
              >
                <button
                  onClick={() => setConfirmItem(null)}
                  className="absolute right-3 top-3 rounded-full bg-white/20 p-1 text-white/90 transition-colors hover:bg-white/30"
                >
                  <X className="h-4 w-4" />
                </button>
                <motion.div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/25 text-4xl backdrop-blur-sm"
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                >
                  {confirmItem.icon}
                </motion.div>
                <h3 className="mt-3 text-lg font-extrabold">确认购买</h3>
                <p className="mt-0.5 text-xs text-white/90">{confirmItem.name}</p>
              </div>

              <div className="space-y-3 p-5">
                <p className="text-xs leading-relaxed text-dark-600">
                  {confirmItem.description}
                </p>

                <div className="flex items-center justify-between rounded-xl bg-dark-50 px-4 py-3">
                  <span className="text-xs font-medium text-dark-500">本次消费</span>
                  <div className="inline-flex items-center gap-1.5">
                    <span className="text-lg">
                      {confirmItem.currency === 'coins' ? '🪙' : '💎'}
                    </span>
                    <span className="text-lg font-extrabold text-dark-900">
                      {confirmItem.price}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-dark-50 px-4 py-3">
                  <span className="text-xs font-medium text-dark-500">购买后余额</span>
                  <div className="inline-flex items-center gap-1.5">
                    <span className="text-lg">
                      {confirmItem.currency === 'coins' ? '🪙' : '💎'}
                    </span>
                    <span className="text-lg font-extrabold text-success-600">
                      {confirmItem.currency === 'coins'
                        ? user.coins - confirmItem.price
                        : user.gems - confirmItem.price}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setConfirmItem(null)}
                    className="btn-ghost flex-1"
                  >
                    再想想
                  </button>
                  <button
                    onClick={handleConfirmBuy}
                    className={`flex-1 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all active:scale-95 ${
                      confirmItem.currency === 'coins'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90'
                        : 'bg-gradient-to-r from-cyan-500 to-sky-500 hover:opacity-90'
                    }`}
                  >
                    确认购买
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 购买成功提示 ===== */}
      <AnimatePresence>
        {purchaseSuccess && (
          <motion.div
            className="fixed left-1/2 top-20 z-[55] -translate-x-1/2"
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
          >
            <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-2xl ring-1 ring-dark-100">
              <motion.div
                className="flex h-10 w-10 items-center justify-center rounded-full bg-success-100 text-2xl"
                animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 0.5 }}
              >
                {purchaseSuccess.icon}
              </motion.div>
              <div>
                <div className="text-sm font-extrabold text-dark-900">购买成功！</div>
                <div className="text-[11px] text-dark-500">
                  已加入背包：{purchaseSuccess.name}
                </div>
              </div>
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 使用道具提示 ===== */}
      <AnimatePresence>
        {useToast && (
          <motion.div
            className="fixed left-1/2 bottom-24 z-[55] -translate-x-1/2 sm:bottom-10"
            initial={{ opacity: 0, y: 30, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          >
            <div className="flex items-center gap-3 rounded-2xl bg-dark-900 px-5 py-3 text-white shadow-2xl">
              <span className="text-xl">{useToast.msg.charAt(0)}</span>
              <span className="text-sm font-semibold">{useToast.msg.slice(1)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 错误提示 ===== */}
      <AnimatePresence>
        {errorToast && (
          <motion.div
            className="fixed left-1/2 bottom-24 z-[55] -translate-x-1/2 sm:bottom-10"
            initial={{ opacity: 0, y: 30, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          >
            <div className="flex items-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-white shadow-2xl">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-semibold">{errorToast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
