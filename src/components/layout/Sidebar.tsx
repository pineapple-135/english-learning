import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  CalendarCheck,
  BookOpen,
  PenTool,
  BookText,
  Headphones,
  GraduationCap,
  Trophy,
  ShoppingBag,
  Award,
  User,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../store/StoreContext';
import { getLevelName, getRankColor, getRankGradient } from '../../utils/helpers';
import LevelBadge from '../game/LevelBadge';

export interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
}

export const navItems: NavItem[] = [
  { to: '/', label: '首页', icon: Home },
  { to: '/study-plan', label: '学习计划', icon: CalendarCheck },
  { to: '/vocabulary', label: '词汇冒险', icon: BookOpen },
  { to: '/grammar', label: '语法挑战', icon: PenTool },
  { to: '/reading', label: '阅读探索', icon: BookText },
  { to: '/listening', label: '听力训练', icon: Headphones },
  { to: '/exam', label: '考试中心', icon: GraduationCap },
  { to: '/leaderboard', label: '排行榜', icon: Trophy },
  { to: '/shop', label: '商店', icon: ShoppingBag },
  { to: '/achievements', label: '成就', icon: Award },
  { to: '/profile', label: '个人中心', icon: User },
];

const Sidebar: React.FC = () => {
  const { state } = useStore();
  const { user } = state;

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-dark-100 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-dark-100 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 text-white shadow-md">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-extrabold text-dark-900">EnglishQuest</span>
          <span className="text-[10px] font-medium text-dark-400">FCE 冒险之旅</span>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-dark-600 hover:bg-dark-50 hover:text-dark-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary-600"
                        />
                      )}
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? 'text-primary-600' : 'text-dark-400 group-hover:text-dark-600'
                        }`}
                      />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 底部用户信息卡片 */}
      <div className="border-t border-dark-100 p-3">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-dark-50 to-white p-3 transition-all hover:shadow-md"
        >
          <LevelBadge level={user.level} size="sm" glow={false} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base">{user.avatar}</span>
              <span className="truncate text-sm font-bold text-dark-900">{user.name}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-[11px]">
              <span className="truncate text-dark-500">Lv.{user.level} · {getLevelName(user.level)}</span>
            </div>
            <div className={`mt-1 inline-block truncate bg-gradient-to-r ${getRankGradient(user.rankTier)} bg-clip-text text-[11px] font-bold text-transparent`}>
              {user.rankTier}
            </div>
          </div>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
