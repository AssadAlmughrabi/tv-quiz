import { REQUEST_TIMEOUT_MS } from 'core/constants/api.const';
import { ApiError, http } from 'core/services/api.service';
import { delay } from 'core/utils/delay.utils';

export type FaultMode = 'none' | 'slow' | 'error' | 'offline' | 'hang';

const SLOW_MS = 3000;

let mode: FaultMode = 'none';

export function setFaultMode(next: FaultMode): void {
  mode = next;
}

export function getFaultMode(): FaultMode {
  return mode;
}

/** Waits or throws according to the current mode. Does nothing in 'none'. */
export async function applyFault(): Promise<void> {
  switch (mode) {
    case 'none':
      return;
    case 'slow':
      await delay(SLOW_MS);
      return;
    case 'error':
      throw new ApiError('http', 'Injected server error', 500);
    case 'offline':
      throw new ApiError('network', 'Injected offline');
    case 'hang':
      await delay(REQUEST_TIMEOUT_MS);
      throw new ApiError('timeout', 'Injected timeout');
  }
}

/**
 * Runs applyFault before every axios request. Call once at startup, in dev only.
 * Also exposes `__setFaultMode('offline')` etc. on the global object, so tests and the
 * browser console can force a state without changing code.
 */
export function installFaultInjector(): void {
  http.interceptors.request.use(async config => {
    await applyFault();
    return config;
  });
  (globalThis as { __setFaultMode?: typeof setFaultMode }).__setFaultMode =
    setFaultMode;
}
