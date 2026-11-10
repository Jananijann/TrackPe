import type { NotificationPayload } from '@/native/NativeNotificationListener';
import type { ParsedNotificationExpense } from '@/types/expense';

const AMOUNT_REGEX = /(?:rs\.?|inr|₹)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i;
const DEBIT_HINT_REGEX = /(debited|spent|paid|sent)/i;
const CREDIT_HINT_REGEX = /(credited|received|refund)/i;
const MERCHANT_REGEX = /(?:to|at|towards)\s+([A-Za-z0-9@._ -]{2,40})/i;

const sourceLabelFromPackage = (packageName: string): string => {
  const packageNameMap: Record<string, string> = {
    'com.amazon.mShop.android.shopping': 'Amazon Pay',
    'com.android.shell': 'Android Shell',
    'com.dreamplug.androidapp': 'CRED',
    'com.google.android.apps.nbu.paisa.user': 'GPay',
    'com.phonepe.app': 'PhonePe',
    'in.org.npci.upiapp': 'BHIM',
    'net.one97.paytm': 'Paytm',
  };

  return packageNameMap[packageName] ?? packageName;
};

const normalizeAmount = (rawAmount: string): number => {
  const cleaned = rawAmount.replace(/,/g, '');
  const parsed = Number.parseFloat(cleaned);

  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeForId = (value: string): string => value.toLowerCase().replace(/\s+/g, ' ').trim();

const buildExpenseId = (payload: NotificationPayload, amount: number): string => {
  const normalizedBody = normalizeForId(payload.body);
  const normalizedTitle = normalizeForId(payload.title);

  return `${payload.packageName}|${normalizedTitle}|${normalizedBody}|${amount}`;
};

const resolveMerchant = (payload: NotificationPayload): string => {
  const match = payload.body.match(MERCHANT_REGEX);
  if (match && match[1]) {
    return match[1].trim();
  }

  const title = payload.title.trim();
  return title.length > 0 ? title : sourceLabelFromPackage(payload.packageName);
};

export const parseNotificationPayload = (
  payload: NotificationPayload,
): ParsedNotificationExpense | null => {
  const body = payload.body.trim();
  if (body.length === 0) {
    return null;
  }

  if (!DEBIT_HINT_REGEX.test(body) || CREDIT_HINT_REGEX.test(body)) {
    return null;
  }

  const amountMatch = body.match(AMOUNT_REGEX);
  if (!amountMatch || !amountMatch[1]) {
    return null;
  }

  const amount = normalizeAmount(amountMatch[1]);
  if (amount <= 0) {
    return null;
  }

  return {
    amount,
    createdAt: payload.timestamp,
    id: buildExpenseId(payload, amount),
    merchant: resolveMerchant(payload),
    packageName: payload.packageName,
    sourceLabel: sourceLabelFromPackage(payload.packageName),
    title: payload.title,
  };
};
