import { DependencyList, useCallback, useEffect, useState } from 'react';
import { ApiError } from 'core/services/api.service';

export type AsyncStatus = 'loading' | 'ready' | 'empty' | 'error' | 'offline';

interface AsyncState<T> {
  status: AsyncStatus;
  data?: T;
}

function stateFor<T>(data: T | undefined): AsyncState<T> {
  if (data === undefined) {
    return { status: 'loading' };
  }
  return { status: isEmpty(data) ? 'empty' : 'ready', data };
}

/**
 * Loads data for a screen or row and reports which state to show.
 * With `peek`, cached data is shown on the very first frame and then refreshed in the background,
 * so a returning screen never shows a spinner and focus can land immediately.
 * The request is cancelled when the component closes or the deps change.
 */
export function useAsyncData<T>(
  load: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList,
  peek?: () => T | undefined,
) {
  const [state, setState] = useState<AsyncState<T>>(() => stateFor(peek?.()));
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const cached = peek?.();
    setState(stateFor(cached));

    load(controller.signal)
      .then(data => {
        if (!controller.signal.aborted) {
          setState({ status: isEmpty(data) ? 'empty' : 'ready', data });
        }
      })
      .catch(error => {
        if (
          controller.signal.aborted ||
          (error instanceof ApiError && error.type === 'aborted')
        ) {
          return;
        }
        if (cached !== undefined) {
          // Refresh failed but cached data is on screen: keep showing it.
          return;
        }
        const offline = error instanceof ApiError && error.type === 'network';
        setState({ status: offline ? 'offline' : 'error' });
      });

    return () => controller.abort();
    // `load` is a new function every render; the caller's deps say when to reload.
  }, [...deps, attempt]);

  const retry = useCallback(() => setAttempt(n => n + 1), []);
  return { ...state, retry };
}

function isEmpty(data: unknown): boolean {
  return Array.isArray(data) && data.length === 0;
}
