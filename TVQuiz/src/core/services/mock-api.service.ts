import { translations } from 'assets/i18n';
import {
  ARTWORK_SIZES,
  BROKEN_IMAGE_QUESTION,
  BROKEN_IMAGE_URL,
  CATEGORY_SHAPES,
  DEFAULT_CATEGORY_SHAPE,
  EMPTY_CATEGORY,
  IMAGE_EVERY_NTH_QUESTION,
  MARATHON,
  MOCK_LATENCY_MS,
  QUESTIONS_PER_QUIZ,
  SECONDS_PER_QUESTION,
  SEED_PLAYERS,
} from 'core/constants/mock-data.const';
import { applyFault } from 'core/interceptors/fault-injector.interceptor';
import { platform } from 'core/platform/platform';
import { ApiError } from 'core/services/api.service';
import { delay } from 'core/utils/delay.utils';
import { Artwork, ArtworkShape, Category } from 'types/category.interface';
import { Language } from 'types/language.interface';
import { Difficulty, Quiz } from 'types/quiz.interface';
import { LeaderboardEntry, PendingScore } from 'types/score.interface';

const LEADERBOARD_SIZE = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

interface StoredScore {
  id: string;
  quizId: string;
  nickname: string;
  score: number;
  date: string;
}

/** Scores submitted while the app runs. In memory until platform storage exists. */
const submittedScores: StoredScore[] = [];

/**
 * Turns a category from the Trivia API into our model: translated name (English from the
 * API when there is no translation yet) and local artwork.
 */
export function toCategory(
  id: string,
  englishName: string,
  lang: Language,
): Category {
  apiNames.set(id, englishName);
  return {
    id,
    name: categoryName(id, lang),
    artwork: buildArtwork(id, shapeOf(id)),
  };
}

/** Local category with no quizzes, added after the API's list to show the empty state. */
export function emptyCategory(lang: Language): Category {
  return toCategory(EMPTY_CATEGORY.id, 'Coming Soon', lang);
}

export async function getQuizzes(
  categoryId: string,
  lang: Language,
): Promise<Quiz[]> {
  await simulateNetwork();
  return buildQuizzes(categoryId, lang);
}

/** One quiz by id, e.g. for a deep link. */
export async function getQuiz(quizId: string, lang: Language): Promise<Quiz> {
  await simulateNetwork();
  // Quiz ids are "<categoryId>-<level>", so any category's quizzes can be rebuilt from the id.
  const categoryId = quizId.slice(0, quizId.lastIndexOf('-'));
  const quiz = buildQuizzes(categoryId, lang).find(q => q.id === quizId);
  if (!quiz) {
    throw new ApiError('http', `Quiz ${quizId} not found`, 404);
  }
  return quiz;
}

/** Same quiz for everyone all day; changes at midnight UTC. */
export async function getDailyQuiz(lang: Language): Promise<Quiz> {
  await simulateNetwork();
  const quizzes = allQuizzes(lang).filter(q => q.difficulty !== 'mixed');
  const dayNumber = Math.floor(Date.now() / DAY_MS);
  return { ...quizzes[dayNumber % quizzes.length], isDaily: true };
}

/** Image for one question, or undefined for a text-only question. */
export function getQuestionImage(
  quizId: string,
  index: number,
): string | undefined {
  if (
    quizId === BROKEN_IMAGE_QUESTION.quizId &&
    index === BROKEN_IMAGE_QUESTION.index
  ) {
    return BROKEN_IMAGE_URL;
  }
  if (index % IMAGE_EVERY_NTH_QUESTION === IMAGE_EVERY_NTH_QUESTION - 1) {
    return `https://picsum.photos/seed/${quizId}-${index}/1280/720`;
  }
  return undefined;
}

/** Saves a score once. Sending the same id again does not add a second entry. */
export async function submitScore(
  pending: PendingScore,
): Promise<{ rank: number }> {
  await simulateNetwork();
  if (!submittedScores.some(s => s.id === pending.id)) {
    submittedScores.push({
      id: pending.id,
      quizId: pending.quizId,
      nickname: pending.nickname,
      score: pending.score,
      date: pending.createdAt,
    });
  }
  const rank =
    sortedScores(pending.quizId).findIndex(s => s.id === pending.id) + 1;
  return { rank };
}

/** Top scores, plus the player's best row even when it is outside the top. */
export async function getLeaderboard(
  quizId: string,
  nickname: string,
): Promise<LeaderboardEntry[]> {
  await simulateNetwork();
  const ranked = sortedScores(quizId).map((s, i) => ({
    rank: i + 1,
    nickname: s.nickname,
    score: s.score,
    date: s.date,
    isPlayer: false,
  }));

  // Sorted best first, so the first match is the player's best score.
  const player = ranked.find(entry => entry.nickname === nickname);
  if (player) {
    player.isPlayer = true;
  }

  const top = ranked.slice(0, LEADERBOARD_SIZE);
  if (player && player.rank > LEADERBOARD_SIZE) {
    top.push(player);
  }
  return top;
}

/** Fake network: normal latency, then any fault set in the fault injector. */
/** Behaves like a real server call: fails when the device has no connection. */
async function simulateNetwork(): Promise<void> {
  await delay(MOCK_LATENCY_MS);
  if (!(await platform.isOnline())) {
    throw new ApiError('network', 'No connection');
  }
  await applyFault();
}

function shapeOf(categoryId: string): ArtworkShape {
  if (categoryId === EMPTY_CATEGORY.id) {
    return EMPTY_CATEGORY.shape;
  }
  return CATEGORY_SHAPES[categoryId] ?? DEFAULT_CATEGORY_SHAPE;
}

/** English names the API gave, for categories that have no translation yet. */
const apiNames = new Map<string, string>();

/** Translated name; falls back to the API's English name (or the id) for a category with no translation. */
function categoryName(categoryId: string, lang: Language): string {
  const names: Record<string, string> = translations[lang].categories;
  return (
    names[categoryId] ??
    apiNames.get(categoryId) ??
    categoryId.replace(/_/g, ' ')
  );
}

/** Quizzes are generated for any category the API sends, except the local empty one. */
function buildQuizzes(categoryId: string, lang: Language): Quiz[] {
  if (categoryId === EMPTY_CATEGORY.id) {
    return [];
  }
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
  const quizzes = difficulties.map(difficulty =>
    buildQuiz(
      categoryId,
      difficulty,
      QUESTIONS_PER_QUIZ,
      SECONDS_PER_QUESTION,
      lang,
    ),
  );
  if (categoryId === MARATHON.categoryId) {
    quizzes.push(
      buildQuiz(
        categoryId,
        'mixed',
        MARATHON.questionCount,
        MARATHON.secondsPerQuestion,
        lang,
      ),
    );
  }
  return quizzes;
}

function buildQuiz(
  categoryId: string,
  difficulty: Difficulty,
  questionCount: number,
  secondsPerQuestion: number,
  lang: Language,
): Quiz {
  const suffix = difficulty === 'mixed' ? 'marathon' : difficulty;
  return {
    id: `${categoryId}-${suffix}`,
    categoryId,
    title: `${categoryName(categoryId, lang)} – ${
      translations[lang].difficulty[difficulty]
    }`,
    difficulty,
    questionCount,
    secondsPerQuestion,
    artwork: buildArtwork(
      `${categoryId}-${suffix}`,
      quizShape(categoryId, difficulty),
    ),
  };
}

const SHAPES: ArtworkShape[] = ['wide', 'square', 'tall'];
const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard', 'mixed'];

/** Different shapes inside one row, to show that cards of any shape line up. */
function quizShape(categoryId: string, difficulty: Difficulty): ArtworkShape {
  const start = SHAPES.indexOf(shapeOf(categoryId));
  return SHAPES[(start + DIFFICULTY_ORDER.indexOf(difficulty)) % SHAPES.length];
}

/** The daily quiz is picked from the categories the mock knows. */
function allQuizzes(lang: Language): Quiz[] {
  return Object.keys(CATEGORY_SHAPES).flatMap(categoryId =>
    buildQuizzes(categoryId, lang),
  );
}

function buildArtwork(seed: string, shape: ArtworkShape): Artwork {
  const { width, height } = ARTWORK_SIZES[shape];
  return {
    url: `https://picsum.photos/seed/${seed}/${width}/${height}`,
    shape,
  };
}

/** Seed players plus submitted scores for one quiz, best first. */
function sortedScores(quizId: string): StoredScore[] {
  const seeds = SEED_PLAYERS.map((player, i) => ({
    id: `seed-${i}`,
    quizId,
    nickname: player.nickname,
    score: player.score,
    date: new Date(Date.now() - (i + 1) * DAY_MS).toISOString(),
  }));
  const submitted = submittedScores.filter(s => s.quizId === quizId);
  return [...seeds, ...submitted].sort((a, b) => b.score - a.score);
}
