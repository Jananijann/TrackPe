import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useAppTheme } from '@/theme';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
};

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, trailing }) => {
  const theme = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <AppText variant="sectionTitle">{title}</AppText>
        {subtitle ? (
          <AppText color={theme.colors.textMuted} style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {trailing}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
  },
  subtitle: {
    marginTop: 6,
  },
});
