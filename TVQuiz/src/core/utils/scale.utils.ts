import { Dimensions, PixelRatio } from 'react-native';

/** Every size in the app is written for a 1920-wide screen. */
const DESIGN_WIDTH = 1920;

const factor = Dimensions.get('window').width / DESIGN_WIDTH;

/**
 * Converts a size from the 1920x1080 design to this screen's units.
 * An Android TV at 1080p is 960 units wide, a 720p web TV 1280, a 4K screen the same as 1080p.
 */
export function scale(size: number): number {
  return PixelRatio.roundToNearestPixel(size * factor);
}
