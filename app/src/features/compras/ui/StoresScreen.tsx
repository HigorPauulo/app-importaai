import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { toIsoDate } from '@/shared/date';
import { ActionSheet, Button, Icon, Monogram, Screen, StackBar, Text, colors, radius, shadows } from '@/shared/ui';

import { listPurchases } from '../data/purchaseRepository';
import { deleteStore, listStoresWithUsage } from '../data/storeRepository';
import { measurePunctuality, monthStart, type StorePunctuality } from '../domain/dashboard';
import { describeDeleteBlock, describeStoreUsage, storeMonogram, type StoreWithUsage } from '../domain/stores';
import { DelayBadge } from './DelayBadge';
import { StoreSheet } from './StoreSheet';

type StoresScreenProps = {
  onBack: () => void;
  onShowPurchases: (storeName: string) => void;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; stores: StoreWithUsage[]; punctuality: StorePunctuality[] };

function useStores() {
  const db = useSQLiteContext();
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  const load = useCallback(async () => {
    try {
      const [stores, purchases] = await Promise.all([listStoresWithUsage(db), listPurchases(db)]);
      const punctuality = measurePunctuality(purchases, monthStart(toIsoDate(new Date()), 11));
      setState({ status: 'ready', stores, punctuality });
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

type Sheet = { kind: 'actions' | 'delete' | 'edit'; store: StoreWithUsage } | { kind: 'new' } | null;

// T07 · Minhas lojas (RF-12).
export function StoresScreen({ onBack, onShowPurchases }: StoresScreenProps) {
  const { db, state, reload } = useStores();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [blockedId, setBlockedId] = useState<string | null>(null);
  const [deleteFailed, setDeleteFailed] = useState(false);
  const stores = state.status === 'ready' ? state.stores : [];

  function requestDelete(store: StoreWithUsage) {
    // Em uso, a exclusão nem chega a ser oferecida: o aviso aparece junto da loja (CT-24).
    if (describeDeleteBlock(store)) setBlockedId(store.id);
    else setSheet({ kind: 'delete', store });
  }

  async function confirmDelete(store: StoreWithUsage) {
    try {
      await deleteStore(db, store.id);
      setDeleteFailed(false);
      await reload();
    } catch {
      setDeleteFailed(true);
    }
  }

  return (
    <>
      <Screen
        header={
          <View style={styles.header}>
            <StackBar title="Minhas lojas" onBack={onBack} action={{ label: 'Nova', icon: 'plus', onPress: () => setSheet({ kind: 'new' }) }} />
          </View>
        }
        status={state.status === 'ready' ? (stores.length > 0 ? 'content' : 'empty') : state.status}
        onRetry={reload}
        empty={{
          icon: 'store',
          title: 'Nenhuma loja ainda',
          description: 'Cadastre as lojas onde você compra para comparar preço e pontualidade entre elas.',
          action: <Button label="Cadastrar loja" variant="secondary" onPress={() => setSheet({ kind: 'new' })} style={styles.stretch} />,
        }}>
        <Text variant="caption13" color="textMuted">
          Cada oferta e compra pertence a uma loja. É assim que o app compara preço e pontualidade entre elas.
        </Text>
        {deleteFailed && (
          <Text variant="caption13" color="errorDark">
            Não foi possível excluir a loja. Tente de novo.
          </Text>
        )}
        <View style={styles.list}>
          {stores.map((store, index) => {
            const punctuality = state.status === 'ready' ? state.punctuality.find((item) => item.storeId === store.id) : undefined;
            const block = blockedId === store.id ? describeDeleteBlock(store) : null;
            return (
              <View key={store.id} style={[styles.item, index > 0 && styles.divider]}>
                <Pressable
                  onPress={() => setSheet({ kind: 'actions', store })}
                  accessibilityRole="button"
                  accessibilityLabel={`${store.name}, ${describeStoreUsage(store)}`}
                  style={styles.row}>
                  <Monogram letter={storeMonogram(store.name)} />
                  <View style={styles.texts}>
                    <Text variant="body16Medium" numberOfLines={1}>
                      {store.name}
                    </Text>
                    <Text variant="caption12" color="textMuted" numberOfLines={1}>
                      {describeStoreUsage(store)}
                    </Text>
                  </View>
                  {punctuality && <DelayBadge averageDelay={punctuality.averageDelay} size="sm" />}
                  <Icon name="chevron-right" size={20} />
                </Pressable>
                {block && (
                  <View style={styles.block} accessibilityRole="alert">
                    <View style={styles.blockTitle}>
                      <Icon name="alert" size={18} color="warningDark" />
                      <Text variant="body14Medium" color="warningDark">
                        Esta loja não pode ser excluída
                      </Text>
                    </View>
                    <Text variant="caption13" color="warningDark">
                      {block}
                    </Text>
                    <View style={styles.blockActions}>
                      <Pressable onPress={() => onShowPurchases(store.name)} accessibilityRole="link" hitSlop={12}>
                        <Text variant="body14Medium" color="primaryDark">
                          Ver compras e ofertas
                        </Text>
                      </Pressable>
                      <Pressable onPress={() => setBlockedId(null)} accessibilityRole="button" hitSlop={12}>
                        <Text variant="body14Medium" color="warningDark">
                          Entendi
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </Screen>
      <ActionSheet
        isVisible={sheet?.kind === 'actions' || sheet?.kind === 'delete'}
        onClose={() => setSheet(null)}
        {...(sheet?.kind === 'actions'
          ? {
              title: sheet.store.name,
              actions: [
                { label: 'Editar', icon: 'edit' as const, onPress: () => setSheet({ kind: 'edit', store: sheet.store }) },
                { label: 'Excluir', icon: 'trash' as const, isDestructive: true, onPress: () => requestDelete(sheet.store) },
              ],
            }
          : sheet?.kind === 'delete'
            ? {
                title: `Excluir "${sheet.store.name}"?`,
                message: 'A loja sai deste aparelho e dos outros na próxima sincronização.',
                actions: [{ label: 'Excluir loja', icon: 'trash' as const, isDestructive: true, onPress: () => confirmDelete(sheet.store) }],
              }
            : {})}
      />
      <StoreSheet
        key={sheet?.kind === 'edit' ? sheet.store.id : 'new'}
        isVisible={sheet?.kind === 'edit' || sheet?.kind === 'new'}
        store={sheet?.kind === 'edit' ? sheet.store : undefined}
        onClose={() => setSheet(null)}
        onSaved={() => reload()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.surfaceWhite, borderBottomWidth: 1, borderBottomColor: colors.borderDefault },
  stretch: { alignSelf: 'stretch' },
  list: { borderRadius: radius.card, backgroundColor: colors.surfaceWhite, overflow: 'hidden', ...shadows.sm },
  item: { gap: 10, paddingVertical: 14, paddingLeft: 16, paddingRight: 12 },
  divider: { borderTopWidth: 1, borderTopColor: colors.borderDefault },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  texts: { flex: 1, gap: 2 },
  block: { gap: 8, padding: 12, borderRadius: radius.md, backgroundColor: colors.warningBg },
  blockTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  blockActions: { flexDirection: 'row', gap: 20, paddingTop: 2 },
});
