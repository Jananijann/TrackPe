import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

export type NotificationReaderPayload = {
  sender: string;
  body: string;
  timestamp: number;
};

export interface NotificationReaderSpec {
  startListening(): void;
  stopListening(): void;
  requestPermission(): void;
  hasPermission(): Promise<boolean>;
  drainCapturedMessages(): Promise<NotificationReaderPayload[]>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

const resolvedNotificationReader = NativeModules.NotificationReaderModule as
  | NotificationReaderSpec
  | undefined;

const NativeNotificationReader: NotificationReaderSpec = resolvedNotificationReader ?? {
  addListener: (_eventName: string): void => undefined,
  drainCapturedMessages: async (): Promise<NotificationReaderPayload[]> => [],
  hasPermission: async (): Promise<boolean> => false,
  removeListeners: (_count: number): void => undefined,
  requestPermission: (): void => undefined,
  startListening: (): void => undefined,
  stopListening: (): void => undefined,
};

type NotificationReaderEmitter = {
  addListener: (
    eventName: string,
    listener: (payload: NotificationReaderPayload) => void,
  ) => { remove: () => void };
};

export const notificationReaderEmitter =
  Platform.OS === 'ios' && resolvedNotificationReader
    ? new NativeEventEmitter(NativeModules.NotificationReaderModule)
    : {
        addListener: (
          _eventName: string,
          _listener: (payload: NotificationReaderPayload) => void,
        ): { remove: () => void } => ({
          remove: (): void => undefined,
        }),
      } satisfies NotificationReaderEmitter;

export default NativeNotificationReader;
