import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Headphones,
  Lock,
  Clock,
  Radio,
  Play,
  Pause,
  Volume2,
  Captions,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  X,
  Zap,
  Coins,
  Sparkles,
  Repeat,
  PencilLine,
  RotateCcw,
  MapPin,
  ChevronRight,
  Mic,
  Antenna,
  MessagesSquare,
  Lightbulb,
} from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { listeningMaterials } from '../data/listening';
import { ListeningMaterial, ListeningQuestion, CEFRLevel } from '../types';
import ProgressBar from '../components/ui/ProgressBar';
import RewardPopup from '../components/game/RewardPopup';
import Confetti from '../components/ui/Confetti';

// ===== 类型定义 =====
type View = 'list' | 'listening' | 'quiz' | 'result';
type Speed = 0.75 | 1 | 1.25;
type Mode = 'normal' | 'sentence' | 'dictation';

interface QuizResult {
  correct: number;
  total: number;
  xp: number;
  coins: number;
  skillDelta: number;
  accuracy: number;
}

// ===== 工具函数 =====
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

// 素材类型样式
const TYPE_STYLE: Record<
  ListeningMaterial['type'],
  { label: string; icon: typeof Mic; gradient: string; tag: string }
> = {
  dialogue: {
    label: '对话截获',
    icon: MessagesSquare,
    gradient: 'from-cyan-400 to-sky-500',
    tag: '对话',
  },
  monologue: {
    label: '独白解码',
    icon: Mic,
    gradient: 'from-violet-400 to-purple-500',
    tag: '独白',
  },
  broadcast: {
    label: '广播监听',
    icon: Radio,
    gradient: 'from-amber-400 to-orange-500',
    tag: '广播',
  },
  interview: {
    label: '访谈记录',
    icon: Antenna,
    gradient: 'from-rose-400 to-pink-500',
    tag: '访谈',
  },
};

// 题型标签
const QTYPE_LABEL: Record<ListeningQuestion['type'], string> = {
  'multiple-choice': '选择题',
  'fill-blank': '填空题',
  matching: '匹配题',
};

const QTYPE_GRADIENT: Record<ListeningQuestion['type'], string> = {
  'multiple-choice': 'from-cyan-500 to-sky-500',
  'fill-blank': 'from-violet-500 to-purple-500',
  matching: 'from-amber-500 to-orange-500',
};

// 格式化时间 mm:ss
function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// 将 transcript 拆分成句子
function splitIntoSentences(transcript: string): string[] {
  const cleaned = transcript.replace(/^\[Transcript\]\s*/m, '').trim();
  const lines = cleaned
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l);

  const sentences: string[] = [];
  for (const line of lines) {
    const matches = line.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g);
    if (matches && matches.length > 1) {
      for (const m of matches) {
        const t = m.trim();
        if (t) sentences.push(t);
      }
    } else if (line) {
      sentences.push(line);
    }
  }
  return sentences;
}

// ===== 主组件 =====
const ListeningPage: React.FC = () => {
  const { helperFunctions } = useStore();

  const [view, setView] = useState<View>('list');
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null);

  // 播放器状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  const [speed, setSpeed] = useState<Speed>(1);
  const [showSubtitle, setShowSubtitle] = useState(true);
  const [mode, setMode] = useState<Mode>('normal');

  // 听写模式
  const [dictationInput, setDictationInput] = useState('');
  const [dictationFeedback, setDictationFeedback] = useState<
    'correct' | 'wrong' | null
  >(null);

  // 答题状态
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 奖励与庆祝
  const [rewardTrigger, setRewardTrigger] = useState(0);
  const [rewardData, setRewardData] = useState({
    xp: 0,
    coins: 0,
    title: '情报破译！',
  });
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const activeMaterial = useMemo(
    () => listeningMaterials.find((m) => m.id === activeMaterialId) ?? null,
    [activeMaterialId],
  );

  const sentences = useMemo(() => {
    if (!activeMaterial) return [];
    return splitIntoSentences(activeMaterial.transcript);
  }, [activeMaterial]);

  // 每句的预估时长（基于字数与素材总时长）
  const sentenceDurations = useMemo(() => {
    if (sentences.length === 0 || !activeMaterial) return [];
    const totalWords = sentences.reduce(
      (s, sent) => s + sent.split(/\s+/).length,
      0,
    );
    const durationPerWord = activeMaterial.duration / Math.max(totalWords, 1);
    return sentences.map((s) => {
      const w = s.split(/\s+/).length;
      // 每句最少 2 秒，最多 8 秒
      return Math.min(8, Math.max(2, w * durationPerWord));
    });
  }, [sentences, activeMaterial]);

  // 总累计时间轴：每句结束时的累计时间
  const sentenceTimeline = useMemo(() => {
    let acc = 0;
    const timeline: number[] = [0];
    for (const d of sentenceDurations) {
      acc += d;
      timeline.push(acc);
    }
    return timeline;
  }, [sentenceDurations]);

  // 当前累计播放时间（秒，按 speed 调整）
  const [elapsedSec, setElapsedSec] = useState(0);

  const totalDuration = activeMaterial?.duration ?? 0;

  // 清理定时器
  const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ===== 播放逻辑 =====
  useEffect(() => {
    if (!isPlaying) {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
      return;
    }

    // 普通模式：逐句推进
    const tickMs = 200; // 每 200ms 更新一次
    const tickSec = (tickMs / 1000) * speed;

    playTimerRef.current = setInterval(() => {
      setElapsedSec((prev) => {
        const next = prev + tickSec;
        // 检查是否切换到下一句
        const newIdx = Math.min(
          sentences.length - 1,
          sentenceTimeline.findIndex((t) => next < t),
        );
        if (newIdx >= 0 && newIdx !== currentSentenceIdx) {
          setCurrentSentenceIdx(newIdx);
        }
        // 播放结束
        if (next >= totalDuration) {
          setIsPlaying(false);
          setCurrentSentenceIdx(sentences.length - 1);
          return totalDuration;
        }
        return next;
      });
    }, tickMs);

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [
    isPlaying,
    speed,
    sentences.length,
    sentenceTimeline,
    currentSentenceIdx,
    totalDuration,
  ]);

  // 清理
  useEffect(() => {
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  // 切换素材时重置播放
  useEffect(() => {
    setIsPlaying(false);
    setCurrentSentenceIdx(0);
    setElapsedSec(0);
    setDictationInput('');
    setDictationFeedback(null);
  }, [activeMaterialId]);

  const currentQuestion = activeMaterial?.questions[currentIdx] ?? null;
  const progress =
    activeMaterial && activeMaterial.questions.length > 0
      ? (currentIdx / activeMaterial.questions.length) * 100
      : 0;

  // ===== 进入素材 =====
  const handleEnterMaterial = (m: ListeningMaterial) => {
    if (!m.unlocked) return;
    setActiveMaterialId(m.id);
    setView('listening');
  };

  // ===== 播放控制 =====
  const togglePlay = () => {
    if (elapsedSec >= totalDuration) {
      // 已结束，重新开始
      setElapsedSec(0);
      setCurrentSentenceIdx(0);
    }
    setIsPlaying((p) => !p);
  };

  const handleSpeedChange = (s: Speed) => {
    setSpeed(s);
  };

  // 跳转到指定句子
  const jumpToSentence = (idx: number) => {
    setCurrentSentenceIdx(idx);
    setElapsedSec(sentenceTimeline[idx] ?? 0);
    // 逐句模式：暂停在当前句
    if (mode === 'sentence') {
      setIsPlaying(false);
    }
  };

  // 重复当前句
  const handleRepeatSentence = () => {
    setElapsedSec(sentenceTimeline[currentSentenceIdx] ?? 0);
    setIsPlaying(true);
  };

  // ===== 听写模式 =====
  const handleDictationSubmit = () => {
    if (!dictationInput.trim() || dictationFeedback) return;
    const target = sentences[currentSentenceIdx] ?? '';
    // 去除说话人前缀（如 "Sarah: "）进行比较
    const cleanTarget = target.replace(/^[A-Za-z]+\s*:\s*/, '');
    const isCorrect = norm(dictationInput) === norm(cleanTarget);
    setDictationFeedback(isCorrect ? 'correct' : 'wrong');
  };

  const handleDictationNext = () => {
    setDictationInput('');
    setDictationFeedback(null);
    if (currentSentenceIdx < sentences.length - 1) {
      setCurrentSentenceIdx((i) => i + 1);
      setElapsedSec(sentenceTimeline[currentSentenceIdx + 1] ?? 0);
    }
  };

  // ===== 开始答题 =====
  const handleStartQuiz = () => {
    setIsPlaying(false);
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
    if (!activeMaterial) return;
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    if (currentIdx < activeMaterial.questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setInputValue('');
      setFeedback(null);
    } else {
      finishQuiz();
    }
  }, [currentIdx, activeMaterial]);

  // ===== 完成答题 =====
  const finishQuiz = () => {
    if (!activeMaterial) return;
    const total = activeMaterial.questions.length;
    const accuracy = Math.round((correctCount / total) * 100);
    const xpReward = Math.round((correctCount / total) * 60) + 10;
    const coinReward = Math.round((correctCount / total) * 80) + 15;
    const skillDelta = accuracy >= 80 ? 5 : accuracy >= 50 ? 3 : 1;

    helperFunctions.addXP(xpReward);
    helperFunctions.addCoins(coinReward);
    helperFunctions.updateSkill('listening', skillDelta);
    helperFunctions.updateStreak();

    if (accuracy === 100) {
      helperFunctions.unlockAchievement(
        `listening-perfect-${activeMaterial.id}`,
      );
      setConfettiTrigger((t) => t + 1);
    } else if (accuracy >= 80) {
      setConfettiTrigger((t) => t + 1);
    }

    setRewardData({
      xp: xpReward,
      coins: coinReward,
      title: accuracy >= 80 ? '听力达人！' : '情报破译',
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
    setIsPlaying(false);
    setView('list');
    setActiveMaterialId(null);
    setQuizResult(null);
    setCurrentIdx(0);
    setCorrectCount(0);
    setFeedback(null);
    setSelectedOption(null);
    setInputValue('');
    setElapsedSec(0);
    setCurrentSentenceIdx(0);
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

  // ===== 渲染：素材列表 =====
  const renderList = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {listeningMaterials.map((m, idx) => {
          const style = TYPE_STYLE[m.type];
          const Icon = style.icon;
          const accessible = m.unlocked;
          return (
            <motion.button
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              whileHover={accessible ? { y: -4, scale: 1.01 } : {}}
              whileTap={accessible ? { scale: 0.99 } : {}}
              onClick={() => handleEnterMaterial(m)}
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
                <Icon className="h-20 w-20" />
              </div>

              {/* 锁定遮罩 */}
              {!accessible && (
                <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-dark-200/80 backdrop-blur-sm">
                  <Lock className="h-4 w-4 text-dark-500" />
                </div>
              )}

              {/* 任务编号 */}
              <div className="absolute right-3 top-3 flex items-center gap-1">
                {accessible && (
                  <span className="badge bg-success-50 text-success-700">
                    <Antenna className="h-3 w-3" />
                    可截获
                  </span>
                )}
              </div>

              <div className="relative flex items-start gap-4">
                {/* 任务图标 */}
                <div
                  className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${style.gradient} text-white shadow-sm`}
                >
                  {accessible ? (
                    <Icon className="h-7 w-7" />
                  ) : (
                    <Lock className="h-6 w-6" />
                  )}
                </div>

                {/* 素材信息 */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`badge text-[10px] ${CEFR_COLOR[m.level]}`}
                    >
                      {m.level}
                    </span>
                    <span
                      className={`badge bg-gradient-to-r ${style.gradient} text-[10px] text-white`}
                    >
                      {style.tag}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-base font-bold text-dark-900">
                    {m.title}
                  </h3>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-dark-400">
                    {m.titleEn}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-dark-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(m.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" />
                      {m.questions.length} 题
                    </span>
                    <span className="flex items-center gap-1 text-primary-600">
                      <Sparkles className="h-3 w-3" />
                      {style.label}
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
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-500 text-white shadow">
          <Headphones className="h-6 w-6" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="text-xs text-dark-400">情报截获进度</div>
          <div className="text-base font-bold text-dark-900">
            {listeningMaterials.filter((m) => m.unlocked).length} /{' '}
            {listeningMaterials.length} 条已解锁
          </div>
        </div>
        <div className="w-full sm:w-48">
          <ProgressBar
            value={
              (listeningMaterials.filter((m) => m.unlocked).length /
                listeningMaterials.length) *
              100
            }
            color="from-cyan-400 to-sky-500"
            height="h-2.5"
            showLabel
            label="截获进度"
          />
        </div>
      </motion.div>
    </div>
  );

  // ===== 渲染：听力界面 =====
  const renderListening = () => {
    if (!activeMaterial) return null;
    const style = TYPE_STYLE[activeMaterial.type];
    const Icon = style.icon;
    const playProgress = (elapsedSec / totalDuration) * 100;
    const currentSentence = sentences[currentSentenceIdx] ?? '';

    return (
      <div className="space-y-4">
        {/* 素材头部 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${style.gradient} p-5 text-white shadow-lg sm:p-6`}
        >
          <div className="pointer-events-none absolute -right-8 -top-8 opacity-20">
            <Icon className="h-32 w-32" />
          </div>
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-white/85">
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1">
                <Antenna className="h-3 w-3" />
                {style.label}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1">
                {activeMaterial.level}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(activeMaterial.duration)}
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-extrabold">
              {activeMaterial.title}
            </h2>
            <p className="mt-0.5 text-sm font-medium uppercase tracking-wider text-white/80">
              {activeMaterial.titleEn}
            </p>
          </div>
        </motion.div>

        {/* 播放器 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5 sm:p-6"
        >
          {/* 进度条 */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold tabular-nums text-dark-500">
              {formatTime(elapsedSec)}
            </span>
            <div className="flex-1">
              <ProgressBar
                value={playProgress}
                color="from-cyan-500 to-sky-500"
                height="h-2"
              />
            </div>
            <span className="text-xs font-semibold tabular-nums text-dark-500">
              {formatTime(totalDuration)}
            </span>
          </div>

          {/* 播放控制 */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={togglePlay}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 translate-x-0.5" />
              )}
            </button>

            <button
              onClick={handleRepeatSentence}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-dark-100 text-dark-600 transition-colors hover:bg-dark-200"
              title="重复当前句"
            >
              <Repeat className="h-4 w-4" />
            </button>

            <button
              onClick={() => setShowSubtitle((s) => !s)}
              className={`flex h-10 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors ${
                showSubtitle
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-dark-100 text-dark-500'
              }`}
              title="字幕开关"
            >
              <Captions className="h-4 w-4" />
              字幕
            </button>

            {/* 语速控制 */}
            <div className="flex items-center gap-1 rounded-full bg-dark-100 p-1">
              {([0.75, 1, 1.25] as Speed[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                    speed === s
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-dark-500 hover:text-dark-700'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* 模式切换 */}
          <div className="mt-4 flex items-center justify-center gap-2 border-t border-dark-100 pt-4">
            {([
              { id: 'normal' as Mode, label: '普通播放', icon: Play },
              { id: 'sentence' as Mode, label: '逐句精听', icon: Repeat },
              { id: 'dictation' as Mode, label: '听写模式', icon: PencilLine },
            ]).map((m) => {
              const MIcon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setMode(m.id);
                    setIsPlaying(false);
                    setDictationInput('');
                    setDictationFeedback(null);
                  }}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    mode === m.id
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-sm'
                      : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
                  }`}
                >
                  <MIcon className="h-3.5 w-3.5" />
                  {m.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* 字幕区 / 听写区 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5 sm:p-6"
        >
          {mode === 'dictation' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-dark-700">
                  <PencilLine className="h-4 w-4 text-accent-500" />
                  听写模式
                </div>
                <span className="text-xs text-dark-400">
                  第 {currentSentenceIdx + 1} / {sentences.length} 句
                </span>
              </div>

              <div className="rounded-xl bg-primary-50 p-4 text-center">
                <div className="text-xs text-primary-600">
                  点击播放按钮，听一句后输入你听到的内容
                </div>
                <button
                  onClick={handleRepeatSentence}
                  className="btn-ghost mt-2"
                >
                  <Volume2 className="h-4 w-4" />
                  重新播放本句
                </button>
              </div>

              {dictationFeedback && (
                <div
                  className={`rounded-xl p-3 text-sm ${
                    dictationFeedback === 'correct'
                      ? 'bg-success-50 text-success-700'
                      : 'bg-danger-50 text-danger-700'
                  }`}
                >
                  <div className="font-bold">
                    {dictationFeedback === 'correct'
                      ? '✓ 听写正确！'
                      : '✗ 再听一次试试'}
                  </div>
                  <div className="mt-1 text-dark-700">
                    <span className="font-semibold">原文：</span>
                    {currentSentence.replace(/^[A-Za-z]+\s*:\s*/, '')}
                  </div>
                </div>
              )}

              <textarea
                value={dictationInput}
                onChange={(e) => setDictationInput(e.target.value)}
                disabled={!!dictationFeedback}
                placeholder="输入你听到的英文..."
                rows={3}
                className={`input resize-none ${
                  dictationFeedback === 'correct'
                    ? 'border-success-500 bg-success-50'
                    : dictationFeedback === 'wrong'
                      ? 'border-danger-500 bg-danger-50'
                      : ''
                }`}
              />

              <div className="flex gap-2">
                {!dictationFeedback ? (
                  <button
                    onClick={handleDictationSubmit}
                    disabled={!dictationInput.trim()}
                    className="btn-primary flex-1"
                  >
                    提交听写
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleDictationNext}
                    className="btn-primary flex-1"
                  >
                    下一句
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-dark-700">
                  <Captions className="h-4 w-4 text-primary-500" />
                  {showSubtitle ? '字幕（高亮当前播放句）' : '字幕已隐藏'}
                </div>
                <span className="text-xs text-dark-400">
                  第 {currentSentenceIdx + 1} / {sentences.length} 句
                </span>
              </div>

              <div
                className={`space-y-2 transition-opacity ${
                  showSubtitle ? 'opacity-100' : 'opacity-30 blur-sm'
                }`}
              >
                {sentences.map((s, i) => {
                  const isCurrent = i === currentSentenceIdx;
                  const isPast = i < currentSentenceIdx;
                  return (
                    <motion.p
                      key={i}
                      onClick={() => jumpToSentence(i)}
                      className={`cursor-pointer rounded-lg px-3 py-2 text-sm leading-relaxed transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-r from-primary-100 to-accent-100 font-semibold text-primary-900 shadow-sm ring-1 ring-primary-200'
                          : isPast
                            ? 'text-dark-400'
                            : 'text-dark-700 hover:bg-dark-50'
                      }`}
                    >
                      {isCurrent && (
                        <motion.span
                          className="mr-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 align-middle"
                          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                      {s}
                    </motion.p>
                  );
                })}
              </div>

              {mode === 'sentence' && (
                <div className="mt-4 rounded-xl bg-accent-50 p-3 text-center text-xs text-accent-700">
                  <Repeat className="mx-auto mb-1 h-4 w-4" />
                  逐句精听模式：点击任意句子跳转，按下播放按钮重复当前句
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* 开始答题 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card flex flex-col items-center gap-4 p-5 sm:flex-row sm:justify-between"
        >
          <div className="text-center sm:text-left">
            <div className="text-base font-bold text-dark-900">
              准备好接受情报测试了吗？
            </div>
            <div className="text-xs text-dark-500">
              共 {activeMaterial.questions.length} 道题目，检验你的听力成果
            </div>
          </div>
          <button
            onClick={handleStartQuiz}
            className="btn-primary w-full sm:w-auto"
          >
            <Lightbulb className="h-4 w-4" />
            开始答题
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    );
  };

  // ===== 渲染：答题 =====
  const renderQuiz = () => {
    if (!currentQuestion || !activeMaterial) return null;
    const gradient = QTYPE_GRADIENT[currentQuestion.type];
    const total = activeMaterial.questions.length;

    return (
      <div className="space-y-4">
        {/* 顶部状态条 */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (advanceTimer.current) clearTimeout(advanceTimer.current);
              setView('listening');
            }}
            className="flex items-center gap-1 text-sm text-dark-500 transition-colors hover:text-dark-700"
          >
            <ArrowLeft className="h-4 w-4" /> 返回听力
          </button>
          <div className="flex items-center gap-2">
            <span className="badge bg-cyan-50 text-cyan-700">
              <Headphones className="h-3 w-3" />
              听力测试
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
              color="from-cyan-500 to-sky-500"
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
                <Lightbulb className="h-4 w-4" />
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
    if (!quizResult || !activeMaterial) return null;
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
                ? 'from-cyan-400 via-sky-500 to-indigo-500'
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
                  ? '🎧'
                  : '📻'}
            </motion.div>
            <h2 className="mt-3 text-2xl font-extrabold">
              {quizResult.accuracy === 100
                ? '完美破译！'
                : passed
                  ? '情报破译！'
                  : '继续训练！'}
            </h2>
            <p className="mt-1 text-sm text-white/90">
              {passed
                ? `你已成功截获「${activeMaterial.title}」`
                : '再听几遍，下次一定可以！'}
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
                <div className="text-xl font-extrabold text-cyan-600">
                  {quizResult.accuracy}%
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
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
                    <Headphones className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[10px] text-dark-400">听力</div>
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
                返回情报列表
              </button>
              <button onClick={handleRetry} className="btn-ghost flex-1">
                <RotateCcw className="h-4 w-4" />
                重新挑战
              </button>
              <button
                onClick={() => setView('listening')}
                className="btn-primary flex-1"
              >
                <Headphones className="h-4 w-4" />
                再听一遍
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  // ===== 主渲染 =====
  return (
    <div className="space-y-5">
      {/* 页面标题 */}
      {view === 'list' && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 p-5 text-white shadow-lg sm:p-6"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 left-1/4 h-32 w-32 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Headphones className="h-5 w-5" />
              </span>
              <h1 className="text-xl font-extrabold sm:text-2xl">听力训练</h1>
            </div>
            <p className="mt-2 text-sm text-white/90">
              截获情报，训练你的耳朵
            </p>
          </div>
        </motion.section>
      )}

      {/* 非列表视图显示返回条 */}
      {view !== 'list' && view !== 'result' && activeMaterial && (
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
            返回情报列表
          </button>
          <div className="flex items-center gap-2 text-xs text-dark-500">
            <Headphones className="h-3.5 w-3.5" />
            <span className="font-semibold text-dark-700">
              {activeMaterial.title}
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
            返回情报列表
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
          {view === 'listening' && renderListening()}
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

export default ListeningPage;
