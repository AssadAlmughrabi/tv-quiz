import { Language } from 'types/language.interface';

export interface AnswerRecord {
  questionId: string;
  /** null when the timer ran out. */
  choiceId: string | null;
  isCorrect: boolean;
  timeMs: number;
}

/** One row of the review list: the answer plus the texts, so the result needs no reload. */
export interface ReviewItem extends AnswerRecord {
  questionText: string;
  /** null when the timer ran out. */
  givenText: string | null;
  correctText: string;
  /** API text keeps its own direction inside the Arabic layout. */
  contentLanguage: Language;
}

export interface QuizResult {
  quizId: string;
  quizTitle: string;
  score: number;
  correctCount: number;
  total: number;
  review: ReviewItem[];
  /** ISO date string. */
  finishedAt: string;
}

export interface PendingScore {
  /** Idempotency key: a resend with the same id is ignored. */
  id: string;
  quizId: string;
  nickname: string;
  score: number;
  /** ISO date string. */
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  score: number;
  /** ISO date string. */
  date: string;
  isPlayer: boolean;
}
