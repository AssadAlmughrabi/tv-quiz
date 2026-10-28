export type Unsubscribe = () => void;

export type PlatformName = 'androidtv' | 'tvos' | 'webos' | 'tizen' | 'web';

export type RemoteKey = 'up' | 'down' | 'left' | 'right' | 'enter' | 'back';

export type AppState = 'active' | 'background';

export interface DeviceInfo {
  model: string;
  osVersion: string;
  appVersion: string;
}

export interface PlatformStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface PlatformAdapter {
  /** For logs and About only. Screens must never branch on it. */
  name: PlatformName;

  getDeviceInfo(): Promise<DeviceInfo>;

  /** Raw key codes (461, 10009, KEYCODE_BACK...) normalized to RemoteKey. */
  onRemoteKey(handler: (key: RemoteKey) => void): Unsubscribe;

  /** Handler returns true when it handled Back, false to pass it on. */
  onBack(handler: () => boolean): Unsubscribe;
  exitApp(): void;

  /** Fires on Home, standby and app switching. */
  onAppStateChange(handler: (state: AppState) => void): Unsubscribe;

  isOnline(): Promise<boolean>;
  onNetworkChange(handler: (online: boolean) => void): Unsubscribe;

  /** Cold start: the link that launched the app, read once. */
  getInitialDeepLink(): Promise<string | null>;
  /** Warm start: links received while the app is running. */
  onDeepLink(handler: (url: string) => void): Unsubscribe;

  storage: PlatformStorage;
}
