import React from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { useAppTheme } from '@/theme';

type AppTextVariant =
  | 'hero'
  | 'title'
  | 'sectionTitle'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'caption';

type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  color?: string;
};

export const AppText: React.FC<AppTextProps> = ({ variant = 'body', color, style, ...rest }) => {
  const theme = useAppTheme();
  const variantStyle = theme.typography[variant] as TextStyle;

  return (
    <Text
      {...rest}
      style={[styles.base, variantStyle, { color: color ?? theme.colors.textPrimary }, style]}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
