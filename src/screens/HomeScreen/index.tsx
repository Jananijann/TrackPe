import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, Platform, Pressable, ScrollView, View } from 'react-native';

import { AppText, Button, Card, Screen } from '@/components';
import { languageStrings } from '@/constants/languageStrings';
import { listExpenses, upsertExpense } from '@/db/expenseRepository';
import type { NotificationPayload } from '@/native/NativeNotificationListener';
import {
  drainIosCapturedNotifications,
  ensureNotificationPermission,
  hasNotificationPermission,
  startNotificationCapture,
  stopNotificationCapture,
  subscribeToNotifications,
} from '@/native/notificationListenerClient';
import { parseNotificationPayload } from '@/parsers/notificationParser';
import { useAppTheme } from '@/theme';
import type { ParsedNotificationExpense } from '@/types/expense';

import { styles } from '@/screens/HomeScreen/styles';

type HomeScreenProps = {
  onAddExpensePress?: () => void;
  refreshSignal?: number;
};

const groupBySection = (
  items: ParsedNotificationExpense[],
): Array<{ items: ParsedNotificationExpense[]; title: string }> => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

  const sections = {
    more: [] as ParsedNotificationExpense[],
    today: [] as ParsedNotificationExpense[],
    yesterday: [] as ParsedNotificationExpense[],
  };

  items.forEach(item => {
    if (item.createdAt >= todayStart) {
      sections.today.push(item);
      return;
    }

    if (item.createdAt >= yesterdayStart) {
      sections.yesterday.push(item);
      return;
    }

    sections.more.push(item);
  });

  return [
    { items: sections.today, title: languageStrings.home.sections.today },
    { items: sections.yesterday, title: languageStrings.home.sections.yesterday },
    { items: sections.more, title: languageStrings.home.sections.more },
  ].filter(section => section.items.length > 0);
};

const formatAmount = (amount: number): string => `₹${amount.toLocaleString('en-IN')}`;

const formatExpenseDateTime = (timestamp: number): string =>
  new Date(timestamp).toLocaleString([], {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  });

const DUPLICATE_WINDOW_MS = 60 * 1000;

const areLikelyDuplicateExpenses = (
  current: ParsedNotificationExpense,
  previous: ParsedNotificationExpense,
): boolean => {
  const sameAmount = current.amount === previous.amount;
  const sameMerchant =
    current.merchant.trim().toLowerCase() === previous.merchant.trim().toLowerCase();
  const sameSource =
    current.sourceLabel.trim().toLowerCase() === previous.sourceLabel.trim().toLowerCase();
  const sameTitle = current.title.trim().toLowerCase() === previous.title.trim().toLowerCase();
  const withinWindow = Math.abs(current.createdAt - previous.createdAt) <= DUPLICATE_WINDOW_MS;

  return sameAmount && sameMerchant && sameSource && sameTitle && withinWindow;
};

const dedupeLikelyDuplicateExpenses = (
  records: ParsedNotificationExpense[],
): ParsedNotificationExpense[] => {
  const deduped: ParsedNotificationExpense[] = [];

  records.forEach(record => {
    const previous = deduped.at(-1);
    if (previous && areLikelyDuplicateExpenses(record, previous)) {
      return;
    }

    deduped.push(record);
  });

  return deduped;
};

const sourceEmoji = (sourceLabel: string): string => {
  const lower = sourceLabel.toLowerCase();

  if (lower.includes('gpay') || lower.includes('pay')) {
    return '💳';
  }

  if (lower.includes('phonepe')) {
    return '🟣';
  }

  if (lower.includes('cred')) {
    return '🧾';
  }

  return '🏦';
};

const parseAndLogNotification = (
  payload: NotificationPayload,
): ParsedNotificationExpense | null => {
  const parsed = parseNotificationPayload(payload);
  console.log('[TrackPe][Notification][Raw]', payload);
  console.log('[TrackPe][Notification][Parsed]', parsed);

  return parsed;
};

const homeTabIcon = '⌂';
const addTabIcon = '+';
const settingsTabIcon = '⚙';
type HomeTab = 'home' | 'settings';

export const HomeScreen: React.FC<HomeScreenProps> = ({ onAddExpensePress, refreshSignal }) => {
  const theme = useAppTheme();
  const [expenses, setExpenses] = useState<ParsedNotificationExpense[]>([]);
  const [activeTab, setActiveTab] = useState<HomeTab>('home');
  const [iosSyncMeta, setIosSyncMeta] = useState<{
    lastSyncAt: number | null;
    recordsImported: number;
  }>({
    lastSyncAt: null,
    recordsImported: 0,
  });

  const refreshExpenses = useCallback(async (): Promise<void> => {
    const records = await listExpenses().catch(() => [] as ParsedNotificationExpense[]);
    const sortedRecords = [...records].sort((a, b) => {
      if (b.createdAt !== a.createdAt) {
        return b.createdAt - a.createdAt;
      }

      return b.id.localeCompare(a.id);
    });

    const dedupedRecords = dedupeLikelyDuplicateExpenses(sortedRecords);
    setExpenses(dedupedRecords.slice(0, 100));
  }, []);

  const pushParsedNotification = useCallback(
    (payload: NotificationPayload): void => {
      const parsed = parseAndLogNotification(payload);
      if (!parsed) {
        return;
      }

      upsertExpense(parsed)
        .then(() => refreshExpenses())
        .catch(() => undefined);
    },
    [refreshExpenses],
  );

  const addExpenseFromTab = useCallback((): void => {
    if (onAddExpensePress) {
      onAddExpensePress();
      return;
    }

    const timestamp = Date.now();

    upsertExpense({
      amount: languageStrings.home.addExpense.testAmount,
      createdAt: timestamp,
      id: `${timestamp}-manual-fallback`,
      merchant: languageStrings.home.addExpense.merchant,
      packageName: 'manual:add',
      sourceLabel: languageStrings.home.addExpense.sourceLabel,
      title: languageStrings.home.addExpense.notificationTitle,
    })
      .then(() => refreshExpenses())
      .catch(() => undefined);

    setActiveTab('home');
  }, [onAddExpensePress, refreshExpenses]);

  const drainQueuedIosMessages = useCallback(async (): Promise<number> => {
    if (Platform.OS !== 'ios') {
      return 0;
    }

    const queued = await drainIosCapturedNotifications().catch(() => []);
    queued.forEach(pushParsedNotification);
    setIosSyncMeta({
      lastSyncAt: Date.now(),
      recordsImported: queued.length,
    });

    return queued.length;
  }, [pushParsedNotification]);

  useEffect(() => {
    refreshExpenses().catch(() => undefined);
  }, [refreshExpenses, refreshSignal]);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeToNotifications(pushParsedNotification);

    const syncPermissionAndStartCapture = async (): Promise<void> => {
      if (Platform.OS === 'ios') {
        if (isMounted) {
          startNotificationCapture();
        }

        return;
      }

      const granted = await hasNotificationPermission().catch(() => false);
      if (!isMounted || !granted) {
        return;
      }

      startNotificationCapture();
    };

    if (Platform.OS === 'ios') {
      startNotificationCapture();
    } else {
      ensureNotificationPermission()
        .then(granted => {
          if (granted) {
            startNotificationCapture();
          }
        })
        .catch(() => undefined);
    }

    const appStateSubscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        syncPermissionAndStartCapture().catch(() => undefined);
      }
    });

    return () => {
      isMounted = false;
      appStateSubscription.remove();
      stopNotificationCapture();
      unsubscribe();
    };
  }, [pushParsedNotification]);

  const latestExpense = useMemo(() => expenses.at(0) ?? null, [expenses]);
  const sectionedExpenses = useMemo(() => groupBySection(expenses.slice(1)), [expenses]);

  const monthTotal = useMemo(() => {
    const now = new Date();

    return expenses.reduce((total, item) => {
      const date = new Date(item.createdAt);
      const isCurrentMonth =
        date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

      return isCurrentMonth ? total + item.amount : total;
    }, 0);
  }, [expenses]);

  return (
    <Screen contentStyle={styles.page} safeAreaBackgroundColor={theme.colors.surface}>
      {activeTab === 'home' ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <View>
              <AppText
                color={theme.colors.textSecondary}
                style={styles.profileText}
                variant="label"
              >
                {languageStrings.home.greeting.prefix}, {languageStrings.home.greeting.name}{' '}
                {languageStrings.home.greeting.wave}
              </AppText>
              <AppText style={styles.titleText} variant="title">
                {languageStrings.home.title}
              </AppText>
            </View>
          </View>

          <Card style={[styles.monthCard, { borderColor: theme.colors.border }]}>
            <AppText color={theme.colors.textMuted} variant="caption">
              {languageStrings.home.monthCard.title}
            </AppText>
            <View style={styles.cardBody}>
              <View>
                <AppText style={styles.cardAmount} variant="title">
                  {formatAmount(monthTotal)}
                </AppText>
              </View>
            </View>
          </Card>

          {latestExpense ? (
            <Card style={[styles.latestExpenseCard, { borderColor: theme.colors.border }]}>
              <AppText variant="bodyStrong">{languageStrings.home.detailsCard.title}</AppText>

              <View style={styles.latestExpenseHeader}>
                <View style={[styles.entryIcon, { backgroundColor: theme.colors.secondary }]}>
                  <AppText variant="caption">{sourceEmoji(latestExpense.sourceLabel)}</AppText>
                </View>
                <View style={styles.latestExpenseHeaderText}>
                  <AppText numberOfLines={1} variant="sectionTitle">
                    {latestExpense.merchant}
                  </AppText>
                  <AppText color={theme.colors.textMuted} variant="caption">
                    {latestExpense.sourceLabel}
                  </AppText>
                </View>
                <AppText style={styles.latestExpenseAmount} variant="sectionTitle">
                  {formatAmount(latestExpense.amount)}
                </AppText>
              </View>

              <View style={styles.detailRow}>
                <AppText color={theme.colors.textMuted} variant="caption">
                  {languageStrings.home.detailsCard.fields.merchant}
                </AppText>
                <AppText numberOfLines={1} style={styles.detailValue} variant="label">
                  {latestExpense.merchant}
                </AppText>
              </View>

              <View style={styles.detailRow}>
                <AppText color={theme.colors.textMuted} variant="caption">
                  {languageStrings.home.detailsCard.fields.source}
                </AppText>
                <AppText numberOfLines={1} style={styles.detailValue} variant="label">
                  {latestExpense.sourceLabel}
                </AppText>
              </View>

              <View style={styles.detailRow}>
                <AppText color={theme.colors.textMuted} variant="caption">
                  {languageStrings.home.detailsCard.fields.time}
                </AppText>
                <AppText numberOfLines={1} style={styles.detailValue} variant="label">
                  {formatExpenseDateTime(latestExpense.createdAt)}
                </AppText>
              </View>

              <View style={styles.detailRow}>
                <AppText color={theme.colors.textMuted} variant="caption">
                  {languageStrings.home.detailsCard.fields.notification}
                </AppText>
                <AppText numberOfLines={1} style={styles.detailValue} variant="label">
                  {latestExpense.title}
                </AppText>
              </View>
            </Card>
          ) : null}

          <View style={styles.listWrap}>
            {sectionedExpenses.length === 0 ? (
              <Card style={styles.emptyWrap}>
                <AppText variant="bodyStrong">{languageStrings.home.emptyTitle}</AppText>
                <AppText color={theme.colors.textMuted} style={styles.dateText} variant="caption">
                  {languageStrings.home.emptyDescription}
                </AppText>
              </Card>
            ) : (
              sectionedExpenses.map(section => (
                <View key={section.title} style={styles.sectionWrap}>
                  <AppText
                    color={theme.colors.textMuted}
                    style={styles.sectionHeader}
                    variant="label"
                  >
                    {section.title}
                  </AppText>
                  {section.items.map(item => (
                    <View key={item.id} style={styles.entryItem}>
                      <View style={styles.entryLeft}>
                        <View
                          style={[styles.entryIcon, { backgroundColor: theme.colors.secondary }]}
                        >
                          <AppText variant="caption">{sourceEmoji(item.sourceLabel)}</AppText>
                        </View>
                        <View style={styles.entryInfo}>
                          <AppText numberOfLines={1} variant="bodyStrong">
                            {item.merchant}
                          </AppText>
                          <AppText
                            color={theme.colors.textMuted}
                            numberOfLines={1}
                            style={styles.appText}
                            variant="caption"
                          >
                            {item.sourceLabel} ·{' '}
                            {new Date(item.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </AppText>
                        </View>
                      </View>
                      <AppText style={styles.amountText}>{formatAmount(item.amount)}</AppText>
                    </View>
                  ))}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.settingsWrap}>
          <Card style={[styles.settingsCard, { borderColor: theme.colors.border }]}>
            <AppText variant="sectionTitle">{languageStrings.home.settings.title}</AppText>
            <AppText color={theme.colors.textMuted} style={styles.settingsHint} variant="caption">
              {languageStrings.home.settings.helper}
            </AppText>
            <View style={styles.settingsRow}>
              <AppText color={theme.colors.textMuted} variant="caption">
                {languageStrings.home.settings.modeLabel}
              </AppText>
              <AppText variant="bodyStrong">
                {theme.mode === 'dark'
                  ? languageStrings.home.settings.modeDark
                  : languageStrings.home.settings.modeLight}
              </AppText>
            </View>
            <Button onPress={theme.toggleMode} title={languageStrings.home.settings.toggleButton} />
          </Card>

          {Platform.OS === 'ios' ? (
            <Card
              style={[
                styles.settingsCard,
                styles.settingsSecondaryCard,
                { borderColor: theme.colors.border },
              ]}
            >
              <AppText variant="sectionTitle">
                {languageStrings.home.settings.iosCapture.title}
              </AppText>
              <AppText color={theme.colors.textMuted} style={styles.settingsHint} variant="caption">
                {languageStrings.home.settings.iosCapture.helper}
              </AppText>
              <View style={styles.settingsRow}>
                <AppText color={theme.colors.textMuted} variant="caption">
                  {languageStrings.home.settings.iosCapture.lastSyncLabel}
                </AppText>
                <AppText variant="bodyStrong">
                  {iosSyncMeta.lastSyncAt
                    ? formatExpenseDateTime(iosSyncMeta.lastSyncAt)
                    : languageStrings.home.settings.iosCapture.neverSynced}
                </AppText>
              </View>
              <View style={styles.settingsRow}>
                <AppText color={theme.colors.textMuted} variant="caption">
                  {languageStrings.home.settings.iosCapture.recordsLabel}
                </AppText>
                <AppText variant="bodyStrong">{iosSyncMeta.recordsImported}</AppText>
              </View>
              <Button
                onPress={() => {
                  drainQueuedIosMessages().catch(() => undefined);
                }}
                title={languageStrings.home.settings.iosCapture.syncButton}
                variant="secondary"
              />
            </Card>
          ) : null}
        </View>
      )}

      <View
        style={[
          styles.tabRow,
          { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
        ]}
      >
        <Pressable
          accessibilityLabel={languageStrings.home.tabs.home}
          accessibilityRole="button"
          onPress={() => setActiveTab('home')}
          style={styles.tabItem}
        >
          <AppText color={theme.colors.primary} variant="label">
            {homeTabIcon}
          </AppText>
          <AppText
            color={activeTab === 'home' ? theme.colors.primary : theme.colors.textMuted}
            style={styles.tabLabel}
            variant="caption"
          >
            {languageStrings.home.tabs.home}
          </AppText>
        </Pressable>

        <Pressable
          accessibilityLabel={languageStrings.home.addExpense.accessibilityLabel}
          accessibilityRole="button"
          onPress={addExpenseFromTab}
          style={[styles.addTabButton, { backgroundColor: theme.colors.primary }]}
        >
          <AppText
            color={theme.colors.textOnPrimary}
            style={styles.addTabIcon}
            variant="sectionTitle"
          >
            {addTabIcon}
          </AppText>
          <AppText color={theme.colors.textOnPrimary} style={styles.tabLabel} variant="caption">
            {languageStrings.home.tabs.add}
          </AppText>
        </Pressable>

        <Pressable
          accessibilityLabel={languageStrings.home.tabs.settings}
          accessibilityRole="button"
          onPress={() => setActiveTab('settings')}
          style={styles.tabItem}
        >
          <AppText color={theme.colors.textMuted} variant="label">
            {settingsTabIcon}
          </AppText>
          <AppText
            color={activeTab === 'settings' ? theme.colors.primary : theme.colors.textMuted}
            style={styles.tabLabel}
            variant="caption"
          >
            {languageStrings.home.tabs.settings}
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
};
