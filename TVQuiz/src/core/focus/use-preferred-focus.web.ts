/// <reference lib="dom" />
import { RefObject, useEffect } from 'react';
import { View } from 'react-native';
import { moveFocus } from 'core/focus/spatial-navigation';

/**
 * Web version of `hasTVPreferredFocus`, which browsers do not know:
 * when `enabled` is true, focus this element as soon as it is on screen.
 */
export function usePreferredFocus(
  ref: RefObject<View | null>,
  enabled: boolean | undefined,
): void {
  useEffect(() => {
    // react-native-web gives the DOM element.
    const element = ref.current as unknown as HTMLElement | null;
    if (enabled && element) {
      // Scrolls it into the safe area (e.g. a "See all" at the far end of a rail), then focuses it.
      moveFocus(element);
    }
  }, [ref, enabled]);
}
