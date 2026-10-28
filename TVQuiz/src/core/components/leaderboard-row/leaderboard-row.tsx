import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TVPressable } from 'core/components/tv-pressable/tv-pressable';
import { FOCUS_GLOW } from 'core/constants/focus-glow.const';
import { COLORS } from 'core/constants/theme-colors.const';
import { useLanguage } from 'core/i18n/language.context';
import { formatDate, formatNumber } from 'core/utils/format.utils';
import { scale } from 'core/utils/scale.utils';
import { LeaderboardEntry } from 'types/score.interface';

/** Every row has this height, so loading skeletons take exactly the same space. */
export const LEADERBOARD_ROW_HEIGHT = scale(68);

/** Side padding + border of a row, so the column titles can sit above their columns. */
export const LEADERBOARD_ROW_INSET = scale(20) + scale(4);

/** Column widths, shared with the column titles so they line up. */
export const LEADERBOARD_COLUMNS = {
  rank: scale(84),
  score: scale(160),
  date: scale(240),
};

const MEDALS = [COLORS.gold, COLORS.silver, COLORS.bronze];
const CHIP_SIZE = scale(48);

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  hasTVPreferredFocus?: boolean;
}

/**
 * One score. Focusable, so the remote can move through the list.
 * The player's own row has a "You" badge and a border, not colour alone.
 */
export function LeaderboardRow({
  entry,
  hasTVPreferredFocus,
}: LeaderboardRowProps) {
  const { lang, t } = useLanguage();
  const rank = formatNumber(entry.rank, lang);
  const score = formatNumber(entry.score, lang);
  const date = formatDate(entry.date, lang);
  const medal = MEDALS[entry.rank - 1];

  return (
    <TVPressable
      accessibilityLabel={[
        `${t.leaderboard.rank} ${rank}`,
        entry.nickname,
        entry.isPlayer && t.leaderboard.you,
        `${t.leaderboard.score} ${score}`,
        date,
      ]
        .filter(Boolean)
        .join(', ')}
      hasTVPreferredFocus={hasTVPreferredFocus}
      style={({ focused }) => [
        styles.row,
        entry.isPlayer && styles.player,
        focused && styles.focused,
      ]}
    >
      <View style={styles.rankCell}>
        <View style={[styles.chip, medal ? { backgroundColor: medal } : null]}>
          <Text style={[styles.chipText, medal ? styles.medalText : null]}>
            {rank}
          </Text>
        </View>
      </View>

      <View style={styles.nameCell}>
        <Text style={styles.name} numberOfLines={1}>
          {entry.nickname}
        </Text>
        {entry.isPlayer && (
          <View style={styles.you}>
            <Text style={styles.youText}>{t.leaderboard.you}</Text>
          </View>
        )}
      </View>

      {/* Numbers line up at the column's end (right in English, left in Arabic). */}
      <View style={[styles.endCell, { width: LEADERBOARD_COLUMNS.score }]}>
        <Text style={styles.score}>{score}</Text>
      </View>
      <View style={[styles.endCell, { width: LEADERBOARD_COLUMNS.date }]}>
        <Text style={styles.date}>{date}</Text>
      </View>
    </TVPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    height: LEADERBOARD_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    borderRadius: scale(14),
    borderWidth: scale(4),
    // Same width when not focused, so nothing moves when focus arrives.
    borderColor: 'transparent',
    backgroundColor: COLORS.surface,
  },
  player: { borderColor: COLORS.accent, backgroundColor: COLORS.surfaceRaised },
  focused: {
    borderColor: COLORS.focus,
    backgroundColor: COLORS.surfaceRaised,
    ...FOCUS_GLOW,
  },
  rankCell: { width: LEADERBOARD_COLUMNS.rank },
  chip: {
    width: CHIP_SIZE,
    height: CHIP_SIZE,
    borderRadius: CHIP_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.border,
  },
  chipText: { color: COLORS.text, fontSize: scale(24), fontWeight: '800' },
  medalText: { color: COLORS.background },
  nameCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(16),
  },
  name: {
    flexShrink: 1,
    color: COLORS.text,
    fontSize: scale(30),
    fontWeight: '600',
  },
  you: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(2),
    borderRadius: scale(8),
    backgroundColor: COLORS.accent,
  },
  youText: { color: COLORS.background, fontSize: scale(20), fontWeight: '800' },
  // flex-end follows the direction on every target; textAlign right does not.
  endCell: { alignItems: 'flex-end' },
  score: {
    color: COLORS.text,
    fontSize: scale(30),
    fontWeight: '800',
  },
  date: {
    color: COLORS.textMuted,
    fontSize: scale(24),
  },
});
