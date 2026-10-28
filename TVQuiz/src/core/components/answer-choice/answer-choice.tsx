import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TVPressable } from 'core/components/tv-pressable/tv-pressable';
import { COLORS } from 'core/constants/theme-colors.const';
import { textAlignStart } from 'core/i18n/direction';
import { useLanguage } from 'core/i18n/language.context';
import { scale } from 'core/utils/scale.utils';
import { Language } from 'types/language.interface';

/**
 * - idle:    answering, nothing chosen yet
 * - correct: the right answer, shown during feedback
 * - wrong:   the player's choice, when it was wrong
 * - dimmed:  the other choices during feedback
 */
export type ChoiceState = 'idle' | 'correct' | 'wrong' | 'dimmed';

export const CHOICE_HEIGHT = scale(130);

interface AnswerChoiceProps {
  /** Passed back in onPress, so the screen can give every card the same function. */
  choiceId: string;
  /** Position (0 = A), passed back in onFocus. */
  index: number;
  letter: string;
  text: string;
  state: ChoiceState;
  /** Language of the text: API answers are English even when the app is Arabic. */
  textLanguage: Language;
  onPress: (choiceId: string) => void;
  onFocus?: (index: number) => void;
  hasTVPreferredFocus?: boolean;
}

/**
 * One answer. Correct and wrong are shown with an icon and a word, not colour alone.
 * Every state has the same size and border width, so nothing moves when feedback appears.
 * Memoized: the question screen re-renders on every timer tick (10 times a second), and the
 * cards must not redraw when nothing about them changed. The screen passes stable callbacks.
 */
export const AnswerChoice = memo(function AnswerChoiceContent({
  choiceId,
  index,
  letter,
  text,
  state,
  textLanguage,
  onPress,
  onFocus,
  hasTVPreferredFocus,
}: AnswerChoiceProps) {
  const { lang, t } = useLanguage();
  const status =
    state === 'correct'
      ? `✓ ${t.question.correct}`
      : state === 'wrong'
      ? `✗ ${t.question.wrong}`
      : '';

  return (
    <TVPressable
      accessibilityRole="button"
      // The screen reader reads the whole choice as one item.
      accessibilityLabel={[letter, text, status].filter(Boolean).join(', ')}
      hasTVPreferredFocus={hasTVPreferredFocus}
      onPress={() => onPress(choiceId)}
      onFocus={() => onFocus?.(index)}
      style={({ focused }) => [
        styles.choice,
        state === 'correct' && styles.correct,
        state === 'wrong' && styles.wrong,
        state === 'dimmed' && styles.dimmed,
        focused && styles.focused,
      ]}
    >
      {/* The card mirrors with the app: in Arabic the letter and the text sit on the right. */}
      <View style={styles.letter}>
        <Text style={styles.letterText}>{letter}</Text>
      </View>
      <Text
        style={[
          styles.text,
          textLanguage === 'en' && styles.leftToRight,
          textAlignStart(lang),
        ]}
        numberOfLines={3}
      >
        {text}
      </Text>
      {/* Always rendered with a fixed width, so the text does not shift when it fills in. */}
      <Text style={styles.status}>{status}</Text>
    </TVPressable>
  );
});

const styles = StyleSheet.create({
  choice: {
    height: CHOICE_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(20),
    paddingHorizontal: scale(24),
    borderRadius: scale(16),
    borderWidth: scale(4),
    borderColor: 'transparent',
    backgroundColor: COLORS.surface,
  },
  focused: {
    borderColor: COLORS.focus,
    transform: [{ scale: 1.03 }],
  },
  correct: { backgroundColor: COLORS.correctSoft, borderColor: COLORS.correct },
  wrong: { backgroundColor: COLORS.wrongSoft, borderColor: COLORS.wrong },
  dimmed: { opacity: 0.5 },
  letter: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceRaised,
  },
  letterText: { color: COLORS.text, fontSize: scale(28), fontWeight: '800' },
  text: {
    flex: 1,
    color: COLORS.text,
    fontSize: scale(30),
    lineHeight: scale(38),
  },
  // English API text keeps its own reading order (punctuation at the end) inside Arabic.
  leftToRight: { writingDirection: 'ltr' },
  status: {
    width: scale(150),
    color: COLORS.text,
    fontSize: scale(24),
    fontWeight: '800',
  },
});
