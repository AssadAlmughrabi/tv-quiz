import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TVPressable } from 'core/components/tv-pressable/tv-pressable';
import { FOCUS_GLOW } from 'core/constants/focus-glow.const';
import { COLORS } from 'core/constants/theme-colors.const';
import { textAlignStart } from 'core/i18n/direction';
import { useLanguage } from 'core/i18n/language.context';
import { formatNumber } from 'core/utils/format.utils';
import { scale } from 'core/utils/scale.utils';
import { ReviewItem } from 'types/score.interface';

const PADDING = scale(20);
const BORDER = scale(4);
const QUESTION_LINE = scale(36);
const ANSWER_LINE = scale(32);
const GAP = scale(10);

/**
 * Every row has this height (two question lines + one answer line), so the list knows
 * where each row is without measuring.
 */
export const REVIEW_ROW_HEIGHT =
  BORDER * 2 + PADDING * 2 + QUESTION_LINE * 2 + GAP + ANSWER_LINE;
export const REVIEW_ROW_GAP = scale(16);

interface ReviewRowProps {
  item: ReviewItem;
  index: number;
}

/**
 * One answered question in the result's review list. Focusable, so the remote can scroll
 * the list row by row. Right and wrong are shown with an icon and a word, not colour alone.
 */
export function ReviewRow({ item, index }: ReviewRowProps) {
  const { lang, t } = useLanguage();
  const mark = item.isCorrect
    ? `✓ ${t.question.correct}`
    : item.choiceId === null
    ? `⏱ ${t.question.timeUp}`
    : `✗ ${t.question.wrong}`;
  const given = item.givenText ?? t.result.noAnswer;
  const ltr = item.contentLanguage === 'en' && styles.leftToRight;

  return (
    <TVPressable
      accessibilityLabel={[
        formatNumber(index + 1, lang),
        item.questionText,
        mark,
        `${t.result.yourAnswer}: ${given}`,
        !item.isCorrect && `${t.result.correctAnswer}: ${item.correctText}`,
      ]
        .filter(Boolean)
        .join(', ')}
      style={({ focused }) => [styles.row, focused && styles.focused]}
    >
      <Text style={styles.number}>{formatNumber(index + 1, lang)}</Text>

      <View style={styles.body}>
        {/* In Arabic the question sits on the right, like the rest of the row. */}
        <Text
          style={[styles.question, ltr, textAlignStart(lang)]}
          numberOfLines={2}
        >
          {item.questionText}
        </Text>
        <View style={styles.answers}>
          <Text style={styles.answer} numberOfLines={1}>
            {t.result.yourAnswer}:{' '}
            <Text style={[ltr, item.isCorrect ? styles.right : styles.wrong]}>
              {given}
            </Text>
          </Text>
          {/* Always takes its half, so the layout is the same for right and wrong rows. */}
          <Text style={styles.answer} numberOfLines={1}>
            {!item.isCorrect && (
              <>
                {t.result.correctAnswer}:{' '}
                <Text style={[ltr, styles.right]}>{item.correctText}</Text>
              </>
            )}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.mark,
          item.isCorrect ? styles.markRight : styles.markWrong,
        ]}
      >
        <Text style={styles.markText}>{mark}</Text>
      </View>
    </TVPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    height: REVIEW_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(20),
    padding: PADDING,
    borderRadius: scale(16),
    borderWidth: BORDER,
    // Same width when not focused, so nothing moves when focus arrives.
    borderColor: 'transparent',
    backgroundColor: COLORS.surface,
  },
  focused: {
    borderColor: COLORS.focus,
    backgroundColor: COLORS.surfaceRaised,
    ...FOCUS_GLOW,
  },
  number: {
    width: scale(48),
    color: COLORS.textMuted,
    fontSize: scale(28),
    lineHeight: QUESTION_LINE,
    fontWeight: '800',
  },
  body: { flex: 1, gap: GAP },
  // No fixed height: a one-line question leaves its spare space at the bottom of the row.
  question: {
    color: COLORS.text,
    fontSize: scale(28),
    lineHeight: QUESTION_LINE,
    fontWeight: '700',
  },
  // English API text keeps its own reading order (punctuation at the end) inside Arabic.
  leftToRight: { writingDirection: 'ltr' },
  answers: { flexDirection: 'row', gap: scale(32) },
  answer: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: scale(24),
    lineHeight: ANSWER_LINE,
  },
  right: { color: COLORS.correct },
  wrong: { color: COLORS.wrong },
  mark: {
    width: scale(200),
    alignItems: 'center',
    paddingVertical: scale(6),
    borderRadius: scale(8),
  },
  markRight: { backgroundColor: COLORS.correctSoft },
  markWrong: { backgroundColor: COLORS.wrongSoft },
  markText: { color: COLORS.text, fontSize: scale(22), fontWeight: '800' },
});
