const palette = {
  midnight: '#030712',
  obsidian: '#0B1324',
  charcoal: '#111A2F',
  titanium: '#1E293B',
  steel: '#334155',
  graphite: '#475569',
  silver: '#94A3B8',
  platinum: '#E2E8F0',
  pearl: '#F8FAFC',
  azure: '#0EA5E9',
  glow: '#06B6D4',
  amethyst: '#7C3AED',
  rose: '#F472B6',
  ember: '#FB7185',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

const typography = {
  headingXL: { fontSize: 32, fontWeight: '700' as const },
  headingL: { fontSize: 24, fontWeight: '700' as const },
  headingM: { fontSize: 20, fontWeight: '600' as const },
  title: { fontSize: 28, fontWeight: '600' as const, letterSpacing: 0.5 },
  subtitle: { fontSize: 18, fontWeight: '400' as const, letterSpacing: 0.3 },
  button: { fontSize: 16, fontWeight: '600' as const, letterSpacing: 0.4 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, letterSpacing: 0.2, lineHeight: 18 },
};

export const theme = {
  palette,
  colors: {
    primary: '#7C3AED',
    secondary: '#06B6D4',
    background: palette.midnight,
    surface: palette.obsidian,
    surfaceAlt: palette.charcoal,
    border: palette.titanium,
    success: '#22C55E',
    warning: '#FACC15',
    error: '#F87171',
  },
  text: {
    primary: palette.pearl,
    secondary: palette.platinum,
    muted: palette.silver,
    inverted: palette.midnight,
  },
  gradients: {
    appBackground: ['#050818', '#020617'],
    card: ['#0E1528', '#121B33'],
    cta: ['#7C3AED', '#06B6D4'],
    accent: ['#0EA5E9', '#7C3AED'],
    matrix: ['#14B8A6', '#6366F1'],
  },
  spacing,
  radii: {
    sm: 10,
    md: 16,
    lg: 24,
    pill: 999,
  },
  radius: {
    sm: 10,
    md: 16,
    lg: 24,
    pill: 999,
  },
  typography,
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 12,
    },
    button: {
      shadowColor: '#0EA5E9',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.45,
      shadowRadius: 14,
      elevation: 6,
    },
  },
  shadow: {
    panel: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 18,
      elevation: 10,
    },
    button: {
      shadowColor: '#0EA5E9',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
    },
  },
};

export type Theme = typeof theme;
