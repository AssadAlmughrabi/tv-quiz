import { PlatformAdapter } from 'types/platform.interface';

/**
 * The file TypeScript and screens see. It has no code: when bundling, Metro picks
 * platform.android.ts or platform.ios.ts, and the web build picks
 * platform.web.ts, platform.webos.ts or platform.tizen.ts instead.
 * Screens always import from here, never from a platform file directly.
 */
export declare const platform: PlatformAdapter;
