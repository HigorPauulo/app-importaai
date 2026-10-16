import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, EmptyState, Icon, ProgressRow, StackBar, StickyFooter, Text, colors, radius, shadows } from '@/shared/ui';

import { compareOffers } from '../domain/offerComparison';
import { groupOffers } from '../domain/offerList';
import { useOffers } from './useOffers';

type ComparisonScreenProps = {
  groupId: string;
  onBack: () => void;
  onBuy: (offerId: string) => void;
  onOpenPurchase: (purchaseId: string) => void;
};

const COLUMN_WIDTH = 96;

function TableFrame({ isScrollable, children }: { isScrollable: boolean; children: ReactNode }) {
  return isScrollable ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableContent}>
      <View>{children}</View>
    </ScrollView>
  ) : (
    <View style={styles.tableContent}>{children}</View>
  );
}

// T12 · Comparação (RF-06).
export function ComparisonScreen({ groupId, onBack, onBuy, onOpenPurchase }: ComparisonScreenProps) {
  const { state, reload } = useOffers();
  const group =
    state.status === 'ready'
      ? groupOffers(
          state.offers.filter((offer) => offer.groupId === groupId),
          state.rates,
          state.taxVersions,
          new Date(),
        )[0]
      : undefined;
  const comparison = group ? compareOffers(group) : null;

  const header = (
    <View style={styles.header}>
      <StackBar title="Comparação" onBack={onBack} />
      {group && comparison && (
        <View style={styles.verdict}>
          <Text variant="body14" color="textMuted">
            {group.name} · {group.offers.length} ofertas
          </Text>
          <View style={styles.verdictTitle}>
            <View style={styles.checkCircle}>
              <Icon name="check" size={18} color="successDark" />
            </View>
            <Text variant="section20" accessibilityRole="header" style={styles.fill}>
              {comparison.title}
            </Text>
          </View>
          <Text variant="body14" color="textMuted">
            {comparison.explanation}
          </Text>
        </View>
      )}
    </View>
  );

  if (!comparison) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {header}
        {state.status === 'error' && (
          <EmptyState
            icon="alert"
            title="Não foi possível carregar"
            description="Os dados salvos no aparelho continuam aqui. Tente de novo em instantes."
            action={<Button label="Tentar de novo" variant="secondary" onPress={reload} style={styles.stretch} />}
          />
        )}
        {state.status === 'ready' && (
          <EmptyState
            icon="scale"
            title="Não há o que comparar"
            description="A comparação precisa de pelo menos duas ofertas do mesmo produto com custo estimado."
          />
        )}
      </SafeAreaView>
    );
  }

  const { cheapest } = comparison;
  const isWide = comparison.columns.length > 2;
  const maxDifference = Math.max(...comparison.differences.map((item) => Math.abs(item.amount)));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {header}
      <ScrollView style={styles.body} contentContainerStyle={styles.content}>
        <View style={styles.table}>
          {/* Duas lojas cabem na largura; com mais, as colunas rolam para o lado e o rótulo ganha largura fixa. */}
          <TableFrame isScrollable={isWide}>
            <View style={styles.headerRow}>
              <View style={isWide ? styles.fixedLabel : styles.labelCell} />
              {comparison.columns.map((column, index) => (
                <View key={column.offer.id} style={styles.columnHead}>
                  <Text variant="body14Medium" numberOfLines={1}>
                    {column.offer.storeName}
                  </Text>
                  {index === 0 && (
                    <View style={styles.badge}>
                      <Text variant="caption11Bold" color="successDark">
                        MENOR
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
            {comparison.rows.map((row) => (
              <View key={row.label} style={styles.row} accessible accessibilityLabel={`${row.label}: ${row.values.join(', ')}`}>
                <Text
                  variant={row.isTotal ? 'body14Medium' : 'caption13'}
                  color={row.isTotal ? 'textStrong' : 'textMuted'}
                  style={isWide ? styles.fixedLabel : styles.labelCell}>
                  {row.label}
                </Text>
                {row.values.map((value, index) => (
                  <Text
                    key={comparison.columns[index].offer.id}
                    variant={row.isTotal ? 'body16Medium' : 'body14'}
                    color={row.isTotal && index === 0 ? 'successDark' : 'textStrong'}
                    align="right"
                    style={styles.cell}>
                    {value}
                  </Text>
                ))}
              </View>
            ))}
          </TableFrame>
        </View>

        <Card title={comparison.differenceTitle} isCompact gap={12}>
          {comparison.differences.map((item) => (
            <ProgressRow
              key={item.label}
              label={item.label}
              value={item.amount}
              max={maxDifference}
              valueLabel={item.value}
              trackColor="borderDefault"
            />
          ))}
        </Card>
      </ScrollView>
      <StickyFooter caption="Estimativa. Não substitui a apuração oficial do imposto.">
        <Button
          label={cheapest.purchaseId ? 'Ver compra' : `Comprar na ${cheapest.storeName}`}
          onPress={() => (cheapest.purchaseId ? onOpenPurchase(cheapest.purchaseId) : onBuy(cheapest.id))}
        />
      </StickyFooter>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stretch: { alignSelf: 'stretch' },
  safeArea: { flex: 1, backgroundColor: colors.surfaceWhite },
  header: { backgroundColor: colors.surfaceWhite, borderBottomWidth: 1, borderBottomColor: colors.borderDefault },
  verdict: { gap: 6, paddingTop: 4, paddingHorizontal: 20, paddingBottom: 20 },
  verdictTitle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkCircle: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.successBg,
  },
  fill: { flex: 1 },
  body: { backgroundColor: colors.background },
  content: { gap: 12, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 24 },
  table: { paddingVertical: 4, borderRadius: radius.card, backgroundColor: colors.surfaceWhite, ...shadows.sm },
  tableContent: { paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 12 },
  columnHead: { width: COLUMN_WIDTH, alignItems: 'flex-end', gap: 4 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, backgroundColor: colors.successBg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
  },
  labelCell: { flex: 1 },
  fixedLabel: { width: 120 },
  cell: { width: COLUMN_WIDTH },
});
