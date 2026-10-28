import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from 'core/constants/theme-colors.const';
import { directionProps } from 'core/i18n/direction';
import { scale } from 'core/utils/scale.utils';

/** Every row has this height, so the list does not move when the values arrive. */
export const INFO_ROW_HEIGHT = scale(112);
const LTR = directionProps('en');

interface InfoRowProps {
  label: string;
  /** Null while loading: a dash keeps the space. */
  value: string | null;
}

/**
 * One read-only fact: the name at the start, the value at the end. Not focusable.
 * The value comes from the device in English (model, version), so it is always left-to-right.
 */
export function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${label}: ${value ?? ''}`}
    >
      <Text style={styles.label}>{label}</Text>
      <View {...LTR} style={[styles.valueBox, LTR.style]}>
        <Text style={styles.value} numberOfLines={2}>
          {value ?? '—'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: INFO_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(32),
    paddingHorizontal: scale(32),
    borderRadius: scale(20),
    backgroundColor: COLORS.surface,
  },
  label: {
    width: scale(260),
    color: COLORS.textMuted,
    fontSize: scale(30),
    fontWeight: '600',
  },
  valueBox: { flex: 1 },
  value: {
    color: COLORS.text,
    fontSize: scale(30),
    lineHeight: scale(40),
    fontWeight: '700',
  },
});
