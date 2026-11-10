import React from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/AppText';
import { useAppTheme } from '@/theme';

type TextFieldProps = TextInputProps & {
  label: string;
  helperText?: string;
  errorText?: string;
};

export const TextField: React.FC<TextFieldProps> = ({
  label,
  helperText,
  errorText,
  style,
  ...rest
}) => {
  const theme = useAppTheme();
  const hasError = Boolean(errorText);

  return (
    <View style={styles.container}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        {...rest}
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: hasError ? theme.colors.danger : theme.colors.inputBorder,
            borderRadius: theme.radius.md,
            color: theme.colors.textPrimary,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.md,
          },
          style,
        ]}
      />
      {errorText ? (
        <AppText color={theme.colors.danger} variant="caption">
          {errorText}
        </AppText>
      ) : helperText ? (
        <AppText color={theme.colors.textMuted} variant="caption">
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    fontSize: 16,
  },
});
