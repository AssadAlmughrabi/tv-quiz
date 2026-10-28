import { TextStyle, ViewProps } from 'react-native';
import { Language } from 'types/language.interface';

/**
 * Props that make a view and everything inside it right-to-left for Arabic.
 * Web: the HTML `dir` attribute (react-native-web does not accept the `direction` style).
 */
export function directionProps(lang: Language): ViewProps {
  return { dir: lang === 'ar' ? 'rtl' : 'ltr' } as ViewProps;
}

/**
 * Aligns text to the start of the app's reading direction (right in Arabic), whatever
 * language the text itself is in. Web: browsers never swap left and right, so pick the side.
 */
export function textAlignStart(lang: Language): TextStyle {
  return { textAlign: lang === 'ar' ? 'right' : 'left' };
}
