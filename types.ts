
export type PracticeLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topics: string[];
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  level: PracticeLevel;
  date: string; // Stored as ISO string
}

export interface SavedStudyGuide {
  topic: string;
  content: string;
}

export interface VideoExplanation {
  videoId: string;
  title: string;
  description: string;
}

export type StudyProgress = Record<string, string[]>;

export interface Reminder {
  id: string;
  topic: string;
  time: string; // "HH:MM" format
  frequency: 'once' | 'daily' | 'weekly';
}

export type Theme = 'light' | 'dark' | 'system';

export type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};
