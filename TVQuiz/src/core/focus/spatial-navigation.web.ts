/// <reference lib="dom" />

/**
 * Focus engine for the web build (webOS, Tizen, browsers).
 * Browsers only move focus with Tab, so this moves it with the arrow keys, choosing the
 * nearest focusable element in the pressed direction, the way a TV's native engine does.
 * Enter is already handled: react-native-web presses the focused button on Enter.
 */

import { isTyping, toRemoteKey } from 'core/platform/web-keys';

type Direction = 'up' | 'down' | 'left' | 'right';

interface Candidate {
  element: HTMLElement;
  rect: DOMRect;
}

/** react-native-web gives every Pressable with a role tabIndex=0. */
const FOCUSABLE = '[tabindex="0"], button, a[href], input, textarea';

/** How much more being off to the side costs than being further away in the pressed direction. */
const SIDE_WEIGHT = 2;

/** Keep focused items this far from the window edges (5%, the TV overscan safe area). */
const SAFE_MARGIN = 0.05;

const TRAP = '[data-focus-trap]';

/** The newest focus trap on screen (e.g. an open dialog), if any. */
function activeTrap(): Element | null {
  const traps = document.querySelectorAll(TRAP);
  return traps.length > 0 ? traps[traps.length - 1] : null;
}

/**
 * Every focusable element with its position, measured once per key press (layout reads are slow on TVs).
 * While a focus trap is open, only the elements inside it.
 */
function candidates(): Candidate[] {
  const list: Candidate[] = [];
  const root = activeTrap() ?? document;
  root.querySelectorAll<HTMLElement>(FOCUSABLE).forEach(element => {
    const rect = element.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      list.push({ element, rect });
    }
  });
  return list;
}

const centerX = (r: DOMRect) => r.left + r.width / 2;
const centerY = (r: DOMRect) => r.top + r.height / 2;

/** Distance from `from` to `to` in the pressed direction, or null if `to` is not that way. */
function score(
  from: DOMRect,
  to: DOMRect,
  direction: Direction,
): number | null {
  const horizontal = direction === 'left' || direction === 'right';
  const forward =
    direction === 'right'
      ? centerX(to) - centerX(from)
      : direction === 'left'
      ? centerX(from) - centerX(to)
      : direction === 'down'
      ? centerY(to) - centerY(from)
      : centerY(from) - centerY(to);
  if (forward <= 1) {
    return null;
  }

  // No side cost when the two overlap across the pressed direction (same row or column).
  const overlaps = horizontal
    ? to.top < from.bottom && to.bottom > from.top
    : to.left < from.right && to.right > from.left;

  // Left/Right stay in the same row, like a TV rail: at the end of a rail nothing happens.
  if (horizontal && !overlaps) {
    return null;
  }

  const side = overlaps
    ? 0
    : horizontal
    ? Math.abs(centerY(to) - centerY(from))
    : Math.abs(centerX(to) - centerX(from));

  return forward + side * SIDE_WEIGHT;
}

function findNext(
  current: HTMLElement,
  direction: Direction,
): HTMLElement | null {
  const from = current.getBoundingClientRect();
  let best: HTMLElement | null = null;
  let bestScore = Infinity;

  for (const { element, rect } of candidates()) {
    if (element === current) {
      continue;
    }
    const value = score(from, rect, direction);
    if (value !== null && value < bestScore) {
      best = element;
      bestScore = value;
    }
  }
  return best;
}

function isScrollable(element: HTMLElement, axis: 'x' | 'y'): boolean {
  const style = getComputedStyle(element);
  const overflow = axis === 'y' ? style.overflowY : style.overflowX;
  const hasMore =
    axis === 'y'
      ? element.scrollHeight > element.clientHeight
      : element.scrollWidth > element.clientWidth;
  return (overflow === 'auto' || overflow === 'scroll') && hasMore;
}

/**
 * Brings the element into view only as much as needed, like the TV engine.
 * Unlike scrollIntoView, it only moves real scroll areas (the page, a rail), never
 * containers that are meant to stay fixed, so the screen never shifts into the overscan area.
 */
function revealElement(target: HTMLElement): void {
  // The app area (scaled to fit the window, maybe with bars around it), not the whole window.
  const root = document.getElementById('root') ?? document.body;
  const app = root.getBoundingClientRect();
  const marginX = app.width * SAFE_MARGIN;
  const marginY = app.height * SAFE_MARGIN;
  // Rects are in screen pixels (after the fit-to-window scale); scrollTop is not. Convert.
  const zoom = app.width / root.offsetWidth || 1;

  for (
    let parent = target.parentElement;
    parent;
    parent = parent.parentElement
  ) {
    const box = parent.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    if (isScrollable(parent, 'y')) {
      const top = Math.max(box.top, app.top + marginY);
      const bottom = Math.min(box.bottom, app.bottom - marginY);
      if (rect.top < top) {
        parent.scrollTop -= (top - rect.top) / zoom;
      } else if (rect.bottom > bottom) {
        parent.scrollTop += (rect.bottom - bottom) / zoom;
      }
    }
    if (isScrollable(parent, 'x')) {
      const left = Math.max(box.left, app.left + marginX);
      const right = Math.min(box.right, app.right - marginX);
      if (rect.left < left) {
        parent.scrollLeft -= (left - rect.left) / zoom;
      } else if (rect.right > right) {
        parent.scrollLeft += (rect.right - right) / zoom;
      }
    }
  }
}

const GROUP = '[data-focus-group]';

/** Last focused item per group. WeakMap: groups that leave the screen are forgotten. */
const lastInGroup = new WeakMap<Element, HTMLElement>();

function groupOf(element: Element): Element | null {
  return element.closest(GROUP);
}

/**
 * Entering a group from outside goes to the item last used in it (if still on the page),
 * otherwise to its first item. Moving inside a group is not changed.
 */
function applyGroup(current: HTMLElement, next: HTMLElement): HTMLElement {
  const group = groupOf(next);
  if (!group || group === groupOf(current)) {
    return next;
  }
  const remembered = lastInGroup.get(group);
  if (remembered && remembered.isConnected) {
    return remembered;
  }
  return group.querySelector<HTMLElement>(FOCUSABLE) ?? next;
}

function rememberInGroup(event: FocusEvent): void {
  const target = event.target as HTMLElement | null;
  const group = target && groupOf(target);
  if (target && group) {
    lastInGroup.set(group, target);
  }
}

/**
 * Scroll first, then focus. Focusing runs the screen's onFocus, which may start its own
 * smooth scroll (e.g. Home keeps the focused row at a fixed line); scrolling after it would cancel that.
 */
export function moveFocus(target: HTMLElement): void {
  revealElement(target);
  target.focus({ preventScroll: true });
}

export function installSpatialNavigation(): () => void {
  const onKeyDown = (event: KeyboardEvent) => {
    const key = toRemoteKey(event);
    if (key === null || key === 'enter' || key === 'back') {
      return;
    }
    const direction: Direction = key;
    // Left/Right move the text cursor while typing; Up/Down still leave the field.
    if (isTyping(event) && (direction === 'left' || direction === 'right')) {
      return;
    }
    // Arrows must move focus, not scroll the page.
    event.preventDefault();

    const current = document.activeElement as HTMLElement | null;
    const trap = activeTrap();
    // Focus is lost, or outside an open trap: bring it back to the first item there.
    if (
      !current ||
      current === document.body ||
      (trap && !trap.contains(current))
    ) {
      // Focus was lost (e.g. the screen changed): recover on the first focusable item.
      const first = candidates()[0];
      if (first) {
        moveFocus(first.element);
      }
      return;
    }

    const next = findNext(current, direction);
    // A rail keeps Left/Right inside it: at its end focus stays, instead of jumping to a card
    // of another rail that sticks out further to the side.
    const group = groupOf(current);
    if (
      next &&
      (direction === 'left' || direction === 'right') &&
      group?.hasAttribute('data-focus-trap-x') &&
      groupOf(next) !== group
    ) {
      return;
    }
    if (next) {
      moveFocus(applyGroup(current, next));
    }
  };

  window.addEventListener('keydown', onKeyDown);
  // focusin also catches focus set by code (start focus, focus restore), so groups stay up to date.
  document.addEventListener('focusin', rememberInGroup);
  return () => {
    window.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('focusin', rememberInGroup);
  };
}
