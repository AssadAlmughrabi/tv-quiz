import { Route } from 'types/route.interface';

/** Ids are like "science-easy" or "film_and_tv": anything else is ignored, never navigated to. */
const ID = /^[a-z0-9_-]{1,64}$/i;

/**
 * The screens a link opens, with Home underneath so Back always ends at Home.
 * Accepted:
 * - tvquiz://quiz/<quizId>        and  tvquiz://category/<categoryId>   (Android, LG launch params)
 * - https://…/?quiz=<quizId>      and  https://…/?category=<categoryId>  (web)
 * Anything else (no link, unknown kind, bad id) gives null: the app opens normally.
 */
export function parseDeepLink(url: string | null | undefined): Route[] | null {
  if (!url) {
    return null;
  }
  const target = readTarget(url);
  if (!target || !ID.test(target.id)) {
    return null;
  }
  return target.kind === 'quiz'
    ? [{ name: 'home' }, { name: 'question', params: { quizId: target.id } }]
    : [
        { name: 'home' },
        { name: 'category', params: { categoryId: target.id } },
      ];
}

type Target = { kind: 'quiz' | 'category'; id: string };

function readTarget(url: string): Target | null {
  // tvquiz://quiz/science-easy
  const app = url.match(/^tvquiz:\/\/(quiz|category)\/([^/?#]+)/i);
  if (app) {
    return {
      kind: app[1].toLowerCase() as Target['kind'],
      id: safeDecode(app[2]),
    };
  }
  // …?quiz=science-easy or …?category=science
  const query = url.split('?')[1]?.split('#')[0] ?? '';
  for (const pair of query.split('&')) {
    const [key, value] = pair.split('=');
    if ((key === 'quiz' || key === 'category') && value) {
      return { kind: key, id: safeDecode(value) };
    }
  }
  return null;
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return '';
  }
}
