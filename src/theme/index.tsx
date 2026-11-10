import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import {
  colorTokens,
  radiusTokens,
  shadowTokens,
  spacingTokens,
  typographyTokens,
} from '@/theme/tokens';

export type ThemeMode = 'light' | 'dark';

export type AppTheme = {
  mode: ThemeMode;
  toggleMode: () => void;
  colors: {
    background: string;
    backgroundAccent: string;
    surface: string;
    surfaceMuted: string;
    surfaceStrong: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textOnPrimary: string;
    primary: string;
    primaryPressed: string;
    secondary: string;
    success: string;
    successSurface: string;
    warning: string;
    warningSurface: string;
    danger: string;
    dangerSurface: string;
    inputBackground: string;
    inputBorder: string;
  };
  spacing: typeof spacingTokens;
  radius: typeof radiusTokens;
  shadows: typeof shadowTokens;
  typography: typeof typographyTokens;
};

const lightTheme: AppTheme = {
  mode: 'light',
  toggleMode: () => undefined,
  colors: {
    background: '#F8FAFF',
    backgroundAccent: '#EEF0FF',
    surface: colorTokens.white,
    surfaceMuted: '#F8FAFC',
    surfaceStrong: '#EEF2FF',
    border: '#E6EAF5',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    textOnPrimary: colorTokens.white,
    primary: colorTokens.indigo,
    primaryPressed: colorTokens.indigoDark,
    secondary: '#EDF2FF',
    success: colorTokens.mint,
    successSurface: colorTokens.mintSoft,
    warning: colorTokens.amber,
    warningSurface: colorTokens.amberSoft,
    danger: colorTokens.red,
    dangerSurface: colorTokens.redSoft,
    inputBackground: colorTokens.white,
    inputBorder: '#D8DEF0',
  },
  spacing: spacingTokens,
  radius: radiusTokens,
  shadows: shadowTokens,
  typography: typographyTokens,
};

const darkTheme: AppTheme = {
  mode: 'dark',
  toggleMode: () => undefined,
  colors: {
    background: '#090E1A',
    backgroundAccent: '#121933',
    surface: '#121A2B',
    surfaceMuted: '#172036',
    surfaceStrong: '#1C2750',
    border: '#26324A',
    textPrimary: '#F8FAFC',
    textSecondary: '#D6DFF2',
    textMuted: '#94A3B8',
    textOnPrimary: colorTokens.white,
    primary: '#7C74FF',
    primaryPressed: '#6A61F6',
    secondary: '#1C2750',
    success: '#35D399',
    successSurface: '#0B2A20',
    warning: '#FBBF24',
    warningSurface: '#36230A',
    danger: '#FB7185',
    dangerSurface: '#39131B',
    inputBackground: '#111827',
    inputBorder: '#334155',
  },
  spacing: spacingTokens,
  radius: radiusTokens,
  shadows: shadowTokens,
  typography: typographyTokens,
};

const ThemeContext = createContext<AppTheme>(lightTheme);

type ThemeProviderProps = {
  children: React.ReactNode;
  mode?: ThemeMode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, mode }) => {
  const scheme = useColorScheme();
  const [internalMode, setInternalMode] = useState<ThemeMode>(scheme === 'dark' ? 'dark' : 'light');

  const resolvedMode = mode ?? internalMode;

  const toggleMode = useCallback((): void => {
    if (mode) {
      return;
    }

    setInternalMode(current => (current === 'dark' ? 'light' : 'dark'));
  }, [mode]);

  const theme = useMemo((): AppTheme => {
    const baseTheme = resolvedMode === 'dark' ? darkTheme : lightTheme;

    return {
      ...baseTheme,
      toggleMode,
    };
  }, [resolvedMode, toggleMode]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = (): AppTheme => useContext(ThemeContext);

export { lightTheme, darkTheme };
