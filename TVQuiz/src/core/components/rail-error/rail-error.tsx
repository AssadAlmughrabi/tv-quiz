import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FocusableButton } from 'core/components/focusable-button/focusable-button';
import { RAIL_HEIGHT, SAFE_AREA } from 'core/constants/layout.const';
import { COLORS } from 'core/constants/theme-colors.const';
import { useLanguage } from 'core/i18n/language.context';
import { scale } from 'core/utils/scale.utils';

interface RailErrorProps {
  title: string;
  onRetry: () => void;
}

export function RailError({ title, onRetry }: RailErrorProps) {
  const { t } = useLanguage();

  return (
    <View style={styles.railError}>
      <Text style={styles.text}>
        {title}: {t.states.rowError}
      </Text>
      <FocusableButton label={t.common.retry} onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  railError: {
    height: RAIL_HEIGHT,
    paddingHorizontal: SAFE_AREA.horizontal,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(24),
  },
  text: { color: COLORS.textMuted, fontSize: scale(28) },
});
