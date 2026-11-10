import React from 'react';
import { View } from 'react-native';

import { AppText, Button, Card, Screen } from '@/components';
import { languageStrings } from '@/constants/languageStrings';
import { styles } from '@/screens/WhyPermissionsScreen/styles';
import { useAppTheme } from '@/theme';

type WhyPermissionsScreenProps = {
  onPrimaryAction: () => void;
};

export const WhyPermissionsScreen: React.FC<WhyPermissionsScreenProps> = ({ onPrimaryAction }) => {
  const theme = useAppTheme();

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.topSection}>
        <View style={styles.heroBlock}>
          <View style={[styles.shieldShell, { backgroundColor: theme.colors.surfaceStrong }]}> 
            <View style={[styles.shieldCore, { backgroundColor: theme.colors.primary }]}> 
              <AppText color={theme.colors.textOnPrimary} variant="title">
                🔒
              </AppText>
            </View>
          </View>
          <AppText style={styles.heading} variant="title">
            {languageStrings.onboarding.whyPermissions.title}
          </AppText>
          <AppText color={theme.colors.textMuted} style={styles.copy}>
            {languageStrings.onboarding.whyPermissions.subtitle}
          </AppText>
        </View>

        <Card style={styles.pointsCard}>
          {languageStrings.onboarding.whyPermissions.points.map(point => (
            <View key={point} style={styles.pointRow}>
              <View
                style={[
                  styles.pointBadge,
                  { backgroundColor: theme.colors.surfaceStrong, borderRadius: theme.radius.pill },
                ]}
              >
                <AppText color={theme.colors.primary} variant="caption">
                  ✓
                </AppText>
              </View>
              <AppText color={theme.colors.textSecondary} style={styles.pointText}>
                {point}
              </AppText>
            </View>
          ))}
        </Card>

        <View style={styles.buttonWrap}>
          <Button onPress={onPrimaryAction} title={languageStrings.onboarding.whyPermissions.buttonLabel} />
        </View>
      </View>
    </Screen>
  );
};
