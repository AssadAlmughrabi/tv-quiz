/// <reference lib="dom" />

/**
 * Remote key handling shared by the web platform and the web focus engine, so both
 * read keys the same way. Only imported by .web.ts files.
 */
import { RemoteKey } from 'types/platform.interface';

/** Arrow keys and Enter by name; keyCode as a fallback for TV remotes that send no name. */
const KEY_NAMES: Record<string, RemoteKey> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Enter: 'enter',
};
const KEY_CODES: Record<number, RemoteKey> = {
  38: 'up',
  40: 'down',
  37: 'left',
  39: 'right',
  13: 'enter',
};

/** Back: Backspace, Escape, LG webOS (461), Samsung Tizen (10009). */
const BACK_KEY_CODES = [8, 27, 461, 10009];

export function isTyping(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  return target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';
}

export function isBackKey(event: KeyboardEvent): boolean {
  if (isTyping(event)) {
    // Backspace deletes text while typing; it is not Back.
    return (
      event.key === 'Escape' || event.keyCode === 461 || event.keyCode === 10009
    );
  }
  return (
    event.key === 'Escape' ||
    event.key === 'Backspace' ||
    BACK_KEY_CODES.includes(event.keyCode)
  );
}

/** The remote key for a keyboard event, or null if it is not one of ours. */
export function toRemoteKey(event: KeyboardEvent): RemoteKey | null {
  if (isBackKey(event)) {
    return 'back';
  }
  return KEY_NAMES[event.key] ?? KEY_CODES[event.keyCode] ?? null;
}
