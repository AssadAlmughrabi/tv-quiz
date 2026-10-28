import { platform } from 'core/platform/platform';

const STORAGE_KEY = 'quiz-cache';

/** Waits this long after a change, so several changes are saved in one write. */
const SAVE_DELAY_MS = 500;

const memory = new Map<string, unknown>();
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSave(): void {
  if (saveTimer) {
    return;
  }
  saveTimer = setTimeout(() => {
    saveTimer = null;
    // A plain loop instead of Object.fromEntries, which old TV browsers do not have.
    const snapshot: Record<string, unknown> = {};
    memory.forEach((value, key) => {
      snapshot[key] = value;
    });
    platform.storage
      .setItem(STORAGE_KEY, JSON.stringify(snapshot))
      .catch(() => {});
  }, SAVE_DELAY_MS);
}

/**
 * Last known result per key, kept in memory and saved on the device.
 * Keys include the language (e.g. "quizzes:music:ar"), so one language never shows the other's text.
 */
export const cacheService = {
  /** Instant read, for the first frame of a screen. */
  peek<T>(key: string): T | undefined {
    return memory.get(key) as T | undefined;
  },

  set<T>(key: string, value: T): void {
    memory.set(key, value);
    scheduleSave();
  },

  /** Loads what was saved last time. Called once at startup, before the first screen. */
  async hydrate(): Promise<void> {
    try {
      const raw = await platform.storage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      const saved = JSON.parse(raw) as Record<string, unknown>;
      Object.keys(saved).forEach(key => {
        if (!memory.has(key)) {
          memory.set(key, saved[key]);
        }
      });
    } catch {
      // A broken cache only means the first screen loads normally.
    }
  },
};
