/**
 * Native (Android TV, Apple TV): the TV's own focus engine moves focus with the remote,
 * so there is nothing to install. The web build uses spatial-navigation.web.ts instead.
 */
export function installSpatialNavigation(): () => void {
  return () => {};
}

/** Native: focus is moved by the TV. Exists so both versions export the same names. */
export function moveFocus(_target: unknown): void {}
