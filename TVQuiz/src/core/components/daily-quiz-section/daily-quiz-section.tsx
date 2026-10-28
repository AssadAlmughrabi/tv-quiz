import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AsyncView } from 'core/components/async-view/async-view';
import { DailyQuizHero } from 'core/components/daily-quiz-hero/daily-quiz-hero';
import { SkeletonBox } from 'core/components/skeleton/skeleton';
import {
  CONTENT_WIDTH,
  HERO_HEIGHT,
  SAFE_AREA,
} from 'core/constants/layout.const';
import { AsyncStatus } from 'core/hooks/use-async-data';
import { scale } from 'core/utils/scale.utils';
import { Quiz } from 'types/quiz.interface';

interface DailyQuizSectionProps {
  status: AsyncStatus;
  quiz: Quiz | undefined;
  onRetry: () => void;
  onPress: (quiz: Quiz) => void;
  onFocus?: () => void;
  hasFocus: boolean;
}

export function DailyQuizSection({
  status,
  quiz,
  onRetry,
  onPress,
  onFocus,
  hasFocus,
}: DailyQuizSectionProps) {
  return (
    <View style={styles.hero}>
      <AsyncView
        status={status}
        onRetry={onRetry}
        takeFocus={hasFocus}
        loading={
          <SkeletonBox
            width={CONTENT_WIDTH}
            height={HERO_HEIGHT}
            radius={scale(20)}
          />
        }
      >
        {() =>
          quiz && (
            <DailyQuizHero
              quiz={quiz}
              hasTVPreferredFocus={hasFocus}
              onFocus={onFocus}
              onPress={() => onPress(quiz)}
            />
          )
        }
      </AsyncView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: HERO_HEIGHT, paddingHorizontal: SAFE_AREA.horizontal },
});
