import { ViewStyle } from 'react-native';

/**
 * Web: no glow. A blurred box-shadow is one of the slowest things a browser draws, and at 4K it
 * made each focus move miss frames. Focus stays clear from the border and the zoom.
 */
export const FOCUS_GLOW: ViewStyle = {};
