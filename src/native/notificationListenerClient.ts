import { Platform } from 'react-native';

import NativeNotificationReader, {
  notificationReaderEmitter,
  type NotificationReaderPayload,
} from '@/native/NativeNotificationReader';
import NativeNotificationListener, {
  notificationListenerEmitter,
  type NotificationPayload,
} from '@/native/NativeNotificationListener';

const NOTIFICATION_EVENT_NAME = 'onNotificationReceived';

const mapNotificationReaderPayloadToNotificationPayload = (
  payload: NotificationReaderPayload,
): NotificationPayload => ({
  body: payload.body,
  packageName: payload.sender ? `sms:${payload.sender}` : 'sms:unknown',
  timestamp: payload.timestamp,
  title: payload.sender || 'Bank SMS',
});

export const hasNotificationPermission = async (): Promise<boolean> =>
  Platform.OS === 'ios'
    ? NativeNotificationReader.hasPermission()
    : NativeNotificationListener.hasPermission();

export const ensureNotificationPermission = async (): Promise<boolean> => {
  const hasPermission = await hasNotificationPermission();
  if (hasPermission) {
    return true;
  }

  if (Platform.OS === 'ios') {
    NativeNotificationReader.requestPermission();
  } else {
    NativeNotificationListener.requestPermission();
  }

  return false;
};

export const startNotificationCapture = (): void => {
  if (Platform.OS === 'ios') {
    NativeNotificationReader.startListening();
    return;
  }

  NativeNotificationListener.startListening();
};

export const stopNotificationCapture = (): void => {
  if (Platform.OS === 'ios') {
    NativeNotificationReader.stopListening();
    return;
  }

  NativeNotificationListener.stopListening();
};

export const drainIosCapturedNotifications = async (): Promise<NotificationPayload[]> => {
  if (Platform.OS !== 'ios') {
    return [];
  }

  const capturedMessages = await NativeNotificationReader.drainCapturedMessages();
  return capturedMessages.map(mapNotificationReaderPayloadToNotificationPayload);
};

export const subscribeToNotifications = (
  onNotification: (payload: NotificationPayload) => void,
): (() => void) => {
  const subscription =
    Platform.OS === 'ios'
      ? notificationReaderEmitter.addListener(
          NOTIFICATION_EVENT_NAME,
          (payload: NotificationReaderPayload) => {
            onNotification(mapNotificationReaderPayloadToNotificationPayload(payload));
          },
        )
      : notificationListenerEmitter.addListener(NOTIFICATION_EVENT_NAME, onNotification);

  return () => {
    subscription.remove();
  };
};
