import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS } from 'core/constants/theme-colors.const';
import { useLanguage } from 'core/i18n/language.context';
import { formatNumber } from 'core/utils/format.utils';
import { scale } from 'core/utils/scale.utils';

interface CountdownBarProps {
  remainingMs: number;
  limitMs: number;
  /** False while paused or showing feedback: the bar stops where it is. */
  running: boolean;
  /** Changes for every question, so the bar restarts full. */
  questionKey: string;
}

const LOW_FRACTION = 0.25;

/**
 * Time left as a shrinking bar plus the seconds as a number, so it never relies on colour alone.
 * The bar is one animation per question, run by the native animation driver, so it stays smooth
 * on slow TVs and does not compete with key presses on the JS thread.
 */
export function CountdownBar({
  remainingMs,
  limitMs,
  running,
  questionKey,
}: CountdownBarProps) {
  const { lang, t } = useLanguage();
  const progress = useRef(new Animated.Value(remainingMs / limitMs)).current;

  useEffect(() => {
    progress.stopAnimation();
    progress.setValue(remainingMs / limitMs);
    if (running && remainingMs > 0) {
      Animated.timing(progress, {
        toValue: 0,
        duration: remainingMs,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
    return () => progress.stopAnimation();
    // Restart only when the question changes or it pauses/resumes, not on every clock tick.
  }, [running, questionKey]);

  const low = remainingMs / limitMs < LOW_FRACTION;

  return (
    <View style={styles.wrapper}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            low && styles.fillLow,
            // Shrinks toward the reading start: left in English, right in Arabic.
            lang === 'ar' ? styles.fromRight : styles.fromLeft,
            { transform: [{ scaleX: progress }] },
          ]}
        />
      </View>
      {/* Aligned by its box, not textAlign: flex-end follows the direction on every target. */}
      <View style={styles.secondsBox}>
        <Text style={[styles.seconds, low && styles.secondsLow]}>
          {formatNumber(Math.ceil(remainingMs / 1000), lang)}
          {t.question.secondsShort}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', gap: scale(20) },
  track: {
    flex: 1,
    height: scale(14),
    borderRadius: scale(7),
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  // Full width, shrunk with scaleX from its start edge.
  fill: {
    width: '100%',
    height: '100%',
    borderRadius: scale(7),
    backgroundColor: COLORS.focus,
  },
  fromLeft: { transformOrigin: 'left' },
  fromRight: { transformOrigin: 'right' },
  fillLow: { backgroundColor: COLORS.wrong },
  // Fixed width, so the bar does not jump when the number changes from 10 to 9.
  secondsBox: { width: scale(90), alignItems: 'flex-end' },
  seconds: {
    color: COLORS.text,
    fontSize: scale(32),
    fontWeight: '800',
  },
  secondsLow: { color: COLORS.wrong },
});
