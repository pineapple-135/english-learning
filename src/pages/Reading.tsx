import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Lock,
  Clock,
  FileText,
  Tag,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  X,
  Zap,
  Coins,
  Compass,
  Gauge,
  BookMarked,
  Lightbulb,
  RotateCcw,
  MapPin,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { readingPassages } from '../data/reading';
import { ReadingPassage, ReadingQuestion, CEFRLevel } from '../types';
import ProgressBar from '../components/ui/ProgressBar';
import RewardPopup from '../components/game/RewardPopup';
import Confetti from '../components/ui/Confetti';

// ===== 类型定义 =====
type View = 'list' | 'reading' | 'quiz' | 'result';

interface QuizResult {
  correct: number;
  total: number;
  xp: number;
  coins: number;
  skillDelta: number;
  accuracy: number;
}

// ===== 工具函数 =====
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,!?;:"'`]+$/g, '')
    .replace(/^["'`]+/, '');
}

// CEFR 等级颜色
const CEFR_COLOR: Record<CEFRLevel, string> = {
  A1: 'bg-emerald-100 text-emerald-700',
  A2: 'bg-teal-100 text-teal-700',
  B1: 'bg-sky-100 text-sky-700',
  'B1+': 'bg-blue-100 text-blue-700',
  B2: 'bg-indigo-100 text-indigo-700',
  'B2+': 'bg-violet-100 text-violet-700',
  C1: 'bg-purple-100 text-purple-700',
};

// 分类图标与颜色
const CATEGORY_STYLE: Record<string, { icon: string; gradient: string }> = {
  文化与历史: { icon: '🏛️', gradient: 'from-amber-400 to-orange-500' },
  自然科学: { icon: '🦋', gradient: 'from-emerald-400 to-teal-500' },
  心理学: { icon: '🧠', gradient: 'from-rose-400 to-pink-500' },
  科技伦理: { icon: '🤖', gradient: 'from-violet-400 to-purple-500' },
};

function getCategoryStyle(category: string) {
  return (
    CATEGORY_STYLE[category] ?? {
      icon: '📚',
      gradient: 'from-primary-400 to-accent-500',
    }
  );
}

// 题型标签
const QTYPE_LABEL: Record<ReadingQuestion['type'], string> = {
  'multiple-choice': '选择题',
  'fill-blank': '填空题',
  'heading-match': '标题匹配',
  'true-false': '判断题',
};

const QTYPE_ICON: Record<ReadingQuestion['type'], typeof BookOpen> = {
  'multiple-choice': Lightbulb,
  'fill-blank': BookMarked,
  'heading-match': Layers,
  'true-false': CheckCircle2,
};

const QTYPE_GRADIENT: Record<ReadingQuestion['type'], string> = {
  'multiple-choice': 'from-sky-500 to-blue-500',
  'fill-blank': 'from-violet-500 to-purple-500',
  'heading-match': 'from-amber-500 to-orange-500',
  'true-false': 'from-emerald-500 to-teal-500',
};

// ===== 生词高亮渲染 =====
function renderHighlightedText(
  text: string,
  vocabulary: { word: string; meaning: string }[],
  activeWord: string | null,
  onWordClick: (word: string, meaning: string) => void,
): React.ReactNode[] {
  if (vocabulary.length === 0) return [text];

  // 按词长降序排列，优先匹配更长的词组
  const sortedVocab = [...vocabulary].sort(
    (a, b) => b.word.length - a.word.length,
  );
  const pattern = sortedVocab
    .map((v) => escapeRegExp(v.word))
    .join('|');
  // 匹配词汇本身或其派生形式（词根 + 词缀字符）
  const regex = new RegExp(`\\b(${pattern})\\w*\\b`, 'gi');

  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyCounter = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }

    const matched = match[0];
    const lowerMatched = matched.toLowerCase();
    // 找到对应的词汇条目
    const entry = sortedVocab.find((v) =>
      lowerMatched.startsWith(v.word.toLowerCase()),
    );

    if (entry) {
      const isActive = activeWord === entry.word;
      result.push(
        <motion.span
          key={`vw-${keyCounter++}`}
          onClick={(e) => {
            e.stopPropagation();
            onWordClick(entry.word, entry.meaning);
          }}
          whileHover={{ scale: 1.05 }}
          className={`cursor-pointer rounded px-0.5 font-medium underline decoration-dashed decoration-amber-400 underline-offset-2 transition-colors ${
            isActive
              ? 'bg-amber-300 text-amber-900'
              : 'bg-amber-100/70 text-amber-700 hover:bg-amber-200'
          }`}
          title={`${entry.word} — ${entry.meaning}`}
        >
          {matched}
        </motion.span>,
      );
    } else {
      result.push(matched);
    }

    lastIndex = match.index + matched.length;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

// 格式化时间 mm:ss
function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ===== 主组件 =====
const ReadingPage: React.FC = () => {
  const { helperFunctions } = useStore();

  const [view, setView] = useState<View>('list');
  const [activePassageId, setActivePassageId] = useState<string | null>(null);
  const [activeWord, setActiveWord] = useState<{
    word: string;
    meaning: string;
  } | null>(null);

  // 答题状态
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 阅读计时
  const startTimeRef = useRef<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);

  // 奖励与庆祝
  const [rewardTrigger, setRewardTrigger] = useState(0);
  const [rewardData, setRewardData] = useState({
    xp: 0,
    coins: 0,
    title: '阅读完成！',
  });
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const activePassage = useMemo(
    () => readingPassages.find((p) => p.id === activePassageId) ?? null,
    [activePassageId],
  );

  // 下一篇可读文章
  const nextPassage = useMemo(() => {
    if (!activePassageId) return null;
    const idx = readingPassages.findIndex((p) => p.id === activePassageId);
    if (idx < 0 || idx >= readingPassages.length - 1) return null;
    return readingPassages[idx + 1];
  }, [activePassageId]);

  // ===== 阅读计时 effect =====
  useEffect(() => {
    if (view !== 'reading') {
      startTimeRef.current = null;
      return;
    }
    startTimeRef.current = Date.now();
    setElapsedSec(0);
    const interval = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedSec(
          Math.floor((Date.now() - startTimeRef.current) / 1000),
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [view]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  const currentQuestion = activePassage?.questions[currentIdx] ?? null;
  const progress =
    activePassage && activePassage.questions.length > 0
      ? (currentIdx / activePassage.questions.length) * 100
      : 0;

  // 阅读速度（WPM）
  const elapsedMin = elapsedSec / 60;
  const wpm =
    activePassage && elapsedMin > 0
      ? Math.round(activePassage.wordCount / elapsedMin)
      : 0;

  // ===== 进入阅读 =====
  const handleEnterPassage = (p: ReadingPassage) => {
    if (!p.unlocked) return;
    setActivePassageId(p.id);
    setActiveWord(null);
    setView('reading');
  };

  // ===== 开始答题 =====
  const handleStartQuiz = () => {
    setCurrentIdx(0);
    setCorrectCount(0);
    setSelectedOption(null);
    setInputValue('');
    setFeedback(null);
    setView('quiz');
  };

  // ===== 答题处理 =====
  const handleAnswer = (answer: string) => {
    if (!currentQuestion || feedback) return;
    const correct = norm(answer) === norm(String(currentQuestion.answer));
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) setCorrectCount((c) => c + 1);

    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => goToNext(), 1600);
  };

  const handleSelectOption = (opt: string) => {
    if (feedback) return;
    setSelectedOption(opt);
    handleAnswer(opt);
  };

  const handleInputSubmit = () => {
    if (!inputValue.trim() || feedback) return;
    handleAnswer(inputValue.trim());
  };

  const goToNext = useCallback(() => {
    if (!activePassage) return;
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    if (currentIdx < activePassage.questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setInputValue('');
      setFeedback(null);
    } else {
      finishQuiz();
    }
  }, [currentIdx, activePassage]);

  // ===== 完成答题 =====
  const finishQuiz = () => {
    if (!activePassage) return;
    const total = activePassage.questions.length;
    const accuracy = Math.round((correctCount / total) * 100);
    const xpReward = Math.round((correctCount / total) * 60) + 10;
    const coinReward = Math.round((correctCount / total) * 80) + 15;
    const skillDelta = accuracy >= 80 ? 5 : accuracy >= 50 ? 3 : 1;

    helperFunctions.addXP(xpReward);
    helperFunctions.addCoins(coinReward);
    helperFunctions.updateSkill('reading', skillDelta);
    helperFunctions.updateStreak();

    // 成就解锁
    if (accuracy === 100) {
      helperFunctions.unlockAchievement(`reading-perfect-${activePassage.id}`);
      setConfettiTrigger((t) => t + 1);
    } else if (accuracy >= 80) {
      setConfettiTrigger((t) => t + 1);
    }

    setRewardData({
      xp: xpReward,
      coins: coinReward,
      title: accuracy >= 80 ? '阅读大师！' : '阅读完成',
    });
    setQuizResult({
      correct: correctCount,
      total,
      xp: xpReward,
      coins: coinReward,
      skillDelta,
      accuracy,
    });
    setRewardTrigger((t) => t + 1);
    setView('result');
  };

  // ===== 返回列表 =====
  const handleBackToList = () => {
    setView('list');
    setActivePassageId(null);
    setActiveWord(null);
    setQuizResult(null);
    setCurrentIdx(0);
    setCorrectCount(0);
    setFeedback(null);
    setSelectedOption(null);
    setInputValue('');
  };

  // ===== 下一篇 =====
  const handleNextPassage = () => {
    if (!nextPassage) {
      handleBackToList();
      return;
    }
    setActivePassageId(nextPassage.id);
    setActiveWord(null);
    setQuizResult(null);
    setCurrentIdx(0);
    setCorrectCount(0);
    setFeedback(null);
    setSelectedOption(null);
    setInputValue('');
    setView(nextPassage.unlocked ? 'reading' : 'list');
  };

  // ===== 重做 =====
  const handleRetry = () => {
    setCurrentIdx(0);
    setCorrectCount(0);
    setFeedback(null);
    setSelectedOption(null);
    setInputValue('');
    setQuizResult(null);
    setView('quiz');
  };

  // ===== 渲染：文章列表 =====
  const renderList = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {readingPassages.map((p, idx) => {
          const style = getCategoryStyle(p.category);
          const accessible = p.unlocked;
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              whileHover={accessible ? { y: -4, scale: 1.01 } : {}}
              whileTap={accessible ? { scale: 0.99 } : {}}
              onClick={() => handleEnterPassage(p)}
              disabled={!accessible}
              className={`relative overflow-hidden rounded-2xl border p-5 text-left shadow-sm transition-all ${
                !accessible
                  ? 'cursor-not-allowed border-dark-200 bg-dark-50/60 opacity-70'
                  : 'border-dark-100 bg-white hover:border-primary-200 hover:shadow-lg'
              }`}
            >
              {/* 顶部装饰色条 */}
              <div
                className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${style.gradient}`}
              />

              {/* 背景大图标 */}
              <div
                className="pointer-events-none absolute -right-3 -top-3 text-7xl opacity-10"
                aria-hidden
              >
                {style.icon}
              </div>

              {/* 锁定遮罩 */}
              {!accessible && (
                <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-dark-200/80 backdrop-blur-sm">
                  <Lock className="h-4 w-4 text-dark-500" />
                </div>
              )}

              <div className="relative flex items-start gap-4">
                {/* 主题图标 */}
                <div
                  className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${style.gradient} text-2xl shadow-sm`}
                >
                  {accessible ? style.icon : '🔒'}
                </div>

                {/* 文章信息 */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`badge text-[10px] ${CEFR_COLOR[p.level]}`}
                    >
                      {p.level}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-dark-400">
                      <Tag className="h-3 w-3" />
                      {p.category}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-base font-bold text-dark-900">
                    {p.title}
                  </h3>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-dark-400">
                    {p.titleEn}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-dark-500">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {p.wordCount} 词
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />~{p.estimatedTime} 分钟
                    </span>
                    <span className="flex items-center gap-1">
                      <BookMarked className="h-3 w-3" />
                      {p.vocabulary.length} 生词
                    </span>
                  </div>
                </div>

                <ChevronRight
                  className={`mt-1 h-5 w-5 flex-shrink-0 ${
                    accessible ? 'text-dark-300' : 'text-dark-200'
                  }`}
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* 进度统计 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card flex flex-col items-center gap-4 p-5 sm:flex-row"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow">
          <Compass className="h-6 w-6" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="text-xs text-dark-400">文章地图进度</div>
          <div className="text-base font-bold text-dark-900">
            {readingPassages.filter((p) => p.unlocked).length} /{' '}
            {readingPassages.length} 篇已解锁
          </div>
        </div>
        <div className="w-full sm:w-48">
          <ProgressBar
            value={
              (readingPassages.filter((p) => p.unlocked).length /
                readingPassages.length) *
              100
            }
            color="from-sky-400 to-blue-500"
            height="h-2.5"
            showLabel
            label="探索进度"
          />
        </div>
      </motion.div>
    </div>
  );

  // ===== 渲染：阅读界面 =====
  const renderReading = () => {
    if (!activePassage) return null;
    const style = getCategoryStyle(activePassage.category);
    const paragraphs = activePassage.content.split(/\n+/).filter((s) => s.trim());

    return (
      <div className="space-y-4">
        {/* 文章头部 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${style.gradient} p-5 text-white shadow-lg sm:p-6`}
        >
          <div className="pointer-events-none absolute -right-8 -top-8 text-9xl opacity-20">
            {style.icon}
          </div>
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-white/85">
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1">
                {activePassage.level}
              </span>
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {activePassage.category}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {activePassage.wordCount} 词
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />~{activePassage.estimatedTime} 分钟
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-extrabold">
              {activePassage.title}
            </h2>
            <p className="mt-0.5 text-sm font-medium uppercase tracking-wider text-white/80">
              {activePassage.titleEn}
            </p>
          </div>
        </motion.div>

        {/* 主体：左阅读 + 右工具栏 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* 文章正文 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card relative p-5 sm:p-6 lg:col-span-2"
            onClick={() => setActiveWord(null)}
          >
            {/* 生词释义浮窗 */}
            <AnimatePresence>
              {activeWord && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -8 }}
                  className="sticky top-2 z-10 mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
                    <BookMarked className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-amber-900">
                      {activeWord.word}
                    </div>
                    <div className="text-xs text-amber-700">
                      {activeWord.meaning}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveWord(null)}
                    className="rounded-full p-1 text-amber-500 hover:bg-amber-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="prose prose-sm max-w-none sm:prose-base">
              {paragraphs.map((para, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 * i }}
                  className="mb-4 text-[15px] leading-7 text-dark-800"
                >
                  {renderHighlightedText(
                    para,
                    activePassage.vocabulary,
                    activeWord?.word ?? null,
                    (word, meaning) =>
                      setActiveWord({ word, meaning }),
                  )}
                </motion.p>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={handleStartQuiz} className="btn-primary">
                <Lightbulb className="h-4 w-4" />
                开始答题
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          {/* 工具栏 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* 阅读速度统计 */}
            <div className="card p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-dark-500">
                <Gauge className="h-4 w-4 text-primary-500" />
                阅读速度
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-primary-50 p-3 text-center">
                  <div className="text-[10px] font-medium text-primary-600">
                    已用时
                  </div>
                  <div className="mt-0.5 text-lg font-extrabold text-primary-700">
                    {formatTime(elapsedSec)}
                  </div>
                </div>
                <div className="rounded-xl bg-accent-50 p-3 text-center">
                  <div className="text-[10px] font-medium text-accent-600">
                    速度 (WPM)
                  </div>
                  <div className="mt-0.5 text-lg font-extrabold text-accent-700">
                    {wpm > 0 ? wpm : '—'}
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <ProgressBar
                  value={
                    elapsedMin > 0
                      ? Math.min(
                          100,
                          (elapsedMin / activePassage.estimatedTime) * 100,
                        )
                      : 0
                  }
                  color="from-primary-500 to-accent-500"
                  height="h-2"
                />
                <div className="mt-1 text-[10px] text-dark-400">
                  建议阅读时长 {activePassage.estimatedTime} 分钟
                </div>
              </div>
            </div>

            {/* 词汇表 */}
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-dark-500">
                  <BookMarked className="h-4 w-4 text-amber-500" />
                  生词表
                </div>
                <span className="badge bg-amber-50 text-amber-700">
                  {activePassage.vocabulary.length} 词
                </span>
              </div>
              <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
                {activePassage.vocabulary.map((v, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setActiveWord(v)}
                    whileHover={{ x: 2 }}
                    className={`block w-full rounded-lg border p-2 text-left transition-colors ${
                      activeWord?.word === v.word
                        ? 'border-amber-300 bg-amber-50'
                        : 'border-dark-100 bg-white hover:bg-dark-50'
                    }`}
                  >
                    <div className="text-sm font-bold text-dark-900">
                      {v.word}
                    </div>
                    <div className="text-xs text-dark-500">{v.meaning}</div>
                  </motion.button>
                ))}
              </div>
              <div className="mt-3 rounded-lg bg-dark-50 p-2 text-[10px] leading-relaxed text-dark-500">
                💡 文中生词以
                <span className="mx-1 rounded bg-amber-100/70 px-1 font-medium text-amber-700">
                  高亮
                </span>
                显示，点击查看释义
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  // ===== 渲染：单题卡片 =====
  const renderQuiz = () => {
    if (!currentQuestion || !activePassage) return null;
    const QIcon = QTYPE_ICON[currentQuestion.type];
    const gradient = QTYPE_GRADIENT[currentQuestion.type];
    const total = activePassage.questions.length;

    return (
      <div className="space-y-4">
        {/* 顶部状态条 */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (advanceTimer.current) clearTimeout(advanceTimer.current);
              setView('reading');
            }}
            className="flex items-center gap-1 text-sm text-dark-500 transition-colors hover:text-dark-700"
          >
            <ArrowLeft className="h-4 w-4" /> 返回阅读
          </button>
          <div className="flex items-center gap-2">
            <span className="badge bg-primary-50 text-primary-700">
              <Lightbulb className="h-3 w-3" />
              阅读理解
            </span>
            <div className="text-sm font-bold text-dark-700">
              第 <span className="text-primary-600">{currentIdx + 1}</span> /{' '}
              {total} 题
            </div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar
              value={progress}
              color="from-primary-500 to-accent-500"
              height="h-2"
            />
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-success-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {correctCount}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="card overflow-hidden p-0"
          >
            {/* 题型头部 */}
            <div className={`bg-gradient-to-r ${gradient} px-5 py-3 text-white`}>
              <div className="flex items-center gap-2">
                <QIcon className="h-4 w-4" />
                <span className="text-sm font-bold">
                  {QTYPE_LABEL[currentQuestion.type]}
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {/* 题干 */}
              <div className="text-base font-bold leading-relaxed text-dark-900">
                {currentQuestion.question}
              </div>

              {/* 答题区 */}
              <div className="mt-5">
                {currentQuestion.options ? (
                  <div className="grid grid-cols-1 gap-2.5">
                    {currentQuestion.options.map((opt, idx) => {
                      const isSelected = selectedOption === opt;
                      const isAnswer =
                        norm(opt) === norm(String(currentQuestion.answer));
                      const showCorrect = feedback && isAnswer;
                      const showWrong = feedback && isSelected && !isAnswer;
                      return (
                        <motion.button
                          key={idx}
                          onClick={() => handleSelectOption(opt)}
                          disabled={!!feedback}
                          whileTap={{ scale: 0.98 }}
                          className={`relative flex items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all ${
                            showCorrect
                              ? 'border-success-500 bg-success-50'
                              : showWrong
                                ? 'border-danger-500 bg-danger-50'
                                : isSelected
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-dark-200 bg-white hover:border-primary-300 hover:bg-primary-50/40'
                          }`}
                        >
                          <span
                            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                              showCorrect
                                ? 'bg-success-500 text-white'
                                : showWrong
                                  ? 'bg-danger-500 text-white'
                                  : isSelected
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-dark-100 text-dark-600'
                            }`}
                          >
                            {showCorrect ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : showWrong ? (
                              <X className="h-4 w-4" />
                            ) : (
                              String.fromCharCode(65 + idx)
                            )}
                          </span>
                          <span className="text-sm font-medium text-dark-800">
                            {opt}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleInputSubmit();
                      }}
                      disabled={!!feedback}
                      placeholder="输入你的答案..."
                      autoFocus
                      className={`input text-center text-base font-semibold ${
                        feedback === 'correct'
                          ? 'border-success-500 bg-success-50 text-success-700'
                          : feedback === 'wrong'
                            ? 'border-danger-500 bg-danger-50 text-danger-700'
                            : ''
                      }`}
                    />
                    {!feedback && (
                      <button
                        onClick={handleInputSubmit}
                        disabled={!inputValue.trim()}
                        className="btn-primary mt-3 w-full"
                      >
                        确认提交
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 反馈区 */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div
                      className={`rounded-xl p-4 ${
                        feedback === 'correct'
                          ? 'bg-success-50'
                          : 'bg-danger-50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {feedback === 'correct' ? (
                          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success-600" />
                        ) : (
                          <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-danger-600" />
                        )}
                        <div className="flex-1">
                          <div
                            className={`text-sm font-bold ${
                              feedback === 'correct'
                                ? 'text-success-700'
                                : 'text-danger-700'
                            }`}
                          >
                            {feedback === 'correct'
                              ? '回答正确！'
                              : '回答错误'}
                          </div>
                          {feedback === 'wrong' &&
                            currentQuestion.type === 'fill-blank' && (
                              <div className="mt-1 text-xs text-dark-700">
                                <span className="font-semibold">
                                  正确答案：
                                </span>
                                <span className="text-success-700">
                                  {currentQuestion.answer}
                                </span>
                              </div>
                            )}
                          <div className="mt-1.5 text-xs leading-relaxed text-dark-600">
                            <span className="font-semibold">解析：</span>
                            {currentQuestion.explanation}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  // ===== 渲染：结果页 =====
  const renderResult = () => {
    if (!quizResult || !activePassage) return null;
    const passed = quizResult.accuracy >= 60;

    return (
      <div className="mx-auto max-w-xl">
        <Confetti trigger={confettiTrigger} duration={3000} count={120} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="card overflow-hidden"
        >
          {/* 顶部色带 */}
          <div
            className={`bg-gradient-to-r ${
              passed
                ? 'from-emerald-400 via-teal-500 to-sky-500'
                : 'from-primary-500 to-accent-500'
            } p-6 text-center text-white`}
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 220, delay: 0.1 }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-5xl backdrop-blur-sm"
            >
              {quizResult.accuracy === 100
                ? '🏆'
                : passed
                  ? '🎉'
                  : '📚'}
            </motion.div>
            <h2 className="mt-3 text-2xl font-extrabold">
              {quizResult.accuracy === 100
                ? '完美通关！'
                : passed
                  ? '阅读完成！'
                  : '继续努力！'}
            </h2>
            <p className="mt-1 text-sm text-white/90">
              {passed
                ? `你已成功完成「${activePassage.title}」`
                : '再多读几遍，下次一定可以！'}
            </p>
          </div>

          <div className="p-5 sm:p-6">
            {/* 答题统计 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-dark-50 p-3 text-center">
                <div className="text-xs text-dark-400">答对</div>
                <div className="text-xl font-extrabold text-success-600">
                  {quizResult.correct}
                </div>
              </div>
              <div className="rounded-xl bg-dark-50 p-3 text-center">
                <div className="text-xs text-dark-400">总题数</div>
                <div className="text-xl font-extrabold text-dark-900">
                  {quizResult.total}
                </div>
              </div>
              <div className="rounded-xl bg-dark-50 p-3 text-center">
                <div className="text-xs text-dark-400">正确率</div>
                <div className="text-xl font-extrabold text-primary-600">
                  {quizResult.accuracy}%
                </div>
              </div>
            </div>

            {/* 阅读速度回顾 */}
            <div className="mt-4 rounded-xl border border-dark-100 bg-dark-50/60 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-dark-500">
                <Gauge className="h-3.5 w-3.5 text-primary-500" />
                阅读数据
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="text-[10px] text-dark-400">阅读用时</div>
                  <div className="text-base font-extrabold text-dark-900">
                    {formatTime(elapsedSec)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-dark-400">阅读速度</div>
                  <div className="text-base font-extrabold text-dark-900">
                    {wpm > 0 ? `${wpm} WPM` : '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* 获得奖励 */}
            <div className="mt-4 rounded-xl border border-dark-100 bg-dark-50/60 p-4">
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-dark-500">
                获得奖励
              </div>
              <div className="flex items-center justify-around">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                    <Zap className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[10px] text-dark-400">XP</div>
                    <div className="text-base font-extrabold text-dark-900">
                      +{quizResult.xp}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                    <Coins className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[10px] text-dark-400">金币</div>
                    <div className="text-base font-extrabold text-dark-900">
                      +{quizResult.coins}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[10px] text-dark-400">阅读</div>
                    <div className="text-base font-extrabold text-dark-900">
                      +{quizResult.skillDelta}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={handleBackToList}
                className="btn-ghost flex-1"
              >
                <MapPin className="h-4 w-4" />
                返回地图
              </button>
              <button onClick={handleRetry} className="btn-ghost flex-1">
                <RotateCcw className="h-4 w-4" />
                再读一遍
              </button>
              {nextPassage && nextPassage.unlocked && (
                <button
                  onClick={handleNextPassage}
                  className="btn-primary flex-1"
                >
                  下一篇
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  // ===== 主渲染 =====
  return (
    <div className="space-y-5">
      {/* 页面标题（仅 list 视图） */}
      {view === 'list' && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 p-5 text-white shadow-lg sm:p-6"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 left-1/4 h-32 w-32 rounded-full bg-sky-300/20 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <BookOpen className="h-5 w-5" />
              </span>
              <h1 className="text-xl font-extrabold sm:text-2xl">阅读探索</h1>
            </div>
            <p className="mt-2 text-sm text-white/90">
              探索文章地图，解锁故事剧情
            </p>
          </div>
        </motion.section>
      )}

      {/* 非列表视图显示返回条 */}
      {view !== 'list' && view !== 'result' && activePassage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={handleBackToList}
            className="flex items-center gap-1 text-sm font-medium text-dark-600 transition-colors hover:text-primary-600"
          >
            <ArrowLeft className="h-4 w-4" />
            返回文章列表
          </button>
          <div className="flex items-center gap-2 text-xs text-dark-500">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="font-semibold text-dark-700">
              {activePassage.title}
            </span>
          </div>
        </motion.div>
      )}

      {view === 'result' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={handleBackToList}
            className="flex items-center gap-1 text-sm font-medium text-dark-600 transition-colors hover:text-primary-600"
          >
            <ArrowLeft className="h-4 w-4" />
            返回文章地图
          </button>
        </motion.div>
      )}

      {/* 视图切换 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'list' && renderList()}
          {view === 'reading' && renderReading()}
          {view === 'quiz' && renderQuiz()}
          {view === 'result' && renderResult()}
        </motion.div>
      </AnimatePresence>

      {/* 奖励弹窗 */}
      <RewardPopup
        trigger={rewardTrigger}
        xp={rewardData.xp}
        coins={rewardData.coins}
        title={rewardData.title}
        duration={2600}
      />
    </div>
  );
};

export default ReadingPage;
