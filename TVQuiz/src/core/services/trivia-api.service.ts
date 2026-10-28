import { TRIVIA_API_MAX_LIMIT, TRIVIA_API_URL } from 'core/constants/api.const';
import { ApiError, request } from 'core/services/api.service';
import { shuffle } from 'core/utils/shuffle.utils';
import { Question } from 'types/question.interface';
import { Difficulty } from 'types/quiz.interface';
import {
  TriviaApiCategories,
  TriviaApiQuestion,
} from 'types/trivia-api.interface';

export interface ApiCategory {
  /** Slug used in question requests, e.g. "film_and_tv". */
  id: string;
  /** English display name from the API, e.g. "Film & TV". */
  englishName: string;
}

export async function getCategories(
  signal?: AbortSignal,
): Promise<ApiCategory[]> {
  const dto = await request<TriviaApiCategories>(
    `${TRIVIA_API_URL}/categories`,
    { signal },
  );
  if (!dto || typeof dto !== 'object') {
    throw new ApiError('parse', 'Categories missing from the response');
  }
  return Object.keys(dto).map(name => ({
    id: mainSlug(name, dto[name]),
    englishName: name,
  }));
}

/** The API lists several slugs per category; the main one is the name in snake_case. */
function mainSlug(name: string, slugs: string[]): string {
  const snake = name
    .toLowerCase()
    .replace(/ & /g, '_and_')
    .replace(/\s+/g, '_');
  return Array.isArray(slugs) && !slugs.includes(snake) && slugs.length > 0
    ? slugs[0]
    : snake;
}

export interface GetQuestionsOptions {
  /** Trivia API category slug, e.g. "music". */
  category: string;
  difficulty: Difficulty;
  count: number;
  signal?: AbortSignal;
}

export async function getQuestions(
  options: GetQuestionsOptions,
): Promise<Question[]> {
  const byId = new Map<string, Question>();
  // The API is random, so batches can repeat questions. Stop after a few extra tries.
  const maxRequests = Math.ceil(options.count / TRIVIA_API_MAX_LIMIT) + 2;

  for (let i = 0; i < maxRequests && byId.size < options.count; i++) {
    const missing = options.count - byId.size;
    const batch = await request<TriviaApiQuestion[]>(
      `${TRIVIA_API_URL}/questions`,
      {
        params: {
          categories: options.category,
          difficulties:
            options.difficulty === 'mixed'
              ? 'easy,medium,hard'
              : options.difficulty,
          types: 'text_choice',
          limit: Math.min(missing, TRIVIA_API_MAX_LIMIT),
        },
        signal: options.signal,
      },
    );

    for (const dto of batch) {
      const question = mapQuestion(dto);
      if (question && !byId.has(question.id)) {
        byId.set(question.id, question);
      }
    }
  }

  if (byId.size === 0) {
    throw new ApiError('parse', 'No usable questions received');
  }
  return [...byId.values()].slice(0, options.count);
}

/** Maps one API question to our model. Returns null when the data is unusable. */
export function mapQuestion(dto: TriviaApiQuestion): Question | null {
  const text = dto?.question?.text;
  const wrong = Array.isArray(dto?.incorrectAnswers)
    ? dto.incorrectAnswers.slice(0, 3)
    : [];
  if (!dto?.id || !text || !dto.correctAnswer || wrong.length < 3) {
    return null;
  }

  // Index 0 is the correct answer before shuffling.
  const choices = [dto.correctAnswer, ...wrong].map((choiceText, n) => ({
    id: `${dto.id}-${n}`,
    text: choiceText,
  }));

  return {
    id: dto.id,
    text,
    choices: shuffle(choices),
    correctChoiceId: `${dto.id}-0`,
    contentLanguage: 'en',
  };
}
