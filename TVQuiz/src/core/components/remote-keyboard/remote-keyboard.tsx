import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TVPressable } from 'core/components/tv-pressable/tv-pressable';
import { FOCUS_GLOW } from 'core/constants/focus-glow.const';
import { LANGUAGE_NAMES } from 'core/constants/app.const';
import { COLORS } from 'core/constants/theme-colors.const';
import { directionProps } from 'core/i18n/direction';
import { useLanguage } from 'core/i18n/language.context';
import { scale } from 'core/utils/scale.utils';
import { Language } from 'types/language.interface';

/**
 * 36 characters in 4 rows of 9 for each layout: every row is the same width, so Up and Down
 * land straight. Arabic has its 28 letters plus the hamza and taa marbuta forms; digits are
 * typed from the English layout.
 */
const LAYOUTS: Record<Language, string[]> = {
  en: ['ABCDEFGHI', 'JKLMNOPQR', 'STUVWXYZ0', '123456789'],
  ar: ['ابتثجحخدذ', 'رزسشصضطظع', 'غفقكلمنهو', 'يةىءأإآؤئ'],
};
const OTHER_LAYOUT: Record<Language, Language> = { en: 'ar', ar: 'en' };
const COLUMNS = 9;
const KEY_WIDTH = scale(92);
const KEY_HEIGHT = scale(76);
const KEY_GAP = scale(10);
/** Width of a character row; the action row below is made exactly as wide. */
export const KEYBOARD_WIDTH = COLUMNS * KEY_WIDTH + (COLUMNS - 1) * KEY_GAP;

interface RemoteKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onDone: () => void;
  maxLength: number;
}

/**
 * On-screen keyboard used with arrows and Enter only, the same on every TV.
 * No system keyboard is opened: each platform has a different one, and some need touch.
 * It starts with the letters of the app's language; one key switches English / Arabic.
 * Focus starts on the first letter. Typing past maxLength, a leading space or two spaces in a row are ignored.
 * Done does nothing while the text is empty or only spaces.
 */
export function RemoteKeyboard({
  value,
  onChange,
  onDone,
  maxLength,
}: RemoteKeyboardProps) {
  const { lang, t } = useLanguage();
  const [layout, setLayout] = useState<Language>(lang);
  const [lowerCase, setLowerCase] = useState(false);
  const hasCase = layout === 'en';
  // Arabic letters run right to left, English left to right, whatever the app language.
  const direction = directionProps(layout);
  const canFinish = value.trim().length > 0;

  const type = (char: string) => {
    const full = value.length >= maxLength;
    const badSpace = char === ' ' && (value === '' || value.endsWith(' '));
    if (!full && !badSpace) {
      onChange(value + char);
    }
  };

  return (
    <View {...direction} style={[styles.keyboard, direction.style]}>
      {LAYOUTS[layout].map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {[...row].map((char, column) => {
            const shown = hasCase && lowerCase ? char.toLowerCase() : char;
            return (
              <Key
                // Keyed by place, not letter: switching layout only relabels the keys,
                // so focus stays on the same spot instead of jumping to the first key.
                key={column}
                label={shown}
                hasTVPreferredFocus={rowIndex === 0 && column === 0}
                onPress={() => type(shown)}
              />
            );
          })}
        </View>
      ))}

      <View style={styles.row}>
        <Key
          label={LANGUAGE_NAMES[OTHER_LAYOUT[layout]]}
          accessibilityLabel={t.keyboard.layout}
          flex={1}
          onPress={() => setLayout(current => OTHER_LAYOUT[current])}
        />
        <Key
          label={lowerCase ? 'ABC' : 'abc'}
          accessibilityLabel={t.keyboard.shift}
          flex={1}
          // Arabic has no upper and lower case: dimmed, but still focusable.
          disabled={!hasCase}
          onPress={() => hasCase && setLowerCase(current => !current)}
        />
        <Key label={t.keyboard.space} flex={1.5} onPress={() => type(' ')} />
        <Key
          label="⌫"
          accessibilityLabel={t.keyboard.delete}
          flex={1}
          onPress={() => onChange(value.slice(0, -1))}
        />
        <Key
          label={t.keyboard.done}
          flex={1.5}
          primary
          disabled={!canFinish}
          onPress={() => canFinish && onDone()}
        />
      </View>
    </View>
  );
}

interface KeyProps {
  label: string;
  accessibilityLabel?: string;
  /** Share of the action row; character keys have a fixed width instead. */
  flex?: number;
  /** The key that finishes: drawn in the accent colour. */
  primary?: boolean;
  /** Looks dimmed but stays focusable, so focus is never lost from the key it is on. */
  disabled?: boolean;
  hasTVPreferredFocus?: boolean;
  onPress: () => void;
}

function Key({
  label,
  accessibilityLabel,
  flex,
  primary,
  disabled,
  hasTVPreferredFocus,
  onPress,
}: KeyProps) {
  return (
    <TVPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      hasTVPreferredFocus={hasTVPreferredFocus}
      onPress={onPress}
      style={({ focused }) => [
        styles.key,
        flex ? { flex } : styles.charKey,
        focused && styles.focused,
        // After focus, so Done keeps its fill (and dark text stays readable) when focused.
        primary && styles.primary,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[styles.label, primary && styles.primaryLabel]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TVPressable>
  );
}

const styles = StyleSheet.create({
  keyboard: { width: KEYBOARD_WIDTH, gap: KEY_GAP },
  row: { flexDirection: 'row', gap: KEY_GAP },
  key: {
    height: KEY_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(12),
    borderWidth: scale(4),
    // Same width when not focused, so nothing moves when focus arrives.
    borderColor: 'transparent',
    backgroundColor: COLORS.surface,
  },
  charKey: { width: KEY_WIDTH },
  primary: { backgroundColor: COLORS.accent },
  disabled: { opacity: 0.4 },
  focused: {
    borderColor: COLORS.focus,
    backgroundColor: COLORS.surfaceRaised,
    transform: [{ scale: 1.08 }],
    ...FOCUS_GLOW,
  },
  label: { color: COLORS.text, fontSize: scale(32), fontWeight: '700' },
  primaryLabel: { color: COLORS.background },
});
