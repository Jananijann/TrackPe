import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppState, Platform } from 'react-native';

import { upsertExpense } from '@/db/expenseRepository';
import { AddManualEntryScreen } from '@/screens/AddManualEntryScreen';
import { AccessEnabledScreen } from '@/screens/AccessEnabledScreen';
import { EnableAccessScreen } from '@/screens/EnableAccessScreen';
import { HomePreviewScreen } from '@/screens/HomePreviewScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { SplashScreen } from '@/screens/SplashScreen';
import { WhyPermissionsScreen } from '@/screens/WhyPermissionsScreen';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { useAppTheme } from '@/theme';
import type { ParsedNotificationExpense } from '@/types/expense';

import {
  ensureNotificationPermission,
  hasNotificationPermission,
} from '@/native/notificationListenerClient';

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  WhyPermissions: undefined;
  EnableAccess: undefined;
  AccessEnabled: undefined;
  Home: undefined;
  AddManualEntry: undefined;
  HomePreview: undefined;
  NotificationDev: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const theme = useAppTheme();
  const [routeName, setRouteName] = useState<keyof RootStackParamList>('Splash');
  const [isCheckingPermission, setIsCheckingPermission] = useState<boolean>(false);
  const [homeRefreshNonce, setHomeRefreshNonce] = useState<number>(0);

  useEffect(() => {
    if (routeName !== 'Splash') {
      return;
    }

    const timeoutId = setTimeout(() => {
      setRouteName('Welcome');
    }, 2500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [routeName]);

  useEffect(() => {
    if (routeName !== 'EnableAccess') {
      return;
    }

    if (Platform.OS === 'ios') {
      setRouteName('Home');
      return;
    }

    let isMounted = true;

    const syncPermission = async (): Promise<void> => {
      const isGranted = await hasNotificationPermission().catch(() => false);
      if (isMounted && isGranted) {
        setRouteName('AccessEnabled');
      }
    };

    syncPermission().catch(() => undefined);

    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        syncPermission().catch(() => undefined);
      }
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [routeName]);

  const requestNotificationAccess = (): void => {
    if (Platform.OS === 'ios') {
      setRouteName('Home');
      return;
    }

    setIsCheckingPermission(true);

    ensureNotificationPermission()
      .then(isGranted => {
        if (isGranted) {
          setRouteName('AccessEnabled');
        }
      })
      .catch(() => undefined)
      .finally(() => {
        setIsCheckingPermission(false);
      });
  };

  const navigationTheme = theme.mode === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer
      theme={{
        ...navigationTheme,
        colors: {
          ...navigationTheme.colors,
          background: theme.colors.background,
          border: theme.colors.border,
          card: theme.colors.surface,
          notification: theme.colors.primary,
          primary: theme.colors.primary,
          text: theme.colors.textPrimary,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          contentStyle: { backgroundColor: theme.colors.background },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.textPrimary,
          headerTitleStyle: {
            color: theme.colors.textPrimary,
            fontWeight: '700',
          },
        }}
      >
        {routeName === 'Splash' ? (
          <Stack.Screen name="Splash" options={{ headerShown: false }}>
            {() => <SplashScreen />}
          </Stack.Screen>
        ) : routeName === 'Welcome' ? (
          <Stack.Screen name="Welcome" options={{ headerShown: false }}>
            {() => (
              <WelcomeScreen
                onPrimaryAction={() =>
                  setRouteName(Platform.OS === 'ios' ? 'Home' : 'WhyPermissions')
                }
                onSecondaryAction={() => setRouteName('NotificationDev')}
              />
            )}
          </Stack.Screen>
        ) : routeName === 'WhyPermissions' ? (
          <Stack.Screen name="WhyPermissions" options={{ headerShown: false }}>
            {() => <WhyPermissionsScreen onPrimaryAction={() => setRouteName('EnableAccess')} />}
          </Stack.Screen>
        ) : routeName === 'EnableAccess' ? (
          <Stack.Screen name="EnableAccess" options={{ headerShown: false }}>
            {() => (
              <EnableAccessScreen
                isCheckingPermission={isCheckingPermission}
                onPrimaryAction={requestNotificationAccess}
              />
            )}
          </Stack.Screen>
        ) : routeName === 'AccessEnabled' ? (
          <Stack.Screen name="AccessEnabled" options={{ headerShown: false }}>
            {() => <AccessEnabledScreen onPrimaryAction={() => setRouteName('Home')} />}
          </Stack.Screen>
        ) : routeName === 'Home' ? (
          <Stack.Screen name="Home" options={{ headerShown: false }}>
            {() => (
              <HomeScreen
                onAddExpensePress={() => setRouteName('AddManualEntry')}
                refreshSignal={homeRefreshNonce}
              />
            )}
          </Stack.Screen>
        ) : routeName === 'AddManualEntry' ? (
          <Stack.Screen name="AddManualEntry" options={{ headerShown: false }}>
            {() => (
              <AddManualEntryScreen
                onCancel={() => setRouteName('Home')}
                onSave={async (expense: ParsedNotificationExpense) => {
                  await upsertExpense(expense);
                  setHomeRefreshNonce(current => current + 1);
                  setRouteName('Home');
                }}
              />
            )}
          </Stack.Screen>
        ) : routeName === 'HomePreview' ? (
          <Stack.Screen name="HomePreview" options={{ title: 'Design System Preview' }}>
            {() => <HomePreviewScreen onOpenDevTools={() => setRouteName('NotificationDev')} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen
            getComponent={() => require('@/screens/NotificationDevScreen').NotificationDevScreen}
            name="NotificationDev"
            options={{ title: 'Dev Tools' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
