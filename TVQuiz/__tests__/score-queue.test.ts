import { ApiError } from 'core/services/api.service';
import { createScoreQueue } from 'core/services/score-queue.service';
import { PendingScore } from 'types/score.interface';

function memoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: async (key: string) => store.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: async (key: string) => {
      store.delete(key);
    },
  };
}

const score = (id: string, value = 10): PendingScore => ({
  id,
  quizId: 'music-easy',
  nickname: 'Player',
  score: value,
  createdAt: '2026-10-26T12:00:00.000Z',
});

describe('score queue', () => {
  it('keeps scores while offline and sends them when back online', async () => {
    let online = false;
    const submit = jest.fn(async () => {
      if (!online) {
        throw new ApiError('network', 'offline');
      }
      return { rank: 1 };
    });
    const queue = createScoreQueue({ storage: memoryStorage(), submit });

    expect(await queue.submitOrQueue(score('A'))).toEqual({ status: 'queued' });
    expect((await queue.getPending()).map(s => s.id)).toEqual(['A']);

    online = true;
    await queue.flush();
    expect(await queue.getPending()).toEqual([]);
  });

  it('does not lose a score added while a send is running', async () => {
    const storage = memoryStorage();
    await storage.setItem('pending-scores', JSON.stringify([score('A'), score('B')]));
    const sent: string[] = [];
    const submit = jest.fn(async (pending: PendingScore) => {
      await new Promise(resolve => setTimeout(resolve, 20));
      sent.push(pending.id);
      return { rank: sent.length };
    });
    const queue = createScoreQueue({ storage, submit });

    const running = queue.flush();
    await new Promise(resolve => setTimeout(resolve, 5)); // A is being sent now
    const result = await queue.submitOrQueue(score('C'));
    await running;

    expect(sent).toEqual(['A', 'B', 'C']);
    expect(result).toEqual({ status: 'sent', rank: 3 });
    expect(await queue.getPending()).toEqual([]);
  });

  it('drops a score that can never be sent, so it does not block the others', async () => {
    const submit = jest.fn(async (pending: PendingScore) => {
      if (pending.id === 'BROKEN') {
        throw new TypeError('bad data');
      }
      return { rank: 1 };
    });
    const storage = memoryStorage();
    await storage.setItem('pending-scores', JSON.stringify([score('BROKEN'), score('OK')]));
    const queue = createScoreQueue({ storage, submit });

    await queue.flush();

    expect(submit).toHaveBeenCalledTimes(2);
    expect(await queue.getPending()).toEqual([]);
  });

  it('reports a score the server refuses as rejected', async () => {
    const submit = jest.fn(async () => {
      throw new ApiError('http', 'bad request', 400);
    });
    const queue = createScoreQueue({ storage: memoryStorage(), submit });

    expect(await queue.submitOrQueue(score('X'))).toEqual({ status: 'rejected' });
  });
});
