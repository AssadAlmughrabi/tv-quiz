import { QuizResult } from 'types/score.interface';

/** Every screen of the app and the params it needs. */
export type Route =
  | { name: 'home' }
  | { name: 'category'; params: { categoryId: string } }
  | { name: 'question'; params: { quizId: string } }
  | { name: 'result'; params: { result: QuizResult } }
  | { name: 'leaderboard'; params: { quizId: string; quizTitle: string } }
  | { name: 'settings' }
  | { name: 'nickname' }
  | { name: 'about' };

export type RouteName = Route['name'];
