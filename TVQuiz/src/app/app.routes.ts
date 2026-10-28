import { ScreenRegistry } from 'core/navigation/navigation.context';
import { AboutScreen } from 'screens/about/about.screen';
import { CategoryScreen } from 'screens/category/category.screen';
import { HomeScreen } from 'screens/home/home.screen';
import { LeaderboardScreen } from 'screens/leaderboard/leaderboard.screen';
import { NicknameScreen } from 'screens/nickname/nickname.screen';
import { QuestionScreen } from 'screens/question/question.screen';
import { ResultScreen } from 'screens/result/result.screen';
import { SettingsScreen } from 'screens/settings/settings.screen';
import { Route } from 'types/route.interface';

export const INITIAL_ROUTE: Route = { name: 'home' };

/** Which component draws each route. Screens not listed yet show a "not built" message. */
export const SCREENS: ScreenRegistry = {
  home: HomeScreen,
  category: CategoryScreen,
  question: QuestionScreen,
  result: ResultScreen,
  leaderboard: LeaderboardScreen,
  settings: SettingsScreen,
  nickname: NicknameScreen,
  about: AboutScreen,
};
