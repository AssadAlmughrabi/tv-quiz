import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AsyncView } from 'core/components/async-view/async-view';
import {
  LEADERBOARD_COLUMNS,
  LEADERBOARD_ROW_HEIGHT,
  LEADERBOARD_ROW_INSET,
  LeaderboardRow,
} from 'core/components/leaderboard-row/leaderboard-row';
import { SkeletonBox } from 'core/components/skeleton/skeleton';
import { SAFE_AREA } from 'core/constants/layout.const';
import { COLORS } from 'core/constants/theme-colors.const';
import { useAsyncData } from 'core/hooks/use-async-data';
import { useLanguage } from 'core/i18n/language.context';
import { useSettings } from 'core/settings/settings.context';
import { ScreenProps, useNavigation } from 'core/navigation/navigation.context';
import { quizService } from 'core/services/quiz.service';
import { formatNumber } from 'core/utils/format.utils';
import { scale } from 'core/utils/scale.utils';
import { LeaderboardEntry } from 'types/score.interface';

const ROW_GAP = scale(8);
const TOP_SIZE = 10;
const SIDE_WIDTH = scale(480);
const POSITION_CARD_HEIGHT = scale(220);

/**
 * Title and the player's position on the left, the top 10 on the right, plus the player's
 * best row under a "…" gap when it is not in the top 10. At most 11 rows: they fit on one
 * screen, so there is no scrolling. Back returns to the result.
 */
export function LeaderboardScreen({ route }: ScreenProps<'leaderboard'>) {
  const { quizId, quizTitle } = route.params;
  const { t } = useLanguage();
  const { goBack } = useNavigation();
  const { nickname } = useSettings().settings;
  const entries = useAsyncData(
    () => quizService.getLeaderboard(quizId, nickname),
    [quizId, nickname],
  );
  const player = entries.data?.find(e => e.isPlayer);

  return (
    <View style={styles.screen}>
      <View style={styles.side}>
        <Text style={styles.title} accessibilityRole="header">
          {t.leaderboard.title}
        </Text>
        <Text style={styles.quizTitle} numberOfLines={2}>
          {quizTitle}
        </Text>
        {/* Space kept while loading, so nothing moves when the scores arrive. */}
        <View style={styles.positionSlot}>
          {entries.status === 'loading' ? (
            <SkeletonBox
              width="100%"
              height={POSITION_CARD_HEIGHT}
              radius={scale(16)}
            />
          ) : (
            entries.data && <PositionCard player={player} />
          )}
        </View>
      </View>

      <View style={styles.table}>
        {/* Only above rows or their skeleton, not above an error or empty message. */}
        {(entries.status === 'loading' || entries.status === 'ready') && (
          <ColumnTitles />
        )}
        <AsyncView
          status={entries.status}
          onRetry={entries.retry}
          takeFocus
          emptyMessage={t.leaderboard.empty}
          emptyAction={{ label: t.common.back, onPress: goBack }}
          loading={<LeaderboardSkeleton />}
        >
          {() => entries.data && <Rows entries={entries.data} />}
        </AsyncView>
      </View>
    </View>
  );
}

/** The player's own place, big, so it is found at a glance (Screens: "the player's own position"). */
function PositionCard({ player }: { player?: LeaderboardEntry }) {
  const { lang, t } = useLanguage();
  return (
    <View style={styles.positionCard}>
      <Text style={styles.positionLabel}>{t.leaderboard.yourPosition}</Text>
      {player ? (
        <>
          <Text style={styles.positionRank}>
            #{formatNumber(player.rank, lang)}
          </Text>
          <Text style={styles.positionScore}>
            {t.leaderboard.score}: {formatNumber(player.score, lang)}
          </Text>
        </>
      ) : (
        <Text style={styles.notRanked}>{t.leaderboard.notRanked}</Text>
      )}
    </View>
  );
}

function ColumnTitles() {
  const { t } = useLanguage();
  return (
    <View style={styles.columns}>
      <Text style={[styles.column, { width: LEADERBOARD_COLUMNS.rank }]}>
        {t.leaderboard.rank}
      </Text>
      <Text style={[styles.column, styles.flex]}>{t.leaderboard.player}</Text>
      <View style={[styles.end, { width: LEADERBOARD_COLUMNS.score }]}>
        <Text style={styles.column}>{t.leaderboard.score}</Text>
      </View>
      <View style={[styles.end, { width: LEADERBOARD_COLUMNS.date }]}>
        <Text style={styles.column}>{t.leaderboard.date}</Text>
      </View>
    </View>
  );
}

function Rows({ entries }: { entries: LeaderboardEntry[] }) {
  // Focus starts on the player's own row; with no score yet, on the first place.
  const focusRank = (entries.find(e => e.isPlayer) ?? entries[0]).rank;

  return (
    <View style={styles.rows}>
      {entries.map((entry, i) => (
        <React.Fragment key={`${entry.rank}-${entry.nickname}`}>
          {/* The player's row comes after the top 10 when it is further down. */}
          {i === TOP_SIZE && <Text style={styles.gap}>⋯</Text>}
          <LeaderboardRow
            entry={entry}
            hasTVPreferredFocus={entry.rank === focusRank}
          />
        </React.Fragment>
      ))}
    </View>
  );
}

/** Same rows, same size, so nothing moves when the scores arrive. */
function LeaderboardSkeleton() {
  return (
    <View style={styles.rows}>
      {Array.from({ length: TOP_SIZE }, (_, i) => (
        <SkeletonBox
          key={i}
          width="100%"
          height={LEADERBOARD_ROW_HEIGHT}
          radius={scale(14)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'row',
    gap: scale(56),
    paddingHorizontal: SAFE_AREA.horizontal,
    paddingVertical: SAFE_AREA.vertical,
  },
  side: { width: SIDE_WIDTH },
  title: { color: COLORS.text, fontSize: scale(56), fontWeight: '800' },
  quizTitle: {
    color: COLORS.textMuted,
    fontSize: scale(30),
    lineHeight: scale(40),
    height: scale(80),
    marginTop: scale(8),
  },
  positionSlot: { height: POSITION_CARD_HEIGHT, marginTop: scale(40) },
  positionCard: {
    height: POSITION_CARD_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: scale(32),
    borderRadius: scale(16),
    borderWidth: scale(4),
    borderColor: COLORS.accent,
    backgroundColor: COLORS.surface,
  },
  positionLabel: { color: COLORS.textMuted, fontSize: scale(26) },
  positionRank: {
    color: COLORS.accent,
    fontSize: scale(88),
    lineHeight: scale(104),
    fontWeight: '800',
  },
  positionScore: { color: COLORS.text, fontSize: scale(28), fontWeight: '700' },
  notRanked: {
    color: COLORS.text,
    fontSize: scale(28),
    lineHeight: scale(38),
    marginTop: scale(8),
  },
  table: { flex: 1 },
  columns: {
    flexDirection: 'row',
    paddingHorizontal: LEADERBOARD_ROW_INSET,
    marginBottom: scale(12),
  },
  column: {
    color: COLORS.textMuted,
    fontSize: scale(22),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: scale(1),
  },
  flex: { flex: 1 },
  // Above the score and date: at the column's end, like the numbers under them.
  end: { alignItems: 'flex-end' },
  rows: { gap: ROW_GAP },
  gap: {
    color: COLORS.textMuted,
    fontSize: scale(32),
    lineHeight: scale(24),
    textAlign: 'center',
  },
});
