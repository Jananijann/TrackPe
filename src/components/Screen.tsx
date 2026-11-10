import React from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme';

type ScreenProps = {
  children: React.ReactNode;
  scrollable?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  safeAreaBackgroundColor?: string;
};

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  contentStyle,
  safeAreaBackgroundColor,
}) => {
  const theme = useAppTheme();
  const backgroundColor = safeAreaBackgroundColor ?? theme.colors.background;

  if (scrollable) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { padding: theme.spacing.xl },
            contentStyle,
          ]}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={[styles.content, { padding: theme.spacing.xl }, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
