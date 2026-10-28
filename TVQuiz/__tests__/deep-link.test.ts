import { parseDeepLink } from 'core/navigation/deep-link';

describe('parseDeepLink', () => {
  it('opens a quiz over Home from an app link', () => {
    expect(parseDeepLink('tvquiz://quiz/science-easy')).toEqual([
      { name: 'home' },
      { name: 'question', params: { quizId: 'science-easy' } },
    ]);
  });

  it('opens a category over Home from an app link', () => {
    expect(parseDeepLink('tvquiz://category/film_and_tv')).toEqual([
      { name: 'home' },
      { name: 'category', params: { categoryId: 'film_and_tv' } },
    ]);
  });

  it('reads web links from the query string', () => {
    expect(parseDeepLink('http://localhost:8080/?quiz=music-hard#x')).toEqual([
      { name: 'home' },
      { name: 'question', params: { quizId: 'music-hard' } },
    ]);
    expect(
      parseDeepLink('https://tv.example/?lang=en&category=science'),
    ).toEqual([
      { name: 'home' },
      { name: 'category', params: { categoryId: 'science' } },
    ]);
  });

  it('ignores no link, unknown kinds and unsafe ids', () => {
    expect(parseDeepLink(null)).toBeNull();
    expect(parseDeepLink('http://localhost:8080/')).toBeNull();
    expect(parseDeepLink('tvquiz://settings/x')).toBeNull();
    expect(parseDeepLink('tvquiz://quiz/../../etc')).toBeNull();
    expect(parseDeepLink('tvquiz://quiz/%3Cscript%3E')).toBeNull();
    expect(parseDeepLink('tvquiz://quiz/%E0%A4%A')).toBeNull();
  });
});
