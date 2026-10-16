import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { toIsoDate } from '@/shared/date';
import { Button, Chip, FloatingButton, Header, ListSection, Screen, SearchField, type EmptyStateProps } from '@/shared/ui';

import {
  PURCHASE_FILTERS,
  countOnTheWay,
  filterPurchases,
  groupPurchases,
  type PurchaseFilter,
} from '../domain/purchaseList';
import { PurchaseCard } from './PurchaseCard';
import { usePurchases } from './usePurchases';

type PurchasesScreenProps = {
  initialQuery?: string;
  onAlertsPress: () => void;
  hasUnreadAlerts?: boolean;
  onSimulatePress: () => void;
  onNewPurchase?: () => void;
  onPurchasePress?: (id: string) => void;
};

// T03 · Compras (RF-14).
export function PurchasesScreen({ initialQuery = '', onAlertsPress, hasUnreadAlerts, onSimulatePress, onNewPurchase, onPurchasePress }: PurchasesScreenProps) {
  const { state, reload } = usePurchases();
  const [filter, setFilter] = useState<PurchaseFilter>('ALL');
  const [query, setQuery] = useState(initialQuery);
  const today = toIsoDate(new Date());

  const purchases = state.status === 'ready' ? state.purchases : [];
  const sections = groupPurchases(filterPurchases(purchases, filter, query));
  const hasPurchases = purchases.length > 0;

  function clearFilters() {
    setFilter('ALL');
    setQuery('');
  }

  // Vazio sem nenhuma compra e vazio de filtro pedem ações diferentes (telas.md, T03).
  const empty: EmptyStateProps = hasPurchases
    ? {
        icon: 'search',
        title: 'Nenhuma compra encontrada',
        description: 'Nada combina com a busca e o filtro escolhidos.',
        action: <Button label="Limpar filtros" variant="secondary" onPress={clearFilters} style={styles.emptyAction} />,
      }
    : {
        icon: 'package',
        title: 'Nenhuma compra ainda',
        description: 'Cadastre uma compra com o código de rastreio, ou simule uma oferta antes de comprar.',
        action: <Button label="Simular uma oferta" variant="secondary" onPress={onSimulatePress} style={styles.emptyAction} />,
      };

  const onTheWay = countOnTheWay(purchases);

  return (
    <Screen
      header={
        <Header
          title="Compras"
          subtitle={hasPurchases ? `${onTheWay} a caminho` : undefined}
          onAlertsPress={onAlertsPress}
          hasUnreadAlerts={hasUnreadAlerts}
        />
      }
      status={state.status === 'ready' ? (sections.length > 0 ? 'content' : 'empty') : state.status}
      empty={empty}
      onRetry={reload}
      toolbar={
        hasPurchases && (
          <>
            <SearchField placeholder="Buscar produto, loja ou código" value={query} onChangeText={setQuery} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filters}>
              {PURCHASE_FILTERS.map(({ value, label }) => (
                <Chip key={value} label={label} isActive={filter === value} onPress={() => setFilter(value)} />
              ))}
            </ScrollView>
          </>
        )
      }
      floatingAction={onNewPurchase && <FloatingButton label="Nova compra" icon="plus" onPress={onNewPurchase} />}>
      {state.status === 'ready' &&
        sections.map((section) => (
          <ListSection key={section.key} title={section.title} count={section.purchases.length} isHighlighted={section.key === 'ATTENTION'}>
            <View style={styles.cards}>
              {section.purchases.map((purchase) => (
                <PurchaseCard
                  key={purchase.id}
                  purchase={purchase}
                  rates={state.rates}
                  today={today}
                  onPress={onPurchasePress && (() => onPurchasePress(purchase.id))}
                />
              ))}
            </View>
          </ListSection>
        ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  // ScrollView cresce por padrão; sem isto, a barra de filtros ocuparia a sobra vertical da tela.
  filterBar: { flexGrow: 0 },
  filters: { gap: 8 },
  cards: { gap: 8 },
  emptyAction: { alignSelf: 'stretch' },
});
