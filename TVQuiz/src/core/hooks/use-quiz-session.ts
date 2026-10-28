import { useCallback, useEffect, useState } from 'react';
import {
  answer as answerSession,
  pause as pauseSession,
  QuizSession,
  resume as resumeSession,
  startSession,
  tick,
} from 'core/services/quiz-session.service';
import { Question } from 'types/question.interface';

/** How often the clock is checked. The bar itself is animated separately, so this can be slow. */
const TICK_MS = 100;

/**
 * Connects the pure quiz engine to React: this hook owns the real clock and the state.
 * The engine decides what happens; this only says "now" and stores the result.
 */
export function useQuizSession(
  questions: Question[],
  secondsPerQuestion: number,
) {
  const [session, setSession] = useState<QuizSession>(() =>
    startSession(questions, secondsPerQuestion, Date.now()),
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const time = Date.now();
      setNow(time);
      // tick returns the same object when nothing changed, so React skips that update.
      setSession(current => tick(current, time));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const answer = useCallback((choiceId: string) => {
    setSession(current => answerSession(current, choiceId, Date.now()));
  }, []);
  const pause = useCallback(() => {
    setSession(current => pauseSession(current, Date.now()));
  }, []);
  const resume = useCallback(() => {
    setSession(current => resumeSession(current, Date.now()));
  }, []);

  return { session, now, answer, pause, resume };
}
