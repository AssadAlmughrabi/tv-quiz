import React, { ReactNode } from 'react';
import { StyleProp, TVFocusGuideView, ViewStyle } from 'react-native';

interface FocusTrapProps {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

/**
 * Focus cannot leave this area in any direction, e.g. an open dialog.
 * Native: the TV's focus guide traps it. Web: see focus-trap.web.tsx.
 */
export function FocusTrap({ style, children }: FocusTrapProps) {
  return (
    <TVFocusGuideView
      style={style}
      trapFocusUp
      trapFocusDown
      trapFocusLeft
      trapFocusRight
    >
      {children}
    </TVFocusGuideView>
  );
}
