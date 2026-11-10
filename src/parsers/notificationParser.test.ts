import type { NotificationPayload } from '@/native/NativeNotificationListener';
import { parseNotificationPayload } from '@/parsers/notificationParser';

const makePayload = (overrides: Partial<NotificationPayload> = {}): NotificationPayload => ({
  body: 'UPI: Rs.500 debited from A/c XX1234 towards Starbucks Coffee',
  packageName: 'com.google.android.apps.nbu.paisa.user',
  timestamp: 1716600000000,
  title: 'VK-HDFCBK',
  ...overrides,
});

describe('parseNotificationPayload', () => {
  test('parses debit notification with amount and merchant', () => {
    const parsed = parseNotificationPayload(makePayload());

    expect(parsed).not.toBeNull();
    expect(parsed?.amount).toBe(500);
    expect(parsed?.merchant).toBe('Starbucks Coffee');
    expect(parsed?.sourceLabel).toBe('GPay');
  });

  test('generates stable ids for duplicate imports of same message content', () => {
    const first = parseNotificationPayload(makePayload({ timestamp: 1716600000000 }));
    const second = parseNotificationPayload(makePayload({ timestamp: 1717600000000 }));

    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(first?.id).toBe(second?.id);
  });

  test('returns null for credited messages', () => {
    const parsed = parseNotificationPayload(
      makePayload({
        body: 'Rs.500 credited to your account from UPI transfer',
      }),
    );

    expect(parsed).toBeNull();
  });

  test('falls back to title when merchant is missing', () => {
    const parsed = parseNotificationPayload(
      makePayload({
        body: 'UPI: Rs.500 debited from A/c XX1234',
      }),
    );

    expect(parsed).not.toBeNull();
    expect(parsed?.merchant).toBe('VK-HDFCBK');
  });
});
