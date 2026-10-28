/**
 * Web: the app is always laid out at exactly 1920x1080 and the whole page is scaled to the
 * window with CSS (see core/platform/fit-to-window.ts). So sizes are used as written.
 * This also keeps the layout right when the window changes size after the app started.
 */
export function scale(size: number): number {
  return size;
}
