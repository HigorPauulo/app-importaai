import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { toIsoDate } from '@/shared/date';
import { Header, Screen, Text, colors, radius, shadows } from '@/shared/ui';

import { listAlerts, markAlertRead, markAllAlertsRead } from '../data/alertRepository';
import { alertAction, describeAlertTime, describeAlertTitle, groupAlertsByDay, type AlertItem } from '../domain/alerts';
import { AlertRow } from './AlertRow';

type AlertsScreenProps = {
  onOpenPurchase: (purchaseId: string) => void;
  onEditPurchase: (purchaseId: string) => void;
};

type LoadState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; alerts: AlertItem[] };

function useAlerts() {
  const db = useSQLiteContext();
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  const load = useCallback(async () => {
    try {
      setState({ status: 'ready', alerts: await listAlerts(db) });
    } catch {
      setState({ status: 'error' });
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { db, state, reload: load };
}

function describeUnread(count: number): string {
  if (count === 0) return 'Tudo em dia';
  return count === 1 ? '1 precisa de você' : `${count} precisam de você`;
}

// T08 · Alertas (RF-15, RF-16, RF-17).
export function AlertsScreen({ onOpenPurchase, onEditPurchase }: AlertsScreenProps) {
  const { db, state, reload } = useAlerts();
  const now = new Date();
  const today = toIsoDate(now);
  const alerts = state.status === 'ready' ? state.alerts : [];
  const unread = alerts.filter((alert) => !alert.readAt).length;

  async function handlePress(alert: AlertItem) {
    await markAlertRead(db, alert.id);
    const action = alertAction(alert);
    if (action === 'REGISTER_TAX') onEditPurchase(alert.purchaseId);
    else if (alert.productDescription !== null) onOpenPurchase(alert.purchaseId);
    else await reload();
  }

  async function handleMarkAll() {
    await markAllAlertsRead(db);
    await reload();
  }

  return (
    <Screen
      header={<Header title="Alertas" subtitle={state.status === 'ready' ? describeUnread(unread) : undefined} />}
      status={state.status === 'ready' ? (alerts.length > 0 ? 'content' : 'empty') : state.status}
      onRetry={reload}
      empty={{
        icon: 'check-circle',
        title: 'Nenhum alerta',
        description: 'Tudo em dia. Avisamos aqui quando uma encomenda for taxada, atrasar, parar ou chegar perto do prazo de reclamação.',
      }}>
      {groupAlertsByDay(alerts, now).map((group, groupIndex) => (
        <View key={group.title} style={styles.group}>
          <View style={styles.groupTitle}>
            <Text variant="body14Medium" accessibilityRole="header">
              {group.title}
            </Text>
            {groupIndex === 0 && unread > 0 && (
              <Pressable onPress={handleMarkAll} accessibilityRole="button" style={styles.markAll}>
                <Text variant="body14Medium" color="primaryBase">
                  Marcar todos como lidos
                </Text>
              </Pressable>
            )}
          </View>
          <View style={styles.list}>
            {group.alerts.map((alert, index) => (
              <View key={alert.id} style={index > 0 && styles.divider}>
                <AlertRow
                  reason={alert.reason}
                  title={describeAlertTitle(alert, today)}
                  message={alert.message}
                  time={describeAlertTime(alert.createdAt, now)}
                  isRead={alert.readAt !== null}
                  action={alertAction(alert)}
                  onPress={() => handlePress(alert)}
                />
              </View>
            ))}
          </View>
        </View>
      ))}
      <Text variant="caption12" color="textMuted" align="center">
        Alertas lidos ficam guardados até o limite de 50. Os não lidos nunca são apagados.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: 10 },
  groupTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  markAll: { height: 44, justifyContent: 'center' },
  list: { borderRadius: radius.card, backgroundColor: colors.surfaceWhite, overflow: 'hidden', ...shadows.sm },
  divider: { borderTopWidth: 1, borderTopColor: colors.borderDefault },
});
