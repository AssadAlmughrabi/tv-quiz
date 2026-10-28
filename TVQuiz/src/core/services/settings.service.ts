import {
  DEFAULT_NICKNAME,
  NICKNAME_MAX_LENGTH,
} from 'core/constants/app.const';
import { platform } from 'core/platform/platform';
import { Settings } from 'types/settings.interface';

const STORAGE_KEY = 'settings';

export const DEFAULT_SETTINGS: Settings = {
  nickname: DEFAULT_NICKNAME,
  language: 'en',
  sound: true,
};

/** Keeps only valid values, so a damaged or older saved copy can never break the app. */
function sanitize(saved: Partial<Settings>): Settings {
  return {
    nickname:
      typeof saved.nickname === 'string' && saved.nickname.trim()
        ? saved.nickname.trim().slice(0, NICKNAME_MAX_LENGTH)
        : DEFAULT_SETTINGS.nickname,
    language:
      saved.language === 'en' || saved.language === 'ar'
        ? saved.language
        : DEFAULT_SETTINGS.language,
    sound:
      typeof saved.sound === 'boolean' ? saved.sound : DEFAULT_SETTINGS.sound,
  };
}

export const settingsService = {
  /** The saved settings, or the defaults when nothing (valid) is saved. */
  async load(): Promise<Settings> {
    try {
      const raw = await platform.storage.getItem(STORAGE_KEY);
      return raw ? sanitize(JSON.parse(raw)) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  save(settings: Settings): Promise<void> {
    return platform.storage.setItem(STORAGE_KEY, JSON.stringify(settings));
  },
};
