import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FocusableButton } from 'core/components/focusable-button/focusable-button';
import {
  SAFE_AREA,
  TOP_BAR_GAP,
  TOP_BAR_HEIGHT,
} from 'core/constants/layout.const';
import { COLORS } from 'core/constants/theme-colors.const';
import { useLanguage } from 'core/i18n/language.context';
import { scale } from 'core/utils/scale.utils';

interface HomeTopBarProps {
  onSettingsPress: () => void;
  onSettingsFocus?: () => void;
  settingsHasFocus?: boolean;
}

export function HomeTopBar({
  onSettingsPress,
  onSettingsFocus,
  settingsHasFocus,
}: HomeTopBarProps) {
  const { t } = useLanguage();

  return (
    <View style={styles.topBar}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>?</Text>
        </View>
        <Text style={styles.title}>{t.home.title}</Text>
      </View>
      <FocusableButton
        icon="⚙"
        label={t.home.settings}
        hasTVPreferredFocus={settingsHasFocus}
        onFocus={onSettingsFocus}
        onPress={onSettingsPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: TOP_BAR_HEIGHT,
    marginBottom: TOP_BAR_GAP,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SAFE_AREA.horizontal,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: scale(18) },
  logo: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(16),
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: COLORS.background,
    fontSize: scale(44),
    fontWeight: '900',
  },
  title: { color: COLORS.text, fontSize: scale(48), fontWeight: '800' },
});
