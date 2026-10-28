import { Language } from 'types/language.interface';

/** What the player chooses in Settings. Saved on the device and loaded at startup. */
export interface Settings {
  nickname: string;
  language: Language;
  /** Feedback sounds on or off. */
  sound: boolean;
}
