import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { COLORS } from 'core/constants/theme-colors.const';
import { SubmitState } from 'core/hooks/use-submit-score';
import { useLanguage } from 'core/i18n/language.context';
import { scale } from 'core/utils/scale.utils';

/**
 * One line telling where the score went. Fixed height, so nothing moves
 * when "Saving…" changes to "saved" or the offline message.
 */
export function ScoreStatus({ state }: { state: SubmitState }) {
  const { t } = useLanguage();
  const text = {
    sending: t.result.sending,
    sent: t.result.saved,
    queued: t.result.queued,
    rejected: t.result.rejected,
  }[state.status];

  return (
    <Text
      style={[styles.line, state.status !== 'sent' && styles.muted]}
      numberOfLines={2}
      accessibilityLiveRegion="polite"
    >
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  line: {
    height: scale(80),
    color: COLORS.text,
    fontSize: scale(28),
    lineHeight: scale(40),
    fontWeight: '700',
  },
  muted: { color: COLORS.textMuted },
});
