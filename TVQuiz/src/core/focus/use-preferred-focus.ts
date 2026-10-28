import { RefObject } from 'react';
import { View } from 'react-native';

/**
 * Native: `hasTVPreferredFocus` on the Pressable already does this, so nothing to do.
 * The web build uses use-preferred-focus.web.ts.
 */
export function usePreferredFocus(
  _ref: RefObject<View | null>,
  _enabled: boolean | undefined,
): void {}
