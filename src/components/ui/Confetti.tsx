import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ConfettiProps {
  /** 触发庆祝的唯一标识，变化时重新播放 */
  trigger: number | string;
  /** 持续毫秒，默认 2500 */
  duration?: number;
  /** 粒子数，默认 80 */
  count?: number;
  /** 是否全屏覆盖 */
  fullScreen?: boolean;
}

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  rotate: number;
  size: number;
  shape: 'rect' | 'circle';
}

const COLORS = [
  '#6366f1',
  '#f97316',
  '#22c55e',
  '#ef4444',
  '#facc15',
  '#06b6d4',
  '#a855f7',
  '#ec4899',
];

function randomParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 1.6 + Math.random() * 1.4,
    color: COLORS[i % COLORS.length],
    rotate: Math.random() * 360,
    size: 6 + Math.random() * 8,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  }));
}

const Confetti: React.FC<ConfettiProps> = ({
  trigger,
  duration = 2500,
  count = 80,
  fullScreen = true,
}) => {
  const [active, setActive] = useState(false);
  const particles = useMemo(() => randomParticles(count), [count, trigger]);

  useEffect(() => {
    if (trigger === 0 || trigger === '') return;
    setActive(true);
    const t = setTimeout(() => setActive(false), duration);
    return () => clearTimeout(t);
  }, [trigger, duration]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className={`pointer-events-none z-50 overflow-hidden ${
            fullScreen ? 'fixed inset-0' : 'absolute inset-0'
          }`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute top-0"
              style={{
                left: `${p.left}%`,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: p.shape === 'circle' ? '9999px' : '2px',
              }}
              initial={{ y: -20, opacity: 1, rotate: 0 }}
              animate={{
                y: typeof window !== 'undefined' ? window.innerHeight + 40 : 800,
                opacity: [1, 1, 0.9, 0],
                rotate: p.rotate,
                x: [0, (Math.random() - 0.5) * 120, (Math.random() - 0.5) * 200],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: 'easeIn',
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Confetti;
