type NotificationPayload = {
  packageName: string;
  title: string;
  body: string;
  timestamp: number;
};

type ClientModule = typeof import('@/native/notificationListenerClient');

type ListenerSubscription = {
  remove: jest.Mock<void, []>;
};

type ClientSetup = {
  client: ClientModule;
  notificationAddListener: jest.Mock<
    ListenerSubscription,
    [string, (payload: NotificationPayload) => void]
  >;
  smsAddListener: jest.Mock<
    ListenerSubscription,
    [string, (payload: { sender: string; body: string; timestamp: number }) => void]
  >;
  notificationHasPermission: jest.Mock<Promise<boolean>, []>;
  smsHasPermission: jest.Mock<Promise<boolean>, []>;
  notificationRequestPermission: jest.Mock<void, []>;
  smsRequestPermission: jest.Mock<void, []>;
  notificationStartListening: jest.Mock<void, []>;
  smsStartListening: jest.Mock<void, []>;
  notificationStopListening: jest.Mock<void, []>;
  smsStopListening: jest.Mock<void, []>;
  smsDrainCapturedMessages: jest.Mock<
    Promise<Array<{ sender: string; body: string; timestamp: number }>>,
    []
  >;
};

const setupClientForPlatform = (os: 'android' | 'ios'): ClientSetup => {
  jest.resetModules();

  const notificationAddListener = jest.fn<
    ListenerSubscription,
    [string, (payload: NotificationPayload) => void]
  >(() => ({ remove: jest.fn<void, []>() }));
  const smsAddListener = jest.fn<
    ListenerSubscription,
    [string, (payload: { sender: string; body: string; timestamp: number }) => void]
  >(() => ({ remove: jest.fn<void, []>() }));

  const notificationHasPermission = jest.fn<Promise<boolean>, []>(async () => false);
  const smsHasPermission = jest.fn<Promise<boolean>, []>(async () => false);

  const notificationRequestPermission = jest.fn<void, []>();
  const smsRequestPermission = jest.fn<void, []>();

  const notificationStartListening = jest.fn<void, []>();
  const smsStartListening = jest.fn<void, []>();

  const notificationStopListening = jest.fn<void, []>();
  const smsStopListening = jest.fn<void, []>();
  const smsDrainCapturedMessages = jest.fn<
    Promise<Array<{ sender: string; body: string; timestamp: number }>>,
    []
  >(async () => []);

  jest.doMock('react-native', () => ({
    Platform: { OS: os },
  }));

  jest.doMock('@/native/NativeNotificationListener', () => ({
    __esModule: true,
    default: {
      addListener: jest.fn<void, [string]>(),
      hasPermission: notificationHasPermission,
      removeListeners: jest.fn<void, [number]>(),
      requestPermission: notificationRequestPermission,
      startListening: notificationStartListening,
      stopListening: notificationStopListening,
    },
    notificationListenerEmitter: {
      addListener: notificationAddListener,
    },
  }));

  jest.doMock('@/native/NativeNotificationReader', () => ({
    __esModule: true,
    default: {
      addListener: jest.fn<void, [string]>(),
      drainCapturedMessages: smsDrainCapturedMessages,
      hasPermission: smsHasPermission,
      removeListeners: jest.fn<void, [number]>(),
      requestPermission: smsRequestPermission,
      startListening: smsStartListening,
      stopListening: smsStopListening,
    },
    notificationReaderEmitter: {
      addListener: smsAddListener,
    },
  }));

  let clientModule: ClientModule | null = null;

  jest.isolateModules(() => {
    clientModule = require('@/native/notificationListenerClient') as ClientModule;
  });

  if (!clientModule) {
    throw new Error('notificationListenerClient did not load');
  }

  return {
    client: clientModule,
    notificationAddListener,
    notificationHasPermission,
    notificationRequestPermission,
    notificationStartListening,
    notificationStopListening,
    smsAddListener,
    smsHasPermission,
    smsRequestPermission,
    smsStartListening,
    smsStopListening,
    smsDrainCapturedMessages,
  };
};

describe('notificationListenerClient', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('uses Android module when platform is android', async () => {
    const setup = setupClientForPlatform('android');

    setup.notificationHasPermission.mockResolvedValueOnce(true);
    const hasPermission = await setup.client.hasNotificationPermission();

    expect(hasPermission).toBe(true);
    expect(setup.notificationHasPermission).toHaveBeenCalledTimes(1);
    expect(setup.smsHasPermission).not.toHaveBeenCalled();

    setup.client.startNotificationCapture();
    setup.client.stopNotificationCapture();

    expect(setup.notificationStartListening).toHaveBeenCalledTimes(1);
    expect(setup.notificationStopListening).toHaveBeenCalledTimes(1);
    expect(setup.smsStartListening).not.toHaveBeenCalled();
    expect(setup.smsStopListening).not.toHaveBeenCalled();

    const onNotification = jest.fn<void, [NotificationPayload]>();
    setup.client.subscribeToNotifications(onNotification);

    expect(setup.notificationAddListener).toHaveBeenCalledWith(
      'onNotificationReceived',
      onNotification,
    );
    expect(setup.smsAddListener).not.toHaveBeenCalled();
  });

  test('maps iOS SMS payload into notification payload shape', () => {
    const setup = setupClientForPlatform('ios');
    const onNotification = jest.fn<void, [NotificationPayload]>();

    setup.client.subscribeToNotifications(onNotification);

    expect(setup.smsAddListener).toHaveBeenCalledTimes(1);

    const listenerArgs = setup.smsAddListener.mock.calls[0];
    if (!listenerArgs) {
      throw new Error('Expected sms addListener call to be recorded');
    }

    const callback = listenerArgs[1];

    callback({
      body: 'UPI: Rs.500 debited from A/c XX1234',
      sender: 'VK-HDFCBK',
      timestamp: 1716600000000,
    });

    expect(onNotification).toHaveBeenCalledWith({
      body: 'UPI: Rs.500 debited from A/c XX1234',
      packageName: 'sms:VK-HDFCBK',
      timestamp: 1716600000000,
      title: 'VK-HDFCBK',
    });
  });

  test('requests iOS permission through sms module', async () => {
    const setup = setupClientForPlatform('ios');
    setup.smsHasPermission.mockResolvedValueOnce(false);

    const hasPermission = await setup.client.ensureNotificationPermission();

    expect(hasPermission).toBe(false);
    expect(setup.smsRequestPermission).toHaveBeenCalledTimes(1);
    expect(setup.notificationRequestPermission).not.toHaveBeenCalled();
  });

  test('drains queued iOS captured messages into notification payload shape', async () => {
    const setup = setupClientForPlatform('ios');

    setup.smsDrainCapturedMessages.mockResolvedValueOnce([
      {
        body: 'UPI: Rs.700 debited from A/c XX9876 towards Metro Stores',
        sender: 'VM-ICICIB',
        timestamp: 1716600500000,
      },
    ]);

    const drained = await setup.client.drainIosCapturedNotifications();

    expect(setup.smsDrainCapturedMessages).toHaveBeenCalledTimes(1);
    expect(drained).toEqual([
      {
        body: 'UPI: Rs.700 debited from A/c XX9876 towards Metro Stores',
        packageName: 'sms:VM-ICICIB',
        timestamp: 1716600500000,
        title: 'VM-ICICIB',
      },
    ]);
  });
});
