/// <reference lib="dom" />
import { APP_VERSION } from 'core/constants/app.const';
import { describeUserAgent } from 'core/platform/user-agent';
import { isBackKey, toRemoteKey } from 'core/platform/web-keys';
import { PlatformAdapter, PlatformStorage } from 'types/platform.interface';

const storage: PlatformStorage = {
  async getItem(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItem(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Storage full or blocked: the app keeps working without saving.
    }
  },
  async removeItem(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Same as above.
    }
  },
};

declare global {
  interface Window {
    /** Only on LG webOS. launchParams is the JSON the app was launched with. */
    PalmSystem?: { launchParams?: string };
  }
}

/**
 * The link inside LG webOS launch parameters, e.g. {"target": "tvquiz://quiz/science-easy"}
 * (`ares-launch -p`, or a tile on the TV's home screen). Given as a JSON string at start and
 * as an object on relaunch. Anything else gives null.
 */
function webOSTarget(params: unknown): string | null {
  let value = params;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  const target = (value as { target?: unknown } | null)?.target;
  return typeof target === 'string' ? target : null;
}

export const platform: PlatformAdapter = {
  name: 'web',

  async getDeviceInfo() {
    return {
      ...describeUserAgent(navigator.userAgent),
      appVersion: APP_VERSION,
    };
  },

  onRemoteKey(handler) {
    const listener = (event: KeyboardEvent) => {
      const key = toRemoteKey(event);
      if (key) {
        handler(key);
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  },

  onBack(handler) {
    const listener = (event: KeyboardEvent) => {
      if (isBackKey(event) && handler()) {
        // Stop the browser or TV from navigating away on its own.
        event.preventDefault();
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  },

  exitApp() {
    window.close();
  },

  onAppStateChange(handler) {
    const listener = () => handler(document.hidden ? 'background' : 'active');
    document.addEventListener('visibilitychange', listener);
    return () => document.removeEventListener('visibilitychange', listener);
  },

  async isOnline() {
    return navigator.onLine;
  },

  onNetworkChange(handler) {
    const online = () => handler(true);
    const offline = () => handler(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  },

  async getInitialDeepLink() {
    // LG webOS: the launch parameters; a browser: the page address (…?quiz=<id>).
    return (
      webOSTarget(window.PalmSystem?.launchParams) ??
      (window.location.search ? window.location.href : null)
    );
  },

  onDeepLink(handler) {
    const onAddress = () => handler(window.location.href);
    // LG webOS: launching the app again while it runs sends its new parameters here.
    const onRelaunch = (event: Event) => {
      const target = webOSTarget((event as CustomEvent).detail);
      if (target) {
        handler(target);
      }
    };
    window.addEventListener('popstate', onAddress);
    document.addEventListener('webOSRelaunch', onRelaunch);
    return () => {
      window.removeEventListener('popstate', onAddress);
      document.removeEventListener('webOSRelaunch', onRelaunch);
    };
  },

  storage,
};
