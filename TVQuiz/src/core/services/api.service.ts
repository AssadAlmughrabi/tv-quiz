import axios, { AxiosError } from 'axios';
import { REQUEST_TIMEOUT_MS } from 'core/constants/api.const';

export type ApiErrorType = 'timeout' | 'network' | 'http' | 'parse' | 'aborted';

export class ApiError extends Error {
  type: ApiErrorType;
  /** HTTP status, only for type 'http'. */
  status?: number;

  constructor(type: ApiErrorType, message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
  }
}

/** Shared axios instance. Interceptors (e.g. the fault injector) are added on it. */
export const http = axios.create({
  timeout: REQUEST_TIMEOUT_MS,
  responseType: 'json',
  transitional: {
    // Throw on invalid JSON instead of silently returning a string.
    silentJSONParsing: false,
    // Report timeouts as ETIMEDOUT instead of the generic ECONNABORTED.
    clarifyTimeoutError: true,
  },
});

export interface RequestOptions {
  method?: 'GET' | 'POST';
  params?: Record<string, string | number>;
  body?: unknown;
  timeoutMs?: number;
  /** Lets the caller cancel, e.g. when the screen closes. */
  signal?: AbortSignal;
}

export async function request<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  try {
    const response = await http.request<T>({
      url,
      method: options.method ?? 'GET',
      params: options.params,
      data: options.body,
      timeout: options.timeoutMs ?? REQUEST_TIMEOUT_MS,
      signal: options.signal,
    });
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  if (axios.isCancel(error)) {
    return new ApiError('aborted', 'Request cancelled');
  }
  if (axios.isAxiosError(error)) {
    if (
      error.code === AxiosError.ETIMEDOUT ||
      error.code === AxiosError.ECONNABORTED
    ) {
      return new ApiError('timeout', 'The server took too long to answer');
    }
    const status = error.response?.status;
    if (status !== undefined) {
      // A 2xx with ERR_BAD_RESPONSE means the body was not valid JSON.
      if (status < 300 && error.code === AxiosError.ERR_BAD_RESPONSE) {
        return new ApiError('parse', 'The server sent invalid data');
      }
      return new ApiError('http', `Server error ${status}`, status);
    }
    return new ApiError('network', 'No connection to the server');
  }
  return new ApiError('network', String(error));
}
