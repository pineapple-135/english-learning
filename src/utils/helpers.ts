import { SkillType } from '../types';
import { levelNames, rankTiers } from '../data/gameData';

/**
 * 根据等级获取等级名称（中文）
 */
export function getLevelName(level: number): string {
  const tier = levelNames.find((l) => level >= l.min && level <= l.max);
  return tier ? tier.name : '新手冒险者';
}

/**
 * 获取等级对应的英文图标（来自 levelNames）
 */
export function getLevelIcon(level: number): string {
  const tier = levelNames.find((l) => level >= l.min && level <= l.max);
  return tier ? tier.icon : '🌱';
}

/**
 * 升级所需 XP（与 StoreContext 的 applyXP 逻辑保持一致：level * 100）
 */
export function getXpForLevel(level: number): number {
  return level * 100;
}

/**
 * 当前等级升级进度百分比（0-100）
 */
export function getLevelProgress(level: number, xp: number): number {
  const required = getXpForLevel(level);
  if (required <= 0) return 0;
  const pct = (xp / required) * 100;
  if (pct < 0) return 0;
  if (pct > 100) return 100;
  return Math.round(pct);
}

/**
 * 格式化日期：支持 string | Date，返回 YYYY-MM-DD
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 获取今天日期字符串 YYYY-MM-DD
 */
export function getTodayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 段位颜色映射，返回 Tailwind 文本颜色类
 */
export function getRankColor(rankTier: string): string {
  switch (rankTier) {
    case '青铜学徒':
      return 'text-amber-700';
    case '白银探索者':
      return 'text-slate-400';
    case '黄金行者':
      return 'text-yellow-500';
    case '铂金骑士':
      return 'text-cyan-400';
    case '钻石战士':
      return 'text-sky-500';
    case '宗师语言家':
      return 'text-purple-500';
    case '传奇大师':
      return 'text-rose-500';
    default:
      return 'text-dark-600';
  }
}

/**
 * 段位渐变背景色（用于徽章背景）
 */
export function getRankGradient(rankTier: string): string {
  const idx = rankTiers.indexOf(rankTier);
  if (idx < 0) return 'from-dark-400 to-dark-600';
  const gradients = [
    'from-amber-600 to-amber-800', // 青铜
    'from-slate-300 to-slate-500', // 白银
    'from-yellow-400 to-yellow-600', // 黄金
    'from-cyan-300 to-cyan-500', // 铂金
    'from-sky-400 to-sky-600', // 钻石
    'from-purple-400 to-purple-600', // 宗师
    'from-rose-400 to-rose-600', // 传奇
  ];
  return gradients[idx] ?? gradients[0];
}

/**
 * 技能名称中文映射
 */
export function getSkillName(skill: string): string {
  const map: Record<string, string> = {
    vocabulary: '词汇',
    grammar: '语法',
    reading: '阅读',
    listening: '听力',
    writing: '写作',
    speaking: '口语',
  };
  return map[skill] ?? skill;
}

/**
 * 技能图标映射（emoji，与项目风格一致）
 */
export function getSkillIcon(skill: string): string {
  const map: Record<string, string> = {
    vocabulary: '📚',
    grammar: '✏️',
    reading: '📖',
    listening: '🎧',
    writing: '✍️',
    speaking: '🗣️',
  };
  return map[skill] ?? '🎯';
}

/**
 * 技能颜色映射（Tailwind 文本颜色）
 */
export function getSkillColor(skill: string): string {
  const map: Record<string, string> = {
    vocabulary: 'text-indigo-500',
    grammar: 'text-purple-500',
    reading: 'text-blue-500',
    listening: 'text-cyan-500',
    writing: 'text-rose-500',
    speaking: 'text-orange-500',
  };
  return map[skill] ?? 'text-primary-500';
}

/**
 * 技能十六进制颜色（用于图表）
 */
export function getSkillHex(skill: string): string {
  const map: Record<string, string> = {
    vocabulary: '#6366f1',
    grammar: '#a855f7',
    reading: '#3b82f6',
    listening: '#06b6d4',
    writing: '#f43f5e',
    speaking: '#f97316',
  };
  return map[skill] ?? '#6366f1';
}

/**
 * 技能列表（包含全部 SkillType）
 */
export const ALL_SKILLS: SkillType[] = [
  'vocabulary',
  'grammar',
  'reading',
  'listening',
  'writing',
  'speaking',
];

/**
 * 数字简写：1000 -> 1k, 1000000 -> 1m
 */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

/**
 * 计算两个日期字符串（YYYY-MM-DD）之间的天数差
 */
export function daysUntil(targetDate: string | Date): number {
  const target = typeof targetDate === 'string' ? new Date(targetDate + 'T00:00:00') : targetDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
