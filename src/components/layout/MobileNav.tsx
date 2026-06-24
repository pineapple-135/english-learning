import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, GraduationCap, Trophy, User, BookOpen } from 'lucide-react';

export interface MobileNavItem {
  to: string;
  label: string;
  icon: typeof Home;
}

const mobileNavItems: MobileNavItem[] = [
  { to: '/', label: '首页', icon: Home },
  { to: '/vocabulary', label: '学习', icon: BookOpen },
  { to: '/exam', label: '考试', icon: GraduationCap },
  { to: '/leaderboard', label: '排行', icon: Trophy },
  { to: '/profile', label: '我的', icon: User },
];

const MobileNav: React.FC = () => {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-dark-100 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <ul className="flex items-center justify-around px-1 py-1">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative flex flex-col items-center gap-0.5 py-1.5 text-[10px] font-medium transition-colors ${
                    isActive ? 'text-primary-600' : 'text-dark-400'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <motion.span
                      animate={isActive ? { scale: 1.1, y: -1 } : { scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                        isActive ? 'bg-primary-50' : ''
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.span>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileNav;
