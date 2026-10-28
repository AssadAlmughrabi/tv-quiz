import React, { memo, useCallback, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AsyncView } from 'core/components/async-view/async-view';
import { Card } from 'core/components/card/card';
import { FocusGroup } from 'core/components/focus-group/focus-group';
import { CardRowSkeleton } from 'core/components/skeleton/skeleton';
import {
  CARD_BORDER,
  CARD_GAP,
  CARD_HEIGHT,
  CARD_WIDTH,
  CONTENT_WIDTH,
  RAIL_CARDS_PADDING,
  RAIL_HEIGHT,
  RAIL_TITLE_GAP,
  RAIL_TITLE_HEIGHT,
  RAIL_TOP_SPACE,
  SAFE_AREA,
} from 'core/constants/layout.const';
import { COLORS } from 'core/constants/theme-colors.const';
import { useAsyncData } from 'core/hooks/use-async-data';
import { useLanguage } from 'core/i18n/language.context';
import { quizService } from 'core/services/quiz.service';
import { formatNumber } from 'core/utils/format.utils';
import { scale } from 'core/utils/scale.utils';
import { Category } from 'types/category.interface';
import { Quiz } from 'types/quiz.interface';
import { TVPressable } from 'core/components/tv-pressable/tv-pressable';
import { FOCUS_GLOW } from 'core/constants/focus-glow.const';

interface CategoryRowProps {
  category: Category;
  /** Position in Home's list, passed back in onRowFocus so Home can scroll to this rail. */
  index: number;
  /** Key of the item to focus on return, from navigation focus memory. */
  focusKey: string | undefined;
  onQuizPress: (quiz: Quiz) => void;
  onSeeAllPress: (category: Category) => void;
  /** Called with the row's index when anything in it gets focus, so the page can scroll to it. */
  onRowFocus: (index: number) => void;
}

export const SEE_ALL_PREFIX = 'see-all:';
export const seeAllFocusKey = (categoryId: string) =>
  `${SEE_ALL_PREFIX}${categoryId}`;

export const categoryIdOfFocusKey = (key: string) =>
  key.startsWith(SEE_ALL_PREFIX)
    ? key.slice(SEE_ALL_PREFIX.length)
    : key.slice(0, key.lastIndexOf('-'));

/**
 * One category: its quizzes in a horizontal row, then a "See all" card.
 * Memoized: Home's list re-renders its rails while it scrolls, and a rail whose props did not
 * change must not redraw its cards. On an LG TV that redraw cost ~150 ms per Up/Down.
 * Home therefore passes stable callbacks and the index, not new inline functions.
 */
export const CategoryRow = memo(function CategoryRowContent({
  category,
  index,
  focusKey,
  onQuizPress,
  onSeeAllPress,
  onRowFocus,
}: CategoryRowProps) {
  const { lang, t } = useLanguage();
  const focusRow = useCallback(() => onRowFocus(index), [onRowFocus, index]);
  const quizzes = useAsyncData(
    () => quizService.getQuizzes(category.id, lang),
    [category.id, lang],
    () => quizService.peekQuizzes(category.id, lang),
  );
  const isEmpty = quizzes.status === 'empty';
  const seeAllPreferred = focusKey === seeAllFocusKey(category.id);

  const scrollRef = useRef<ScrollView>(null);
  /**
   * Scrolls the rail so the card at `position` ends inside the safe area. Android's own
   * scroll only shows just enough of a focused card, which left "See all" past the screen edge.
   * Left-to-right only: a right-to-left scroll position counts from the other side, differently
   * on Android and browsers, so Arabic keeps the platform's own scrolling.
   */
  const revealCard = (position: number) => {
    if (lang === 'ar') {
      return;
    }
    const cardRight =
      SAFE_AREA.horizontal + position * (CARD_WIDTH + CARD_GAP) + CARD_WIDTH;
    const visibleRight = SAFE_AREA.horizontal + CONTENT_WIDTH;
    scrollRef.current?.scrollTo({
      x: Math.max(0, cardRight - visibleRight),
      animated: false,
    });
  };
  const quizCount = quizzes.data?.length ?? 0;

  const seeAll = (
    <TVPressable
      accessibilityRole="button"
      accessibilityLabel={`${isEmpty ? t.home.noQuizzes : t.home.seeAll}: ${
        category.name
      }`}
      hasTVPreferredFocus={seeAllPreferred}
      onPress={() => onSeeAllPress(category)}
      onFocus={() => {
        focusRow();
        revealCard(quizCount);
      }}
      style={({ focused }) => [styles.seeAll, focused && styles.seeAllFocused]}
    >
      {/* Points the reading way. "→" is not mirrored by the text engine, unlike "›". */}
      <Text style={styles.seeAllIcon}>
        {isEmpty ? '∅' : lang === 'ar' ? '←' : '→'}
      </Text>
      <Text style={styles.seeAllText}>
        {isEmpty ? t.home.noQuizzes : t.home.seeAll}
      </Text>
    </TVPressable>
  );

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <View style={styles.accentBar} />
        <Text style={styles.title}>{category.name}</Text>
      </View>
      {/* One rail = one focus group: entering it goes to the item last used in it,
          and Left/Right never leave it. */}
      <FocusGroup trapHorizontal>
        {isEmpty ? (
          <View style={styles.list}>{seeAll}</View>
        ) : (
          <AsyncView
            status={quizzes.status}
            onRetry={quizzes.retry}
            loading={<CardRowSkeleton />}
          >
            {() => (
              // A plain ScrollView, not a FlatList: a rail has only a few cards, and a list
              // nested in Home's list re-renders all its cards on every frame Home scrolls.
              <ScrollView
                ref={scrollRef}
                horizontal
                contentContainerStyle={styles.list}
                showsHorizontalScrollIndicator={false}
              >
                {quizzes.data?.map((item, position) => (
                  <Card
                    key={item.id}
                    title={item.title}
                    artwork={item.artwork}
                    badge={t.difficulty[item.difficulty]}
                    meta={`${t.quiz.questions}: ${formatNumber(
                      item.questionCount,
                      lang,
                    )}`}
                    hasTVPreferredFocus={focusKey === item.id}
                    onFocus={() => {
                      focusRow();
                      revealCard(position);
                    }}
                    onPress={() => onQuizPress(item)}
                  />
                ))}
                {seeAll}
              </ScrollView>
            )}
          </AsyncView>
        )}
      </FocusGroup>
    </View>
  );
});

const styles = StyleSheet.create({
  // Fixed height in every state, so Home's list knows where each rail is.
  row: { height: RAIL_HEIGHT, paddingTop: RAIL_TOP_SPACE },
  header: {
    height: RAIL_TITLE_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(14),
    paddingHorizontal: SAFE_AREA.horizontal,
    marginBottom: RAIL_TITLE_GAP,
  },
  accentBar: {
    width: scale(6),
    height: scale(34),
    borderRadius: scale(3),
    backgroundColor: COLORS.focus,
  },
  title: {
    color: COLORS.text,
    fontSize: scale(34),
    lineHeight: RAIL_TITLE_HEIGHT,
    fontWeight: '700',
  },
  // Padding on the content, not the list, so the next card can peek past the right edge.
  // Vertical padding leaves room for the focus zoom.
  list: {
    paddingHorizontal: SAFE_AREA.horizontal,
    paddingVertical: RAIL_CARDS_PADDING,
    gap: CARD_GAP,
  },
  seeAll: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: scale(14),
    borderWidth: CARD_BORDER,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(12),
    padding: scale(16),
  },
  seeAllFocused: {
    borderColor: COLORS.focus,
    backgroundColor: COLORS.surfaceRaised,
    transform: [{ scale: 1.06 }],
    ...FOCUS_GLOW,
  },
  seeAllIcon: { color: COLORS.focus, fontSize: scale(56), fontWeight: '300' },
  seeAllText: {
    color: COLORS.text,
    fontSize: scale(26),
    fontWeight: '600',
    textAlign: 'center',
  },
});
