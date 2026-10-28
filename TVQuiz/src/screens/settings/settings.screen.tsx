import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChoiceChip } from 'core/components/choice-chip/choice-chip';
import { SettingRow } from 'core/components/setting-row/setting-row';
import { LANGUAGE_NAMES } from 'core/constants/app.const';
import { SAFE_AREA } from 'core/constants/layout.const';
import { COLORS } from 'core/constants/theme-colors.const';
import { useLanguage } from 'core/i18n/language.context';
import { useNavigation } from 'core/navigation/navigation.context';
import { useSettings } from 'core/settings/settings.context';
import { scale } from 'core/utils/scale.utils';
import { Language } from 'types/language.interface';

const LANGUAGES: Language[] = ['en', 'ar'];
const NICKNAME_FOCUS_KEY = 'nickname';
const ABOUT_FOCUS_KEY = 'about';
const SIDE_WIDTH = scale(440);

/**
 * Every change applies at once and is saved on the device; there is no Save button.
 * Back returns to Home with focus on the Settings button.
 */
export function SettingsScreen() {
  const { t, setLanguage } = useLanguage();
  const { settings, updateSettings } = useSettings();
  const { navigate, rememberFocus, focusKey } = useNavigation();

  const openNickname = () => {
    rememberFocus(NICKNAME_FOCUS_KEY);
    navigate({ name: 'nickname' });
  };

  const openAbout = () => {
    rememberFocus(ABOUT_FOCUS_KEY);
    navigate({ name: 'about' });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.side}>
        <Text style={styles.title} accessibilityRole="header">
          {t.settings.title}
        </Text>
        <Text style={styles.subtitle}>{t.settings.savedAutomatically}</Text>
      </View>

      <View style={styles.rows}>
        <SettingRow
          icon="✎"
          label={t.settings.nickname}
          hint={t.settings.nicknameHint}
          // First visit and back from the keyboard: this card. Back from About: the About card.
          hasTVPreferredFocus={focusKey !== ABOUT_FOCUS_KEY}
          onPress={openNickname}
        >
          <Text style={styles.nickname} numberOfLines={1}>
            {settings.nickname}
          </Text>
        </SettingRow>

        <SettingRow
          icon="A"
          label={t.settings.language}
          hint={t.settings.languageHint}
        >
          {LANGUAGES.map(language => (
            <ChoiceChip
              key={language}
              label={LANGUAGE_NAMES[language]}
              selected={settings.language === language}
              onPress={() => setLanguage(language)}
            />
          ))}
        </SettingRow>

        <SettingRow
          icon="♪"
          label={t.settings.sound}
          hint={t.settings.soundHint}
        >
          <ChoiceChip
            label={t.settings.on}
            selected={settings.sound}
            onPress={() => updateSettings({ sound: true })}
          />
          <ChoiceChip
            label={t.settings.off}
            selected={!settings.sound}
            onPress={() => updateSettings({ sound: false })}
          />
        </SettingRow>

        <SettingRow
          icon="i"
          label={t.settings.about}
          hint={t.settings.aboutHint}
          hasTVPreferredFocus={focusKey === ABOUT_FOCUS_KEY}
          onPress={openAbout}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'row',
    gap: scale(64),
    paddingHorizontal: SAFE_AREA.horizontal,
    paddingVertical: SAFE_AREA.vertical,
  },
  side: { width: SIDE_WIDTH },
  title: { color: COLORS.text, fontSize: scale(64), fontWeight: '800' },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: scale(28),
    lineHeight: scale(40),
    marginTop: scale(12),
  },
  // Space above and between rows leaves room for the focus zoom.
  rows: { flex: 1, gap: scale(20), paddingTop: scale(12) },
  nickname: {
    maxWidth: scale(420),
    color: COLORS.accent,
    fontSize: scale(34),
    fontWeight: '800',
  },
});
