/** Raw shape returned by the-trivia-api.com/v2. Used only by trivia-api.service. */
export interface TriviaApiQuestion {
  id: string;
  category: string;
  question: { text: string };
  correctAnswer: string;
  incorrectAnswers: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  type: string;
  tags: string[];
}

/** Raw shape of /v2/categories: display name -> slugs the API accepts, e.g. "Film & TV": ["movies", "film", "film_and_tv"]. */
export type TriviaApiCategories = Record<string, string[]>;
