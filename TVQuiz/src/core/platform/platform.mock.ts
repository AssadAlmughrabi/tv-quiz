import { AppState, PlatformAdapter, RemoteKey } from 'types/platform.interface';

/** Fake platform for Jest. Tests drive it with the helpers in mockPlatform. */
const store = new Map<string, string>();
let keyHandlers: ((key: RemoteKey) => void)[] = [];
let backHandlers: (() => boolean)[] = [];
let appStateHandlers: ((state: AppState) => void)[] = [];
let networkHandlers: ((online: boolean) => void)[] = [];
let online = true;

function remove<T>(list: T[], item: T): T[] {
  return list.filter(x => x !== item);
}

export const platform: PlatformAdapter = {
  name: 'web',
  getDeviceInfo: async () => ({
    model: 'Test TV',
    osVersion: 'Test OS 1',
    appVersion: '0.0.1',
  }),
  onRemoteKey(handler) {
    keyHandlers.push(handler);
    return () => (keyHandlers = remove(keyHandlers, handler));
  },
  onBack(handler) {
    backHandlers.push(handler);
    return () => (backHandlers = remove(backHandlers, handler));
  },
  exitApp: jest.fn(),
  onAppStateChange(handler) {
    appStateHandlers.push(handler);
    return () => (appStateHandlers = remove(appStateHandlers, handler));
  },
  isOnline: async () => online,
  onNetworkChange(handler) {
    networkHandlers.push(handler);
    return () => (networkHandlers = remove(networkHandlers, handler));
  },
  getInitialDeepLink: async () => null,
  onDeepLink: () => () => {},
  storage: {
    getItem: async key => store.get(key) ?? null,
    setItem: async (key, value) => {
      store.set(key, value);
    },
    removeItem: async key => {
      store.delete(key);
    },
  },
};

export const mockPlatform = {
  /** Presses Back like the system does: newest handler first. */
  pressBack(): void {
    for (let i = backHandlers.length - 1; i >= 0; i--) {
      if (backHandlers[i]()) {
        return;
      }
    }
  },
  pressKey(key: RemoteKey): void {
    keyHandlers.forEach(h => h(key));
  },
  setAppState(state: AppState): void {
    appStateHandlers.forEach(h => h(state));
  },
  setOnline(next: boolean): void {
    online = next;
    networkHandlers.forEach(h => h(next));
  },
};
