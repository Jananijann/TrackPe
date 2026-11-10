import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { HomeScreen } from '@/screens/HomeScreen';
import { useAppTheme } from '@/theme';
import type { ParsedNotificationExpense } from '@/types/expense';

const mockEnsureNotificationPermission = jest.fn();
const mockHasNotificationPermission = jest.fn();
const mockDrainIosCapturedNotifications = jest.fn();
const mockStartNotificationCapture = jest.fn();
const mockStopNotificationCapture = jest.fn();
const mockSubscribeToNotifications = jest.fn();
const mockToggleMode = jest.fn();
const mockListExpenses = jest.fn();
const mockUpsertExpense = jest.fn();

type NotificationCallback = (payload: {
  packageName: string;
  title: string;
  body: string;
  timestamp: number;
}) => void;

let notificationCallback: NotificationCallback | null = null;
let mockDbExpenses: ParsedNotificationExpense[] = [];

jest.mock('@/native/notificationListenerClient', () => ({
  drainIosCapturedNotifications: (...args: unknown[]) => mockDrainIosCapturedNotifications(...args),
  ensureNotificationPermission: (...args: unknown[]) => mockEnsureNotificationPermission(...args),
  hasNotificationPermission: (...args: unknown[]) => mockHasNotificationPermission(...args),
  startNotificationCapture: (...args: unknown[]) => mockStartNotificationCapture(...args),
  stopNotificationCapture: (...args: unknown[]) => mockStopNotificationCapture(...args),
  subscribeToNotifications: (...args: unknown[]) => mockSubscribeToNotifications(...args),
}));

jest.mock('@/db/expenseRepository', () => ({
  listExpenses: (...args: unknown[]) => mockListExpenses(...args),
  upsertExpense: (...args: unknown[]) => mockUpsertExpense(...args),
}));

jest.mock('@/theme', () => {
  const actualTheme = jest.requireActual('@/theme');

  return {
    ...actualTheme,
    useAppTheme: jest.fn(),
  };
});

const mockUseAppTheme = useAppTheme as jest.Mock;

describe('HomeScreen', () => {
  beforeEach(() => {
    notificationCallback = null;
    mockDbExpenses = [];

    mockEnsureNotificationPermission.mockResolvedValue(true);
    mockHasNotificationPermission.mockResolvedValue(true);
    mockDrainIosCapturedNotifications.mockResolvedValue([]);
    mockStartNotificationCapture.mockImplementation(() => undefined);
    mockStopNotificationCapture.mockImplementation(() => undefined);
    mockSubscribeToNotifications.mockImplementation((callback: NotificationCallback) => {
      notificationCallback = callback;
      return () => undefined;
    });

    mockUpsertExpense.mockImplementation(async (expense: ParsedNotificationExpense) => {
      mockDbExpenses = [expense, ...mockDbExpenses.filter(item => item.id !== expense.id)];
    });
    mockListExpenses.mockImplementation(async () => mockDbExpenses);

    mockUseAppTheme.mockImplementation(() => {
      const actualTheme = jest.requireActual('@/theme') as typeof import('@/theme');
      return {
        ...actualTheme.lightTheme,
        toggleMode: mockToggleMode,
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('shows latest expense details card when notification is parsed', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    render(<HomeScreen />);

    await waitFor(() => {
      expect(mockStartNotificationCapture).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      notificationCallback?.({
        body: 'UPI: Rs.500 debited from A/c XX1234 towards Starbucks Coffee',
        packageName: 'com.google.android.apps.nbu.paisa.user',
        timestamp: 1716600000000,
        title: 'VK-HDFCBK',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Latest Expense')).toBeOnTheScreen();
    });

    expect(screen.getAllByText('Starbucks Coffee').length).toBeGreaterThan(0);
    expect(screen.getAllByText('₹500').length).toBeGreaterThan(0);
    expect(screen.getByText('Merchant')).toBeOnTheScreen();
    expect(screen.getByText('Source')).toBeOnTheScreen();
    expect(screen.getByText('Notification')).toBeOnTheScreen();

    expect(consoleSpy).toHaveBeenCalledWith('[TrackPe][Notification][Raw]', {
      body: 'UPI: Rs.500 debited from A/c XX1234 towards Starbucks Coffee',
      packageName: 'com.google.android.apps.nbu.paisa.user',
      timestamp: 1716600000000,
      title: 'VK-HDFCBK',
    });

    consoleSpy.mockRestore();
  });

  test('does not render latest expense details card for non-debit payload', async () => {
    render(<HomeScreen />);

    await waitFor(() => {
      expect(mockStartNotificationCapture).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      notificationCallback?.({
        body: 'Rs.500 credited to your account from UPI transfer',
        packageName: 'com.google.android.apps.nbu.paisa.user',
        timestamp: 1716600000000,
        title: 'VK-HDFCBK',
      });
    });

    expect(screen.queryByText('Latest Expense')).not.toBeOnTheScreen();
  });

  test('refresh signal updates latest card and list with newest persisted expense', async () => {
    mockDbExpenses = [
      {
        amount: 120,
        createdAt: 100,
        id: 'manual-100',
        merchant: 'Old Merchant',
        packageName: 'manual:add',
        sourceLabel: 'Manual Entry',
        title: 'Added Manually',
      },
    ];

    const rendered = render(<HomeScreen refreshSignal={0} />);

    await waitFor(() => {
      expect(screen.getAllByText('Old Merchant').length).toBeGreaterThan(0);
    });

    mockDbExpenses = [
      {
        amount: 500,
        createdAt: 200,
        id: 'manual-200',
        merchant: 'New Merchant',
        packageName: 'manual:add',
        sourceLabel: 'Manual Entry',
        title: 'Added Manually',
      },
      ...mockDbExpenses,
    ];

    rendered.rerender(<HomeScreen refreshSignal={1} />);

    await waitFor(() => {
      expect(screen.getAllByText('New Merchant').length).toBeGreaterThan(1);
    });

    expect(screen.getAllByText('New Merchant').length).toBeGreaterThan(1);
  });

  test('dedupes near-identical imports so monthly total is not doubled', async () => {
    mockDbExpenses = [
      {
        amount: 1500,
        createdAt: 1716600000000,
        id: 'sms:a',
        merchant: 'Swiggy',
        packageName: 'sms:VK-HDFCBK',
        sourceLabel: 'sms:VK-HDFCBK',
        title: 'VK-HDFCBK',
      },
      {
        amount: 1500,
        createdAt: 1716600005000,
        id: 'sms:b',
        merchant: 'Swiggy',
        packageName: 'sms:VK-HDFCBK',
        sourceLabel: 'sms:VK-HDFCBK',
        title: 'VK-HDFCBK',
      },
    ];

    render(<HomeScreen />);

    await waitFor(() => {
      expect(screen.getByText('₹1,500')).toBeOnTheScreen();
    });

    expect(screen.queryByText('₹3,000')).not.toBeOnTheScreen();
  });

  test('calls add-expense callback when add tab button is pressed', async () => {
    const onAddExpensePress = jest.fn();

    render(<HomeScreen onAddExpensePress={onAddExpensePress} />);

    await waitFor(() => {
      expect(mockStartNotificationCapture).toHaveBeenCalledTimes(1);
    });

    fireEvent.press(screen.getByLabelText('Add expense'));

    expect(onAddExpensePress).toHaveBeenCalledTimes(1);
  });

  test('opens settings tab and toggles theme', async () => {
    render(<HomeScreen />);

    await waitFor(() => {
      expect(mockStartNotificationCapture).toHaveBeenCalledTimes(1);
    });

    fireEvent.press(screen.getByLabelText('Settings'));
    expect(screen.getByText('Theme Mode')).toBeOnTheScreen();

    fireEvent.press(screen.getByText('Toggle Theme'));
    expect(mockToggleMode).toHaveBeenCalledTimes(1);
  });

  test('does not auto-sync iOS captured queue on launch', async () => {
    render(<HomeScreen />);

    await waitFor(() => {
      expect(mockStartNotificationCapture).toHaveBeenCalledTimes(1);
    });

    expect(mockDrainIosCapturedNotifications).not.toHaveBeenCalled();
  });

  test('does not request notification permission on iOS mount', async () => {
    render(<HomeScreen />);

    await waitFor(() => {
      expect(mockStartNotificationCapture).toHaveBeenCalledTimes(1);
    });

    expect(mockEnsureNotificationPermission).not.toHaveBeenCalled();
    expect(mockHasNotificationPermission).not.toHaveBeenCalled();
  });

  test('syncs iOS captured queue from settings panel', async () => {
    render(<HomeScreen />);

    await waitFor(() => {
      expect(mockStartNotificationCapture).toHaveBeenCalledTimes(1);
    });

    const initialDrainCalls = mockDrainIosCapturedNotifications.mock.calls.length;

    fireEvent.press(screen.getByLabelText('Settings'));
    fireEvent.press(screen.getByText('Sync iOS Capture'));

    await waitFor(() => {
      expect(mockDrainIosCapturedNotifications.mock.calls.length).toBeGreaterThan(
        initialDrainCalls,
      );
    });
  });
});
