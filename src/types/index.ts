// ===== 用户与游戏化系统类型 =====

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B1+' | 'B2' | 'B2+' | 'C1';

export type SkillType = 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'writing' | 'speaking';

export type MembershipTier = 'free' | 'premium' | 'sprint';

export interface UserState {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  coins: number;
  gems: number;
  streak: number;
  lastStudyDate: string | null;
  membership: MembershipTier;
  examDate: string | null;
  dailyGoalMinutes: number;
  totalStudyTime: number;
  totalTasksCompleted: number;
  skills: Record<SkillType, number>;
  cefrLevel: CEFRLevel | null;
  assessmentCompleted: boolean;
  studyPlanPhase: number;
  rankTier: string;
  rankPoints: number;
  inventory: GameItem[];
  achievements: string[];
  unlockedThemes: string[];
  studyCalendar: Record<string, boolean>;
  shieldCount: number;
}

export interface GameItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  price: number;
  currency: 'coins' | 'gems';
}

// ===== 学习内容类型 =====

export interface VocabularyWord {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
  synonyms?: string[];
  theme: string;
  difficulty: number;
}

export interface VocabularyTheme {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  color: string;
  words: VocabularyWord[];
  unlocked: boolean;
}

export interface GrammarTopic {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  description: string;
  rule: string;
  examples: { sentence: string; translation: string }[];
  exercises: GrammarExercise[];
  difficulty: number;
  completed: boolean;
}

export interface GrammarExercise {
  id: string;
  type: 'fill-blank' | 'error-correction' | 'transformation' | 'multiple-choice';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface ReadingPassage {
  id: string;
  title: string;
  titleEn: string;
  category: string;
  level: CEFRLevel;
  wordCount: number;
  content: string;
  vocabulary: { word: string; meaning: string }[];
  questions: ReadingQuestion[];
  estimatedTime: number;
  unlocked: boolean;
}

export interface ReadingQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'heading-match' | 'true-false';
  question: string;
  options?: string[];
  answer: string | number;
  explanation: string;
}

export interface ListeningMaterial {
  id: string;
  title: string;
  titleEn: string;
  type: 'dialogue' | 'monologue' | 'broadcast' | 'interview';
  level: CEFRLevel;
  duration: number;
  transcript: string;
  audioUrl?: string;
  questions: ListeningQuestion[];
  unlocked: boolean;
}

export interface ListeningQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'matching';
  question: string;
  options?: string[];
  answer: string | number;
  explanation: string;
}

// ===== 模考类型 =====

export interface MockExam {
  id: string;
  title: string;
  description: string;
  duration: number;
  sections: MockExamSection[];
  totalQuestions: number;
}

export interface MockExamSection {
  id: string;
  name: string;
  type: SkillType;
  duration: number;
  questions: ExamQuestion[];
}

export interface ExamQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'word-formation' | 'open-cloze';
  question: string;
  options?: string[];
  answer: string | number;
  explanation: string;
  skill: SkillType;
}

// ===== 测评类型 =====

export interface AssessmentQuestion {
  id: string;
  skill: SkillType;
  difficulty: number;
  type: 'multiple-choice' | 'fill-blank';
  question: string;
  options?: string[];
  answer: string | number;
}

// ===== 学习计划类型 =====

export interface StudyPlan {
  phase: number;
  name: string;
  nameEn: string;
  description: string;
  duration: string;
  progress: number;
  milestones: StudyMilestone[];
  dailyTasks: DailyTask[];
}

export interface StudyMilestone {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  target: string;
}

export interface DailyTask {
  id: string;
  module: SkillType;
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  estimatedMinutes: number;
  completed: boolean;
  icon: string;
}

// ===== 排行榜类型 =====

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
  rankTier: string;
  isCurrentUser?: boolean;
}

// ===== 成就类型 =====

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'persistence' | 'skill' | 'challenge' | 'collection';
  requirement: string;
  reward: { coins?: number; gems?: number; xp?: number };
  unlocked: boolean;
}

// ===== 宝箱类型 =====

export interface TreasureChest {
  id: string;
  type: 'small' | 'medium' | 'large' | 'legendary';
  name: string;
  icon: string;
  description: string;
  rewards: {
    coinsMin: number;
    coinsMax: number;
    gemsMin: number;
    gemsMax: number;
    items?: string[];
  };
  opened: boolean;
}
