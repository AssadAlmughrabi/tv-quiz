/// <reference lib="dom" />

/** The size every screen is designed for. The web build always lays out at this size. */
const DESIGN = { width: 1920, height: 1080 };

/**
 * Web only (imported by index.web.js): scales the 1920x1080 app to fill the window,
 * keeping 16:9 (bars on the sides or top if the window has another shape).
 * Runs again on every resize, so 720p, 1080p, 4K and a resized browser all fit.
 */
export function fitToWindow(root: HTMLElement): () => void {
  const apply = () => {
    const factor = Math.min(
      window.innerWidth / DESIGN.width,
      window.innerHeight / DESIGN.height,
    );
    const transform = `scale(${factor})`;
    root.style.transform = transform;
    // Older TV browsers (webOS 3/4, Tizen 3) only know the prefixed property.
    root.style.setProperty('-webkit-transform', transform);
    root.style.left = `${(window.innerWidth - DESIGN.width * factor) / 2}px`;
    root.style.top = `${(window.innerHeight - DESIGN.height * factor) / 2}px`;
  };
  apply();
  window.addEventListener('resize', apply);
  return () => window.removeEventListener('resize', apply);
}
