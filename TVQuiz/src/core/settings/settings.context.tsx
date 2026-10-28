import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { settingsService } from 'core/services/settings.service';
import { Settings } from 'types/settings.interface';

interface SettingsValue {
  settings: Settings;
  /** Changes some settings, shows them at once and saves them on the device. */
  updateSettings: (change: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsValue | null>(null);

interface SettingsProviderProps {
  /** Loaded at startup, so the first screen already has the right language. */
  initial: Settings;
  children: ReactNode;
}

export function SettingsProvider({ initial, children }: SettingsProviderProps) {
  const [settings, setSettings] = useState(initial);

  const updateSettings = useCallback((change: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...change }));
  }, []);

  // Save after every change, not on the first render (that copy was just loaded).
  const loaded = useRef(settings);
  useEffect(() => {
    if (settings !== loaded.current) {
      // Saving can fail (full storage); the change still applies for this session.
      settingsService.save(settings).catch(() => {});
    }
  }, [settings]);

  const value = useMemo(
    () => ({ settings, updateSettings }),
    [settings, updateSettings],
  );
  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsValue {
  const value = useContext(SettingsContext);
  if (!value) {
    throw new Error('useSettings must be used inside SettingsProvider');
  }
  return value;
}
