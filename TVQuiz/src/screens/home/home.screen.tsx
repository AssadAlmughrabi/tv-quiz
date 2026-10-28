import React, { useCallback, useRef } from 'react';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';
import {
  CategoryRow,
  categoryIdOfFocusKey,
  seeAllFocusKey,
} from 'core/components/category-row/category-row';
import { DailyQuizSection } from 'core/components/daily-quiz-section/daily-quiz-section';
import { ErrorBoundary } from 'core/components/error-boundary/error-boundary';
import { ExitAppDialog } from 'core/components/exit-app-dialog/exit-app-dialog';
import { HomeTopBar } from 'core/components/home-top-bar/home-top-bar';
import { RailError } from 'core/components/rail-error/rail-error';
import { RailsStatus } from 'core/components/rails-status/rails-status';
import {
  FOCUSED_ROW_OFFSET,
  HOME_HEADER_HEIGHT,
  RAIL_HEIGHT,
  SAFE_AREA,
} from 'core/constants/layout.const';
import { useAsyncData } from 'core/hooks/use-async-data';
import { useLanguage } from 'core/i18n/language.context';
import { useNavigation } from 'core/navigation/navigation.context';
import { quizService } from 'core/services/quiz.service';
import { scale } from 'core/utils/scale.utils';
import { Category } from 'types/category.interface';
import { Quiz } from 'types/quiz.interface';

const DAILY_FOCUS_KEY = 'daily';
const SETTINGS_FOCUS_KEY = 'settings';

const railOffset = (index: number) => HOME_HEADER_HEIGHT + RAIL_HEIGHT * index;

function railIndexOf(
  key: string | undefined,
  categories: Category[] | undefined,
): number {
  if (!key || !categories) {
    return -1;
  }
  const categoryId = categoryIdOfFocusKey(key);
  return categories.findIndex(c => c.id === categoryId);
}

export function HomeScreen() {
  const { lang } = useLanguage();
  const { navigate, rememberFocus, focusKey } = useNavigation();
  const daily = useAsyncData(
    () => quizService.getDailyQuiz(lang),
    [lang],
    () => quizService.peekDailyQuiz(lang),
  );
  const categories = useAsyncData(
    () => quizService.getCategories(lang),
    [lang],
    () => quizService.peekCategories(lang),
  );
  const listRef = useRef<FlatList<Category>>(null);

  const startKey = focusKey ?? DAILY_FOCUS_KEY;

  const startRail = railIndexOf(focusKey, categories.data);

  const scrollToRail = useCallback(
    (index: number) =>
      listRef.current?.scrollToOffset({
        offset: Math.max(0, railOffset(index) - FOCUSED_ROW_OFFSET),
        animated: false,
      }),
    [],
  );
  const scrollToTop = () =>
    listRef.current?.scrollToOffset({ offset: 0, animated: false });

  const openQuiz = useCallback(
    (quiz: Quiz, key: string) => {
      rememberFocus(key);
      navigate({ name: 'question', params: { quizId: quiz.id } });
    },
    [rememberFocus, navigate],
  );

  const openRailQuiz = useCallback(
    (quiz: Quiz) => openQuiz(quiz, quiz.id),
    [openQuiz],
  );

  const openCategory = useCallback(
    (category: Category) => {
      rememberFocus(seeAllFocusKey(category.id));
      navigate({ name: 'category', params: { categoryId: category.id } });
    },
    [rememberFocus, navigate],
  );

  const openSettings = () => {
    rememberFocus(SETTINGS_FOCUS_KEY);
    navigate({ name: 'settings' });
  };

  const renderRail: ListRenderItem<Category> = useCallback(
    ({ item: category, index }) => (
      <ErrorBoundary
        renderFallback={reset => (
          <RailError title={category.name} onRetry={reset} />
        )}
      >
        <CategoryRow
          category={category}
          index={index}
          focusKey={startKey}
          onQuizPress={openRailQuiz}
          onSeeAllPress={openCategory}
          onRowFocus={scrollToRail}
        />
      </ErrorBoundary>
    ),
    [startKey, openRailQuiz, openCategory, scrollToRail],
  );

  const header = (
    <View style={styles.header}>
      <HomeTopBar
        settingsHasFocus={startKey === SETTINGS_FOCUS_KEY}
        onSettingsFocus={scrollToTop}
        onSettingsPress={openSettings}
      />
      <DailyQuizSection
        status={daily.status}
        quiz={daily.data}
        onRetry={daily.retry}
        hasFocus={startKey === DAILY_FOCUS_KEY}
        onFocus={scrollToTop}
        onPress={quiz => openQuiz(quiz, DAILY_FOCUS_KEY)}
      />
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        ref={listRef}
        data={categories.status === 'ready' ? categories.data : []}
        keyExtractor={category => category.id}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <RailsStatus
            status={categories.status}
            onRetry={categories.retry}
            takeFocus={
              startKey !== DAILY_FOCUS_KEY && startKey !== SETTINGS_FOCUS_KEY
            }
          />
        }
        renderItem={renderRail}
        getItemLayout={(_, index) => ({
          length: RAIL_HEIGHT,
          offset: railOffset(index),
          index,
        })}
        initialScrollIndex={startRail > 0 ? startRail : undefined}
        initialNumToRender={4}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      />
      <ExitAppDialog />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: scale(600) },
  header: { height: HOME_HEADER_HEIGHT, paddingTop: SAFE_AREA.vertical },
});
