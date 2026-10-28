import { Artwork } from 'types/category.interface';

/** 'mixed' = all three levels together, used by the 100-question marathon. */
export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';

export interface Quiz {
  /** Category + difficulty, e.g. "music-easy". The API has no quiz concept. */
  id: string;
  categoryId: string;
  /** Already translated to the current UI language. */
  title: string;
  difficulty: Difficulty;
  questionCount: number;
  secondsPerQuestion: number;
  artwork: Artwork;
  isDaily?: boolean;
}
