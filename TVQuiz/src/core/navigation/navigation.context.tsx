import React, {
  ComponentType,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ErrorBoundary } from 'core/components/error-boundary/error-boundary';
import { ScreenError } from 'core/components/screen-error/screen-error';
import { COLORS } from 'core/constants/theme-colors.const';
import { directionProps } from 'core/i18n/direction';
import { useLanguage } from 'core/i18n/language.context';
import { parseDeepLink } from 'core/navigation/deep-link';
import { platform } from 'core/platform/platform';
import { Route, RouteName } from 'types/route.interface';
import { scale } from 'core/utils/scale.utils';

/** Returns true when it handled Back, so nothing else runs. */
export type BackHandlerFn = () => boolean;

export type ScreenProps<N extends RouteName> = {
  route: Extract<Route, { name: N }>;
};

export type ScreenRegistry = Partial<{
  [N in RouteName]: ComponentType<ScreenProps<N>>;
}>;

interface StackEntry {
  id: number;
  route: Route;
}

interface NavigationValue {
  route: Route;
  /** Key of the item that had focus when this screen was left, to restore it on return. */
  focusKey: string | undefined;
  navigate: (route: Route) => void;
  /** Swaps the current screen for another, e.g. a finished quiz for its result. */
  replace: (route: Route) => void;
  goBack: () => void;
  reset: (routes: Route[]) => void;
  rememberFocus: (key: string) => void;
  addBackHandler: (handler: BackHandlerFn) => () => void;
}

const NavigationContext = createContext<NavigationValue | null>(null);

interface NavigationProviderProps {
  screens: ScreenRegistry;
  /** The first stack, bottom first: normally [home], or what the launch link asks for. */
  initialRoutes: Route[];
}

export function NavigationProvider({
  screens,
  initialRoutes,
}: NavigationProviderProps) {
  const { lang } = useLanguage();
  const direction = directionProps(lang);
  const nextId = useRef(initialRoutes.length);
  const [entries, setEntries] = useState<StackEntry[]>(() =>
    initialRoutes.map((route, id) => ({ id, route })),
  );
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  // Kept outside state: remembering focus must not re-render the screen.
  const focusMemory = useRef(new Map<number, string>());
  const backHandlers = useRef<BackHandlerFn[]>([]);

  const navigate = useCallback((route: Route) => {
    setEntries(prev => [...prev, { id: nextId.current++, route }]);
  }, []);

  const goBack = useCallback(() => {
    setEntries(prev => {
      if (prev.length <= 1) {
        return prev;
      }
      focusMemory.current.delete(prev[prev.length - 1].id);
      return prev.slice(0, -1);
    });
  }, []);

  const replace = useCallback((route: Route) => {
    setEntries(prev => {
      focusMemory.current.delete(prev[prev.length - 1].id);
      return [...prev.slice(0, -1), { id: nextId.current++, route }];
    });
  }, []);

  const reset = useCallback((routes: Route[]) => {
    focusMemory.current.clear();
    setEntries(routes.map(route => ({ id: nextId.current++, route })));
  }, []);

  const rememberFocus = useCallback((key: string) => {
    const top = entriesRef.current[entriesRef.current.length - 1];
    focusMemory.current.set(top.id, key);
  }, []);

  const addBackHandler = useCallback((handler: BackHandlerFn) => {
    backHandlers.current.push(handler);
    return () => {
      backHandlers.current = backHandlers.current.filter(h => h !== handler);
    };
  }, []);

  // A link while the app runs (e.g. from the TV's home screen): open what it asks for, over Home.
  // Links that are not ours are ignored, so the current screen stays.
  useEffect(
    () =>
      platform.onDeepLink(url => {
        const routes = parseDeepLink(url);
        if (routes) {
          reset(routes);
        }
      }),
    [reset],
  );

  // The one place Back is decided. Always returns true, so the system never closes the app on its own.
  useEffect(
    () =>
      platform.onBack(() => {
        // 1. Dialogs and screens, newest first (a dialog registers after its screen).
        const handlers = backHandlers.current;
        for (let i = handlers.length - 1; i >= 0; i--) {
          if (handlers[i]()) {
            return true;
          }
        }
        // 2. Previous screen.
        if (entriesRef.current.length > 1) {
          goBack();
          return true;
        }
        // 3. Home: nothing here. Home asks with its exit dialog (a handler above), so no
        //    number of Back presses can ever close the app on its own.
        return true;
      }),
    [goBack],
  );

  const top = entries[entries.length - 1];
  const value = useMemo<NavigationValue>(
    () => ({
      route: top.route,
      focusKey: focusMemory.current.get(top.id),
      navigate,
      replace,
      goBack,
      reset,
      rememberFocus,
      addBackHandler,
    }),
    [top, navigate, replace, goBack, reset, rememberFocus, addBackHandler],
  );

  const Screen = screens[top.route.name] as
    | ComponentType<{ route: Route }>
    | undefined;

  return (
    <NavigationContext.Provider value={value}>
      {/* Arabic mirrors the whole layout here (rows, start/end spacing, focus order), no restart. */}
      <View {...direction} style={[styles.root, direction.style]}>
        {Screen ? (
          // A crash in one screen shows a message there; the app and the other screens keep
          // working. Keyed by the entry, so a new screen starts with a fresh boundary.
          <ErrorBoundary
            key={top.id}
            renderFallback={retry => (
              <ScreenError
                onRetry={retry}
                onBack={entries.length > 1 ? goBack : undefined}
              />
            )}
          >
            <Screen route={top.route} />
          </ErrorBoundary>
        ) : (
          <View style={styles.missing}>
            <Text style={styles.missingText}>
              Screen "{top.route.name}" is not built yet.
            </Text>
          </View>
        )}
      </View>
    </NavigationContext.Provider>
  );
}

function useNavigationContext(): NavigationValue {
  const value = useContext(NavigationContext);
  if (!value) {
    throw new Error('Navigation hooks must be used inside NavigationProvider');
  }
  return value;
}

export function useNavigation() {
  const { route, focusKey, navigate, replace, goBack, reset, rememberFocus } =
    useNavigationContext();
  return { route, focusKey, navigate, replace, goBack, reset, rememberFocus };
}

/** Lets a screen or dialog take Back first. Return true to stop it there. */
export function useBackHandler(handler: BackHandlerFn, enabled = true): void {
  const { addBackHandler } = useNavigationContext();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) {
      return;
    }
    return addBackHandler(() => handlerRef.current());
  }, [enabled, addBackHandler]);
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  missingText: { color: COLORS.textMuted, fontSize: scale(32) },
});
