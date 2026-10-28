import React, { ReactNode } from 'react';
import { StyleProp, TVFocusGuideView, ViewStyle } from 'react-native';

interface FocusGroupProps {
  style?: StyleProp<ViewStyle>;
  /**
   * Left and Right never leave the group, e.g. a rail: at its end focus stays put instead of
   * jumping to a card of another rail that happens to stick out further right.
   */
  trapHorizontal?: boolean;
  children: ReactNode;
}

/**
 * A focus group, e.g. one rail. Entering it from outside focuses the item last used in it,
 * or the first item on the first visit. Moving inside it is unchanged.
 * Native: the TV's own focus guide does this. Web: see focus-group.web.tsx.
 */
export function FocusGroup({ style, trapHorizontal, children }: FocusGroupProps) {
  return (
    <TVFocusGuideView
      autoFocus
      trapFocusLeft={trapHorizontal}
      trapFocusRight={trapHorizontal}
      style={style}
    >
      {children}
    </TVFocusGuideView>
  );
}
