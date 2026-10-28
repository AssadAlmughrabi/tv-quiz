import { TRIVIA_API_URL as ENV_TRIVIA_API_URL } from '@env';

export const TRIVIA_API_URL = ENV_TRIVIA_API_URL;

/** The Trivia API returns at most 50 questions per request. */
export const TRIVIA_API_MAX_LIMIT = 50;

/** A request with no answer after this long fails with a timeout error. */
export const REQUEST_TIMEOUT_MS = 10000;
