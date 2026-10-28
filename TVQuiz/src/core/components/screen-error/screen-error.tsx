import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FocusableButton } from 'core/components/focusable-button/focusable-button';
import { COLORS } from 'core/constants/theme-colors.const';
import { useLanguage } from 'core/i18n/language.context';
import { scale } from 'core/utils/scale.utils';

interface ScreenErrorProps {
  /** Draws the screen again. */
  onRetry: () => void;
  /** Leaves the broken screen. Not given on the first screen, which has nowhere to go back to. */
  onBack?: () => void;
}

/**
 * Shown in place of a screen that crashed. Focus starts on Retry, so focus is never lost;
 * the remote's Back key works as usual.
 */
export function ScreenError({ onRetry, onBack }: ScreenErrorProps) {
  const { t } = useLanguage();

  return (
    <View style={styles.screen} accessibilityLiveRegion="assertive">
      <Text style={styles.title} accessibilityRole="header">
        {t.states.errorTitle}
      </Text>
      <Text style={styles.message}>{t.states.screenError}</Text>
      <View style={styles.actions}>
        <FocusableButton
          label={t.common.retry}
          onPress={onRetry}
          hasTVPreferredFocus
        />
        {onBack && <FocusableButton label={t.common.back} onPress={onBack} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(24),
  },
  title: { color: COLORS.text, fontSize: scale(48), fontWeight: '800' },
  message: { color: COLORS.textMuted, fontSize: scale(30), textAlign: 'center' },
  actions: { flexDirection: 'row', gap: scale(24), marginTop: scale(16) },
});
