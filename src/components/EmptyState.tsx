import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useAppTheme } from '@/theme';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const theme = useAppTheme();

  return (
    <Card style={styles.card}>
      <View
        style={[
          styles.illustration,
          { backgroundColor: theme.colors.surfaceStrong, borderRadius: theme.radius.lg },
        ]}
      >
        <AppText variant="title">+</AppText>
      </View>
      <AppText style={styles.title} variant="sectionTitle">
        {title}
      </AppText>
      <AppText color={theme.colors.textMuted} style={styles.description}>
        {description}
      </AppText>
      {actionLabel && onAction ? (
        <Button onPress={onAction} style={styles.button} title={actionLabel} />
      ) : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 28,
  },
  illustration: {
    alignItems: 'center',
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  title: {
    marginTop: 8,
    textAlign: 'center',
  },
  description: {
    maxWidth: 280,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'stretch',
    marginTop: 8,
  },
});
