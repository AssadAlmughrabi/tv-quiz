import React from 'react';
import { StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { COLORS } from 'core/constants/theme-colors.const';
import { scale } from 'core/utils/scale.utils';
import { TVPressable } from 'core/components/tv-pressable/tv-pressable';
import { FOCUS_GLOW } from 'core/constants/focus-glow.const';

interface FocusableButtonProps {
  label: string;
  onPress: () => void;
  onFocus?: () => void;
  /** Optional symbol before the label, e.g. ⚙. */
  icon?: string;
  hasTVPreferredFocus?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Button for the remote: a thick border and a small zoom show focus, not colour alone. */
export function FocusableButton({
  label,
  onPress,
  onFocus,
  icon,
  hasTVPreferredFocus,
  style,
}: FocusableButtonProps) {
  return (
    <TVPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hasTVPreferredFocus={hasTVPreferredFocus}
      onPress={onPress}
      onFocus={onFocus}
      style={({ focused }) => [styles.button, focused && styles.focused, style]}
    >
      <Text style={styles.label}>
        {icon ? `${icon}  ` : ''}
        {label}
      </Text>
    </TVPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: scale(20),
    paddingHorizontal: scale(36),
    borderRadius: scale(12),
    borderWidth: scale(4),
    // Same width when not focused, so nothing moves when focus arrives.
    borderColor: 'transparent',
    backgroundColor: COLORS.surface,
  },
  focused: {
    borderColor: COLORS.focus,
    backgroundColor: COLORS.surfaceRaised,
    transform: [{ scale: 1.05 }],
    ...FOCUS_GLOW,
  },
  label: { color: COLORS.text, fontSize: scale(30) },
});
