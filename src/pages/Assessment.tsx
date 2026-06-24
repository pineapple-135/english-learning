import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Brain,
  Trophy,
  Target,
  BookOpen,
  Headphones,
  PenTool,
  BookText,
  Clock,
  Award,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  LogOut,
} from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { assessmentQuestions } from '../data/assessment';
import {
  SkillType,
  CEFRLevel,
  AssessmentQuestion,
} from '../types';
import { getSkillName, getSkillIcon } from '../utils/helpers';
import ProgressBar from '../components/ui/ProgressBar';
import RadarChartSkill from '../components/ui/RadarChartSkill';
import Confetti from '../components/ui/Confetti';

type Step = 'intro' | 'quiz' | 'result';

interface AssessmentResult {
  totalScore: number;
  correctCount: number;
  skillScores: Record<SkillType, number>;
  cefrLevel: CEFRLevel;
}

const SKILL_OVERVIEW: {
  skill: SkillType;
  icon: typeof BookOpen;
  gradient: string;
}[] = [
  {
    skill: 'vocabulary',
    icon: BookOpen,
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    skill: 'grammar',
    icon: PenTool,
    gradient: 'from-purple-500 to-fuchsia-500',
  },
  {
    skill: 'reading',
    icon: BookText,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    skill: 'listening',
    icon: Headphones,
    gradient: 'from-cyan-500 to-teal-500',
  },
];

const ASSESSED_SKILLS: SkillType[] = ['vocabulary', 'grammar', 'reading', 'listening'];

// FCE 通过线（整体正确率 70%）
const FCE_PASS_SCORE = 70;

function getCefrLevel(correctRate: number): CEFRLevel {
  if (correctRate < 0.3) return 'A2';
  if (correctRate < 0.5) return 'B1';
  if (correctRate < 0.7) return 'B1+';
  if (correctRate < 0.85) return 'B2';
  return 'B2+';
}

function getCefrGradient(level: CEFRLevel): string {
  switch (level) {
    case 'A2':
      return 'from-slate-400 to-slate-600';
    case 'B1':
      return 'from-cyan-400 to-blue-500';
    case 'B1+':
      return 'from-blue-400 to-indigo-500';
    case 'B2':
      return 'from-indigo-500 to-purple-500';
    case 'B2+':
      return 'from-purple-500 via-fuchsia-500 to-rose-500';
    default:
      return 'from-slate-400 to-slate-600';
  }
}

function getCefrDesc(level: CEFRLevel): string {
  switch (level) {
    case 'A2':
      return '初学者 · 基础英语使用者';
    case 'B1':
      return '中级 · 独立使用者';
    case 'B1+':
      return '中级加强 · 进阶独立使用者';
    case 'B2':
      return '中高级 · 已达 FCE 通过水平';
    case 'B2+':
      return '高级 · 超越 FCE 通过水平';
    default:
      return '';
  }
}

function normalizeAnswer(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,!?;:]+$/, '');
}

function isCorrect(
  question: AssessmentQuestion,
  userAnswer: string | number | undefined,
): boolean {
  if (userAnswer === undefined || userAnswer === '') return false;
  if (question.type === 'multiple-choice') {
    return Number(userAnswer) === Number(question.answer);
  }
  return (
    normalizeAnswer(String(userAnswer)) ===
    normalizeAnswer(String(question.answer))
  );
}

const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const { state, helperFunctions } = useStore();

  const [step, setStep] = useState<Step>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalQuestions = assessmentQuestions.length;
  const currentQuestion = assessmentQuestions[currentIdx];
  const progress = (currentIdx / totalQuestions) * 100;

  const clearAdvanceTimer = () => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  };

  // 清理定时器
  useEffect(() => {
    return () => clearAdvanceTimer();
  }, []);

  // 切题时同步已保存答案到 UI 状态
  useEffect(() => {
    if (!currentQuestion) return;
    const saved = answers[currentQuestion.id];
    if (currentQuestion.type === 'fill-blank') {
      setInputValue(typeof saved === 'string' ? saved : '');
      setSelectedOption(null);
    } else {
      setSelectedOption(typeof saved === 'number' ? saved : null);
      setInputValue('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx]);

  const computeResult = useCallback((): AssessmentResult => {
    let correctCount = 0;
    const skillCorrect: Record<string, number> = {
      vocabulary: 0,
      grammar: 0,
      reading: 0,
      listening: 0,
    };
    const skillTotal: Record<string, number> = {
      vocabulary: 0,
      grammar: 0,
      reading: 0,
      listening: 0,
    };

    assessmentQuestions.forEach((q) => {
      skillTotal[q.skill]++;
      if (isCorrect(q, answers[q.id])) {
        correctCount++;
        skillCorrect[q.skill]++;
      }
    });

    const totalRate = correctCount / totalQuestions;
    const skillScores: Record<SkillType, number> = {
      vocabulary: Math.round((skillCorrect.vocabulary / skillTotal.vocabulary) * 100),
      grammar: Math.round((skillCorrect.grammar / skillTotal.grammar) * 100),
      reading: Math.round((skillCorrect.reading / skillTotal.reading) * 100),
      listening: Math.round((skillCorrect.listening / skillTotal.listening) * 100),
      writing: state.user.skills.writing,
      speaking: state.user.skills.speaking,
    };

    return {
      totalScore: Math.round(totalRate * 100),
      correctCount,
      skillScores,
      cefrLevel: getCefrLevel(totalRate),
    };
  }, [answers, totalQuestions, state.user.skills]);

  const goToNext = useCallback(() => {
    clearAdvanceTimer();
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      const r = computeResult();
      setResult(r);
      setStep('result');
      setConfettiTrigger((t) => t + 1);
    }
  }, [currentIdx, totalQuestions, computeResult]);

  const goToPrev = () => {
    clearAdvanceTimer();
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
  };

  const handleSelectOption = (optionIdx: number) => {
    setSelectedOption(optionIdx);
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIdx }));
    clearAdvanceTimer();
    advanceTimer.current = setTimeout(() => {
      goToNext();
    }, 420);
  };

  const handleFillBlankSubmit = () => {
    if (!inputValue.trim()) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: inputValue.trim() }));
    goToNext();
  };

  const handleRestart = () => {
    clearAdvanceTimer();
    setStep('intro');
    setCurrentIdx(0);
    setAnswers({});
    setResult(null);
    setSelectedOption(null);
    setInputValue('');
  };

  const handleGeneratePlan = () => {
    if (!result) return;
    helperFunctions.completeAssessment(result.cefrLevel, result.skillScores);
    navigate('/study-plan');
  };

  // ===== INTRO STEP =====
  if (step === 'intro') {
    return (
      <div className="relative min-h-screen overflow-hidden gradient-bg">
        {/* 装饰光斑 */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/20 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-accent-300/30 blur-3xl"
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <motion.div
            className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-purple-300/30 blur-3xl"
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>

        {/* 漂浮装饰 */}
        <div className="pointer-events-none absolute inset-0 hidden sm:block">
          {[
            { emoji: '📚', top: '14%', left: '8%', delay: 0 },
            { emoji: '✏️', top: '24%', right: '10%', delay: 1.2 },
            { emoji: '🎧', top: '64%', left: '6%', delay: 0.6 },
            { emoji: '📖', top: '72%', right: '8%', delay: 1.8 },
            { emoji: '🎯', top: '44%', left: '12%', delay: 2.4 },
          ].map((d, i) => (
            <motion.div
              key={i}
              className="absolute text-3xl opacity-30"
              style={{ top: d.top, left: (d as { left?: string }).left, right: (d as { right?: string }).right }}
              animate={{ y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
              transition={{
                duration: 5 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: d.delay,
              }}
            >
              {d.emoji}
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-10 sm:px-8 sm:py-14">
          {/* 头部 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 backdrop-blur-sm"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Brain className="h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">能力测评</span>
            </motion.div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-4xl">
              入学能力测评
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/90 sm:text-base">
              评估你的英语水平，生成个性化学习计划
            </p>
          </motion.div>

          {/* 主卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            {/* 概览数据 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-dark-50 p-4 text-center">
                <Target className="mx-auto h-6 w-6 text-primary-500" />
                <div className="mt-2 text-2xl font-bold text-dark-900">20</div>
                <div className="text-xs text-dark-500">题目数量</div>
              </div>
              <div className="rounded-2xl bg-dark-50 p-4 text-center">
                <Clock className="mx-auto h-6 w-6 text-accent-500" />
                <div className="mt-2 text-2xl font-bold text-dark-900">20-30</div>
                <div className="text-xs text-dark-500">分钟</div>
              </div>
              <div className="rounded-2xl bg-dark-50 p-4 text-center">
                <Award className="mx-auto h-6 w-6 text-purple-500" />
                <div className="mt-2 text-2xl font-bold text-dark-900">4</div>
                <div className="text-xs text-dark-500">技能维度</div>
              </div>
            </div>

            {/* 技能维度 */}
            <div className="mt-6">
              <div className="mb-3 text-sm font-bold text-dark-700">测评内容涵盖</div>
              <div className="grid grid-cols-2 gap-3">
                {SKILL_OVERVIEW.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.skill}
                      className={`flex items-center gap-3 rounded-xl bg-gradient-to-br ${s.gradient} p-3 text-white shadow-sm`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold">{getSkillName(s.skill)}</div>
                        <div className="text-[11px] text-white/80">5 题 · 难度递增</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 说明 */}
            <div className="mt-6 flex items-start gap-2 rounded-xl bg-primary-50 p-3 text-xs leading-relaxed text-primary-700">
              <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>
                请根据真实水平作答，结果将用于生成最适合你的学习路径。每题作答后自动进入下一题，可随时返回修改。
              </span>
            </div>

            {/* 开始按钮 */}
            <motion.button
              onClick={() => setStep('quiz')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-primary-600 to-accent-500 py-4 text-base font-extrabold text-white shadow-lg transition-all hover:shadow-xl"
            >
              <span className="flex items-center justify-center gap-2">
                开始测评
                <ArrowRight className="h-5 w-5" />
              </span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ===== RESULT STEP =====
  if (step === 'result' && result) {
    const gap = FCE_PASS_SCORE - result.totalScore;
    const reachedFCE = result.totalScore >= FCE_PASS_SCORE;
    const weakSkills = ASSESSED_SKILLS.filter(
      (s) => result.skillScores[s] < 60,
    );

    return (
      <div className="relative min-h-screen bg-dark-50">
        <Confetti trigger={confettiTrigger} duration={3000} count={120} />

        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
          {/* 头部 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-xl"
            >
              <Trophy className="h-9 w-9 text-white" />
            </motion.div>
            <h1 className="text-2xl font-extrabold text-dark-900 sm:text-3xl">
              测评完成！
            </h1>
            <p className="mt-1 text-sm text-dark-500">你的英语能力画像已生成</p>
          </motion.div>

          {/* CEFR + 总分 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6 overflow-hidden rounded-3xl bg-white shadow-lg"
          >
            <div
              className={`bg-gradient-to-r ${getCefrGradient(result.cefrLevel)} p-6 text-white sm:p-7`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-white/80">
                    你的 CEFR 等级
                  </div>
                  <div className="mt-1 text-5xl font-extrabold tracking-tight sm:text-6xl">
                    {result.cefrLevel}
                  </div>
                  <div className="mt-1 text-sm text-white/90">
                    {getCefrDesc(result.cefrLevel)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium uppercase tracking-wider text-white/80">
                    总分
                  </div>
                  <div className="text-4xl font-extrabold sm:text-5xl">
                    {result.totalScore}
                    <span className="text-xl">%</span>
                  </div>
                  <div className="text-sm text-white/90">
                    {result.correctCount} / {totalQuestions} 正确
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 雷达图 + 各维度得分 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <div className="card p-5">
              <div className="mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary-500" />
                <span className="text-sm font-bold text-dark-700">能力雷达图</span>
              </div>
              <RadarChartSkill skills={result.skillScores} size={260} />
            </div>

            <div className="card p-5">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent-500" />
                <span className="text-sm font-bold text-dark-700">各维度得分</span>
              </div>
              <div className="space-y-3.5">
                {ASSESSED_SKILLS.map((skill) => {
                  const score = result.skillScores[skill];
                  const passed = score >= 60;
                  return (
                    <div key={skill}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 font-medium text-dark-700">
                          <span>{getSkillIcon(skill)}</span>
                          {getSkillName(skill)}
                        </span>
                        <span
                          className={`font-bold ${passed ? 'text-success-600' : 'text-accent-600'}`}
                        >
                          {score}
                        </span>
                      </div>
                      <ProgressBar
                        value={score}
                        color={
                          passed
                            ? 'from-success-500 to-green-400'
                            : 'from-accent-400 to-rose-400'
                        }
                        height="h-2"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* FCE 差距分析 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-6 card p-5"
          >
            <div className="mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-bold text-dark-700">
                FCE 通过线差距分析
              </span>
            </div>

            {reachedFCE ? (
              <div className="flex items-start gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="font-bold">恭喜！你已达到 FCE 通过水平</div>
                  <div className="mt-1 text-xs text-green-600">
                    你的总分 {result.totalScore}% 已超过 FCE 通过线（{FCE_PASS_SCORE}%），可直接进入冲刺阶段强化实战能力。
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-accent-50 p-4">
                <div className="text-sm text-accent-700">
                  距离 FCE 通过线还差{' '}
                  <span className="text-lg font-extrabold text-accent-600">
                    {gap}
                  </span>{' '}
                  分
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-dark-500">
                    <span>你的水平 {result.totalScore}%</span>
                    <span>FCE 通过线 {FCE_PASS_SCORE}%</span>
                  </div>
                  <div className="relative">
                    <ProgressBar
                      value={result.totalScore}
                      color="from-primary-500 to-accent-500"
                      height="h-3"
                    />
                    {/* FCE 通过线标记 */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2"
                      style={{ left: `${FCE_PASS_SCORE}%` }}
                    >
                      <div className="h-5 w-0.5 bg-dark-700" />
                    </div>
                  </div>
                </div>
                {weakSkills.length > 0 && (
                  <div className="mt-3 text-xs text-dark-600">
                    <span className="font-semibold">建议重点强化：</span>
                    {weakSkills.map((s) => getSkillName(s)).join('、')}
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* 生成学习计划按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-6"
          >
            <motion.button
              onClick={handleGeneratePlan}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-2xl bg-gradient-to-r from-primary-600 to-accent-500 py-4 text-base font-extrabold text-white shadow-xl transition-all hover:shadow-2xl"
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5" />
                生成个性化学习计划
                <ArrowRight className="h-5 w-5" />
              </span>
            </motion.button>
            <button
              onClick={handleRestart}
              className="mt-3 flex w-full items-center justify-center gap-1.5 text-xs text-dark-400 transition-colors hover:text-dark-600"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              重新测评
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ===== QUIZ STEP =====
  const isLastQuestion = currentIdx === totalQuestions - 1;

  return (
    <div className="min-h-screen bg-dark-50">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        {/* 顶部进度 */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <button
              onClick={() => {
                clearAdvanceTimer();
                setStep('intro');
              }}
              className="flex items-center gap-1 text-sm text-dark-500 transition-colors hover:text-dark-700"
            >
              <LogOut className="h-4 w-4" /> 退出
            </button>
            <div className="text-sm font-bold text-dark-700">
              第 <span className="text-primary-600">{currentIdx + 1}</span> / {totalQuestions} 题
            </div>
          </div>
          <ProgressBar
            value={progress}
            color="from-primary-500 to-accent-500"
            height="h-2"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="card p-6 sm:p-8"
          >
            {/* 技能 + 难度标签 */}
            <div className="mb-4 flex items-center justify-between">
              <span className="badge bg-primary-50 text-primary-700">
                {getSkillIcon(currentQuestion.skill)} {getSkillName(currentQuestion.skill)}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-dark-400">难度</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        i < currentQuestion.difficulty
                          ? 'bg-accent-400'
                          : 'bg-dark-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 题目 */}
            <h2 className="text-base font-bold leading-relaxed text-dark-900 sm:text-lg">
              {currentQuestion.question}
            </h2>

            {/* 答题区 */}
            <div className="mt-6">
              {currentQuestion.type === 'multiple-choice' &&
              currentQuestion.options ? (
                <div className="space-y-2.5">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    return (
                      <motion.button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        whileTap={{ scale: 0.98 }}
                        className={`flex w-full items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-dark-200 bg-white hover:border-primary-300 hover:bg-primary-50/40'
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                            isSelected
                              ? 'bg-primary-500 text-white'
                              : 'bg-dark-100 text-dark-600'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
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
                      if (e.key === 'Enter') handleFillBlankSubmit();
                    }}
                    placeholder="输入你的答案..."
                    autoFocus
                    className="input"
                  />
                  <button
                    onClick={handleFillBlankSubmit}
                    disabled={!inputValue.trim()}
                    className="btn-primary mt-3 w-full"
                  >
                    确认并继续
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 底部导航 */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            onClick={goToPrev}
            disabled={currentIdx === 0}
            className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            上一题
          </button>

          <div className="flex-1 text-center text-xs text-dark-400">
            {isLastQuestion
              ? '完成最后一题后将自动提交'
              : currentQuestion.type === 'multiple-choice'
                ? '选择后自动进入下一题'
                : '输入答案后点击确认'}
          </div>

          {currentQuestion.type === 'multiple-choice' ? (
            <button
              onClick={goToNext}
              className="btn-ghost"
              title="跳到下一题"
            >
              {isLastQuestion ? '提交测评' : '跳过'}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="w-20" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Assessment;
