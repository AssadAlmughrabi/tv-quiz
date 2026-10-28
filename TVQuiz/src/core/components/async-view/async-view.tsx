import React, { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { FocusableButton } from 'core/components/focusable-button/focusable-button';
import { COLORS } from 'core/constants/theme-colors.const';
import { AsyncStatus } from 'core/hooks/use-async-data';
import { useLanguage } from 'core/i18n/language.context';
import { scale } from 'core/utils/scale.utils';

interface AsyncViewProps {
  status: AsyncStatus;
  onRetry: () => void;
  /** Shown instead of the default empty text. */
  emptyMessage?: string;
  /** Focusable action for the empty state, e.g. "Back to Home". */
  emptyAction?: { label: string; onPress: () => void };
  /** Take focus when an error or empty message appears. Only for full screens, not rows. */
  takeFocus?: boolean;
  /** Placeholder shown while loading, e.g. a skeleton in the content's exact size. Default: spinner. */
  loading?: ReactNode;
  children: () => ReactNode;
}

/** Shows loading, empty, error or offline; renders children only when data is ready. */
export function AsyncView({
  status,
  onRetry,
  emptyMessage,
  emptyAction,
  takeFocus = false,
  loading,
  children,
}: AsyncViewProps) {
  const { t } = useLanguage();

  if (status === 'ready') {
    return <>{children()}</>;
  }

  if (status === 'loading' && loading) {
    return (
      <View
        accessibilityLabel={t.common.loading}
        accessibilityLiveRegion="polite"
      >
        {loading}
      </View>
    );
  }

  if (status === 'loading') {
    return (
      <View style={styles.box} accessibilityLabel={t.common.loading}>
        <ActivityIndicator size="large" color={COLORS.focus} />
      </View>
    );
  }

  if (status === 'empty') {
    return (
      <View style={styles.box}>
        <Text style={styles.message}>{emptyMessage ?? t.states.empty}</Text>
        {emptyAction && (
          <FocusableButton
            label={emptyAction.label}
            onPress={emptyAction.onPress}
            hasTVPreferredFocus={takeFocus}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.box}>
      <Text style={styles.message}>
        {status === 'offline' ? t.states.offlineTitle : t.states.errorTitle}
      </Text>
      <FocusableButton
        label={t.common.retry}
        onPress={onRetry}
        hasTVPreferredFocus={takeFocus}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(24),
    padding: scale(32),
  },
  message: {
    color: COLORS.textMuted,
    fontSize: scale(30),
    textAlign: 'center',
  },
});
