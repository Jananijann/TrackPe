export const languageStrings = {
  devTools: {
    capture: {
      emptyStateHintAndroid:
        'Trigger a local test notification from Android to verify the native listener pipeline.',
      emptyStateHintIos:
        'Send a bank transaction push/SMS-style notification to this device to verify iOS capture.',
      listeningLabel: 'Listening',
      modeLabel: 'Capture Mode',
      modeValueAndroid: 'Android notifications',
      modeValueIos: 'iOS SMS/bank push',
      permissionLabel: 'Permission',
      refreshPermissionAction: 'Refresh Permission',
      startListeningAction: 'Start Listening',
      statusTitle: 'Status',
      stopListeningAction: 'Stop Listening',
      subtitleAndroid:
        'Developer screen for validating Android notification capture while integrating the parser pipeline.',
      subtitleIos:
        'Developer screen for validating iOS SMS/bank push capture while integrating the parser pipeline.',
      title: 'Capture pipeline tester',
      unknownPermission: 'Unknown',
      withPermission: 'Granted',
      withoutPermission: 'Not granted',
      noEventsTitle: 'No events yet',
      noTitleFallback: '(no title)',
      noBodyFallback: '(no body)',
      listeningYes: 'Yes',
      listeningNo: 'No',
    },
  },
  home: {
    addManualEntry: {
      amountFieldLabel: 'Amount',
      amountFieldPlaceholder: 'Enter amount',
      amountInvalidError: 'Enter a valid amount greater than zero',
      cancelButton: 'Cancel',
      merchantFieldLabel: 'Merchant',
      merchantFieldPlaceholder: 'Where did you spend?',
      merchantRequiredError: 'Merchant name is required',
      saveButton: 'Save Expense',
      saveFailedError: 'Could not save expense. Please try again.',
      sourceLabel: 'Manual Entry',
      subtitle: 'Add an expense manually when a transaction alert is missing.',
      notificationTitle: 'Added Manually',
      title: 'Add Expense',
    },
    addExpense: {
      accessibilityLabel: 'Add expense',
      merchant: 'Manual Expense',
      notificationTitle: 'Added from Home',
      sourceLabel: 'Manual Entry',
      testAmount: 420,
    },
    detailsCard: {
      fields: {
        merchant: 'Merchant',
        notification: 'Notification',
        source: 'Source',
        time: 'Time',
      },
      title: 'Latest Expense',
    },
    emptyDescription:
      'Make a payment or add an expense manually to get started.',
    emptyTitle: 'No expenses yet',
    greeting: {
      name: 'Janani',
      prefix: 'Hi',
      wave: '👋',
    },
    monthCard: {
      hint: 'Live from notifications',
      title: 'This Month Spend',
    },
    testNotification: {
      helper: 'Temporary: inject a sample notification without adb.',
      triggerLabel: 'Inject Test Notification',
    },
    sections: {
      more: 'More',
      today: 'Today',
      yesterday: 'Yesterday',
    },
    tabs: {
      add: 'Add',
      home: 'Home',
      settings: 'Settings',
      stats: 'Stats',
    },
    settings: {
      helper: 'Switch between light and dark theme for the app shell.',
      iosCapture: {
        helper:
          'Enable TrackPe under Settings > Messages > Unknown & Spam > SMS Filtering. Use sync to import newly captured messages.',
        lastSyncLabel: 'Last Sync',
        neverSynced: 'Not synced yet',
        recordsLabel: 'Records Imported',
        syncButton: 'Sync iOS Capture',
        title: 'iOS Message Filter',
      },
      modeDark: 'Dark',
      modeLight: 'Light',
      modeLabel: 'Theme Mode',
      title: 'Settings',
      toggleButton: 'Toggle Theme',
    },
    title: 'Good Morning',
  },
  onboarding: {
    accessEnabled: {
      buttonLabel: 'Continue to App',
      subtitle: 'Make a payment and see it appear here automatically.',
      title: "You're All Set!",
    },
    enableAccess: {
      buttonCheckingLabel: 'Checking...',
      buttonLabel: 'Enable Access',
      steps: ['Tap the button below', 'Enable "TrackPe"', 'Come back to the app'],
      tip: 'This helps TrackPe detect payment notifications.',
      title: 'Enable Notification Access',
    },
    splash: {
      brandName: 'TrackPe',
      subtitle: 'Automatic expense tracking from your payment alerts.',
      symbol: '₹',
    },
    welcome: {
      platforms: ['GPay', 'PhonePe', 'Paytm', 'CRED & more'],
      primaryActionLabel: 'Get Started',
      primaryActionLabelIos: 'Continue to Home',
      secondaryActionLabel: 'Open Dev Tools',
      subtitle:
        'We capture payment alerts from UPI apps and bank notifications to help you track expenses effortlessly.',
      subtitleIos: 'TrackPe uses Apple’s SMS Filtering capability to identify supported bank transaction messages on your device and help organize expenses automatically.',
      title: 'Track every rupee automatically',
    },
    whyPermissions: {
      buttonLabel: 'Continue',
      points: ['Only payment alerts', '100% private & secure', "You're in control"],
      subtitle:
        'To detect payment alerts and automatically add expenses. We never read messages, chats or OTPs.',
      title: 'We need access to notifications',
    },
  },
} as const;
