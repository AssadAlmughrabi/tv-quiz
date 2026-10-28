import React, { ReactNode } from 'react';
import { StyleProp, View, ViewProps, ViewStyle } from 'react-native';

interface FocusGroupProps {
  style?: StyleProp<ViewStyle>;
  /** Left and Right never leave the group (see focus-group.tsx). */
  trapHorizontal?: boolean;
  children: ReactNode;
}

/**
 * Web version: marks the area with data-focus-group (and data-focus-trap-x). The web focus
 * engine (spatial-navigation.web.ts) remembers the last focused item in each group and keeps
 * Left/Right inside a trapped one.
 */
// dataSet is a react-native-web prop that React Native's types do not include.
const GROUP_PROPS = { dataSet: { focusGroup: 'true' } } as unknown as ViewProps;
const TRAPPED_GROUP_PROPS = {
  dataSet: { focusGroup: 'true', focusTrapX: 'true' },
} as unknown as ViewProps;

export function FocusGroup({ style, trapHorizontal, children }: FocusGroupProps) {
  return (
    <View
      style={style}
      {...(trapHorizontal ? TRAPPED_GROUP_PROPS : GROUP_PROPS)}
    >
      {children}
    </View>
  );
}
