import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Badge } from 'core/components/badge/badge';
import {
  CARD_BORDER,
  CARD_HEIGHT,
  CARD_IMAGE_HEIGHT,
  CARD_META_LINE_HEIGHT,
  CARD_TEXT_PADDING,
  CARD_TITLE_LINE_HEIGHT,
  CARD_WIDTH,
} from 'core/constants/layout.const';
import { COLORS } from 'core/constants/theme-colors.const';
import { scale } from 'core/utils/scale.utils';
import { Artwork } from 'types/category.interface';
import { TVPressable } from 'core/components/tv-pressable/tv-pressable';
import { FOCUS_GLOW } from 'core/constants/focus-glow.const';

interface CardProps {
  title: string;
  artwork: Artwork;
  onPress: () => void;
  /** Short label on the image, e.g. the difficulty. */
  badge?: string;
  /** One line under the title, e.g. "Questions: 10". */
  meta?: string;
  onFocus?: () => void;
  hasTVPreferredFocus?: boolean;
}

/**
 * Artwork card. Every part has a fixed size (same frame for every artwork shape, two title
 * lines, one meta line), so all cards line up and nothing moves while images load.
 */
export function Card({
  title,
  artwork,
  onPress,
  badge,
  meta,
  onFocus,
  hasTVPreferredFocus,
}: CardProps) {
  return (
    <TVPressable
      accessibilityRole="button"
      accessibilityLabel={[title, badge, meta].filter(Boolean).join(', ')}
      hasTVPreferredFocus={hasTVPreferredFocus}
      onPress={onPress}
      onFocus={onFocus}
      style={({ focused }) => [styles.card, focused && styles.focused]}
    >
      <View style={styles.imageBox}>
        <Image
          source={{ uri: artwork.url }}
          style={styles.image}
          resizeMode="cover"
        />
        {badge && (
          <View style={styles.badge}>
            <Badge label={badge} />
          </View>
        )}
      </View>
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {meta && (
          <Text style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
        )}
      </View>
    </TVPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: scale(14),
    borderWidth: CARD_BORDER,
    borderColor: 'transparent',
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  focused: {
    borderColor: COLORS.focus,
    backgroundColor: COLORS.surfaceRaised,
    transform: [{ scale: 1.06 }],
    ...FOCUS_GLOW,
  },
  imageBox: { height: CARD_IMAGE_HEIGHT, backgroundColor: COLORS.background },
  image: { width: '100%', height: '100%' },
  badge: { position: 'absolute', top: scale(12), start: scale(12) },
  text: { padding: CARD_TEXT_PADDING },
  title: {
    color: COLORS.text,
    fontSize: scale(24),
    fontWeight: '600',
    lineHeight: CARD_TITLE_LINE_HEIGHT,
    height: CARD_TITLE_LINE_HEIGHT * 2,
  },
  meta: {
    color: COLORS.textMuted,
    fontSize: scale(20),
    lineHeight: CARD_META_LINE_HEIGHT,
    height: CARD_META_LINE_HEIGHT,
  },
});
