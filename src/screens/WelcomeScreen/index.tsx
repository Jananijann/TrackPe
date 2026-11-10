import React from 'react';
import { Image, Platform, View } from 'react-native';

import { AppText, Button, Card, Screen } from '@/components';
import { languageStrings } from '@/constants/languageStrings';
import { styles } from '@/screens/WelcomeScreen/styles';
import { useAppTheme } from '@/theme';

type WelcomeScreenProps = {
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
};

type PlatformItem = {
  name: string;
  iconSource: number;
};

const platforms: PlatformItem[] = [
  {
    iconSource: require('@/assets/platforms/gpay-badge.jpeg'),
    name: languageStrings.onboarding.welcome.platforms[0],
  },
  {
    iconSource: require('@/assets/platforms/phonepe-badge.jpeg'),
    name: languageStrings.onboarding.welcome.platforms[1],
  },
  {
    iconSource: require('@/assets/platforms/paytm-badge.jpeg'),
    name: languageStrings.onboarding.welcome.platforms[2],
  },
  {
    iconSource: require('@/assets/platforms/cred-badge.jpeg'),
    name: languageStrings.onboarding.welcome.platforms[3],
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onPrimaryAction,
  onSecondaryAction: _onSecondaryAction,
}) => {
  const theme = useAppTheme();
  const isIos = Platform.OS === 'ios';

  return (
    <Screen contentStyle={[styles.screen, isIos ? styles.screenIos : null]}>
      <View style={styles.heroBlock}>
        <View style={[styles.heroArt, { backgroundColor: theme.colors.surfaceStrong }]}>
          <View style={[styles.phoneCard, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.phoneHeader, { backgroundColor: theme.colors.surfaceStrong }]} />
            <View style={styles.phoneBody}>
              <View
                style={[
                  styles.phoneLine,
                  styles.phoneLineLong,
                  { backgroundColor: theme.colors.border },
                ]}
              />
              <View
                style={[
                  styles.phoneLine,
                  styles.phoneLineShort,
                  { backgroundColor: theme.colors.border },
                ]}
              />
            </View>
          </View>
          <View
            style={[
              styles.heroChip,
              styles.heroChipRight,
              { backgroundColor: theme.colors.success },
            ]}
          />
          <View
            style={[
              styles.heroChip,
              styles.heroChipLeft,
              { backgroundColor: theme.colors.warning },
            ]}
          />
          <View
            style={[
              styles.heroChip,
              styles.heroChipBottom,
              { backgroundColor: theme.colors.primary },
            ]}
          />
        </View>
        <AppText style={styles.heroTitle} variant="hero">
          {languageStrings.onboarding.welcome.title}
        </AppText>
        <AppText color={theme.colors.textMuted} style={styles.subtitle}>
          {isIos
            ? languageStrings.onboarding.welcome.subtitleIos
            : languageStrings.onboarding.welcome.subtitle}
        </AppText>
      </View>

      {isIos ? null : (
        <Card style={styles.featureCard}>
          <View style={[styles.platformList, { marginTop: theme.spacing.xs }]}>
            {platforms.map(platform => (
              <View key={platform.name} style={styles.platformRow}>
                <Image source={platform.iconSource} style={styles.platformBadgeImage} />
                <AppText color={theme.colors.textSecondary} style={styles.platformLabel}>
                  {platform.name}
                </AppText>
              </View>
            ))}
          </View>
        </Card>
      )}

      <View
        style={[
          styles.footer,
          isIos ? { marginTop: theme.spacing.xl } : { marginTop: theme.spacing.xxl },
        ]}
      >
        <Button
          onPress={onPrimaryAction}
          testID="welcome-primary-action"
          title={
            isIos
              ? languageStrings.onboarding.welcome.primaryActionLabelIos
              : languageStrings.onboarding.welcome.primaryActionLabel
          }
        />
        {/* <Button
          onPress={onSecondaryAction}
          style={styles.secondaryAction}
          title={languageStrings.onboarding.welcome.secondaryActionLabel}
          variant="secondary"
        /> */}
      </View>
    </Screen>
  );
};
