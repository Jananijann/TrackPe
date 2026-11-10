import {DeviceEventEmitter, NativeModules, TurboModuleRegistry} from 'react-native';
import type {TurboModule} from 'react-native';

export type NotificationPayload = {
  packageName: string;
  title: string;
  body: string;
  timestamp: number;
};

export interface Spec extends TurboModule {
  startListening(): void;
  stopListening(): void;
  requestPermission(): void;
  hasPermission(): Promise<boolean>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

const resolvedNotificationListener =
  TurboModuleRegistry.get<Spec>('NotificationListener') ??
  (NativeModules.NotificationListener as Spec | undefined);

const NativeNotificationListener: Spec = resolvedNotificationListener ?? {
  addListener: (_eventName: string): void => undefined,
  hasPermission: async (): Promise<boolean> => false,
  removeListeners: (_count: number): void => undefined,
  requestPermission: (): void => undefined,
  startListening: (): void => undefined,
  stopListening: (): void => undefined,
};

export const notificationListenerEmitter = DeviceEventEmitter;

export default NativeNotificationListener;
