import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  MapPin,
  Lock,
  CheckCircle2,
  Star,
  ArrowLeft,
  ArrowRight,
  Volume2,
  BookOpen,
  Zap,
  Coins,
  Sparkles,
  Trophy,
  Swords,
  Target,
  RotateCcw,
  Ear,
  Eye,
  PencilLine,
  Lightbulb,
  Crown,
  ChevronRight,
  X,
} from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { vocabularyThemes } from '../data/vocabulary';
import { VocabularyTheme, VocabularyWord } from '../types';
import ProgressBar from '../components/ui/ProgressBar';
import RewardPopup from '../components/game/RewardPopup';
import Confetti from '../components/ui/Confetti';

// ===== 类型定义 =====
type View = 'map' | 'list' | 'practice' | 'boss' | 'result';

type QType = 'word-to-meaning' | 'meaning-to-word' | 'context-fill' | 'spelling';

interface VocabQuestion {
  id: string;
  type: QType;
  word: VocabularyWord;
  options?: string[];
  answer: string;
  prompt: string;
  subPrompt?: string;
  context?: string;
  contextTrans?: string;
  hint?: string;
}

interface BossResult {
  correct: number;
  total: number;
  conquered: boolean;
  xp: number;
  coins: number;
}

// ===== 工具函数 =====
function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,!?;:]+$/, '');
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickDistractors<T>(pool: T[], exclude: T, n: number): T[] {
  return shuffle(pool.filter((p) => p !== exclude)).slice(0, n);
}

// 题型中文名
const QTYPE_LABEL: Record<QType, string> = {
  'word-to-meaning': '看词选义',
  'meaning-to-word': '看义选词',
  'context-fill': '语境填空',
  spelling: '听音拼写',
};

// 题型图标
const QTYPE_ICON: Record<QType, typeof Eye> = {
  'word-to-meaning': Eye,
  'meaning-to-word': BookOpen,
  'context-fill': Lightbulb,
  spelling: Ear,
};

// 题型主题色（Tailwind 渐变）
const QTYPE_GRADIENT: Record<QType, string> = {
  'word-to-meaning': 'from-indigo-500 to-purple-500',
  'meaning-to-word': 'from-purple-500 to-fuchsia-500',
  'context-fill': 'from-blue-500 to-cyan-500',
  spelling: 'from-amber-500 to-orange-500',
};

// 构建一道题
function buildQuestion(
  word: VocabularyWord,
  type: QType,
  theme: VocabularyTheme,
  idx: number,
): VocabQuestion {
  const allWords = theme.words;
  const allMeanings = allWords.map((w) => w.meaning);
  const allWordStrs = allWords.map((w) => w.word);

  const base: VocabQuestion = {
    id: `${word.id}-${type}-${idx}`,
    type,
    word,
    answer: '',
    prompt: '',
  };

  switch (type) {
    case 'word-to-meaning': {
      const distractors = pickDistractors(allMeanings, word.meaning, 3);
      const options = shuffle([word.meaning, ...distractors]);
      return {
        ...base,
        options,
        answer: word.meaning,
        prompt: word.word,
        subPrompt: `${word.phonetic} · ${word.partOfSpeech}`,
      };
    }
    case 'meaning-to-word': {
      const distractors = pickDistractors(allWordStrs, word.word, 3);
      const options = shuffle([word.word, ...distractors]);
      return {
        ...base,
        options,
        answer: word.word,
        prompt: word.meaning,
        subPrompt: word.partOfSpeech,
      };
    }
    case 'context-fill': {
      const distractors = pickDistractors(allWordStrs, word.word, 3);
      const options = shuffle([word.word, ...distractors]);
      // 用下划线替换例句中的目标词
      const blanked = word.example.replace(
        new RegExp(`\\b${word.word}\\b`, 'i'),
        '______',
      );
      return {
        ...base,
        options,
        answer: word.word,
        prompt: '选择正确的单词填入空白处',
        context: blanked,
        contextTrans: word.exampleTranslation,
        subPrompt: word.partOfSpeech,
      };
    }
    case 'spelling': {
      return {
        ...base,
        answer: word.word,
        prompt: word.meaning,
        subPrompt: `${word.phonetic} · ${word.partOfSpeech}`,
        hint: `首字母：${word.word[0]} · 共 ${word.word.length} 个字母`,
      };
    }
  }
}

// 为练习模式生成题目列表（每个单词轮换不同题型）
function generatePracticeQuestions(theme: VocabularyTheme): VocabQuestion[] {
  const types: QType[] = [
    'word-to-meaning',
    'meaning-to-word',
    'context-fill',
    'spelling',
  ];
  return theme.words.map((word, idx) =>
    buildQuestion(word, types[idx % types.length], theme, idx),
  );
}

// 为 Boss 战随机生成 N 道题
function generateBossQuestions(theme: VocabularyTheme, n = 5): VocabQuestion[] {
  const types: QType[] = [
    'word-to-meaning',
    'meaning-to-word',
    'context-fill',
    'spelling',
  ];
  const shuffledWords = shuffle(theme.words).slice(0, Math.min(n, theme.words.length));
  return shuffledWords.map((word, idx) =>
    buildQuestion(word, types[Math.floor(Math.random() * types.length)], theme, idx),
  );
}

// ===== 主组件 =====
const VocabularyPage: React.FC = () => {
  const { state, helperFunctions } = useStore();
  const { user } = state;

  const [view, setView] = useState<View>('map');
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<VocabQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [rewardTrigger, setRewardTrigger] = useState(0);
  const [rewardData, setRewardData] = useState({ xp: 0, coins: 0, title: '奖励到手！' });
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [bossResult, setBossResult] = useState<BossResult | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeTheme = useMemo(
    () => vocabularyThemes.find((t) => t.id === activeThemeId) ?? null,
    [activeThemeId],
  );

  // 主题是否已被征服
  const isThemeConquered = useCallback(
    (themeId: string) => user.unlockedThemes.includes(themeId),
    [user.unlockedThemes],
  );

  // 主题是否可访问
  const isThemeAccessible = useCallback(
    (theme: VocabularyTheme, idx: number) => {
      if (theme.unlocked) return true;
      if (idx === 0) return true;
      // 前一个主题被征服即可访问
      const prevTheme = vocabularyThemes[idx - 1];
      return isThemeConquered(prevTheme.id);
    },
    [isThemeConquered],
  );

  // 清理定时器
  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  const currentQuestion = questions[currentIdx];
  const progress =
    questions.length > 0 ? (currentIdx / questions.length) * 100 : 0;

  // ===== 进入主题单词列表 =====
  const handleEnterTheme = (theme: VocabularyTheme, idx: number) => {
    if (!isThemeAccessible(theme, idx)) return;
    setActiveThemeId(theme.id);
    setView('list');
  };

  // ===== 开始练习模式 =====
  const handleStartPractice = () => {
    if (!activeTheme) return;
    const qs = generatePracticeQuestions(activeTheme);
    setQuestions(qs);
    setCurrentIdx(0);
    setCorrectCount(0);
    setSelectedOption(null);
    setInputValue('');
    setFeedback(null);
    setView('practice');
  };

  // ===== 开始 Boss 战 =====
  const handleStartBoss = () => {
    if (!activeTheme) return;
    const qs = generateBossQuestions(activeTheme, 5);
    setQuestions(qs);
    setCurrentIdx(0);
    setCorrectCount(0);
    setSelectedOption(null);
    setInputValue('');
    setFeedback(null);
    setView('boss');
  };

  // ===== 处理答题 =====
  const handleAnswer = (answer: string) => {
    if (!currentQuestion || feedback) return;
    const isCorrect =
      norm(answer) === norm(currentQuestion.answer);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      // 练习模式小奖励
      if (view === 'practice') {
        helperFunctions.addXP(2);
        helperFunctions.addCoins(3);
      }
    }

    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      goToNext();
    }, 1500);
  };

  const handleSelectOption = (option: string) => {
    if (feedback) return;
    setSelectedOption(option);
    handleAnswer(option);
  };

  const handleInputSubmit = () => {
    if (!inputValue.trim() || feedback) return;
    handleAnswer(inputValue.trim());
  };

  const goToNext = useCallback(() => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setInputValue('');
      setFeedback(null);
    } else {
      // 全部完成
      finishSession();
    }
  }, [currentIdx, questions.length]);

  // ===== 完成练习 / Boss 战 =====
  const finishSession = () => {
    if (view === 'practice') {
      // 练习完成 -> 进入 Boss 战
      setView('boss');
      const qs = generateBossQuestions(activeTheme!, 5);
      setQuestions(qs);
      setCurrentIdx(0);
      setCorrectCount(0);
      setSelectedOption(null);
      setInputValue('');
      setFeedback(null);
      return;
    }

    // Boss 战完成
    const total = questions.length;
    const conquered = correctCount === total;
    const xpReward = conquered ? 50 : correctCount * 6;
    const coinReward = conquered ? 80 : correctCount * 10;

    // 调用 store 更新
    helperFunctions.addXP(xpReward);
    helperFunctions.addCoins(coinReward);
    helperFunctions.updateSkill('vocabulary', conquered ? 5 : 2);
    helperFunctions.updateStreak();

    if (conquered && activeTheme) {
      // 征服该区域，解锁下一主题
      if (!user.unlockedThemes.includes(activeTheme.id)) {
        helperFunctions.unlockTheme(activeTheme.id);
      }
      // 解锁成就
      helperFunctions.unlockAchievement(`vocab-boss-${activeTheme.id}`);
      setConfettiTrigger((t) => t + 1);
    }

    setRewardData({
      xp: xpReward,
      coins: coinReward,
      title: conquered ? '区域征服！' : '挑战完成',
    });
    setBossResult({ correct: correctCount, total, conquered, xp: xpReward, coins: coinReward });
    setRewardTrigger((t) => t + 1);
    setView('result');
  };

  // ===== 返回地图 =====
  const handleBackToMap = () => {
    setView('map');
    setActiveThemeId(null);
    setQuestions([]);
    setCurrentIdx(0);
    setCorrectCount(0);
    setBossResult(null);
  };

  // ===== 重新挑战 Boss =====
  const handleRetryBoss = () => {
    if (!activeTheme) return;
    const qs = generateBossQuestions(activeTheme, 5);
    setQuestions(qs);
    setCurrentIdx(0);
    setCorrectCount(0);
    setSelectedOption(null);
    setInputValue('');
    setFeedback(null);
    setBossResult(null);
    setView('boss');
  };

  // ===== 渲染：地图视图 =====
  const renderMap = () => (
    <div className="space-y-5">
      {/* 主题区域卡片网格 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {vocabularyThemes.map((theme, idx) => {
          const accessible = isThemeAccessible(theme, idx);
          const conquered = isThemeConquered(theme.id);
          const isActive = activeThemeId === theme.id;

          return (
            <motion.button
              key={theme.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              whileHover={accessible ? { y: -4, scale: 1.01 } : {}}
              whileTap={accessible ? { scale: 0.99 } : {}}
              onClick={() => handleEnterTheme(theme, idx)}
              disabled={!accessible}
              className={`relative overflow-hidden rounded-2xl border p-5 text-left shadow-sm transition-all ${
                !accessible
                  ? 'cursor-not-allowed border-dark-200 bg-dark-50/60 opacity-70'
                  : conquered
                    ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-md'
                    : isActive
                      ? 'border-primary-300 bg-gradient-to-br from-primary-50 to-white shadow-md ring-2 ring-primary-200'
                      : 'border-dark-100 bg-white hover:border-primary-200 hover:shadow-md'
              }`}
            >
              {/* 顶部装饰色条 */}
              <div
                className="absolute inset-x-0 top-0 h-1.5"
                style={{ background: theme.color }}
              />

              {/* 背景大图标 */}
              <div
                className="pointer-events-none absolute -right-4 -top-4 text-7xl opacity-10"
                aria-hidden
              >
                {theme.icon}
              </div>

              {/* 锁定遮罩 */}
              {!accessible && (
                <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-dark-200/80 backdrop-blur-sm">
                  <Lock className="h-4 w-4 text-dark-500" />
                </div>
              )}

              {/* 征服徽章 */}
              {conquered && (
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-2.5 py-1 text-[10px] font-bold text-white shadow">
                  <Crown className="h-3 w-3" />
                  已征服
                </div>
              )}

              <div className="relative flex items-start gap-4">
                {/* 主题图标 */}
                <div
                  className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-3xl shadow-sm"
                  style={{
                    background: accessible
                      ? `${theme.color}20`
                      : 'rgba(148, 163, 184, 0.15)',
                  }}
                >
                  {accessible ? theme.icon : '🔒'}
                </div>

                {/* 主题信息 */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-dark-900">
                      {theme.name}
                    </h3>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-dark-400">
                      {theme.nameEn}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-dark-500">
                    {theme.description}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-dark-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {theme.words.length} 单词
                    </span>
                    {accessible && !conquered && (
                      <span className="flex items-center gap-1 text-primary-600">
                        <Sparkles className="h-3 w-3" />
                        可探索
                      </span>
                    )}
                    {conquered && (
                      <span className="flex items-center gap-1 text-amber-600">
                        <CheckCircle2 className="h-3 w-3" />
                        通关
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight
                  className={`mt-1 h-5 w-5 flex-shrink-0 transition-transform ${
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
          <Trophy className="h-6 w-6" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="text-xs text-dark-400">区域征服进度</div>
          <div className="text-base font-bold text-dark-900">
            {user.unlockedThemes.filter((id) => vocabularyThemes.some((t) => t.id === id)).length} / {vocabularyThemes.length} 个区域
          </div>
        </div>
        <div className="w-full sm:w-48">
          <ProgressBar
            value={
              (user.unlockedThemes.filter((id) => vocabularyThemes.some((t) => t.id === id)).length /
                vocabularyThemes.length) *
              100
            }
            color="from-amber-400 to-yellow-500"
            height="h-2.5"
            showLabel
            label="总进度"
          />
        </div>
      </motion.div>
    </div>
  );

  // ===== 渲染：单词列表 =====
  const renderList = () => {
    if (!activeTheme) return null;
    const conquered = isThemeConquered(activeTheme.id);
    return (
      <div className="space-y-5">
        {/* 主题头部 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${activeTheme.color} 0%, ${activeTheme.color}cc 50%, #6366f1 100%)`,
          }}
        >
          <div className="pointer-events-none absolute -right-8 -top-8 text-9xl opacity-20">
            {activeTheme.icon}
          </div>
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-medium text-white/80">
              <MapPin className="h-3.5 w-3.5" />
              {activeTheme.nameEn}
              {conquered && (
                <span className="ml-1 flex items-center gap-1 rounded-full bg-white/25 px-2 py-0.5">
                  <Crown className="h-3 w-3" /> 已征服
                </span>
              )}
            </div>
            <h2 className="mt-1 text-2xl font-extrabold">{activeTheme.name}</h2>
            <p className="mt-1 text-sm text-white/90">{activeTheme.description}</p>
            <div className="mt-3 flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1">
                <BookOpen className="h-3 w-3" />
                {activeTheme.words.length} 个单词
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1">
                <Star className="h-3 w-3" />
                平均难度 {(activeTheme.words.reduce((s, w) => s + w.difficulty, 0) / activeTheme.words.length).toFixed(1)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 单词卡片列表 */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {activeTheme.words.map((word, idx) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="card card-hover p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-lg font-extrabold text-dark-900">
                      {word.word}
                    </h3>
                    <span className="text-xs font-medium text-dark-400">
                      {word.phonetic}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span
                      className="badge text-[10px]"
                      style={{
                        background: `${activeTheme.color}20`,
                        color: activeTheme.color,
                      }}
                    >
                      {word.partOfSpeech}
                    </span>
                    <span className="text-[11px] text-dark-400">
                      难度 {word.difficulty}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-dark-800">
                    {word.meaning}
                  </p>
                </div>
                <button
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition-colors hover:bg-primary-100"
                  title="朗读（模拟）"
                  onClick={() => {
                    // 模拟发音：在标题区短暂闪烁
                    if ('speechSynthesis' in window) {
                      const utter = new SpeechSynthesisUtterance(word.word);
                      utter.lang = 'en-US';
                      utter.rate = 0.9;
                      window.speechSynthesis.cancel();
                      window.speechSynthesis.speak(utter);
                    }
                  }}
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 rounded-xl bg-dark-50 p-3">
                <div className="text-xs leading-relaxed text-dark-700">
                  <span className="font-bold text-primary-600">EN: </span>
                  {word.example}
                </div>
                <div className="mt-1 text-xs leading-relaxed text-dark-500">
                  <span className="font-bold text-accent-600">CN: </span>
                  {word.exampleTranslation}
                </div>
              </div>

              {word.synonyms && word.synonyms.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-medium text-dark-400">
                    近义词：
                  </span>
                  {word.synonyms.map((syn) => (
                    <span
                      key={syn}
                      className="rounded-full bg-dark-100 px-2 py-0.5 text-[10px] font-medium text-dark-600"
                    >
                      {syn}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* 开始练习按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card flex flex-col items-center gap-4 p-5 sm:flex-row sm:justify-between"
        >
          <div className="text-center sm:text-left">
            <div className="text-base font-bold text-dark-900">
              准备好挑战这个区域了吗？
            </div>
            <div className="text-xs text-dark-500">
              练习所有单词后，挑战 Boss 战以征服该区域
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button onClick={handleStartPractice} className="btn-primary">
              <BookOpen className="h-4 w-4" />
              开始练习
            </button>
            <button
              onClick={handleStartBoss}
              className="btn-accent"
              title="直接挑战 Boss"
            >
              <Swords className="h-4 w-4" />
              直接 Boss 战
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  // ===== 渲染：单道题卡片 =====
  const renderQuestionCard = (isBoss: boolean) => {
    if (!currentQuestion) return null;

    const QIcon = QTYPE_ICON[currentQuestion.type];
    const gradient = QTYPE_GRADIENT[currentQuestion.type];
    const total = questions.length;

    return (
      <div className="space-y-4">
        {/* 顶部状态条 */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (advanceTimer.current) clearTimeout(advanceTimer.current);
              setView(isBoss ? 'list' : 'list');
              setActiveThemeId(activeThemeId);
              setCurrentIdx(0);
              setFeedback(null);
              setSelectedOption(null);
              setInputValue('');
            }}
            className="flex items-center gap-1 text-sm text-dark-500 transition-colors hover:text-dark-700"
          >
            <ArrowLeft className="h-4 w-4" /> 退出
          </button>
          <div className="flex items-center gap-2">
            <span
              className={`badge text-[10px] ${
                isBoss
                  ? 'bg-accent-50 text-accent-700'
                  : 'bg-primary-50 text-primary-700'
              }`}
            >
              {isBoss ? <Swords className="h-3 w-3" /> : <Target className="h-3 w-3" />}
              {isBoss ? 'BOSS 战' : '练习模式'}
            </span>
            <div className="text-sm font-bold text-dark-700">
              第 <span className="text-primary-600">{currentIdx + 1}</span> / {total} 题
            </div>
          </div>
        </div>

        {/* 进度条 + 正确数 */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar
              value={progress}
              color={isBoss ? 'from-accent-500 to-rose-500' : 'from-primary-500 to-accent-500'}
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QIcon className="h-4 w-4" />
                  <span className="text-sm font-bold">
                    {QTYPE_LABEL[currentQuestion.type]}
                  </span>
                </div>
                {currentQuestion.subPrompt && (
                  <span className="text-xs text-white/80">
                    {currentQuestion.subPrompt}
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {/* 题干 */}
              <div className="text-center">
                {currentQuestion.type === 'spelling' ? (
                  <>
                    <div className="text-xs font-medium uppercase tracking-wider text-dark-400">
                      请根据释义和音标拼写单词
                    </div>
                    <div className="mt-3 text-2xl font-extrabold text-dark-900">
                      {currentQuestion.prompt}
                    </div>
                    {currentQuestion.subPrompt && (
                      <div className="mt-1 text-sm text-dark-500">
                        {currentQuestion.subPrompt}
                      </div>
                    )}
                  </>
                ) : currentQuestion.type === 'context-fill' ? (
                  <>
                    <div className="text-xs font-medium uppercase tracking-wider text-dark-400">
                      选择正确单词填空
                    </div>
                    <div className="mt-4 rounded-xl bg-dark-50 p-4 text-base font-semibold leading-relaxed text-dark-800">
                      {currentQuestion.context}
                    </div>
                    <div className="mt-2 text-xs text-dark-500">
                      {currentQuestion.contextTrans}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-xs font-medium uppercase tracking-wider text-dark-400">
                      {currentQuestion.type === 'word-to-meaning'
                        ? '选择正确的中文释义'
                        : '选择正确的英文单词'}
                    </div>
                    <div className="mt-3 text-3xl font-extrabold text-dark-900">
                      {currentQuestion.prompt}
                    </div>
                    {currentQuestion.type === 'word-to-meaning' && currentQuestion.subPrompt && (
                      <div className="mt-1 text-sm text-dark-500">
                        {currentQuestion.subPrompt}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* 答题区 */}
              <div className="mt-6">
                {currentQuestion.options ? (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {currentQuestion.options.map((opt, idx) => {
                      const isSelected = selectedOption === opt;
                      const isAnswer = norm(opt) === norm(currentQuestion.answer);
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
                      placeholder="输入英文单词..."
                      autoFocus
                      className={`input text-center text-lg font-bold ${
                        feedback === 'correct'
                          ? 'border-success-500 bg-success-50 text-success-700'
                          : feedback === 'wrong'
                            ? 'border-danger-500 bg-danger-50 text-danger-700'
                            : ''
                      }`}
                    />
                    {currentQuestion.hint && !feedback && (
                      <div className="mt-2 text-center text-xs text-dark-400">
                        💡 {currentQuestion.hint}
                      </div>
                    )}
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
                            {feedback === 'correct' ? '回答正确！' : '回答错误'}
                          </div>
                          {feedback === 'wrong' && (
                            <div className="mt-1 text-xs text-dark-700">
                              <span className="font-semibold">正确答案：</span>
                              <span className="text-success-700">
                                {currentQuestion.answer}
                              </span>
                            </div>
                          )}
                          <div className="mt-1.5 text-xs leading-relaxed text-dark-600">
                            <span className="font-semibold">例句：</span>
                            {currentQuestion.word.example}
                          </div>
                          <div className="mt-0.5 text-xs leading-relaxed text-dark-500">
                            {currentQuestion.word.exampleTranslation}
                          </div>
                          {feedback === 'correct' && (
                            <div className="mt-2 flex items-center gap-3 text-[11px] font-bold">
                              <span className="flex items-center gap-1 text-primary-600">
                                <Zap className="h-3 w-3" />+2 XP
                              </span>
                              <span className="flex items-center gap-1 text-amber-600">
                                <Coins className="h-3 w-3" />+3 金币
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 底部提示 */}
        <div className="text-center text-xs text-dark-400">
          {isBoss
            ? '🔥 Boss 战：全部答对才能征服该区域'
            : '练习模式：答错也可继续，掌握单词即可'}
        </div>
      </div>
    );
  };

  // ===== 渲染：结果页 =====
  const renderResult = () => {
    if (!bossResult || !activeTheme) return null;
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
              bossResult.conquered
                ? 'from-amber-400 via-yellow-500 to-orange-500'
                : 'from-primary-500 to-accent-500'
            } p-6 text-center text-white`}
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 220, delay: 0.1 }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-5xl backdrop-blur-sm"
            >
              {bossResult.conquered ? '🏆' : '🎁'}
            </motion.div>
            <h2 className="mt-3 text-2xl font-extrabold">
              {bossResult.conquered ? '区域征服！' : '挑战完成'}
            </h2>
            <p className="mt-1 text-sm text-white/90">
              {bossResult.conquered
                ? `你已成功征服「${activeTheme.name}」`
                : '再接再厉，下次一定可以！'}
            </p>
          </div>

          <div className="p-5 sm:p-6">
            {/* 答题统计 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-dark-50 p-3 text-center">
                <div className="text-xs text-dark-400">答对</div>
                <div className="text-xl font-extrabold text-success-600">
                  {bossResult.correct}
                </div>
              </div>
              <div className="rounded-xl bg-dark-50 p-3 text-center">
                <div className="text-xs text-dark-400">总题数</div>
                <div className="text-xl font-extrabold text-dark-900">
                  {bossResult.total}
                </div>
              </div>
              <div className="rounded-xl bg-dark-50 p-3 text-center">
                <div className="text-xs text-dark-400">正确率</div>
                <div className="text-xl font-extrabold text-primary-600">
                  {Math.round((bossResult.correct / bossResult.total) * 100)}%
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
                      +{bossResult.xp}
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
                      +{bossResult.coins}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[10px] text-dark-400">词汇</div>
                    <div className="text-base font-extrabold text-dark-900">
                      +{bossResult.conquered ? 5 : 2}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 征服提示 */}
            {bossResult.conquered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 p-4 text-center"
              >
                <Crown className="mx-auto h-7 w-7 text-amber-500" />
                <div className="mt-1 text-sm font-bold text-amber-700">
                  解锁下一主题区域！
                </div>
                <div className="mt-0.5 text-xs text-amber-600">
                  宝箱奖励已发放，继续探索新大陆
                </div>
              </motion.div>
            )}

            {/* 操作按钮 */}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button onClick={handleBackToMap} className="btn-primary flex-1">
                <MapPin className="h-4 w-4" />
                返回地图
              </button>
              {!bossResult.conquered && (
                <button onClick={handleRetryBoss} className="btn-ghost flex-1">
                  <RotateCcw className="h-4 w-4" />
                  再战 Boss
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
      {/* 页面标题（仅 map 视图显示大标题） */}
      {view === 'map' && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 p-5 text-white shadow-lg sm:p-6"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 left-1/4 h-32 w-32 rounded-full bg-fuchsia-300/20 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Compass className="h-5 w-5" />
              </span>
              <h1 className="text-xl font-extrabold sm:text-2xl">词汇冒险</h1>
            </div>
            <p className="mt-2 text-sm text-white/90">
              探索主题区域，收集单词宝藏
            </p>
          </div>
        </motion.section>
      )}

      {/* 非地图视图显示返回条 */}
      {view !== 'map' && view !== 'result' && activeTheme && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={() => {
              if (advanceTimer.current) clearTimeout(advanceTimer.current);
              setView('list');
            }}
            className="flex items-center gap-1 text-sm font-medium text-dark-600 transition-colors hover:text-primary-600"
          >
            <ArrowLeft className="h-4 w-4" />
            返回单词列表
          </button>
          <div className="flex items-center gap-2 text-xs text-dark-500">
            <span className="text-lg">{activeTheme.icon}</span>
            <span className="font-semibold text-dark-700">{activeTheme.name}</span>
          </div>
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
          {view === 'map' && renderMap()}
          {view === 'list' && renderList()}
          {(view === 'practice' || view === 'boss') && renderQuestionCard(view === 'boss')}
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

export default VocabularyPage;
