import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { TVPressable } from 'core/components/tv-pressable/tv-pressable';
import { FOCUS_GLOW } from 'core/constants/focus-glow.const';
import { COLORS } from 'core/constants/theme-colors.const';
import { scale } from 'core/utils/scale.utils';

interface ChoiceChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  hasTVPreferredFocus?: boolean;
}

/**
 * One option of a group (language, sound). The chosen one has a ✓, a fill and a border,
 * so "chosen" and "focused" can be told apart without relying on colour.
 */
export function ChoiceChip({
  label,
  selected,
  onPress,
  hasTVPreferredFocus,
}: ChoiceChipProps) {
  return (
    <TVPressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      hasTVPreferredFocus={hasTVPreferredFocus}
      onPress={onPress}
      style={({ focused }) => [
        styles.chip,
        selected && styles.selected,
        focused && styles.focused,
      ]}
    >
      {/* Fixed-width ✓ slot, always there, so the chip does not grow when chosen. */}
      <Text style={[styles.check, selected && styles.selectedLabel]}>
        {selected ? '✓' : ''}
      </Text>
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {label}
      </Text>
    </TVPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minWidth: scale(180),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    paddingVertical: scale(16),
    paddingHorizontal: scale(28),
    borderRadius: scale(40),
    borderWidth: scale(4),
    // Same width when not focused, so nothing moves when focus arrives.
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  selected: { backgroundColor: COLORS.surfaceRaised, borderColor: COLORS.text },
  focused: {
    borderColor: COLORS.focus,
    transform: [{ scale: 1.05 }],
    ...FOCUS_GLOW,
  },
  label: { color: COLORS.textMuted, fontSize: scale(28), fontWeight: '600' },
  selectedLabel: { color: COLORS.text, fontWeight: '800' },
  check: {
    width: scale(28),
    color: COLORS.text,
    fontSize: scale(28),
    fontWeight: '800',
  },
});
