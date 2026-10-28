/** Shown in About and sent with logs. Keep in sync with versionName in android/app/build.gradle. */
export const APP_VERSION = '1.0';

/**
 * Nickname until the player types one in Settings.
 * Not translated: the leaderboard finds the player's rows by this name, in any language.
 */
export const DEFAULT_NICKNAME = 'Player';

/** Longest nickname: fits in a leaderboard row next to the "You" badge. */
export const NICKNAME_MAX_LENGTH = 16;

/** Each language is named in its own script, so a player can find theirs whatever is set now. */
export const LANGUAGE_NAMES = { en: 'English', ar: 'العربية' } as const;
