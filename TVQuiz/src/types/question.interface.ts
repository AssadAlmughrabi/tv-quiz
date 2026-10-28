import { Language } from 'types/language.interface';

export interface Choice {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  /** Choices are already shuffled. */
  choices: Choice[];
  correctChoiceId: string;
  imageUrl?: string;
  /** API content stays English even when the UI is Arabic, so it keeps its own direction. */
  contentLanguage: Language;
}
