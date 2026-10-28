import { useEffect, useState } from 'react';
import { platform } from 'core/platform/platform';

/**
 * Whether the device has a connection now, updated live. Starts as online, so nothing
 * flashes "offline" while the first check runs.
 */
export function useOnline(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let active = true;
    platform
      .isOnline()
      .then(now => active && setOnline(now))
      .catch(() => {});
    const stop = platform.onNetworkChange(next => setOnline(next));
    return () => {
      active = false;
      stop();
    };
  }, []);

  return online;
}
