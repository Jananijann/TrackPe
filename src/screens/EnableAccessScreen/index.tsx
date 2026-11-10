import React from 'react';
import { View } from 'react-native';

import { AppText, Button, Card, Screen } from '@/components';
import { languageStrings } from '@/constants/languageStrings';
import { styles } from '@/screens/EnableAccessScreen/styles';
import { useAppTheme } from '@/theme';

type EnableAccessScreenProps = {
  onPrimaryAction: () => void;
  isCheckingPermission?: boolean;
};

export const EnableAccessScreen: React.FC<EnableAccessScreenProps> = ({
  onPrimaryAction,
  isCheckingPermission = false,
}) => {
  const theme = useAppTheme();

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.topSection}>
        <View style={styles.heroBlock}>
          <View style={[styles.bellShell, { backgroundColor: theme.colors.surfaceStrong }]}> 
            <AppText style={styles.bellIcon} variant="hero">
              🔔
            </AppText>
          </View>
          <AppText style={styles.heading} variant="title">
            {languageStrings.onboarding.enableAccess.title}
          </AppText>
        </View>

        <Card style={styles.stepsCard}>
          {languageStrings.onboarding.enableAccess.steps.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <AppText color={theme.colors.textSecondary} style={styles.stepNumber} variant="label">
                {index + 1}.
              </AppText>
              <AppText color={theme.colors.textSecondary} style={styles.stepText}>
                {step}
              </AppText>
            </View>
          ))}
        </Card>

        <Card style={[styles.tipCard, { backgroundColor: theme.colors.surfaceMuted }]}> 
          <View
            style={[
              styles.tipBadge,
              { backgroundColor: theme.colors.surfaceStrong, borderRadius: theme.radius.pill },
            ]}
          >
            <AppText color={theme.colors.primary} variant="caption">
              ⌂
            </AppText>
          </View>
          <AppText color={theme.colors.textSecondary} style={styles.tipCopy} variant="caption">
            {languageStrings.onboarding.enableAccess.tip}
          </AppText>
        </Card>

        <View style={styles.buttonWrap}>
          <Button
            disabled={isCheckingPermission}
            onPress={onPrimaryAction}
            title={
              isCheckingPermission
                ? languageStrings.onboarding.enableAccess.buttonCheckingLabel
                : languageStrings.onboarding.enableAccess.buttonLabel
            }
          />
        </View>
      </View>
    </Screen>
  );
};
