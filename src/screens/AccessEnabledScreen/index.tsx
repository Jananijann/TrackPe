import React from 'react';
import { View } from 'react-native';

import { AppText, Button, Screen } from '@/components';
import { languageStrings } from '@/constants/languageStrings';
import { styles } from '@/screens/AccessEnabledScreen/styles';
import { useAppTheme } from '@/theme';

type AccessEnabledScreenProps = {
  onPrimaryAction: () => void;
};

export const AccessEnabledScreen: React.FC<AccessEnabledScreenProps> = ({ onPrimaryAction }) => {
  const theme = useAppTheme();

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.topSection}>
        <View style={styles.heroBlock}>
          <View style={[styles.checkShell, { backgroundColor: theme.colors.successSurface }]}> 
            <View style={[styles.checkCore, { backgroundColor: theme.colors.success }]}> 
              <AppText color={theme.colors.textOnPrimary} style={styles.checkMark} variant="hero">
                ✓
              </AppText>
            </View>
          </View>
          <AppText style={styles.heading} variant="title">
            {languageStrings.onboarding.accessEnabled.title}
          </AppText>
          <AppText color={theme.colors.textMuted} style={styles.copy}>
            {languageStrings.onboarding.accessEnabled.subtitle}
          </AppText>
        </View>

        <View style={styles.buttonWrap}>
          <Button
            onPress={onPrimaryAction}
            title={languageStrings.onboarding.accessEnabled.buttonLabel}
          />
        </View>
      </View>
    </Screen>
  );
};
