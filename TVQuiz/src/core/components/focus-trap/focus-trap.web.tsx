import React, { ReactNode } from 'react';
import { StyleProp, View, ViewProps, ViewStyle } from 'react-native';

interface FocusTrapProps {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

// dataSet is a react-native-web prop that React Native's types do not include.
const TRAP_PROPS = { dataSet: { focusTrap: 'true' } } as unknown as ViewProps;

/** Web version: marks the area; the web focus engine only moves focus inside it while it is on screen. */
export function FocusTrap({ style, children }: FocusTrapProps) {
  return (
    <View style={style} {...TRAP_PROPS}>
      {children}
    </View>
  );
}
