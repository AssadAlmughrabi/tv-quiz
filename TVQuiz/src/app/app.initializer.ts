import { installSpatialNavigation } from 'core/focus/spatial-navigation';
import { installFaultInjector } from 'core/interceptors/fault-injector.interceptor';
import { platform } from 'core/platform/platform';
import { cacheService } from 'core/services/cache.service';
import { quizService } from 'core/services/quiz.service';
import { settingsService } from 'core/services/settings.service';
import { soundService } from 'core/services/sound.service';
import { Settings } from 'types/settings.interface';

export interface AppStartup {
  /** Saved settings, so the first screen already has the right language. */
  settings: Settings;
  /** The link that opened the app, or null when it was opened normally. */
  initialDeepLink: string | null;
  /** Removes the listeners added at startup. */
  dispose: () => void;
}

/** Runs once when the app starts, before the first screen is shown. */
export async function initializeApp(): Promise<AppStartup> {
  if (__DEV__) {
    installFaultInjector();
  }

  // Web build only: arrow keys move focus. Native TVs have their own focus engine.
  const stopFocusEngine = installSpatialNavigation();

  // Before the first screen, so content seen last time appears instantly
  // and the saved language is used from the first frame.
  const [settings] = await Promise.all([
    settingsService.load(),
    cacheService.hydrate(),
  ]);

  // Loaded now, so the first answer of the first quiz is not silent while loading.
  soundService.preload();

  const flushScores = () => {
    // Failures are fine here: the scores stay queued for the next try.
    quizService.flushPendingScores().catch(() => {});
  };

  flushScores();
  const stopNetwork = platform.onNetworkChange(online => {
    if (online) {
      flushScores();
    }
  });
  const stopAppState = platform.onAppStateChange(state => {
    if (state === 'active') {
      flushScores();
    }
  });

  const initialDeepLink = await platform.getInitialDeepLink();

  return {
    settings,
    initialDeepLink,
    dispose: () => {
      stopFocusEngine();
      stopNetwork();
      stopAppState();
    },
  };
}
