import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FocusableButton } from 'core/components/focusable-button/focusable-button';
import { InfoRow } from 'core/components/info-row/info-row';
import { SAFE_AREA } from 'core/constants/layout.const';
import { COLORS } from 'core/constants/theme-colors.const';
import { useLanguage } from 'core/i18n/language.context';
import { useNavigation } from 'core/navigation/navigation.context';
import { platform } from 'core/platform/platform';
import { scale } from 'core/utils/scale.utils';
import { DeviceInfo } from 'types/platform.interface';

const SIDE_WIDTH = scale(440);

/**
 * The device model, its system version and the app version, read from the platform.
 * Only the Back button takes focus; Back on the remote does the same.
 */
export function AboutScreen() {
  const { t } = useLanguage();
  const { goBack } = useNavigation();
  const [info, setInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    let active = true;
    platform
      .getDeviceInfo()
      .then(next => active && setInfo(next))
      // Unknown values stay as dashes; the screen still works.
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.side}>
        <Text style={styles.title} accessibilityRole="header">
          {t.about.title}
        </Text>
        <Text style={styles.subtitle}>{t.about.subtitle}</Text>
        <Text style={styles.appName}>{t.home.title}</Text>
      </View>

      <View style={styles.content}>
        <InfoRow label={t.about.model} value={info?.model ?? null} />
        <InfoRow label={t.about.system} value={info?.osVersion ?? null} />
        <InfoRow label={t.about.appVersion} value={info?.appVersion ?? null} />
        <FocusableButton
          label={t.common.back}
          onPress={goBack}
          hasTVPreferredFocus
          style={styles.back}
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
  appName: {
    color: COLORS.accent,
    fontSize: scale(40),
    fontWeight: '800',
    marginTop: scale(40),
  },
  content: { flex: 1, gap: scale(20), paddingTop: scale(12) },
  back: { alignSelf: 'flex-start', marginTop: scale(20) },
});
