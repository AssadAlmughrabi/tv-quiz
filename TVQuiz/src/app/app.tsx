import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { initializeApp } from 'app/app.initializer';
import { INITIAL_ROUTE, SCREENS } from 'app/app.routes';
import { COLORS } from 'core/constants/theme-colors.const';
import { LanguageProvider } from 'core/i18n/language.context';
import { parseDeepLink } from 'core/navigation/deep-link';
import { NavigationProvider } from 'core/navigation/navigation.context';
import { DEFAULT_SETTINGS } from 'core/services/settings.service';
import { SettingsProvider } from 'core/settings/settings.context';
import { Route } from 'types/route.interface';
import { Settings } from 'types/settings.interface';

function App() {
  // null until startup finished; then the saved settings (or the defaults if startup failed).
  const [settings, setSettings] = useState<Settings | null>(null);
  // The first screens: Home, or what the link that launched the app asks for (over Home).
  const [initialRoutes, setInitialRoutes] = useState<Route[]>([INITIAL_ROUTE]);

  useEffect(() => {
    let active = true;
    let dispose: (() => void) | undefined;
    initializeApp()
      .then(startup => {
        if (active) {
          dispose = startup.dispose;
          setInitialRoutes(
            parseDeepLink(startup.initialDeepLink) ?? [INITIAL_ROUTE],
          );
          setSettings(startup.settings);
        } else {
          // Closed before startup finished: remove its listeners right away.
          startup.dispose();
        }
      })
      // Startup problems must never block the app from opening.
      .catch(() => {})
      .finally(() => {
        if (active) {
          setSettings(current => current ?? DEFAULT_SETTINGS);
        }
      });
    return () => {
      active = false;
      dispose?.();
    };
  }, []);

  if (!settings) {
    return <View style={styles.splash} />;
  }

  return (
    <SettingsProvider initial={settings}>
      <LanguageProvider>
        <NavigationProvider screens={SCREENS} initialRoutes={initialRoutes} />
      </LanguageProvider>
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: COLORS.background },
});

export default App;
