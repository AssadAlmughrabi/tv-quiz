import { ViewStyle } from 'react-native';
import { COLORS } from 'core/constants/theme-colors.const';
import { scale } from 'core/utils/scale.utils';

/** Soft glow around a focused item. Native TVs draw it cheaply; the web build has its own version. */
export const FOCUS_GLOW: ViewStyle = {
  elevation: 12,
  shadowColor: COLORS.focus,
  shadowOpacity: 0.5,
  shadowRadius: scale(20),
};
