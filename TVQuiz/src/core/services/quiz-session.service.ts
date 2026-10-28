import { FEEDBACK_MS } from 'core/constants/timing.const';
import { pointsFor } from 'core/utils/scoring.utils';
import { Question } from 'types/question.interface';
import { Quiz } from 'types/quiz.interface';
import { AnswerRecord, QuizResult, ReviewItem } from 'types/score.interface';

/**
 * The quiz rules, as pure functions: (state, now) -> new state. No React and no timers inside,
 * so the screen decides when to call them and tests can pass any "now".
 *
 *   answering --answer()--> feedback --tick() after FEEDBACK_MS--> answering (next) / finished
 *       \--tick() when time is up --/
 *   pause() / resume() freeze and unfreeze the current phase.
 */
export type QuizPhase = 'answering' | 'feedback' | 'finished';

export interface QuizSession {
  questions: Question[];
  index: number;
  phase: QuizPhase;
  /** Time allowed per question. */
  limitMs: number;
  /** When the current phase ends (question timer or feedback), as a timestamp. */
  deadline: number;
  /** When the current question was shown, for answer times. */
  questionStartedAt: number;
  /** Time left in the current phase while paused; null when running. */
  pausedRemainingMs: number | null;
  answers: AnswerRecord[];
  score: number;
}

export function startSession(
  questions: Question[],
  secondsPerQuestion: number,
  now: number,
): QuizSession {
  const limitMs = secondsPerQuestion * 1000;
  return {
    questions,
    index: 0,
    phase: questions.length > 0 ? 'answering' : 'finished',
    limitMs,
    deadline: now + limitMs,
    questionStartedAt: now,
    pausedRemainingMs: null,
    answers: [],
    score: 0,
  };
}

export const isPaused = (session: QuizSession) =>
  session.pausedRemainingMs !== null;

export function currentQuestion(session: QuizSession): Question | undefined {
  return session.questions[session.index];
}

/** Time left in the current phase; frozen while paused. */
export function remainingMs(session: QuizSession, now: number): number {
  if (session.pausedRemainingMs !== null) {
    return session.pausedRemainingMs;
  }
  return Math.max(0, session.deadline - now);
}

/** The answer given for the current question, once in feedback. */
export function currentAnswer(session: QuizSession): AnswerRecord | undefined {
  return session.phase === 'feedback'
    ? session.answers[session.index]
    : undefined;
}

/**
 * Records an answer. Only allowed while answering and not paused, so a second Enter
 * (held or double-pressed) does nothing.
 */
export function answer(
  session: QuizSession,
  choiceId: string,
  now: number,
): QuizSession {
  if (session.phase !== 'answering' || isPaused(session)) {
    return session;
  }
  return record(session, choiceId, now);
}

/** Moves time forward: ends the question when time is up, and leaves feedback when it is over. */
export function tick(session: QuizSession, now: number): QuizSession {
  if (
    isPaused(session) ||
    session.phase === 'finished' ||
    now < session.deadline
  ) {
    return session;
  }
  if (session.phase === 'answering') {
    // Time is up: counts as no answer.
    return record(session, null, now);
  }
  return nextQuestion(session, now);
}

export function pause(session: QuizSession, now: number): QuizSession {
  if (isPaused(session) || session.phase === 'finished') {
    return session;
  }
  return { ...session, pausedRemainingMs: remainingMs(session, now) };
}

export function resume(session: QuizSession, now: number): QuizSession {
  if (session.pausedRemainingMs === null) {
    return session;
  }
  // pause() kept deadline as it was, so the pause started at deadline - remaining.
  const pausedAt = session.deadline - session.pausedRemainingMs;
  // Shift both clocks by the pause length, so neither the timer nor the answer time counts it.
  const shift = now - pausedAt;
  return {
    ...session,
    deadline: now + session.pausedRemainingMs,
    questionStartedAt: session.questionStartedAt + shift,
    pausedRemainingMs: null,
  };
}

export function toResult(
  session: QuizSession,
  quiz: Pick<Quiz, 'id' | 'title'>,
  now: number,
): QuizResult {
  return {
    quizId: quiz.id,
    quizTitle: quiz.title,
    score: session.score,
    correctCount: session.answers.filter(a => a.isCorrect).length,
    total: session.questions.length,
    review: session.answers.map((a, i) => toReviewItem(a, session.questions[i])),
    finishedAt: new Date(now).toISOString(),
  };
}

/** Answers are recorded in question order, so answer i belongs to question i. */
function toReviewItem(given: AnswerRecord, question: Question): ReviewItem {
  const textOf = (choiceId: string | null) =>
    question.choices.find(c => c.id === choiceId)?.text ?? null;
  return {
    ...given,
    questionText: question.text,
    givenText: textOf(given.choiceId),
    correctText: textOf(question.correctChoiceId) ?? '',
    contentLanguage: question.contentLanguage,
  };
}

function record(
  session: QuizSession,
  choiceId: string | null,
  now: number,
): QuizSession {
  const question = session.questions[session.index];
  const timeMs = Math.min(session.limitMs, now - session.questionStartedAt);
  const isCorrect = choiceId !== null && choiceId === question.correctChoiceId;
  return {
    ...session,
    phase: 'feedback',
    deadline: now + FEEDBACK_MS,
    answers: [
      ...session.answers,
      { questionId: question.id, choiceId, isCorrect, timeMs },
    ],
    score: session.score + pointsFor(isCorrect),
  };
}

function nextQuestion(session: QuizSession, now: number): QuizSession {
  const index = session.index + 1;
  if (index >= session.questions.length) {
    return { ...session, phase: 'finished' };
  }
  return {
    ...session,
    index,
    phase: 'answering',
    deadline: now + session.limitMs,
    questionStartedAt: now,
  };
}
