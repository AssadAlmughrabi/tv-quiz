import { platform } from 'core/platform/platform';
import { cacheService } from 'core/services/cache.service';
import * as mockApi from 'core/services/mock-api.service';
import {
  createScoreQueue,
  ScoreQueue,
  SubmitResult,
} from 'core/services/score-queue.service';
import * as triviaApi from 'core/services/trivia-api.service';
import { Category } from 'types/category.interface';
import { Language } from 'types/language.interface';
import { Question } from 'types/question.interface';
import { Quiz } from 'types/quiz.interface';
import { LeaderboardEntry, PendingScore } from 'types/score.interface';

let scoreQueue: ScoreQueue | null = null;

/** Created on first use, so importing this file does not touch platform storage. */
function getScoreQueue(): ScoreQueue {
  if (!scoreQueue) {
    scoreQueue = createScoreQueue({
      storage: platform.storage,
      submit: mockApi.submitScore,
    });
  }
  return scoreQueue;
}

const cacheKeys = {
  categories: (lang: Language) => `categories:${lang}`,
  quizzes: (categoryId: string, lang: Language) =>
    `quizzes:${categoryId}:${lang}`,
  daily: (lang: Language) => `daily:${lang}`,
};

interface CachedDaily {
  /** UTC day (YYYY-MM-DD) the quiz was the daily quiz. */
  day: string;
  quiz: Quiz;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Loads fresh data and keeps a copy, so the next visit can show it instantly. */
async function loadAndCache<T>(
  key: string,
  load: () => Promise<T>,
): Promise<T> {
  const data = await load();
  cacheService.set(key, data);
  return data;
}

/**
 * The only data entry point for screens. Screens never call the Trivia API or the
 * mock directly, so either source can be replaced without touching a screen.
 */
export const quizService = {
  /** Category list from the Trivia API, with local names, artwork and the empty category added. */
  getCategories(lang: Language): Promise<Category[]> {
    return loadAndCache(cacheKeys.categories(lang), async () => {
      const apiCategories = await triviaApi.getCategories();
      return [
        ...apiCategories.map(c =>
          mockApi.toCategory(c.id, c.englishName, lang),
        ),
        mockApi.emptyCategory(lang),
      ];
    });
  },

  /** Last loaded categories, or undefined. Instant, for the first frame. */
  peekCategories(lang: Language): Category[] | undefined {
    return cacheService.peek(cacheKeys.categories(lang));
  },

  getQuizzes(categoryId: string, lang: Language): Promise<Quiz[]> {
    return loadAndCache(cacheKeys.quizzes(categoryId, lang), () =>
      mockApi.getQuizzes(categoryId, lang),
    );
  },

  peekQuizzes(categoryId: string, lang: Language): Quiz[] | undefined {
    return cacheService.peek(cacheKeys.quizzes(categoryId, lang));
  },

  getQuiz(quizId: string, lang: Language): Promise<Quiz> {
    return mockApi.getQuiz(quizId, lang);
  },

  async getDailyQuiz(lang: Language): Promise<Quiz> {
    const quiz = await mockApi.getDailyQuiz(lang);
    cacheService.set<CachedDaily>(cacheKeys.daily(lang), {
      day: today(),
      quiz,
    });
    return quiz;
  },

  /** Cached daily quiz, only if it is still today's. */
  peekDailyQuiz(lang: Language): Quiz | undefined {
    const cached = cacheService.peek<CachedDaily>(cacheKeys.daily(lang));
    return cached?.day === today() ? cached.quiz : undefined;
  },

  /** Questions from the Trivia API, with images from the mock attached. */
  async getQuestions(quiz: Quiz, signal?: AbortSignal): Promise<Question[]> {
    const questions = await triviaApi.getQuestions({
      category: quiz.categoryId,
      difficulty: quiz.difficulty,
      count: quiz.questionCount,
      signal,
    });
    return questions.map((question, index) => ({
      ...question,
      imageUrl: mockApi.getQuestionImage(quiz.id, index),
    }));
  },

  /** Sends the score, or keeps it to send later when there is no connection. */
  submitScore(pending: PendingScore): Promise<SubmitResult> {
    return getScoreQueue().submitOrQueue(pending);
  },

  /** Sends scores that are still waiting. Called at startup and when the connection returns. */
  flushPendingScores(): Promise<unknown> {
    return getScoreQueue().flush();
  },

  getLeaderboard(
    quizId: string,
    nickname: string,
  ): Promise<LeaderboardEntry[]> {
    return mockApi.getLeaderboard(quizId, nickname);
  },
};
