import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { useAppTheme } from '@/theme';

type StatCardProps = {
  label: string;
  value: string;
  trend?: string;
  tone?: 'primary' | 'success';
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, trend, tone = 'primary' }) => {
  const theme = useAppTheme();
  const toneColor = tone === 'success' ? theme.colors.success : theme.colors.primary;
  const toneSurface = tone === 'success' ? theme.colors.successSurface : theme.colors.surfaceStrong;

  return (
    <Card style={[styles.card, { backgroundColor: toneSurface }]}>
      <AppText color={theme.colors.textMuted} variant="caption">
        {label}
      </AppText>
      <AppText style={styles.value} variant="title">
        {value}
      </AppText>
      {trend ? (
        <View
          style={[
            styles.badge,
            { backgroundColor: theme.colors.surface, borderRadius: theme.radius.pill },
          ]}
        >
          <AppText color={toneColor} variant="caption">
            {trend}
          </AppText>
        </View>
      ) : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: 10,
  },
  value: {
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
