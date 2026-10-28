import { describeUserAgent } from 'core/platform/user-agent';

describe('describeUserAgent', () => {
  it('names an LG webOS TV and its browser engine', () => {
    const ua =
      'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 WebAppManager';
    expect(describeUserAgent(ua)).toEqual({
      model: 'LG webOS TV',
      osVersion: 'webOS (Chrome 87)',
    });
  });

  it('names a Samsung Tizen TV and its Tizen version', () => {
    const ua =
      'Mozilla/5.0 (SMART-TV; LINUX; Tizen 5.5) AppleWebKit/537.36 (KHTML, like Gecko) 69.0.3497.106/5.5 TV Safari/537.36';
    expect(describeUserAgent(ua)).toEqual({
      model: 'Samsung Tizen TV',
      osVersion: 'Tizen 5.5',
    });
  });

  it('names a desktop browser and system', () => {
    const ua =
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
    expect(describeUserAgent(ua)).toEqual({
      model: 'Chrome 130',
      osVersion: 'Linux',
    });
  });

  it('tells Edge from Chrome and reads the macOS version', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0';
    expect(describeUserAgent(ua)).toEqual({
      model: 'Edge 130',
      osVersion: 'macOS 10.15.7',
    });
  });
});
