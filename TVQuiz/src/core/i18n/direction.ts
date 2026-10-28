import { TextStyle, ViewProps } from 'react-native';
import { Language } from 'types/language.interface';

/**
 * Props that make a view and everything inside it right-to-left for Arabic.
 * Native: the layout `direction` style (flex rows, start/end spacing mirror).
 */
export function directionProps(lang: Language): ViewProps {
  return { style: { direction: lang === 'ar' ? 'rtl' : 'ltr' } };
}

/**
 * Aligns text to the start of the app's reading direction (right in Arabic), whatever
 * language the text itself is in. Native: 'left' already means the start, because Android
 * swaps left and right inside a right-to-left layout.
 */
export function textAlignStart(_lang: Language): TextStyle {
  return { textAlign: 'left' };
}
