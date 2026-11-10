import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/AppText';
import { useAppTheme } from '@/theme';

type ButtonVariant = 'primary' | 'secondary';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  testID?: string;
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  style,
  disabled = false,
  testID,
}) => {
  const theme = useAppTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isPrimary
            ? pressed
              ? theme.colors.primaryPressed
              : theme.colors.primary
            : theme.colors.secondary,
          borderColor: isPrimary ? theme.colors.primary : theme.colors.border,
          borderRadius: theme.radius.md,
          opacity: disabled ? 0.5 : 1,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
        },
        style,
      ]}
      testID={testID}
    >
      <View style={styles.content}>
        <AppText
          color={isPrimary ? theme.colors.textOnPrimary : theme.colors.primary}
          variant="bodyStrong"
        >
          {title}
        </AppText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
