import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { COLORS } from 'core/constants/theme-colors.const';
import { useLanguage } from 'core/i18n/language.context';
import { scale } from 'core/utils/scale.utils';

interface TVImageProps {
  uri: string;
  width: number;
  height: number;
}

/**
 * Image in a box of fixed size. The box is there before the image arrives, so nothing moves
 * when it loads, and a broken image shows a placeholder instead of an empty hole.
 */
export function TVImage({ uri, width, height }: TVImageProps) {
  const { t } = useLanguage();
  const [failed, setFailed] = useState(false);

  return (
    <View style={[styles.box, { width, height }]}>
      {failed ? (
        <View
          style={styles.placeholder}
          accessibilityLabel={t.question.imageUnavailable}
        >
          <Text style={styles.icon}>🖼</Text>
          <Text style={styles.text}>{t.question.imageUnavailable}</Text>
        </View>
      ) : (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: scale(16),
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(12),
  },
  icon: { fontSize: scale(56), color: COLORS.textMuted },
  text: { color: COLORS.textMuted, fontSize: scale(24) },
});
