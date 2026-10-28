import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from 'core/constants/theme-colors.const';
import { scale } from 'core/utils/scale.utils';

/** Small label pill, e.g. the difficulty on a card. Text, not colour, carries the meaning. */
export function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.scrim,
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
  },
  text: { color: COLORS.text, fontSize: scale(20), fontWeight: '700' },
});
