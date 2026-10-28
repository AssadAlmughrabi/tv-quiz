import { FEEDBACK_MS } from 'core/constants/timing.const';
import {
  answer,
  currentAnswer,
  currentQuestion,
  pause,
  remainingMs,
  resume,
  startSession,
  tick,
  toResult,
} from 'core/services/quiz-session.service';
import { Question } from 'types/question.interface';

const question = (id: string): Question => ({
  id,
  text: `Question ${id}?`,
  choices: ['a', 'b', 'c', 'd'].map(c => ({ id: `${id}-${c}`, text: c })),
  correctChoiceId: `${id}-a`,
  contentLanguage: 'en',
});

const T0 = 1_000_000;
const SECONDS = 20;
const LIMIT = SECONDS * 1000;

describe('quiz session', () => {
  it('starts on the first question with the full time', () => {
    const s = startSession([question('q1'), question('q2')], SECONDS, T0);
    expect(s.phase).toBe('answering');
    expect(currentQuestion(s)?.id).toBe('q1');
    expect(remainingMs(s, T0)).toBe(LIMIT);
    expect(remainingMs(s, T0 + 5000)).toBe(LIMIT - 5000);
  });

  it('records a correct answer for 100 points, then moves on after the feedback', () => {
    let s = startSession([question('q1'), question('q2')], SECONDS, T0);
    s = answer(s, 'q1-a', T0 + 2000);
    expect(s.phase).toBe('feedback');
    expect(currentAnswer(s)).toEqual({ questionId: 'q1', choiceId: 'q1-a', isCorrect: true, timeMs: 2000 });
    expect(s.score).toBe(100);

    expect(tick(s, T0 + 2000 + FEEDBACK_MS - 1)).toBe(s); // feedback still showing
    s = tick(s, T0 + 2000 + FEEDBACK_MS);
    expect(s.phase).toBe('answering');
    expect(currentQuestion(s)?.id).toBe('q2');
    expect(remainingMs(s, T0 + 2000 + FEEDBACK_MS)).toBe(LIMIT);
  });

  it('ignores a second Enter: the first answer stays', () => {
    let s = startSession([question('q1')], SECONDS, T0);
    s = answer(s, 'q1-b', T0 + 1000);
    const again = answer(s, 'q1-a', T0 + 1050);
    expect(again).toBe(s);
    expect(s.answers).toHaveLength(1);
    expect(s.answers[0].isCorrect).toBe(false);
    expect(s.score).toBe(0);
  });

  it('counts running out of time as no answer, then continues', () => {
    let s = startSession([question('q1'), question('q2')], SECONDS, T0);
    expect(tick(s, T0 + LIMIT - 1)).toBe(s);
    s = tick(s, T0 + LIMIT);
    expect(s.phase).toBe('feedback');
    expect(currentAnswer(s)).toEqual({ questionId: 'q1', choiceId: null, isCorrect: false, timeMs: LIMIT });
    s = tick(s, T0 + LIMIT + FEEDBACK_MS);
    expect(currentQuestion(s)?.id).toBe('q2');
  });

  it('freezes the timer while paused and gives back the same time on resume', () => {
    let s = startSession([question('q1')], SECONDS, T0);
    s = pause(s, T0 + 5000);
    expect(remainingMs(s, T0 + 60_000)).toBe(LIMIT - 5000); // a minute in the quit dialog
    expect(tick(s, T0 + 60_000)).toBe(s); // time cannot run out while paused
    expect(answer(s, 'q1-a', T0 + 60_000)).toBe(s); // nor can it be answered

    s = resume(s, T0 + 65_000);
    expect(remainingMs(s, T0 + 65_000)).toBe(LIMIT - 5000);
    s = answer(s, 'q1-a', T0 + 66_000);
    // 5 s before the pause + 1 s after it: the paused minute does not count.
    expect(currentAnswer(s)?.timeMs).toBe(6000);
  });

  it('also freezes the feedback while paused', () => {
    let s = startSession([question('q1'), question('q2')], SECONDS, T0);
    s = answer(s, 'q1-a', T0);
    s = pause(s, T0 + 500);
    expect(tick(s, T0 + 10_000).phase).toBe('feedback');
    s = resume(s, T0 + 10_000);
    expect(tick(s, T0 + 10_000 + FEEDBACK_MS - 500).phase).toBe('answering');
  });

  it('finishes after the last question and builds the result', () => {
    let s = startSession([question('q1'), question('q2')], SECONDS, T0);
    s = answer(s, 'q1-a', T0);
    s = tick(s, T0 + FEEDBACK_MS);
    s = answer(s, 'q2-c', T0 + FEEDBACK_MS + 3000);
    s = tick(s, T0 + FEEDBACK_MS * 2 + 3000);
    expect(s.phase).toBe('finished');

    const result = toResult(s, { id: 'music-easy', title: 'Music' }, T0 + 99_000);
    expect(result).toMatchObject({ quizId: 'music-easy', quizTitle: 'Music', correctCount: 1, total: 2, score: 100 });
    expect(result.review.map(r => r.choiceId)).toEqual(['q1-a', 'q2-c']);
  });

  it('gives the review the texts, and no given text when time ran out', () => {
    let s = startSession([question('q1'), question('q2')], SECONDS, T0);
    s = answer(s, 'q1-b', T0 + 1000);
    s = tick(s, T0 + 1000 + FEEDBACK_MS);
    s = tick(s, T0 + 1000 + FEEDBACK_MS + LIMIT); // q2: time runs out
    s = tick(s, T0 + 1000 + FEEDBACK_MS * 2 + LIMIT);
    expect(s.phase).toBe('finished');

    const [first, second] = toResult(s, { id: 'q', title: 'Q' }, T0).review;
    expect(first).toMatchObject({ questionText: 'Question q1?', givenText: 'b', correctText: 'a', isCorrect: false });
    expect(second).toMatchObject({ choiceId: null, givenText: null, correctText: 'a', isCorrect: false });
  });
});
