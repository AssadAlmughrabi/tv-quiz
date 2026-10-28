/** Points for each correct answer. */
export const POINTS_PER_CORRECT = 100;

/** Score for one answer: 0 if wrong or timed out, otherwise POINTS_PER_CORRECT. */
export function pointsFor(isCorrect: boolean): number {
  return isCorrect ? POINTS_PER_CORRECT : 0;
}
