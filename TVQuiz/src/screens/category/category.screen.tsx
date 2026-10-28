import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AsyncView } from 'core/components/async-view/async-view';
import { Card } from 'core/components/card/card';
import { CardSkeleton } from 'core/components/skeleton/skeleton';
import { CARD_GAP, SAFE_AREA } from 'core/constants/layout.const';
import { COLORS } from 'core/constants/theme-colors.const';
import { useAsyncData } from 'core/hooks/use-async-data';
import { useLanguage } from 'core/i18n/language.context';
import { ScreenProps, useNavigation } from 'core/navigation/navigation.context';
import { quizService } from 'core/services/quiz.service';
import { formatNumber } from 'core/utils/format.utils';
import { scale } from 'core/utils/scale.utils';
import { Quiz } from 'types/quiz.interface';

export function CategoryScreen({ route }: ScreenProps<'category'>) {
  const { categoryId } = route.params;
  const { lang, t } = useLanguage();
  const { navigate, goBack, rememberFocus, focusKey } = useNavigation();
  const quizzes = useAsyncData(
    () => quizService.getQuizzes(categoryId, lang),
    [categoryId, lang],
    () => quizService.peekQuizzes(categoryId, lang),
  );

  const categoryNames: Record<string, string> = t.categories;
  const title = categoryNames[categoryId] ?? categoryId;

  const openQuiz = (quiz: Quiz) => {
    rememberFocus(quiz.id);
    navigate({ name: 'question', params: { quizId: quiz.id } });
  };

  // First visit: the first quiz. Returning: the quiz that was played.
  const startId = focusKey ?? quizzes.data?.[0]?.id;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.accentBar} />
        <View>
          <Text style={styles.title}>{title}</Text>
          {quizzes.data && (
            <Text style={styles.count}>
              {t.category.quizzes}: {formatNumber(quizzes.data.length, lang)}
            </Text>
          )}
        </View>
      </View>

      <AsyncView
        status={quizzes.status}
        onRetry={quizzes.retry}
        takeFocus
        loading={
          <View style={styles.grid}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </View>
        }
        emptyMessage={t.home.noQuizzes}
        emptyAction={{ label: t.category.backToHome, onPress: goBack }}
      >
        {() => (
          <View style={styles.grid}>
            {quizzes.data?.map(quiz => (
              <Card
                key={quiz.id}
                title={quiz.title}
                artwork={quiz.artwork}
                badge={t.difficulty[quiz.difficulty]}
                meta={`${t.quiz.questions}: ${formatNumber(
                  quiz.questionCount,
                  lang,
                )}`}
                hasTVPreferredFocus={quiz.id === startId}
                onPress={() => openQuiz(quiz)}
              />
            ))}
          </View>
        )}
      </AsyncView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SAFE_AREA.horizontal,
    paddingVertical: SAFE_AREA.vertical,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(18),
    marginBottom: scale(32),
  },
  accentBar: {
    width: scale(8),
    height: scale(84),
    borderRadius: scale(4),
    backgroundColor: COLORS.focus,
  },
  title: { color: COLORS.text, fontSize: scale(52), fontWeight: '800' },
  count: { color: COLORS.textMuted, fontSize: scale(26), marginTop: scale(4) },
  // Every card has the same height, so mixed widths still wrap into straight lines.
  // Vertical padding leaves room for the focus zoom.
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    paddingVertical: scale(20),
  },
});
