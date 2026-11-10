import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AddManualEntryScreen } from '@/screens/AddManualEntryScreen';

describe('AddManualEntryScreen', () => {
  test('shows validation errors when amount or merchant is invalid', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);

    render(<AddManualEntryScreen onCancel={jest.fn()} onSave={onSave} />);

    fireEvent.press(screen.getByText('Save Expense'));

    expect(screen.getByText('Enter a valid amount greater than zero')).toBeOnTheScreen();
    expect(screen.getByText('Merchant name is required')).toBeOnTheScreen();
    expect(onSave).not.toHaveBeenCalled();
  });

  test('submits a normalized manual expense payload', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);

    render(<AddManualEntryScreen onCancel={jest.fn()} onSave={onSave} />);

    fireEvent.changeText(screen.getByPlaceholderText('Enter amount'), '420');
    fireEvent.changeText(screen.getByPlaceholderText('Where did you spend?'), '  Groceries  ');
    fireEvent.press(screen.getByText('Save Expense'));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 420,
        merchant: 'Groceries',
        packageName: 'manual:add',
        sourceLabel: 'Manual Entry',
        title: 'Added Manually',
      }),
    );
  });

  test('shows inline save error and stays on form when save fails', async () => {
    const onSave = jest.fn().mockRejectedValue(new Error('db failed'));

    render(<AddManualEntryScreen onCancel={jest.fn()} onSave={onSave} />);

    fireEvent.changeText(screen.getByPlaceholderText('Enter amount'), '250');
    fireEvent.changeText(screen.getByPlaceholderText('Where did you spend?'), 'Fuel');
    fireEvent.press(screen.getByText('Save Expense'));

    await waitFor(() => {
      expect(screen.getByText('Could not save expense. Please try again.')).toBeOnTheScreen();
    });

    expect(screen.getByText('Save Expense')).toBeOnTheScreen();
    expect(screen.getByPlaceholderText('Where did you spend?')).toBeOnTheScreen();
  });
});
