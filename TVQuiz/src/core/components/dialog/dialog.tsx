import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FocusableButton } from 'core/components/focusable-button/focusable-button';
import { FocusTrap } from 'core/components/focus-trap/focus-trap';
import { COLORS } from 'core/constants/theme-colors.const';
import { useBackHandler } from 'core/navigation/navigation.context';
import { scale } from 'core/utils/scale.utils';

export interface DialogAction {
  label: string;
  onPress: () => void;
}

interface DialogProps {
  title: string;
  message: string;
  /** The first action gets focus when the dialog opens, so make it the safe one. */
  actions: DialogAction[];
  /** Back closes the dialog the same way as this. */
  onCancel: () => void;
}

/**
 * Covers the screen; focus is trapped inside and starts on the first action.
 * It registers its Back handler after the screen's, so Back reaches the dialog first.
 */
export function Dialog({ title, message, actions, onCancel }: DialogProps) {
  useBackHandler(() => {
    onCancel();
    return true;
  });

  return (
    <View style={styles.overlay} accessibilityViewIsModal>
      <FocusTrap style={styles.card}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          {actions.map((action, i) => (
            <FocusableButton
              key={action.label}
              label={action.label}
              hasTVPreferredFocus={i === 0}
              onPress={action.onPress}
            />
          ))}
        </View>
      </FocusTrap>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 8, 11, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: scale(900),
    padding: scale(56),
    gap: scale(24),
    borderRadius: scale(24),
    backgroundColor: COLORS.surface,
    borderWidth: scale(2),
    borderColor: COLORS.border,
  },
  title: { color: COLORS.text, fontSize: scale(48), fontWeight: '800' },
  message: {
    color: COLORS.textMuted,
    fontSize: scale(30),
    lineHeight: scale(42),
  },
  actions: { flexDirection: 'row', gap: scale(24), marginTop: scale(16) },
});
