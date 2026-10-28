import React, { useRef } from 'react';
import { Pressable, PressableProps, View } from 'react-native';
import { usePreferredFocus } from 'core/focus/use-preferred-focus';

/**
 * The one focusable building block. Use it instead of Pressable everywhere:
 * `hasTVPreferredFocus` then works on native TVs and in the web build alike.
 */
export function TVPressable({ hasTVPreferredFocus, ...props }: PressableProps) {
  const ref = useRef<View>(null);
  usePreferredFocus(ref, hasTVPreferredFocus);
  return (
    <Pressable ref={ref} hasTVPreferredFocus={hasTVPreferredFocus} {...props} />
  );
}
