import { ArtworkShape } from 'types/category.interface';

/**
 * Categories come from the Trivia API. The mock only adds what the API does not have:
 * an artwork shape per category (mixed, to show cards of any shape line up) ...
 */
export const CATEGORY_SHAPES: Record<string, ArtworkShape> = {
  general_knowledge: 'wide',
  science: 'square',
  history: 'tall',
  geography: 'wide',
  music: 'square',
  film_and_tv: 'tall',
  sport_and_leisure: 'wide',
  arts_and_literature: 'square',
  food_and_drink: 'tall',
  society_and_culture: 'wide',
};

/** Shape for a category the API adds later and the mock does not know yet. */
export const DEFAULT_CATEGORY_SHAPE: ArtworkShape = 'wide';

/** ... and one extra category with no quizzes, to show the empty state. */
export const EMPTY_CATEGORY = {
  id: 'coming-soon',
  shape: 'square' as ArtworkShape,
};

export const QUESTIONS_PER_QUIZ = 10;
export const SECONDS_PER_QUESTION = 20;

export const MARATHON = {
  categoryId: 'general_knowledge',
  questionCount: 100,
  secondsPerQuestion: 15,
};

/** Pixel size of the artwork image for each shape. */
export const ARTWORK_SIZES: Record<
  ArtworkShape,
  { width: number; height: number }
> = {
  wide: { width: 640, height: 360 },
  square: { width: 400, height: 400 },
  tall: { width: 400, height: 600 },
};

/** Every Nth question gets an image; the rest are text only. */
export const IMAGE_EVERY_NTH_QUESTION = 3;

/** The .invalid domain never resolves, so this image always fails to load. */
export const BROKEN_IMAGE_URL = 'https://image.invalid/broken.jpg';

/** Which question shows the broken image, to test the placeholder. */
export const BROKEN_IMAGE_QUESTION = { quizId: 'science-easy', index: 2 };

/** Fake network delay so loading states are visible. */
export const MOCK_LATENCY_MS = 300;

/** 100 points per correct answer, so a 10-question quiz scores at most 1000. */
export const SEED_PLAYERS: { nickname: string; score: number }[] = [
  { nickname: 'Sara', score: 1000 },
  { nickname: 'Omar', score: 900 },
  { nickname: 'لينا', score: 900 },
  { nickname: 'Yousef', score: 800 },
  { nickname: 'Noor', score: 700 },
  { nickname: 'خالد', score: 700 },
  { nickname: 'Maya', score: 600 },
  { nickname: 'Adam', score: 500 },
  { nickname: 'ريم', score: 400 },
  { nickname: 'Zaid', score: 300 },
  { nickname: 'Hana', score: 200 },
  { nickname: 'Tariq', score: 100 },
];
