import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
  Button,
  EmptyState,
  Screen,
  SectionHeader,
  StatCard,
  TextField,
} from '@/components';
import { useAppTheme } from '@/theme';

type HomePreviewScreenProps = {
  onOpenDevTools: () => void;
};

export const HomePreviewScreen: React.FC<HomePreviewScreenProps> = ({ onOpenDevTools }) => {
  const theme = useAppTheme();

  return (
    <Screen scrollable contentStyle={styles.content}>
      <View style={styles.heroRow}>
        <View>
          <AppText color={theme.colors.textMuted} variant="label">
            Hi, Janani
          </AppText>
          <AppText style={styles.heading} variant="title">
            Good Morning
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onOpenDevTools}
          style={[
            styles.devPill,
            {
              backgroundColor: theme.colors.secondary,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.pill,
            },
          ]}
        >
          <AppText color={theme.colors.primary} variant="caption">
            Dev tools
          </AppText>
        </Pressable>
      </View>

      <SectionHeader
        title="This month spend"
        subtitle="A reusable dashboard shell for the rest of the application."
      />

      <View style={styles.statsRow}>
        <StatCard label="Spent" tone="primary" trend="+12% vs last month" value="₹12,450" />
        <StatCard label="Captured" tone="success" trend="24 auto entries" value="92%" />
      </View>

      <SectionHeader
        title="Manual entry"
        subtitle="Form controls and field states use the same semantic tokens."
      />

      <View style={styles.formStack}>
        <TextField
          helperText="Numeric amount from UPI or manual expense"
          keyboardType="numeric"
          label="Amount"
          placeholder="₹ 0.00"
        />
        <TextField label="Merchant" placeholder="Enter merchant name" />
        <TextField label="Category" placeholder="Food & Drinks" />
        <Button title="Save Expense" />
      </View>

      <SectionHeader
        title="Empty state"
        subtitle="Used for lists, permission walls, and zero-data scenarios."
      />

      <EmptyState
        actionLabel="Add Expense"
        description="Make a payment or add an expense manually to start filling this list."
        onAction={() => undefined}
        title="No expenses yet"
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 24,
  },
  heroRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heading: {
    marginTop: 4,
  },
  devPill: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formStack: {
    gap: 16,
  },
});
