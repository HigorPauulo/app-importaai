import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { toIsoDate } from '@/shared/date';
import { BarChart, Button, Card, Chip, Header, InfoBox, ProgressRow, Screen, StatCard, Text } from '@/shared/ui';

import { buildDashboard, periodOptions, type DashboardPeriod } from '../domain/dashboard';
import { PunctualityRow } from './PunctualityRow';
import { usePurchases } from './usePurchases';

type DashboardScreenProps = {
  onAlertsPress: () => void;
  hasUnreadAlerts?: boolean;
  onNewPurchase: () => void;
};

// T06 · Painel (RF-18, RF-19).
export function DashboardScreen({ onAlertsPress, hasUnreadAlerts, onNewPurchase }: DashboardScreenProps) {
  const { state, reload } = usePurchases();
  const [period, setPeriod] = useState<DashboardPeriod>('MONTH');
  const today = toIsoDate(new Date());
  const purchases = state.status === 'ready' ? state.purchases : [];

  // Sem compras, convite ao cadastro, nunca indicadores zerados (CT-38).
  const status = state.status === 'ready' ? (purchases.length > 0 ? 'content' : 'empty') : state.status;
  const dashboard = state.status === 'ready' && purchases.length > 0 ? buildDashboard(purchases, state.rates, today, period) : null;
  const maxStatus = dashboard ? Math.max(...dashboard.statuses.map((row) => row.count)) : 0;

  return (
    <Screen
      header={<Header title="Painel" subtitle="Suas compras em números" onAlertsPress={onAlertsPress} hasUnreadAlerts={hasUnreadAlerts} />}
      status={status}
      onRetry={reload}
      empty={{
        icon: 'chart',
        title: 'Seu painel começa na primeira compra',
        description: 'Cadastre uma compra para ver o valor em trânsito, os gastos, os impostos e a pontualidade de cada loja.',
        action: <Button label="Cadastrar compra" variant="secondary" onPress={onNewPurchase} style={styles.stretch} />,
      }}
      toolbar={
        dashboard && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodBar} contentContainerStyle={styles.periods}>
            {periodOptions(today).map(({ value, label }) => (
              <Chip key={value} label={label} isActive={period === value} onPress={() => setPeriod(value)} />
            ))}
          </ScrollView>
        )
      }>
      {dashboard && (
        <>
          <StatCard label="Em trânsito agora" value={dashboard.inTransit.value} caption={dashboard.inTransit.caption} isHighlighted />
          <View style={styles.row}>
            <View style={styles.fill}>
              <StatCard label={dashboard.spent.label} value={dashboard.spent.value} caption={dashboard.spent.caption} />
            </View>
            <View style={styles.fill}>
              <StatCard label="Impostos pagos" value={dashboard.taxes.value} caption={dashboard.taxes.caption} />
            </View>
          </View>
          <Card title="Gasto por mês" subtitle="Valor em reais pela cotação da data de cada compra." gap={12} isCompact>
            <BarChart
              bars={dashboard.months.map((month) => ({
                label: month.label,
                value: month.valueMinor,
                caption: month.caption,
                isCurrent: month.isCurrent,
              }))}
            />
          </Card>
          <Card title="Compras por situação" gap={12} isCompact>
            {dashboard.statuses.map((row) => (
              <ProgressRow key={row.label} label={row.label} value={row.count} max={maxStatus} />
            ))}
          </Card>
          <Card title="Pontualidade por loja" subtitle="Atraso médio em relação ao prazo prometido, últimos 12 meses." gap={12} isCompact>
            {dashboard.punctuality.length === 0 ? (
              <Text variant="body14" color="textMuted">
                Aparece depois da primeira entrega.
              </Text>
            ) : (
              dashboard.punctuality.map((store) => <PunctualityRow key={store.storeId} {...store} />)
            )}
            {dashboard.conclusion && (
              <InfoBox tone="success">
                <Text variant="caption13" color="successDark">
                  {dashboard.conclusion}
                </Text>
              </InfoBox>
            )}
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  // ScrollView cresce por padrão; sem isto, a barra de período ocuparia a sobra vertical da tela.
  periodBar: { flexGrow: 0 },
  periods: { gap: 8 },
  row: { flexDirection: 'row', gap: 12 },
  fill: { flex: 1 },
  stretch: { alignSelf: 'stretch' },
});
