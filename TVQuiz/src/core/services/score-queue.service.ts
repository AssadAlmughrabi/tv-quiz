import { ApiError } from 'core/services/api.service';
import { PlatformStorage } from 'types/platform.interface';
import { PendingScore } from 'types/score.interface';

const STORAGE_KEY = 'pending-scores';

export type SubmitResult =
  | { status: 'sent'; rank: number }
  | { status: 'queued' }
  | { status: 'rejected' };

export interface ScoreQueueDeps {
  storage: PlatformStorage;
  submit: (score: PendingScore) => Promise<{ rank: number }>;
}
export function createScoreQueue({ storage, submit }: ScoreQueueDeps) {
  let flushing: Promise<void> | null = null;
  /** Rank of every score sent while the app runs, whichever flush sent it. */
  const sentRanks = new Map<string, number>();
  /** Storage changes run one after another, so two changes never overwrite each other. */
  let storageLock: Promise<unknown> = Promise.resolve();

  async function load(): Promise<PendingScore[]> {
    const raw = await storage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw) as PendingScore[];
    } catch {
      return [];
    }
  }

  /** Reads the saved list, changes it and saves it, as one step no other change can interrupt. */
  function update(
    change: (scores: PendingScore[]) => PendingScore[],
  ): Promise<void> {
    const run = storageLock.then(async () => {
      const scores = await load();
      await storage.setItem(STORAGE_KEY, JSON.stringify(change(scores)));
    });
    storageLock = run.catch(() => {});
    return run;
  }

  const remove = (id: string) =>
    update(scores => scores.filter(s => s.id !== id));

  /**
   * Sends pending scores in order. The list is read again before each score, so a score
   * added during the run is sent too and is never overwritten by an old copy of the list.
   */
  async function sendAll(): Promise<void> {
    const tried = new Set<string>();
    for (;;) {
      const next = (await load()).find(s => !tried.has(s.id));
      if (!next) {
        return;
      }
      tried.add(next.id);
      try {
        const { rank } = await submit(next);
        sentRanks.set(next.id, rank);
        await remove(next.id);
      } catch (error) {
        if (isRetryable(error)) {
          // Still offline or the server is down: keep the rest for the next try.
          return;
        }
        // Rejected for good: drop it so it cannot block the scores behind it.
        await remove(next.id);
      }
    }
  }

  /** Runs one send at a time; a second call while sending waits for the same run. */
  function flush(): Promise<void> {
    if (!flushing) {
      flushing = sendAll().finally(() => {
        flushing = null;
      });
    }
    return flushing;
  }

  return {
    /** Saves the score, then tries to send everything that is waiting. */
    async submitOrQueue(score: PendingScore): Promise<SubmitResult> {
      await update(scores =>
        scores.some(s => s.id === score.id) ? scores : [...scores, score],
      );
      // A send may already be running; it may send this score too. Then send again.
      await flushing;
      await flush();

      const rank = sentRanks.get(score.id);
      if (rank !== undefined) {
        return { status: 'sent', rank };
      }
      const stillPending = (await load()).some(s => s.id === score.id);
      return stillPending ? { status: 'queued' } : { status: 'rejected' };
    },

    /** Call when the connection returns and when the app starts. */
    flush,

    async getPending(): Promise<PendingScore[]> {
      return load();
    },
  };
}

export type ScoreQueue = ReturnType<typeof createScoreQueue>;

function isRetryable(error: unknown): boolean {
  // Not a network or server error (e.g. bad data): retrying would fail the same way forever.
  if (!(error instanceof ApiError)) {
    return false;
  }
  if (error.type === 'http') {
    return (error.status ?? 500) >= 500;
  }
  return (
    error.type === 'network' ||
    error.type === 'timeout' ||
    error.type === 'aborted'
  );
}
