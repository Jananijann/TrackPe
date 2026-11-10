export const colorTokens = {
  indigo: '#5B4CFF',
  indigoDark: '#4338CA',
  indigoSoft: '#EEF0FF',
  mint: '#19C37D',
  mintSoft: '#E9FBF3',
  amber: '#F59E0B',
  amberSoft: '#FFF7E6',
  red: '#EF4444',
  redSoft: '#FEEDEE',
  slate900: '#0F172A',
  slate700: '#334155',
  slate500: '#64748B',
  slate300: '#CBD5E1',
  slate200: '#E2E8F0',
  slate100: '#F1F5F9',
  white: '#FFFFFF',
  black: '#020617',
} as const;

export const spacingTokens = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radiusTokens = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const shadowTokens = {
  soft: {
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  lift: {
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 8,
  },
} as const;

export const typographyTokens = {
  hero: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800' as const,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyStrong: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500' as const,
  },
} as const;
