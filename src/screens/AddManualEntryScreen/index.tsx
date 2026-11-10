import React, { useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, Screen, TextField } from '@/components';
import { languageStrings } from '@/constants/languageStrings';
import { useAppTheme } from '@/theme';
import type { ParsedNotificationExpense } from '@/types/expense';

import { styles } from '@/screens/AddManualEntryScreen/styles';

type AddManualEntryScreenProps = {
  onCancel: () => void;
  onSave: (expense: ParsedNotificationExpense) => Promise<void>;
};

const MANUAL_PACKAGE_NAME = 'manual:add';

export const AddManualEntryScreen: React.FC<AddManualEntryScreenProps> = ({ onCancel, onSave }) => {
  const strings = languageStrings.home.addManualEntry;
  const theme = useAppTheme();
  const [amount, setAmount] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');
  const [merchantError, setMerchantError] = useState<string>('');
  const [saveError, setSaveError] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSave = async (): Promise<void> => {
    const normalizedMerchant = merchant.trim();
    const parsedAmount = Number(amount.trim());

    const hasAmountError = !Number.isFinite(parsedAmount) || parsedAmount <= 0;
    const hasMerchantError = normalizedMerchant.length === 0;

    setAmountError(hasAmountError ? strings.amountInvalidError : '');
    setMerchantError(hasMerchantError ? strings.merchantRequiredError : '');

    if (hasAmountError || hasMerchantError) {
      return;
    }

    const createdAt = Date.now();

    setSaveError('');
    setIsSaving(true);

    try {
      await onSave({
        amount: parsedAmount,
        createdAt,
        id: `manual-${createdAt}`,
        merchant: normalizedMerchant,
        packageName: MANUAL_PACKAGE_NAME,
        sourceLabel: strings.sourceLabel,
        title: strings.notificationTitle,
      });
    } catch {
      setSaveError(strings.saveFailedError);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen contentStyle={styles.page} scrollable>
      <View style={styles.titleWrap}>
        <AppText variant="title">{strings.title}</AppText>
        <AppText style={styles.subtitle} variant="body">
          {strings.subtitle}
        </AppText>
      </View>

      <TextField
        editable={!isSaving}
        keyboardType="decimal-pad"
        label={strings.amountFieldLabel}
        onChangeText={text => {
          setAmount(text);
          if (amountError) {
            setAmountError('');
          }
          if (saveError) {
            setSaveError('');
          }
        }}
        placeholder={strings.amountFieldPlaceholder}
        value={amount}
        errorText={amountError || undefined}
      />

      <TextField
        editable={!isSaving}
        label={strings.merchantFieldLabel}
        onChangeText={text => {
          setMerchant(text);
          if (merchantError) {
            setMerchantError('');
          }
          if (saveError) {
            setSaveError('');
          }
        }}
        placeholder={strings.merchantFieldPlaceholder}
        value={merchant}
        errorText={merchantError || undefined}
      />

      <View style={styles.actions}>
        <Button
          disabled={isSaving}
          onPress={onCancel}
          title={strings.cancelButton}
          variant="secondary"
        />
        <Button disabled={isSaving} onPress={handleSave} title={strings.saveButton} />
      </View>

      {saveError ? (
        <AppText color={theme.colors.danger} style={styles.saveError} variant="caption">
          {saveError}
        </AppText>
      ) : null}
    </Screen>
  );
};
