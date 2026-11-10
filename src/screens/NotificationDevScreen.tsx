import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Platform, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { languageStrings } from '@/constants/languageStrings';
import type { NotificationPayload } from '@/native/NativeNotificationListener';
import {
  ensureNotificationPermission,
  startNotificationCapture,
  stopNotificationCapture,
  subscribeToNotifications,
} from '@/native/notificationListenerClient';
import { useAppTheme } from '@/theme';

type LogItem = NotificationPayload & { id: string };

export const NotificationDevScreen: React.FC = () => {
  const strings = languageStrings.devTools.capture;
  const isIos = Platform.OS === 'ios';
  const theme = useAppTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogItem[]>([]);

  const permissionLabel = useMemo((): string => {
    if (hasPermission === null) {
      return strings.unknownPermission;
    }

    return hasPermission ? strings.withPermission : strings.withoutPermission;
  }, [hasPermission, strings.unknownPermission, strings.withPermission, strings.withoutPermission]);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((payload: NotificationPayload) => {
      setLogs(previousLogs =>
        [
          {
            ...payload,
            id: `${payload.timestamp}-${payload.packageName}-${previousLogs.length}`,
          },
          ...previousLogs,
        ].slice(0, 30),
      );
    });

    ensureNotificationPermission()
      .then(setHasPermission)
      .catch(() => {
        setHasPermission(false);
      });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Screen contentStyle={styles.screen}>
      <View>
        <AppText variant="title">{strings.title}</AppText>
        <AppText color={theme.colors.textMuted} style={styles.subtext}>
          {isIos ? strings.subtitleIos : strings.subtitleAndroid}
        </AppText>
      </View>

      <Card style={styles.statusCard}>
        <AppText variant="sectionTitle">{strings.statusTitle}</AppText>
        <AppText color={theme.colors.textSecondary}>
          {strings.modeLabel}: {isIos ? strings.modeValueIos : strings.modeValueAndroid}
        </AppText>
        <AppText color={theme.colors.textSecondary} style={styles.statusLine}>
          {strings.permissionLabel}: {permissionLabel}
        </AppText>
        <AppText color={theme.colors.textSecondary}>
          {strings.listeningLabel}: {isListening ? strings.listeningYes : strings.listeningNo}
        </AppText>
        <View style={styles.actions}>
          <Button
            title={strings.refreshPermissionAction}
            onPress={() => {
              ensureNotificationPermission()
                .then(setHasPermission)
                .catch(() => {
                  setHasPermission(false);
                });
            }}
            variant="secondary"
          />
          <Button
            title={strings.startListeningAction}
            onPress={() => {
              startNotificationCapture();
              setIsListening(true);
            }}
          />
          <Button
            title={strings.stopListeningAction}
            onPress={() => {
              stopNotificationCapture();
              setIsListening(false);
            }}
            variant="secondary"
          />
        </View>
      </Card>

      <FlatList
        data={logs}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card style={styles.logCard}>
            <AppText variant="label">{item.title || strings.noTitleFallback}</AppText>
            <AppText color={theme.colors.textSecondary} style={styles.logBody}>
              {item.body || strings.noBodyFallback}
            </AppText>
            <AppText color={theme.colors.textMuted} variant="caption">
              {item.packageName} · {new Date(item.timestamp).toLocaleString()}
            </AppText>
          </Card>
        )}
        ListEmptyComponent={
          <Card>
            <AppText variant="bodyStrong">{strings.noEventsTitle}</AppText>
            <AppText color={theme.colors.textMuted} style={styles.emptyText}>
              {isIos ? strings.emptyStateHintIos : strings.emptyStateHintAndroid}
            </AppText>
          </Card>
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    gap: 20,
  },
  subtext: {
    marginTop: 10,
  },
  statusCard: {
    gap: 12,
  },
  statusLine: {
    marginTop: 8,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  logCard: {
    gap: 8,
  },
  logBody: {
    marginTop: 4,
  },
  emptyText: {
    marginTop: 8,
  },
});
