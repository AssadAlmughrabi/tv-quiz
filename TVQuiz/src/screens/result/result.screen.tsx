import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { FocusableButton } from 'core/components/focusable-button/focusable-button';
import {
  REVIEW_ROW_GAP,
  REVIEW_ROW_HEIGHT,
  ReviewRow,
} from 'core/components/review-row/review-row';
import { ScoreStatus } from 'core/components/score-status/score-status';
import { SAFE_AREA } from 'core/constants/layout.const';
import { COLORS } from 'core/constants/theme-colors.const';
import { useSubmitScore } from 'core/hooks/use-submit-score';
import { useLanguage } from 'core/i18n/language.context';
import { useSettings } from 'core/settings/settings.context';
import { ScreenProps, useNavigation } from 'core/navigation/navigation.context';
import { formatNumber } from 'core/utils/format.utils';
import { scale } from 'core/utils/scale.utils';
import { ReviewItem } from 'types/score.interface';

const ITEM_LENGTH = REVIEW_ROW_HEIGHT + REVIEW_ROW_GAP;

/**
 * Score and correct count on top, then every answer. The quiz screen was replaced
 * by this one, so Back pops to where the quiz was started (Category or Home).
 */
export function ResultScreen({ route }: ScreenProps<'result'>) {
  const { result } = route.params;
  const { lang, t } = useLanguage();
  const { navigate } = useNavigation();
  const { nickname } = useSettings().settings;
  const submit = useSubmitScore(result, nickname);
  // On TV the list sits inside a focus guide that ignores flex, so it needs a real height:
  // measure the space left under the header and give the list exactly that.
  const [listHeight, setListHeight] = useState(0);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.titles}>
          <Text style={styles.title} accessibilityRole="header">
            {t.result.title}
          </Text>
          <Text style={styles.quizTitle} numberOfLines={1}>
            {result.quizTitle}
          </Text>
          <ScoreStatus state={submit} />
        </View>

        <View style={styles.tile}>
          <Text style={styles.label}>{t.result.score}</Text>
          <Text style={[styles.value, styles.score]}>
            {formatNumber(result.score, lang)}
          </Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.label}>{t.result.correctAnswers}</Text>
          <Text style={styles.value}>
            {formatNumber(result.correctCount, lang)} /{' '}
            {formatNumber(result.total, lang)}
          </Text>
        </View>
        <FocusableButton
          label={t.result.leaderboard}
          hasTVPreferredFocus
          style={styles.button}
          onPress={() =>
            navigate({
              name: 'leaderboard',
              params: { quizId: result.quizId, quizTitle: result.quizTitle },
            })
          }
        />
      </View>

      <Text style={styles.reviewTitle}>{t.result.review}</Text>
      <View
        style={styles.listArea}
        onLayout={e => setListHeight(e.nativeEvent.layout.height)}
      >
        <FlatList
          style={{ height: listHeight }}
          data={result.review}
          keyExtractor={keyOf}
          renderItem={({ item, index }) => (
            <View style={styles.rowCell}>
              <ReviewRow item={item} index={index} />
            </View>
          )}
          // Fixed row height: the list knows every row's place without measuring.
          getItemLayout={(_, index) => ({
            length: ITEM_LENGTH,
            offset: ITEM_LENGTH * index,
            index,
          })}
          initialNumToRender={5}
          windowSize={5}
          // Clipped rows lose focus on Android TV; the window keeps the count low anyway.
          removeClippedSubviews={false}
          // Moved by focus, not by a mouse: no scroll bar.
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const keyOf = (item: ReviewItem) => item.questionId;

const TILE_HEIGHT = scale(150);

const styles = StyleSheet.create({
  // The list ends at the bottom safe margin too, so no row sits in the overscan area.
  screen: {
    flex: 1,
    paddingHorizontal: SAFE_AREA.horizontal,
    paddingVertical: SAFE_AREA.vertical,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(24),
    marginBottom: scale(32),
  },
  titles: { flex: 1 },
  title: { color: COLORS.text, fontSize: scale(52), fontWeight: '800' },
  quizTitle: {
    color: COLORS.textMuted,
    fontSize: scale(30),
    lineHeight: scale(40),
    marginBottom: scale(8),
  },
  tile: {
    width: scale(280),
    height: TILE_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: scale(28),
    borderRadius: scale(16),
    backgroundColor: COLORS.surface,
  },
  label: { color: COLORS.textMuted, fontSize: scale(24) },
  value: {
    color: COLORS.text,
    fontSize: scale(60),
    lineHeight: scale(72),
    fontWeight: '800',
  },
  score: { color: COLORS.accent },
  button: {
    height: TILE_HEIGHT,
    justifyContent: 'center',
    marginStart: scale(8),
  },
  reviewTitle: {
    color: COLORS.text,
    fontSize: scale(36),
    fontWeight: '800',
    marginBottom: scale(16),
  },
  listArea: { flex: 1 },
  rowCell: { height: ITEM_LENGTH, paddingBottom: REVIEW_ROW_GAP },
});
