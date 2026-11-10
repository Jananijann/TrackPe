/**
 * @format
 */

import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

const mockEnsureNotificationPermission = jest.fn();
const mockHasNotificationPermission = jest.fn();

jest.mock('@react-navigation/native', () => {
  const React = require('react');

  return {
    DefaultTheme: { colors: {} },
    DarkTheme: { colors: {} },
    NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');

  return {
    createNativeStackNavigator: () => ({
      Navigator: ({ children }: { children: React.ReactNode }) => children,
      Screen: ({ children, component: Component, getComponent }: any) => {
        if (typeof children === 'function') {
          return children({});
        }

        if (Component) {
          return <Component />;
        }

        if (getComponent) {
          const LazyComponent = getComponent();
          return <LazyComponent />;
        }

        return null;
      },
    }),
  };
});

jest.mock('@/native/notificationListenerClient', () => ({
  ensureNotificationPermission: (...args: unknown[]) => mockEnsureNotificationPermission(...args),
  hasNotificationPermission: (...args: unknown[]) => mockHasNotificationPermission(...args),
}));

import App from '../App';

beforeEach(() => {
  mockEnsureNotificationPermission.mockResolvedValue(false);
  mockHasNotificationPermission.mockResolvedValue(false);
});

afterEach(() => {
  jest.clearAllMocks();
});

test('renders onboarding flow shell', () => {
  jest.useFakeTimers();

  render(<App />);

  expect(screen.getByText('TrackPe')).toBeOnTheScreen();

  act(() => {
    jest.advanceTimersByTime(2600);
  });

  expect(screen.getByText('Track every rupee automatically')).toBeOnTheScreen();
  expect(screen.getByText('Get Started')).toBeOnTheScreen();

  jest.useRealTimers();
});

test('moves to access enabled when permission is granted from onboarding', async () => {
  jest.useFakeTimers();
  mockEnsureNotificationPermission.mockResolvedValue(true);

  render(<App />);

  act(() => {
    jest.advanceTimersByTime(2600);
  });

  fireEvent.press(screen.getByText('Get Started'));
  expect(screen.getByText('We need access to\nnotifications')).toBeOnTheScreen();

  fireEvent.press(screen.getByText('Continue'));
  expect(screen.getByText('Enable Notification\nAccess')).toBeOnTheScreen();

  await act(async () => {
    fireEvent.press(screen.getByText('Enable Access'));
  });

  await waitFor(() => {
    expect(screen.getByText("You're All Set!")).toBeOnTheScreen();
    expect(screen.getByText('Continue to App')).toBeOnTheScreen();
  });

  jest.useRealTimers();
});
