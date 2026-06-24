import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  FileText,
  Award,
  Trophy,
  Play,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Target,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  Coins,
  RotateCcw,
  Timer,
  BookOpen,
  PenTool,
  Headphones,
  Mic,
  AlertCircle,
  Eye,
  ListChecks,
} from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { mockExams } from '../data/mockExam';
import {
  MockExam,
  ExamQuestion,
  SkillType,
} from '../types';
import {
  getSkillName,
  getSkillIcon,
  getSkillHex,
} from '../utils/helpers';
import ProgressBar from '../components/ui/ProgressBar';
import RewardPopup from '../components/game/RewardPopup';
import Confetti from '../components/ui/Confetti';

// ===== 常量 =====

type View = 'list' | 'exam' | 'result';
type Mode = 'timed' | 'free';

// FCE 剑桥量表范围
const CAMBRIDGE_MIN = 122;
const CAMBRIDGE_MAX = 190;
const FCE_PASS = 160; // Grade C 通过
const FCE_GRADE_B = 173;
const FCE_GRADE_A = 180;

// FCE 模块说明
const FCE_MODULES = [
  {
    name: '阅读与语言运用',
    nameEn: 'Reading & Use of English',
    duration: 75,
    icon: BookOpen,
    color: 'from-blue-500 to-cyan-500',
    desc: '阅读理解 + 词汇语法',
  },
  {
    name: '写作',
    nameEn: 'Writing',
    duration: 80,
    icon: PenTool,
    color: 'from-rose-500 to-pink-500',
    desc: '短文 + 信件/报告/评论',
  },
  {
    name: '听力',
    nameEn: 'Listening',
    duration: 40,
    icon: Headphones,
    color: 'from-cyan-500 to-teal-500',
    desc: '4段录音 · 30题',
  },
  {
    name: '口语',
    nameEn: 'Speaking',
    duration: 15,
    icon: Mic,
    color: 'from-orange-500 to-amber-500',
    desc: '4部分 · 双人对话',
  },
];

// 评分等级
const gradeBands = [
  { min: 180, label: 'Grade A 卓越', color: 'from-rose-500 to-purple-600', short: 'A' },
  { min: 173, label: 'Grade B 优秀', color: 'from-purple-500 to-indigo-600', short: 'B' },
  { min: 160, label: 'Grade C 通过', color: 'from-indigo-500 to-blue-500', short: 'C' },
  { min: 140, label: 'Level B1', color: 'from-slate-400 to-slate-600', short: 'B1' },
  { min: 0, label: '未达 B1', color: 'from-dark-400 to-dark-600', short: '-' },
];

function getGrade(score: number) {
  return gradeBands.find((g) => score >= g.min) ?? gradeBands[gradeBands.length - 1];
}

// FCE 通过线进度（基于分数）
function passProgress(score: number) {
  return Math.max(0, Math.min(100, ((score - CAMBRIDGE_MIN) / (CAMBRIDGE_MAX - CAMBRIDGE_MIN)) * 100));
}

// 题型标签
const typeLabels: Record<ExamQuestion['type'], string> = {
  'multiple-choice': '选择题',
  'fill-blank': '填空题',
  'word-formation': '词形变化',
  'open-cloze': '完形填空',
};

const typeColors: Record<ExamQuestion['type'], string> = {
  'multiple-choice': 'bg-blue-50 text-blue-600',
  'fill-blank': 'bg-cyan-50 text-cyan-600',
  'word-formation': 'bg-purple-50 text-purple-600',
  'open-cloze': 'bg-rose-50 text-rose-600',
};

// ===== 工具函数 =====

function normalizeAnswer(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,!?;:'"]+$/, '')
    .replace(/^["']+/, '');
}

function isCorrect(question: ExamQuestion, userAnswer: string | number | undefined): boolean {
  if (userAnswer === undefined || userAnswer === '') return false;
  if (question.type === 'multiple-choice') {
    return Number(userAnswer) === Number(question.answer);
  }
  // 词形变化/完形/填空：忽略大小写、首尾标点、首尾空格
  return (
    normalizeAnswer(String(userAnswer)) === normalizeAnswer(String(question.answer))
  );
}

// 把所有题目展平，并保留 section 信息
interface FlatQuestion {
  q: ExamQuestion;
  sectionId: string;
  sectionName: string;
  sectionType: SkillType;
  sectionIdx: number;
  idxInExam: number; // 在整张试卷中的序号
}

function flattenExam(exam: MockExam): FlatQuestion[] {
  const out: FlatQuestion[] = [];
  let idx = 0;
  exam.sections.forEach((sec, sIdx) => {
    sec.questions.forEach((q) => {
      out.push({
        q,
        sectionId: sec.id,
        sectionName: sec.name,
        sectionType: sec.type,
        sectionIdx: sIdx,
        idxInExam: idx++,
      });
    });
  });
  return out;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// 把正确率映射到剑桥量表分数
function toCambridgeScore(correctRate: number): number {
  const score = Math.round(CAMBRIDGE_MIN + correctRate * (CAMBRIDGE_MAX - CAMBRIDGE_MIN));
  return Math.max(CAMBRIDGE_MIN, Math.min(CAMBRIDGE_MAX, score));
}

// 根据用户技能预测分
function predictScore(skills: Record<SkillType, number>): number {
  const values = Object.values(skills);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return toCambridgeScore(avg / 100);
}

// ===== localStorage 持久化（模考历史与错题本）=====

export interface ExamRecord {
  examId: string;
  examTitle: string;
  date: string; // ISO
  score: number; // 剑桥量表
  correctCount: number;
  totalQuestions: number;
  correctRate: number;
  durationSec: number;
  mode: Mode;
}

export interface MistakeRecord {
  id: string; // questionId + date
  questionId: string;
  examId: string;
  examTitle: string;
  date: string;
  type: ExamQuestion['type'];
  skill: SkillType;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  sectionName: string;
}

const EXAM_HISTORY_KEY = 'englishquest_exam_history';
const MISTAKES_KEY = 'englishquest_mistakes';

function readExamHistory(): ExamRecord[] {
  try {
    const raw = localStorage.getItem(EXAM_HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as ExamRecord[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeExamHistory(records: ExamRecord[]) {
  try {
    localStorage.setItem(EXAM_HISTORY_KEY, JSON.stringify(records.slice(-30)));
  } catch {
    // ignore
  }
}

function readMistakes(): MistakeRecord[] {
  try {
    const raw = localStorage.getItem(MISTAKES_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as MistakeRecord[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeMistakes(records: MistakeRecord[]) {
  try {
    // 最多保留 200 条
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(records.slice(-200)));
  } catch {
    // ignore
  }
}

// ===== 成绩结果类型 =====

interface SectionResult {
  sectionId: string;
  sectionName: string;
  sectionType: SkillType;
  total: number;
  correct: number;
  correctRate: number;
  cambridgeScore: number;
}

interface ExamResult {
  examId: string;
  examTitle: string;
  totalQuestions: number;
  correctCount: number;
  correctRate: number;
  cambridgeScore: number;
  gapToPass: number; // 与 160 的差距（负数表示已超过）
  passed: boolean;
  grade: ReturnType<typeof getGrade>;
  sectionResults: SectionResult[];
  weakSkills: SkillType[];
  strongSkills: SkillType[];
  wrongQuestions: {
    q: ExamQuestion;
    userAnswer: string | number | undefined;
    sectionName: string;
  }[];
  durationSec: number;
  mode: Mode;
}

// ===== 主组件 =====

const ExamCenter: React.FC = () => {
  const { state, helperFunctions } = useStore();
  const { user } = state;

  const [view, setView] = useState<View>('list');
  const [selectedExam, setSelectedExam] = useState<MockExam | null>(null);
  const [mode, setMode] = useState<Mode>('timed');

  // 答题状态
  const flatQuestions = useMemo<FlatQuestion[]>(
    () => (selectedExam ? flattenExam(selectedExam) : []),
    [selectedExam],
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});

  // 计时
  const [timeRemaining, setTimeRemaining] = useState(0); // 秒，计时模式
  const [timeUsed, setTimeUsed] = useState(0); // 秒，自由模式
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 结果与奖励
  const [result, setResult] = useState<ExamResult | null>(null);
  const [rewardTrigger, setRewardTrigger] = useState(0);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [rewardData, setRewardData] = useState<{ xp: number; coins: number; gems: number }>({
    xp: 0,
    coins: 0,
    gems: 0,
  });

  // 预测分
  const predictedScore = useMemo(() => predictScore(user.skills), [user.skills]);

  // 历史最佳
  const examHistory = useMemo(() => readExamHistory(), [view]);
  const bestScore = useMemo(
    () => examHistory.reduce((max, r) => Math.max(max, r.score), 0),
    [examHistory],
  );

  // ===== 计时器 =====
  useEffect(() => {
    if (view !== 'exam') return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (mode === 'timed') {
        setTimeRemaining((t) => {
          if (t <= 1) {
            // 自动提交
            return 0;
          }
          return t - 1;
        });
      } else {
        setTimeUsed((t) => t + 1);
      }
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [view, mode]);

  // 计时归零自动提交
  useEffect(() => {
    if (view === 'exam' && mode === 'timed' && timeRemaining === 0 && flatQuestions.length > 0) {
      // 防止初始化时立即触发：检查是否真的开始过
      if (selectedExam && selectedExam.duration > 0) {
        handleSubmit(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, view, mode]);

  // ===== 开始模考 =====
  const startExam = (exam: MockExam, m: Mode) => {
    setSelectedExam(exam);
    setMode(m);
    setAnswers({});
    setCurrentIdx(0);
    setResult(null);
    setTimeRemaining(m === 'timed' ? exam.duration * 60 : 0);
    setTimeUsed(0);
    setView('exam');
  };

  // ===== 答题 =====
  const setAnswer = (qId: string, val: string | number) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const goToIdx = (idx: number) => {
    if (idx < 0 || idx >= flatQuestions.length) return;
    setCurrentIdx(idx);
  };

  // ===== 提交计算 =====
  const computeResult = useCallback(
    (auto = false): ExamResult | null => {
      if (!selectedExam) return null;
      const durationSec = mode === 'timed' ? selectedExam.duration * 60 - timeRemaining : timeUsed;

      let correctCount = 0;
      const sectionMap: Record<
        string,
        { sectionId: string; sectionName: string; sectionType: SkillType; total: number; correct: number }
      > = {};
      const wrongQuestions: ExamResult['wrongQuestions'] = [];

      flatQuestions.forEach((fq) => {
        const sec = sectionMap[fq.sectionId] ?? {
          sectionId: fq.sectionId,
          sectionName: fq.sectionName,
          sectionType: fq.sectionType,
          total: 0,
          correct: 0,
        };
        sec.total += 1;
        const ua = answers[fq.q.id];
        if (isCorrect(fq.q, ua)) {
          correctCount += 1;
          sec.correct += 1;
        } else {
          wrongQuestions.push({
            q: fq.q,
            userAnswer: ua,
            sectionName: fq.sectionName,
          });
        }
        sectionMap[fq.sectionId] = sec;
      });

      const totalQuestions = flatQuestions.length;
      const correctRate = totalQuestions > 0 ? correctCount / totalQuestions : 0;
      const cambridgeScore = toCambridgeScore(correctRate);
      const grade = getGrade(cambridgeScore);
      const passed = cambridgeScore >= FCE_PASS;
      const gapToPass = cambridgeScore - FCE_PASS;

      const sectionResults: SectionResult[] = Object.values(sectionMap).map((s) => ({
        ...s,
        correctRate: s.total > 0 ? s.correct / s.total : 0,
        cambridgeScore: toCambridgeScore(s.total > 0 ? s.correct / s.total : 0),
      }));

      // 强弱项分析（按 section）
      const sorted = [...sectionResults].sort((a, b) => b.correctRate - a.correctRate);
      const strongSkills = sorted.filter((s) => s.correctRate >= 0.7).map((s) => s.sectionType);
      const weakSkills = sorted.filter((s) => s.correctRate < 0.6).map((s) => s.sectionType);

      return {
        examId: selectedExam.id,
        examTitle: selectedExam.title,
        totalQuestions,
        correctCount,
        correctRate,
        cambridgeScore,
        gapToPass,
        passed,
        grade,
        sectionResults,
        weakSkills,
        strongSkills,
        wrongQuestions,
        durationSec: Math.max(0, durationSec),
        mode,
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [selectedExam, flatQuestions, answers, mode, timeRemaining, timeUsed],
  );

  const handleSubmit = useCallback(
    (auto = false) => {
      const r = computeResult(auto);
      if (!r) return;
      // 停止计时
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setResult(r);
      setView('result');

      // ===== 奖励 =====
      // XP：基础 80 + 每题正确 12；金币：每题正确 6；宝石：通过给 2，卓越给 5
      const xp = 80 + r.correctCount * 12;
      const coins = r.correctCount * 6;
      const gems = r.cambridgeScore >= FCE_GRADE_A ? 8 : r.passed ? 4 : 1;
      helperFunctions.addXP(xp);
      helperFunctions.addCoins(coins);
      helperFunctions.addGems(gems);
      helperFunctions.updateStreak();

      // 技能更新：基于各 section 正确率，正向/负向微调
      r.sectionResults.forEach((sr) => {
        const delta = Math.round((sr.correctRate - 0.5) * 8); // -4 ~ +4
        if (delta !== 0) {
          helperFunctions.updateSkill(sr.sectionType, delta);
        }
      });

      // 成就：满分
      if (r.correctCount === r.totalQuestions) {
        helperFunctions.unlockAchievement('ach-perfect-score');
      }
      // 模考完即可视为完成冲刺阶段任务（这里仅记成就/历史）

      // 写入历史
      const record: ExamRecord = {
        examId: r.examId,
        examTitle: r.examTitle,
        date: new Date().toISOString(),
        score: r.cambridgeScore,
        correctCount: r.correctCount,
        totalQuestions: r.totalQuestions,
        correctRate: Math.round(r.correctRate * 100),
        durationSec: r.durationSec,
        mode: r.mode,
      };
      const history = readExamHistory();
      history.push(record);
      writeExamHistory(history);

      // 写入错题本
      if (r.wrongQuestions.length > 0) {
        const existing = readMistakes();
        const newMistakes: MistakeRecord[] = r.wrongQuestions.map((w) => ({
          id: `${w.q.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          questionId: w.q.id,
          examId: r.examId,
          examTitle: r.examTitle,
          date: new Date().toISOString(),
          type: w.q.type,
          skill: w.q.skill,
          question: w.q.question,
          userAnswer: String(w.userAnswer ?? ''),
          correctAnswer: String(w.q.answer),
          explanation: w.q.explanation,
          sectionName: w.sectionName,
        }));
        writeMistakes([...existing, ...newMistakes]);
      }

      setRewardData({ xp, coins, gems });
      setRewardTrigger((t) => t + 1);
      setConfettiTrigger((t) => t + 1);
    },
    [computeResult, helperFunctions],
  );

  // ===== 退出 / 重置 =====
  const exitExam = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setView('list');
    setSelectedExam(null);
    setAnswers({});
    setCurrentIdx(0);
    setResult(null);
  };

  const retryExam = () => {
    if (selectedExam) {
      startExam(selectedExam, mode);
    }
  };

  // ===== 渲染：当前题目 =====
  const currentFq = flatQuestions[currentIdx];
  const answeredCount = Object.keys(answers).filter((k) => {
    const v = answers[k];
    return v !== undefined && v !== '';
  }).length;

  // ============= LIST VIEW =============
  if (view === 'list') {
    return (
      <div className="space-y-6">
        {/* 标题 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 via-purple-600 to-indigo-600 p-5 text-white shadow-lg sm:p-7"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 left-1/4 h-32 w-32 rounded-full bg-amber-300/20 blur-2xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <Trophy className="h-3.5 w-3.5" />
              FCE Mock Exam
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              FCE 考试中心
            </h1>
            <p className="mt-1.5 text-sm text-white/90 sm:text-base">
              全真模拟，检验你的实力
            </p>
          </div>
        </motion.section>

        {/* FCE 考试信息卡片 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-1 gap-4 lg:grid-cols-3"
        >
          {/* 考试结构 */}
          <div className="card p-5 lg:col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <FileText className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-dark-900">FCE 考试结构</h2>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {FCE_MODULES.map((m) => {
                const Icon = m.icon;
                return (
                  <div
                    key={m.nameEn}
                    className="flex items-center gap-3 rounded-xl border border-dark-100 bg-dark-50/40 p-3 transition-colors hover:bg-dark-50"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${m.color} text-white shadow-sm`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-dark-900">{m.name}</span>
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-dark-500">
                          <Clock className="h-3 w-3" />
                          {m.duration}min
                        </span>
                      </div>
                      <div className="mt-0.5 truncate text-[11px] text-dark-500">
                        {m.nameEn} · {m.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 评分 + 预测分 */}
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Award className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-dark-900">评分与预测</h2>
            </div>

            {/* 预测分 */}
            <div className="rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-dark-600">当前预测分</span>
                <span className="badge bg-white/70 text-primary-700">
                  基于能力值
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-primary-700">
                  {predictedScore}
                </span>
                <span className="text-xs text-dark-500">/ {CAMBRIDGE_MAX}</span>
              </div>
              <div className="mt-2">
                <ProgressBar
                  value={passProgress(predictedScore)}
                  height="h-2"
                  color={
                    predictedScore >= FCE_PASS
                      ? 'from-success-500 to-green-400'
                      : 'from-accent-400 to-rose-400'
                  }
                />
                <div className="mt-1 flex justify-between text-[10px] text-dark-400">
                  <span>{CAMBRIDGE_MIN}</span>
                  <span className="font-bold text-dark-600">通过 {FCE_PASS}</span>
                  <span>{CAMBRIDGE_MAX}</span>
                </div>
              </div>
              {bestScore > 0 && (
                <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-amber-600">
                  <Trophy className="h-3 w-3" />
                  历史最佳：{bestScore} 分
                </div>
              )}
            </div>

            {/* 评分体系 */}
            <div className="mt-3 space-y-1.5">
              {[
                { range: '180 - 190', label: 'Grade A 卓越', color: 'bg-rose-500' },
                { range: '173 - 179', label: 'Grade B 优秀', color: 'bg-purple-500' },
                { range: '160 - 172', label: 'Grade C 通过', color: 'bg-indigo-500' },
                { range: '140 - 159', label: 'Level B1', color: 'bg-slate-400' },
              ].map((g) => (
                <div
                  key={g.label}
                  className="flex items-center gap-2 rounded-lg bg-dark-50 px-2.5 py-1.5"
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${g.color}`} />
                  <span className="text-xs font-semibold text-dark-700">{g.label}</span>
                  <span className="ml-auto text-[11px] text-dark-400">{g.range}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 模考选择 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <ListChecks className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-dark-800">选择模考试卷</h2>
            </div>
            <span className="text-xs font-semibold text-dark-500">
              共 {mockExams.length} 套
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {mockExams.map((exam, idx) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.12 + idx * 0.06 }}
                className="card card-hover overflow-hidden p-5"
              >
                {/* 头部 */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 text-white shadow-md">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-dark-900 sm:text-base">
                        {exam.title}
                      </h3>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] font-medium text-dark-500">
                        <span className="inline-flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {exam.duration} 分钟
                        </span>
                        <span className="inline-flex items-center gap-0.5">
                          <Target className="h-3 w-3" />
                          {exam.totalQuestions} 题
                        </span>
                        <span className="inline-flex items-center gap-0.5">
                          <BookOpen className="h-3 w-3" />
                          {exam.sections.length} 模块
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 描述 */}
                <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-dark-600">
                  {exam.description}
                </p>

                {/* 模块标签 */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {exam.sections.map((s) => (
                    <span
                      key={s.id}
                      className="badge"
                      style={{
                        backgroundColor: `${getSkillHex(s.type)}15`,
                        color: getSkillHex(s.type),
                      }}
                    >
                      {getSkillIcon(s.type)} {s.name}
                    </span>
                  ))}
                </div>

                {/* 模式选择 + 开始按钮 */}
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex flex-1 gap-1.5">
                    <ModeButton
                      active={mode === 'timed'}
                      onClick={() => setMode('timed')}
                      icon={<Timer className="h-3.5 w-3.5" />}
                      label="严格计时"
                    />
                    <ModeButton
                      active={mode === 'free'}
                      onClick={() => setMode('free')}
                      icon={<Eye className="h-3.5 w-3.5" />}
                      label="自由练习"
                    />
                  </div>
                  <button
                    onClick={() => startExam(exam, mode)}
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    开始模考
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <p className="px-1 text-center text-xs text-dark-400">
          <AlertCircle className="mr-1 inline h-3.5 w-3.5" />
          模考成绩将纳入预测分与错题本，并奖励大量 XP 与金币
        </p>
      </div>
    );
  }

  // ============= EXAM VIEW =============
  if (view === 'exam' && selectedExam && currentFq) {
    const totalSeconds = mode === 'timed' ? selectedExam.duration * 60 : 0;
    const usedSeconds = mode === 'timed' ? totalSeconds - timeRemaining : timeUsed;
    const progressPct = (answeredCount / flatQuestions.length) * 100;
    const isLowTime = mode === 'timed' && timeRemaining <= 60;
    const currentQ = currentFq.q;
    const userAns = answers[currentQ.id];

    return (
      <div className="space-y-4">
        {/* 顶部状态栏 */}
        <div className="card sticky top-0 z-20 p-3 shadow-md sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={exitExam}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-dark-500 transition-colors hover:bg-dark-100 hover:text-dark-700"
            >
              <ChevronLeft className="h-4 w-4" />
              退出
            </button>

            <div className="min-w-0 flex-1 truncate text-center text-xs font-semibold text-dark-700 sm:text-sm">
              {selectedExam.title}
            </div>

            {/* 计时器 */}
            <div
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums transition-colors ${
                isLowTime
                  ? 'bg-rose-50 text-rose-600 animate-pulse'
                  : mode === 'timed'
                    ? 'bg-primary-50 text-primary-700'
                    : 'bg-cyan-50 text-cyan-700'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              {mode === 'timed' ? formatTime(timeRemaining) : formatTime(timeUsed)}
            </div>
          </div>

          {/* 进度条 */}
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-[11px] font-medium text-dark-500">
              {answeredCount} / {flatQuestions.length}
            </span>
            <div className="flex-1">
              <ProgressBar
                value={progressPct}
                height="h-1.5"
                color="from-primary-500 to-accent-500"
              />
            </div>
            <button
              onClick={() => handleSubmit(false)}
              className="rounded-lg bg-success-500 px-2.5 py-1 text-[11px] font-bold text-white transition-colors hover:bg-success-600"
            >
              提交
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {/* 题目导航面板 */}
          <aside className="card h-fit p-4 lg:col-span-1 lg:sticky lg:top-32">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-dark-700">题目导航</span>
              <span className="text-[11px] text-dark-400">
                {answeredCount} 已答
              </span>
            </div>

            {/* 按 section 分组 */}
            <div className="space-y-3">
              {selectedExam.sections.map((sec, sIdx) => {
                const secStart = selectedExam.sections
                  .slice(0, sIdx)
                  .reduce((acc, s) => acc + s.questions.length, 0);
                return (
                  <div key={sec.id}>
                    <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-dark-500">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: getSkillHex(sec.type) }}
                      />
                      {sec.name}
                      <span className="ml-auto text-dark-300">
                        {sec.questions.length} 题
                      </span>
                    </div>
                    <div className="grid grid-cols-6 gap-1.5 lg:grid-cols-5">
                      {sec.questions.map((q, i) => {
                        const globalIdx = secStart + i;
                        const isCurrent = globalIdx === currentIdx;
                        const isAnswered =
                          answers[q.id] !== undefined && answers[q.id] !== '';
                        return (
                          <button
                            key={q.id}
                            onClick={() => goToIdx(globalIdx)}
                            className={`aspect-square rounded-md text-[11px] font-bold transition-all ${
                              isCurrent
                                ? 'bg-primary-600 text-white shadow-sm ring-2 ring-primary-200'
                                : isAnswered
                                  ? 'bg-success-100 text-success-700 hover:bg-success-200'
                                  : 'bg-dark-100 text-dark-500 hover:bg-dark-200'
                            }`}
                            title={`第 ${globalIdx + 1} 题`}
                          >
                            {globalIdx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 图例 */}
            <div className="mt-3 flex items-center gap-3 border-t border-dark-100 pt-3 text-[10px] text-dark-500">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-success-100" /> 已答
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-dark-100" /> 未答
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-primary-600" /> 当前
              </span>
            </div>
          </aside>

          {/* 题目区 */}
          <main className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="card p-5 sm:p-6"
              >
                {/* 顶部标签 */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge bg-dark-100 text-dark-700">
                      第 {currentIdx + 1} / {flatQuestions.length} 题
                    </span>
                    <span className={`badge ${typeColors[currentQ.type]}`}>
                      {typeLabels[currentQ.type]}
                    </span>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: `${getSkillHex(currentQ.skill)}15`,
                        color: getSkillHex(currentQ.skill),
                      }}
                    >
                      {getSkillIcon(currentQ.skill)} {getSkillName(currentQ.skill)}
                    </span>
                    <span className="badge bg-dark-50 text-dark-500">
                      {currentFq.sectionName}
                    </span>
                  </div>
                </div>

                {/* 题目文本 */}
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-dark-800 sm:text-base">
                  {currentQ.question}
                </div>

                {/* 答题区 */}
                <div className="mt-5">
                  {currentQ.type === 'multiple-choice' && currentQ.options ? (
                    <div className="space-y-2.5">
                      {currentQ.options.map((opt, i) => {
                        const isSelected = userAns === i;
                        return (
                          <motion.button
                            key={i}
                            onClick={() => setAnswer(currentQ.id, i)}
                            whileTap={{ scale: 0.98 }}
                            className={`flex w-full items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-all ${
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
                              {String.fromCharCode(65 + i)}
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
                        value={typeof userAns === 'string' ? userAns : ''}
                        onChange={(e) => setAnswer(currentQ.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && currentIdx < flatQuestions.length - 1) {
                            goToIdx(currentIdx + 1);
                          }
                        }}
                        placeholder={
                          currentQ.type === 'open-cloze'
                            ? '填入一个单词...'
                            : currentQ.type === 'word-formation'
                              ? '填入变形后的单词...'
                              : '输入你的答案...'
                        }
                        autoFocus
                        className="input"
                      />
                      <p className="mt-2 text-[11px] text-dark-400">
                        {currentQ.type === 'open-cloze' &&
                          '提示：仅需填入一个空白处的单词，不区分大小写。'}
                        {currentQ.type === 'word-formation' &&
                          '提示：根据大写词根变形为合适的词性。'}
                        {currentQ.type === 'fill-blank' &&
                          '提示：填入完整答案，按 Enter 进入下一题。'}
                      </p>
                    </div>
                  )}
                </div>

                {/* 上一题 / 下一题 */}
                <div className="mt-6 flex items-center justify-between gap-3">
                  <button
                    onClick={() => goToIdx(currentIdx - 1)}
                    disabled={currentIdx === 0}
                    className="btn-ghost disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    上一题
                  </button>

                  <div className="flex-1 text-center text-[11px] text-dark-400">
                    {currentIdx === flatQuestions.length - 1
                      ? '已到最后一题，确认后点击「提交」'
                      : userAns !== undefined && userAns !== ''
                        ? '已作答，可继续下一题'
                        : '未作答'}
                  </div>

                  {currentIdx < flatQuestions.length - 1 ? (
                    <button
                      onClick={() => goToIdx(currentIdx + 1)}
                      className="btn-primary"
                    >
                      下一题
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubmit(false)}
                      className="btn-success"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      提交试卷
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    );
  }

  // ============= RESULT VIEW =============
  if (view === 'result' && result) {
    return (
      <>
        <Confetti trigger={confettiTrigger} duration={3200} count={120} />
        <RewardPopup
          trigger={rewardTrigger}
          xp={rewardData.xp}
          coins={rewardData.coins}
          gems={rewardData.gems}
          title={result.passed ? '模考通过！' : '模考完成！'}
          duration={3200}
        />

        <div className="space-y-5">
          {/* 顶部成绩卡 */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${result.grade.color} p-6 text-white shadow-xl sm:p-8`}
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 left-1/3 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

            <div className="relative">
              <button
                onClick={exitExam}
                className="mb-4 inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm transition-colors hover:bg-white/25"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                返回考试中心
              </button>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    <Trophy className="h-3.5 w-3.5" />
                    成绩报告
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold tracking-tight sm:text-6xl">
                      {result.cambridgeScore}
                    </span>
                    <span className="text-base font-semibold text-white/80">
                      / {CAMBRIDGE_MAX}
                    </span>
                  </div>
                  <div className="mt-1 text-base font-bold sm:text-lg">
                    {result.grade.label}
                  </div>
                  <div className="mt-1 text-xs text-white/80">
                    {result.examTitle}
                  </div>
                </div>

                {/* 通过状态 */}
                <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
                  {result.passed ? (
                    <>
                      <motion.div
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 220, delay: 0.2 }}
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-white/25"
                      >
                        <CheckCircle2 className="h-8 w-8" />
                      </motion.div>
                      <div className="text-sm font-bold">已通过 FCE</div>
                      <div className="text-[11px] text-white/85">
                        超过通过线 {Math.abs(result.gapToPass)} 分
                      </div>
                    </>
                  ) : (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 220, delay: 0.2 }}
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-white/25"
                      >
                        <Target className="h-8 w-8" />
                      </motion.div>
                      <div className="text-sm font-bold">未通过</div>
                      <div className="text-[11px] text-white/85">
                        距通过线差 {-result.gapToPass} 分
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 量表条 */}
              <div className="mt-5">
                <div className="relative">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
                    <motion.div
                      className="h-full rounded-full bg-white shadow-sm"
                      initial={{ width: 0 }}
                      animate={{ width: `${passProgress(result.cambridgeScore)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                  {/* 通过线标记 */}
                  <div
                    className="absolute -top-1 h-4.5 w-0.5 bg-white"
                    style={{ left: `${passProgress(FCE_PASS)}%` }}
                  />
                  <div
                    className="absolute -top-1 h-4.5 w-0.5 bg-white/60"
                    style={{ left: `${passProgress(FCE_GRADE_B)}%` }}
                  />
                  <div
                    className="absolute -top-1 h-4.5 w-0.5 bg-white/40"
                    style={{ left: `${passProgress(FCE_GRADE_A)}%` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[10px] text-white/80">
                  <span>{CAMBRIDGE_MIN}</span>
                  <span>C {FCE_PASS}</span>
                  <span>B {FCE_GRADE_B}</span>
                  <span>A {FCE_GRADE_A}</span>
                  <span>{CAMBRIDGE_MAX}</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* 数据概览 */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            <StatTile
              icon={<CheckCircle2 className="h-5 w-5" />}
              label="正确题数"
              value={`${result.correctCount} / ${result.totalQuestions}`}
              color="bg-success-50 text-success-600"
            />
            <StatTile
              icon={<Target className="h-5 w-5" />}
              label="正确率"
              value={`${Math.round(result.correctRate * 100)}%`}
              color="bg-primary-50 text-primary-600"
            />
            <StatTile
              icon={<Clock className="h-5 w-5" />}
              label="用时"
              value={formatTime(result.durationSec)}
              color="bg-cyan-50 text-cyan-600"
            />
            <StatTile
              icon={<Award className="h-5 w-5" />}
              label="剑桥量表"
              value={`${result.cambridgeScore}`}
              color="bg-purple-50 text-purple-600"
            />
          </motion.section>

          {/* 模块得分 + 强弱项 */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="card p-5"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <FileText className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-dark-900">各模块得分</h2>
              </div>
              <div className="space-y-3.5">
                {result.sectionResults.map((sr) => {
                  const passed = sr.cambridgeScore >= FCE_PASS;
                  return (
                    <div key={sr.sectionId}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 font-medium text-dark-700">
                          <span>{getSkillIcon(sr.sectionType)}</span>
                          {sr.sectionName}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-dark-500">
                            {sr.correct} / {sr.total} · {Math.round(sr.correctRate * 100)}%
                          </span>
                          <span
                            className={`text-sm font-extrabold ${
                              passed ? 'text-success-600' : 'text-accent-600'
                            }`}
                          >
                            {sr.cambridgeScore}
                          </span>
                        </span>
                      </div>
                      <ProgressBar
                        value={sr.correctRate * 100}
                        height="h-2"
                        color={
                          passed
                            ? 'from-success-500 to-green-400'
                            : 'from-accent-400 to-rose-400'
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="card p-5"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-dark-900">优势 / 薄弱项分析</h2>
              </div>

              {/* 优势 */}
              <div className="rounded-xl bg-success-50/60 p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-success-700">
                  <TrendingUp className="h-3.5 w-3.5" />
                  优势项
                </div>
                {result.strongSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {result.strongSkills.map((s) => (
                      <span
                        key={s}
                        className="badge bg-success-100 text-success-700"
                      >
                        {getSkillIcon(s)} {getSkillName(s)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-dark-500">
                    暂无明显优势项，继续努力！
                  </p>
                )}
              </div>

              {/* 薄弱 */}
              <div className="mt-2.5 rounded-xl bg-accent-50/60 p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-accent-700">
                  <TrendingDown className="h-3.5 w-3.5" />
                  薄弱项
                </div>
                {result.weakSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {result.weakSkills.map((s) => (
                      <span
                        key={s}
                        className="badge bg-accent-100 text-accent-700"
                      >
                        {getSkillIcon(s)} {getSkillName(s)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-dark-500">
                    无明显薄弱项，表现均衡！
                  </p>
                )}
              </div>

              {/* 通过线差距 */}
              <div className="mt-3 rounded-xl bg-primary-50 p-3">
                <div className="text-xs text-dark-600">
                  距 FCE 通过线（{FCE_PASS}）
                </div>
                <div className="mt-0.5 text-2xl font-extrabold text-primary-700">
                  {result.gapToPass >= 0
                    ? `+${result.gapToPass}`
                    : result.gapToPass}
                  <span className="ml-1 text-sm font-medium text-dark-500">分</span>
                </div>
              </div>
            </motion.section>
          </div>

          {/* 错题回顾 */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="card p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <XCircle className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-dark-900">错题回顾</h2>
              </div>
              <span className="badge bg-rose-50 text-rose-600">
                {result.wrongQuestions.length} 题错
              </span>
            </div>

            {result.wrongQuestions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-success-100"
                >
                  <CheckCircle2 className="h-8 w-8 text-success-600" />
                </motion.div>
                <div className="text-sm font-bold text-dark-800">满分通过！</div>
                <div className="text-xs text-dark-500">
                  全部答对，已解锁「满分荣耀」成就
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {result.wrongQuestions.map((w, i) => (
                  <motion.div
                    key={`${w.q.id}-${i}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.3 + i * 0.04 }}
                    className="rounded-xl border border-rose-100 bg-rose-50/40 p-3.5"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="badge bg-rose-100 text-rose-700">
                        错 #{i + 1}
                      </span>
                      <span className={`badge ${typeColors[w.q.type]}`}>
                        {typeLabels[w.q.type]}
                      </span>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: `${getSkillHex(w.q.skill)}15`,
                          color: getSkillHex(w.q.skill),
                        }}
                      >
                        {getSkillIcon(w.q.skill)} {getSkillName(w.q.skill)}
                      </span>
                      <span className="badge bg-dark-100 text-dark-600">
                        {w.sectionName}
                      </span>
                    </div>

                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-dark-800">
                      {w.q.question}
                    </div>

                    {/* 答案对比 */}
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="rounded-lg bg-rose-100/70 px-3 py-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                          你的答案
                        </div>
                        <div className="mt-0.5 text-sm font-semibold text-dark-800">
                          {w.userAnswer === undefined || w.userAnswer === ''
                            ? '（未作答）'
                            : w.q.type === 'multiple-choice' && w.q.options
                              ? `${String.fromCharCode(65 + Number(w.userAnswer))}. ${w.q.options[Number(w.userAnswer)] ?? ''}`
                              : String(w.userAnswer)}
                        </div>
                      </div>
                      <div className="rounded-lg bg-success-100/70 px-3 py-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-success-600">
                          正确答案
                        </div>
                        <div className="mt-0.5 text-sm font-semibold text-dark-800">
                          {w.q.type === 'multiple-choice' && w.q.options
                            ? `${String.fromCharCode(65 + Number(w.q.answer))}. ${w.q.options[Number(w.q.answer)] ?? ''}`
                            : String(w.q.answer)}
                        </div>
                      </div>
                    </div>

                    {/* 解析 */}
                    <div className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-xs leading-relaxed text-dark-600">
                      <span className="font-bold text-primary-600">解析：</span>
                      {w.q.explanation}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>

          {/* 奖励 + 操作按钮 */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="card overflow-hidden p-5"
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <GiftIcon />
              </div>
              <h2 className="text-base font-bold text-dark-900">本次奖励</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <RewardTile
                icon={<Zap className="h-5 w-5" />}
                label="XP 经验"
                value={`+${rewardData.xp}`}
                color="bg-primary-50 text-primary-600"
              />
              <RewardTile
                icon={<Coins className="h-5 w-5" />}
                label="金币"
                value={`+${rewardData.coins}`}
                color="bg-amber-50 text-amber-600"
              />
              <RewardTile
                icon={<Sparkles className="h-5 w-5" />}
                label="宝石"
                value={`+${rewardData.gems}`}
                color="bg-cyan-50 text-cyan-600"
              />
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button onClick={retryExam} className="btn-primary flex-1">
                <RotateCcw className="h-4 w-4" />
                再练一次
              </button>
              <button onClick={exitExam} className="btn-ghost flex-1">
                <ChevronLeft className="h-4 w-4" />
                返回考试中心
              </button>
            </div>
          </motion.section>
        </div>
      </>
    );
  }

  // 兜底
  return null;
};

// ===== 子组件 =====

const ModeButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition-all ${
      active
        ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-200'
        : 'bg-dark-50 text-dark-500 hover:bg-dark-100'
    }`}
  >
    {icon}
    {label}
  </button>
);

const StatTile: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}> = ({ icon, label, value, color }) => (
  <div className="card p-4">
    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
      {icon}
    </div>
    <div className="mt-2.5 text-xl font-extrabold text-dark-900 sm:text-2xl">
      {value}
    </div>
    <div className="text-xs font-medium text-dark-500">{label}</div>
  </div>
);

const RewardTile: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}> = ({ icon, label, value, color }) => (
  <div className="rounded-xl bg-dark-50/60 p-3 text-center">
    <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${color}`}>
      {icon}
    </div>
    <div className="mt-1.5 text-lg font-extrabold text-dark-900">{value}</div>
    <div className="text-[11px] text-dark-500">{label}</div>
  </div>
);

const GiftIcon: React.FC = () => (
  <span className="text-base">🎁</span>
);

export default ExamCenter;
