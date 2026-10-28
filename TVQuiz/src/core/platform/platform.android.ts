import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import {
  AppState,
  BackHandler,
  HWEvent,
  Linking,
  TVEventHandler,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { PlatformAdapter, RemoteKey } from 'types/platform.interface';

/** TV remote event names mapped to our RemoteKey. Back arrives through BackHandler instead. */
const TV_EVENT_KEYS: Record<string, RemoteKey> = {
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
  select: 'enter',
};

/**
 * Key down (0) is used by the focus engine and usually never reaches JS, so one
 * press is counted on key up (1). Ignoring key down avoids counting a press twice.
 */
const KEY_DOWN = 0;

function isOnline(state: NetInfoState): boolean {
  // isInternetReachable is null while unknown; treat unknown as online.
  return state.isConnected !== false && state.isInternetReachable !== false;
}

export const platform: PlatformAdapter = {
  name: 'androidtv',

  async getDeviceInfo() {
    return {
      model: DeviceInfo.getModel(),
      osVersion: `Android ${DeviceInfo.getSystemVersion()}`,
      appVersion: DeviceInfo.getVersion(),
    };
  },

  onRemoteKey(handler) {
    const tvSubscription = TVEventHandler.addListener((event: HWEvent) => {
      const key = TV_EVENT_KEYS[event.eventType];
      if (key && event.eventKeyAction !== KEY_DOWN) {
        handler(key);
      }
    });
    const backSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handler('back');
        // Only listening: let the real Back handlers decide what happens.
        return false;
      },
    );
    return () => {
      tvSubscription?.remove();
      backSubscription.remove();
    };
  },

  onBack(handler) {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handler,
    );
    return () => subscription.remove();
  },

  exitApp() {
    BackHandler.exitApp();
  },

  onAppStateChange(handler) {
    const subscription = AppState.addEventListener('change', state => {
      handler(state === 'active' ? 'active' : 'background');
    });
    return () => subscription.remove();
  },

  async isOnline() {
    return isOnline(await NetInfo.fetch());
  },

  onNetworkChange(handler) {
    return NetInfo.addEventListener(state => handler(isOnline(state)));
  },

  getInitialDeepLink() {
    return Linking.getInitialURL();
  },

  onDeepLink(handler) {
    const subscription = Linking.addEventListener('url', ({ url }) =>
      handler(url),
    );
    return () => subscription.remove();
  },

  storage: AsyncStorage,
};
