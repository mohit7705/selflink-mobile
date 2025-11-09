import { gradients, palette } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

export const theme = {
  palette,
  gradients,
  spacing,
  typography,
  radius: {
    sm: 12,
    md: 20,
    lg: 28,
    pill: 999,
    full: 999,
  },
  shadow: {
    panel: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 12,
    },
    button: {
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    },
  },
};

export type Theme = typeof theme;
