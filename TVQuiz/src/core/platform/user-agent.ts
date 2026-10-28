export interface UserAgentInfo {
  /** e.g. "LG webOS TV", "Samsung Tizen TV", "Chrome 130". */
  model: string;
  /** e.g. "webOS (Chrome 87)", "Tizen 5.5", "Linux". */
  osVersion: string;
}

const versionOf = (ua: string, pattern: RegExp) => ua.match(pattern)?.[1];

/** The browser and its main version, e.g. "Chrome 130"; Edge is checked before Chrome. */
function browserOf(ua: string): string {
  const browsers: [string, RegExp][] = [
    ['Edge', /Edg\/(\d+)/],
    ['Firefox', /Firefox\/(\d+)/],
    ['Chrome', /Chrome\/(\d+)/],
    ['Safari', /Version\/(\d+).*Safari/],
  ];
  for (const [name, pattern] of browsers) {
    const version = versionOf(ua, pattern);
    if (version) {
      return `${name} ${version}`;
    }
  }
  return 'Web browser';
}

function systemOf(ua: string): string {
  const android = versionOf(ua, /Android ([\d.]+)/);
  if (android) {
    return `Android ${android}`;
  }
  const windows = versionOf(ua, /Windows NT ([\d.]+)/);
  if (windows) {
    return `Windows NT ${windows}`;
  }
  const mac = versionOf(ua, /Mac OS X ([\d_]+)/);
  if (mac) {
    return `macOS ${mac.replace(/_/g, '.')}`;
  }
  if (/CrOS/.test(ua)) {
    return 'ChromeOS';
  }
  return /Linux/.test(ua) ? 'Linux' : 'Unknown';
}

/**
 * Short, readable device and system names for About, from the browser's user agent.
 * TVs are recognised first: their user agents also contain "Linux" and "Chrome".
 */
export function describeUserAgent(ua: string): UserAgentInfo {
  if (/Web0S|webOS/i.test(ua)) {
    return { model: 'LG webOS TV', osVersion: `webOS (${browserOf(ua)})` };
  }
  const tizen = versionOf(ua, /Tizen ([\d.]+)/);
  if (tizen) {
    return { model: 'Samsung Tizen TV', osVersion: `Tizen ${tizen}` };
  }
  return { model: browserOf(ua), osVersion: systemOf(ua) };
}
