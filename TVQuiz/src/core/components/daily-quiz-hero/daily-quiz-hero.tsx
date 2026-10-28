import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { CONTENT_WIDTH, HERO_HEIGHT } from 'core/constants/layout.const';
import { COLORS } from 'core/constants/theme-colors.const';
import { useLanguage } from 'core/i18n/language.context';
import { formatNumber } from 'core/utils/format.utils';
import { scale } from 'core/utils/scale.utils';
import { Quiz } from 'types/quiz.interface';
import { TVPressable } from 'core/components/tv-pressable/tv-pressable';
import { FOCUS_GLOW } from 'core/constants/focus-glow.const';

interface DailyQuizHeroProps {
  quiz: Quiz;
  onPress: () => void;
  onFocus?: () => void;
  hasTVPreferredFocus?: boolean;
}

/** Full-width banner. The image fills it; a dark panel behind the text keeps it readable. */
export function DailyQuizHero({
  quiz,
  onPress,
  onFocus,
  hasTVPreferredFocus,
}: DailyQuizHeroProps) {
  const { lang, t } = useLanguage();
  const meta = `${t.quiz.questions}: ${formatNumber(
    quiz.questionCount,
    lang,
  )}  ·  ${formatNumber(quiz.secondsPerQuestion, lang)} ${t.quiz.secondsEach}`;

  return (
    <TVPressable
      accessibilityRole="button"
      accessibilityLabel={`${t.home.dailyQuiz}: ${quiz.title}, ${meta}`}
      hasTVPreferredFocus={hasTVPreferredFocus}
      onPress={onPress}
      onFocus={onFocus}
      style={({ focused }) => [styles.hero, focused && styles.focused]}
    >
      {({ focused }) => (
        <>
          <Image
            source={{ uri: quiz.artwork.url }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.panel}>
            <View style={styles.label}>
              <Text style={styles.labelText}>★ {t.home.dailyQuiz}</Text>
            </View>
            <Text style={styles.title} numberOfLines={2}>
              {quiz.title}
            </Text>
            <Text style={styles.meta}>{meta}</Text>
            <View style={[styles.play, focused && styles.playFocused]}>
              <Text
                style={[styles.playText, focused && styles.playTextFocused]}
              >
                ▶ {t.home.play}
              </Text>
            </View>
          </View>
        </>
      )}
    </TVPressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: CONTENT_WIDTH,
    height: HERO_HEIGHT,
    borderRadius: scale(20),
    borderWidth: scale(4),
    borderColor: 'transparent',
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  focused: {
    borderColor: COLORS.focus,
    transform: [{ scale: 1.02 }],
    ...FOCUS_GLOW,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
  },
  panel: {
    width: '55%',
    height: '100%',
    backgroundColor: COLORS.scrim,
    paddingHorizontal: scale(56),
    justifyContent: 'center',
    gap: scale(18),
  },
  label: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent,
    borderRadius: scale(8),
    paddingHorizontal: scale(14),
    paddingVertical: scale(4),
  },
  labelText: {
    color: COLORS.background,
    fontSize: scale(22),
    fontWeight: '800',
  },
  title: {
    color: COLORS.text,
    fontSize: scale(56),
    fontWeight: '800',
    lineHeight: scale(66),
  },
  meta: { color: COLORS.textMuted, fontSize: scale(24) },
  play: {
    alignSelf: 'flex-start',
    borderRadius: scale(12),
    borderWidth: scale(3),
    borderColor: COLORS.text,
    paddingHorizontal: scale(28),
    paddingVertical: scale(12),
  },
  playFocused: { backgroundColor: COLORS.text },
  playText: { color: COLORS.text, fontSize: scale(28), fontWeight: '700' },
  playTextFocused: { color: COLORS.background },
});
