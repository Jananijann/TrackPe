import React from 'react';
import { StatusBar, View } from 'react-native';

import { AppText, Screen } from '@/components';
import { languageStrings } from '@/constants/languageStrings';
import { styles } from '@/screens/SplashScreen/styles';
import { useAppTheme } from '@/theme';

export const SplashScreen: React.FC = () => {
  const theme = useAppTheme();

  return (
    <Screen
      contentStyle={[styles.screen, { backgroundColor: theme.colors.primary }]}
      safeAreaBackgroundColor={theme.colors.primary}
    >
      <StatusBar
        animated
        backgroundColor={theme.colors.primary}
        barStyle="light-content"
        translucent={false}
      />

      <View style={styles.centerContent}>
        <View style={styles.currencyBadge}>
          <AppText color={theme.colors.textOnPrimary} style={styles.currencyGlyph} variant="hero">
            {languageStrings.onboarding.splash.symbol}
          </AppText>
        </View>
        <AppText color={theme.colors.textOnPrimary} style={styles.brandName} variant="hero">
          {languageStrings.onboarding.splash.brandName}
        </AppText>
        <AppText color="rgba(255,255,255,0.9)" style={styles.copy}>
          {languageStrings.onboarding.splash.subtitle}
        </AppText>
      </View>

      <View pointerEvents="none" style={styles.backgroundWaves}>
        <View style={[styles.wave, styles.waveLarge, styles.waveLargeBorder]} />
        <View style={[styles.wave, styles.waveMedium, styles.waveMediumBorder]} />
        <View style={[styles.wave, styles.waveSmall, styles.waveSmallBorder]} />
      </View>
    </Screen>
  );
};
