import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TVPressable } from 'core/components/tv-pressable/tv-pressable';
import { FOCUS_GLOW } from 'core/constants/focus-glow.const';
import { COLORS } from 'core/constants/theme-colors.const';
import { directionProps } from 'core/i18n/direction';
import { useLanguage } from 'core/i18n/language.context';
import { scale } from 'core/utils/scale.utils';

export const SETTING_ROW_HEIGHT = scale(136);

interface SettingRowProps {
  /** Symbol in the tile at the start of the row. */
  icon: string;
  label: string;
  /** One line under the label saying what the setting does. */
  hint: string;
  /** Shown at the end: chips or buttons (row not focusable), or a value (focusable row). */
  children?: ReactNode;
  /** When given, the whole row is one focusable card and Enter runs this. */
  onPress?: () => void;
  hasTVPreferredFocus?: boolean;
}

/**
 * One setting: icon, name and hint at the start, controls or value at the end, fixed height.
 * With onPress the whole card takes focus (a big target is easier with a remote);
 * without it, the controls inside take focus one by one.
 */
export function SettingRow({
  icon,
  label,
  hint,
  children,
  onPress,
  hasTVPreferredFocus,
}: SettingRowProps) {
  const { lang } = useLanguage();
  const content = (focused: boolean) => (
    <>
      <View style={[styles.iconTile, focused && styles.iconTileFocused]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.hint} numberOfLines={1}>
          {hint}
        </Text>
      </View>
      <View style={styles.end}>
        {children}
        {/* A card that opens something ends with an arrow pointing the reading way.
            Drawn as a turned corner, not a text arrow: text engines flip arrows in RTL. */}
        {onPress && (
          // Left-to-right box: Android would otherwise swap the right border in Arabic.
          <View {...LTR} style={LTR.style}>
            <View
              style={[styles.chevron, lang === 'ar' && styles.chevronBack]}
            />
          </View>
        )}
      </View>
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content(false)}</View>;
  }

  return (
    <TVPressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${hint}`}
      hasTVPreferredFocus={hasTVPreferredFocus}
      onPress={onPress}
      style={({ focused }) => [
        styles.row,
        styles.card,
        focused && styles.focused,
      ]}
    >
      {({ focused }) => content(focused)}
    </TVPressable>
  );
}

const ICON_TILE = scale(72);
const LTR = directionProps('en');

const styles = StyleSheet.create({
  row: {
    height: SETTING_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(28),
    paddingHorizontal: scale(28),
    borderRadius: scale(20),
    backgroundColor: COLORS.surface,
  },
  // Same border width focused or not, so nothing moves when focus arrives.
  card: { borderWidth: scale(4), borderColor: 'transparent' },
  focused: {
    borderColor: COLORS.focus,
    backgroundColor: COLORS.surfaceRaised,
    transform: [{ scale: 1.02 }],
    ...FOCUS_GLOW,
  },
  iconTile: {
    width: ICON_TILE,
    height: ICON_TILE,
    borderRadius: scale(16),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceRaised,
  },
  iconTileFocused: { backgroundColor: COLORS.focus },
  icon: { color: COLORS.text, fontSize: scale(34) },
  text: { flex: 1 },
  label: { color: COLORS.text, fontSize: scale(34), fontWeight: '700' },
  hint: { color: COLORS.textMuted, fontSize: scale(24), marginTop: scale(4) },
  end: { flexDirection: 'row', alignItems: 'center', gap: scale(16) },
  // Two borders of a square, turned 45°: a ">" shape.
  chevron: {
    width: scale(18),
    height: scale(18),
    marginHorizontal: scale(8),
    borderTopWidth: scale(4),
    borderRightWidth: scale(4),
    borderColor: COLORS.textMuted,
    transform: [{ rotate: '45deg' }],
  },
  chevronBack: { transform: [{ rotate: '-135deg' }] },
});
