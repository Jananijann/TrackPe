/**
 * @format
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { AppText, Button, TextField } from '@/components';
import { ThemeProvider, type ThemeMode } from '@/theme';

const renderWithTheme = (ui: React.ReactElement, mode: ThemeMode = 'light') =>
  render(<ThemeProvider mode={mode}>{ui}</ThemeProvider>);

describe('design system primitives', () => {
  test('renders themed text and button in light mode', () => {
    renderWithTheme(
      <>
        <AppText variant="title">Welcome to TrackPe</AppText>
        <Button title="Continue" />
      </>,
    );

    expect(screen.getByText('Welcome to TrackPe')).toBeOnTheScreen();
    expect(screen.getByText('Continue')).toBeOnTheScreen();
  });

  test('renders input helper state in dark mode', () => {
    renderWithTheme(
      <TextField helperText="Optional helper copy" label="Merchant" placeholder="Coffee shop" />,
      'dark',
    );

    expect(screen.getByText('Merchant')).toBeOnTheScreen();
    expect(screen.getByText('Optional helper copy')).toBeOnTheScreen();
    expect(screen.getByPlaceholderText('Coffee shop')).toBeOnTheScreen();
  });

  test('renders input error state', () => {
    renderWithTheme(
      <TextField errorText="Amount is required" label="Amount" placeholder="₹ 0.00" />,
    );

    expect(screen.getByText('Amount')).toBeOnTheScreen();
    expect(screen.getByText('Amount is required')).toBeOnTheScreen();
  });
});
