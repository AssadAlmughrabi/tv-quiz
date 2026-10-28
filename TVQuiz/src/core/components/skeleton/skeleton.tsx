import React, { useEffect } from 'react';
import {
  Animated,
  DimensionValue,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {
  CARD_GAP,
  CARD_HEIGHT,
  CARD_IMAGE_HEIGHT,
  CARD_TEXT_PADDING,
  CARD_WIDTH,
  RAIL_CARDS_PADDING,
  RAIL_HEIGHT,
  RAIL_TITLE_GAP,
  RAIL_TITLE_HEIGHT,
  RAIL_TOP_SPACE,
  SAFE_AREA,
} from 'core/constants/layout.const';
import { COLORS } from 'core/constants/theme-colors.const';
import { scale } from 'core/utils/scale.utils';

/**
 * One pulse shared by every skeleton on screen, so 40 placeholders cost one animation, not 40.
 * It runs only while at least one skeleton is mounted.
 */
const pulse = new Animated.Value(0.45);
let users = 0;
let loop: Animated.CompositeAnimation | null = null;

function startPulse() {
  users += 1;
  if (users === 1) {
    const useNativeDriver = Platform.OS !== 'web';
    loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver,
        }),
      ]),
    );
    loop.start();
  }
}

function stopPulse() {
  users -= 1;
  if (users === 0) {
    loop?.stop();
    loop = null;
  }
}

interface SkeletonBoxProps {
  width: DimensionValue;
  height: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/** Grey placeholder with a soft pulse, in the exact size of the content that will replace it. */
export function SkeletonBox({
  width,
  height,
  radius = scale(8),
  style,
}: SkeletonBoxProps) {
  useEffect(() => {
    startPulse();
    return stopPulse;
  }, []);

  return (
    <Animated.View
      style={[
        styles.box,
        { width, height, borderRadius: radius, opacity: pulse },
        style,
      ]}
    />
  );
}

/** Same size as Card: image, two title lines, one meta line. */
export function CardSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonBox width="100%" height={CARD_IMAGE_HEIGHT} radius={0} />
      <View style={styles.cardText}>
        <SkeletonBox width="85%" height={scale(24)} />
        <SkeletonBox width="40%" height={scale(20)} style={styles.meta} />
      </View>
    </View>
  );
}

/** A row of card placeholders, laid out like a rail. */
export function CardRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </View>
  );
}

/** A whole rail placeholder: title bar + card row. */
export function RailSkeleton() {
  return (
    <View style={styles.rail}>
      <View style={styles.railTitle}>
        <SkeletonBox width={scale(320)} height={scale(34)} />
      </View>
      <CardRowSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: COLORS.surfaceRaised },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: scale(14),
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  cardText: { padding: CARD_TEXT_PADDING, gap: scale(12) },
  meta: { marginTop: scale(26) },
  // Same padding and gap as a real rail, so cards appear exactly where the skeletons were.
  row: {
    flexDirection: 'row',
    gap: CARD_GAP,
    paddingHorizontal: SAFE_AREA.horizontal,
    paddingVertical: RAIL_CARDS_PADDING,
    overflow: 'hidden',
  },
  rail: { height: RAIL_HEIGHT, paddingTop: RAIL_TOP_SPACE },
  railTitle: {
    height: RAIL_TITLE_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: SAFE_AREA.horizontal,
    marginBottom: RAIL_TITLE_GAP,
  },
});
