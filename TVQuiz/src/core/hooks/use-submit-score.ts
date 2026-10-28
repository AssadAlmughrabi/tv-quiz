import { useEffect, useState } from 'react';
import { platform } from 'core/platform/platform';
import { quizService } from 'core/services/quiz.service';
import { SubmitResult } from 'core/services/score-queue.service';
import { QuizResult } from 'types/score.interface';

export type SubmitState = { status: 'sending' } | SubmitResult;

/**
 * Sends the finished quiz's score once, when the result screen opens.
 * The id comes from the result itself, so a second send of the same result (screen opened
 * again, effect run twice) is ignored by the queue and the server instead of counting twice.
 */
export function useSubmitScore(result: QuizResult, nickname: string) {
  const [state, setState] = useState<SubmitState>({ status: 'sending' });
  const [attempt, setAttempt] = useState(0);
  const { quizId, score, finishedAt } = result;

  useEffect(() => {
    let active = true;
    quizService
      .submitScore({
        id: `${quizId}:${finishedAt}`,
        quizId,
        nickname,
        score,
        createdAt: finishedAt,
      })
      // Storage itself failed: the score could not even be kept for later.
      .catch((): SubmitResult => ({ status: 'rejected' }))
      .then(next => {
        if (active) {
          setState(next);
        }
      });
    return () => {
      active = false;
    };
  }, [quizId, score, finishedAt, nickname, attempt]);

  // Waiting offline: when the connection returns, send again so the message updates.
  // Same id, so if the startup flush already sent it, the server ignores the copy.
  const queued = state.status === 'queued';
  useEffect(() => {
    if (!queued) {
      return;
    }
    return platform.onNetworkChange(online => {
      if (online) {
        setAttempt(n => n + 1);
      }
    });
  }, [queued]);

  return state;
}
