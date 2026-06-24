import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../store/StoreContext';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

const Layout: React.FC = () => {
  const { state } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = state;

  // 未完成测评 -> 跳转测评页
  useEffect(() => {
    if (!user.assessmentCompleted && location.pathname !== '/assessment') {
      navigate('/assessment', { replace: true });
    }
  }, [user.assessmentCompleted, location.pathname, navigate]);

  // 测评页面不渲染主布局（避免导航干扰）
  if (!user.assessmentCompleted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-50">
      <Sidebar />

      {/* 主区域：左侧留出 sidebar 宽度（桌面端） */}
      <div className="lg:pl-64">
        <Header />

        <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="mx-auto max-w-6xl"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MobileNav />
    </div>
  );
};

export default Layout;
