import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  KEYBOARD_WIDTH,
  RemoteKeyboard,
} from 'core/components/remote-keyboard/remote-keyboard';
import { NICKNAME_MAX_LENGTH } from 'core/constants/app.const';
import { SAFE_AREA } from 'core/constants/layout.const';
import { COLORS } from 'core/constants/theme-colors.const';
import { directionProps } from 'core/i18n/direction';
import { useLanguage } from 'core/i18n/language.context';
import { useNavigation } from 'core/navigation/navigation.context';
import { useSettings } from 'core/settings/settings.context';
import { formatNumber } from 'core/utils/format.utils';
import { scale } from 'core/utils/scale.utils';

const LTR = directionProps('en');
/** Any Arabic letter. */
const ARABIC = /[\u0600-\u06FF]/;

/**
 * Types the nickname with the on-screen keyboard. It starts with the current name.
 * Done saves it (without spaces at the end) and goes back; Back goes back without saving.
 */
export function NicknameScreen() {
  const { lang, t } = useLanguage();
  const { goBack } = useNavigation();
  const { settings, updateSettings } = useSettings();
  const [value, setValue] = useState(settings.nickname);
  // An Arabic name is written from the right, an English one from the left.
  // Decided by the first letter; empty follows the app language.
  const first = value.trim()[0];
  const field = directionProps(
    first ? (ARABIC.test(first) ? 'ar' : 'en') : lang,
  );

  const save = () => {
    updateSettings({ nickname: value.trim() });
    goBack();
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title} accessibilityRole="header">
        {t.settings.nickname}
      </Text>
      <Text style={styles.hint}>{t.nickname.hint}</Text>

      {/* Same width as the keyboard. */}
      <View
        {...field}
        style={[styles.field, field.style]}
        accessibilityLabel={value || t.nickname.placeholder}
        accessibilityLiveRegion="polite"
      >
        {value !== '' && (
          <Text style={styles.value} numberOfLines={1}>
            {value}
          </Text>
        )}
        {/* Where the next letter goes. */}
        <View style={styles.cursor} />
        {value === '' && (
          <Text style={styles.placeholder}>{t.nickname.placeholder}</Text>
        )}
      </View>
      {/* Under the field's right end, in both languages, like the field itself. */}
      <View {...LTR} style={[styles.counterRow, LTR.style]}>
        <Text style={styles.counter}>
          {formatNumber(value.length, lang)} /{' '}
          {formatNumber(NICKNAME_MAX_LENGTH, lang)}
        </Text>
      </View>

      <RemoteKeyboard
        value={value}
        onChange={setValue}
        onDone={save}
        maxLength={NICKNAME_MAX_LENGTH}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SAFE_AREA.horizontal,
    paddingVertical: SAFE_AREA.vertical,
  },
  title: { color: COLORS.text, fontSize: scale(56), fontWeight: '800' },
  hint: { color: COLORS.textMuted, fontSize: scale(28), marginTop: scale(8) },
  field: {
    width: KEYBOARD_WIDTH,
    height: scale(96),
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(40),
    paddingHorizontal: scale(28),
    borderRadius: scale(16),
    borderWidth: scale(4),
    borderColor: COLORS.accent,
    backgroundColor: COLORS.surface,
  },
  value: {
    flexShrink: 1,
    color: COLORS.text,
    fontSize: scale(44),
    fontWeight: '700',
  },
  placeholder: {
    marginStart: scale(12),
    color: COLORS.textMuted,
    fontSize: scale(36),
  },
  cursor: {
    width: scale(4),
    height: scale(52),
    marginStart: scale(4),
    backgroundColor: COLORS.accent,
  },
  counterRow: {
    width: KEYBOARD_WIDTH,
    alignItems: 'flex-end',
    marginTop: scale(8),
    marginBottom: scale(28),
  },
  counter: {
    color: COLORS.textMuted,
    fontSize: scale(24),
  },
});
