import * as Clipboard from 'expo-clipboard';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { listAllExchangeRates } from '@/features/referencia/data/currencyRepository';
import type { ExchangeRate } from '@/features/referencia/domain/currencyConverter';
import { formatDayMonth, toIsoDate } from '@/shared/date';
import { ActionSheet, Card, CostLine, Icon, Screen, StackBar, Text, Toast, colors, radius, type SheetAction } from '@/shared/ui';

import {
  archivePurchase,
  confirmReceipt,
  deletePurchase,
  getPurchase,
  listTrackingEvents,
  registerTaxPayment,
  unarchivePurchase,
} from '../data/purchaseRepository';
import {
  describeCosts,
  describePromise,
  describeTaxAction,
  type PurchaseDetail,
  type TrackingEvent,
} from '../domain/purchaseDetail';
import { isConcluded } from '../domain/purchaseList';
import { StatusBadge } from './StatusBadge';
import { TaxActionCard } from './TaxActionCard';
import { Timeline } from './Timeline';

type PurchaseDetailScreenProps = {
  purchaseId: string;
  onBack: () => void;
  onEdit?: () => void;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'missing' }
  | { status: 'ready'; purchase: PurchaseDetail; events: TrackingEvent[]; rates: ExchangeRate[] };

type Sheet = 'menu' | 'delete' | 'payment' | 'receipt' | null;

function usePurchaseDetail(id: string) {
  const db = useSQLiteContext();
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  const load = useCallback(async () => {
    try {
      const [purchase, events, rates] = await Promise.all([getPurchase(db, id), listTrackingEvents(db, id), listAllExchangeRates(db)]);
      setState(purchase ? { status: 'ready', purchase, events, rates } : { status: 'missing' });
    } catch {
      setState({ status: 'error' });
    }
  }, [db, id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { db, state, reload: load };
}

type Feedback = { type: 'success' | 'error'; title: string };

// Retorno curto depois de uma ação; some sozinho.
function useFeedback() {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);
  return [feedback, setFeedback] as const;
}

// T04 · Detalhe da compra (RF-09, RF-11, RF-16).
export function PurchaseDetailScreen({ purchaseId, onBack, onEdit }: PurchaseDetailScreenProps) {
  const { db, state, reload } = usePurchaseDetail(purchaseId);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [feedback, setFeedback] = useFeedback();
  const today = toIsoDate(new Date());

  if (state.status !== 'ready') {
    return (
      <Screen
        header={<DetailHeader onBack={onBack} />}
        status={state.status === 'missing' ? 'empty' : state.status}
        empty={{
          icon: 'package',
          title: 'Compra não encontrada',
          description: 'Ela pode ter sido excluída neste ou em outro aparelho.',
        }}
        onRetry={reload}
      />
    );
  }

  const { purchase, events, rates } = state;
  const taxAction = describeTaxAction(purchase, today);
  const costs = describeCosts(purchase, rates);
  const promise = describePromise(purchase, today);

  async function run(change: () => Promise<void>, message: string) {
    try {
      await change();
      setFeedback({ type: 'success', title: message });
      await reload();
    } catch {
      setFeedback({ type: 'error', title: 'Não foi possível salvar a alteração. Tente de novo.' });
    }
  }

  async function handleCopy() {
    await Clipboard.setStringAsync(purchase.trackingCode);
    setFeedback({ type: 'success', title: 'Código de rastreio copiado.' });
  }

  const menu: SheetAction[] = [
    ...(onEdit ? [{ label: 'Editar', icon: 'edit' as const, onPress: onEdit }] : []),
    ...(!isConcluded(purchase.status)
      ? [{ label: 'Confirmar recebimento', icon: 'check-circle' as const, onPress: () => setSheet('receipt') }]
      : []),
    purchase.archivedAt
      ? { label: 'Desarquivar', icon: 'archive', onPress: () => run(() => unarchivePurchase(db, purchase.id), 'Compra de volta à lista.') }
      : { label: 'Arquivar', icon: 'archive', onPress: () => run(() => archivePurchase(db, purchase.id), 'Compra arquivada.') },
    { label: 'Excluir', icon: 'trash', isDestructive: true, onPress: () => setSheet('delete') },
  ];

  const sheets: Record<Exclude<Sheet, null>, { title?: string; message?: string; actions: SheetAction[] }> = {
    menu: { actions: menu },
    delete: {
      title: `Excluir "${purchase.productDescription}"?`,
      message: 'A compra e o rastreio saem deste aparelho e dos outros na próxima sincronização. Não dá para desfazer.',
      actions: [
        {
          label: 'Excluir compra',
          icon: 'trash',
          isDestructive: true,
          onPress: async () => {
            try {
              await deletePurchase(db, purchase.id);
              onBack();
            } catch {
              setFeedback({ type: 'error', title: 'Não foi possível excluir. Tente de novo.' });
            }
          },
        },
      ],
    },
    payment: {
      title: 'Registrar pagamento da taxa?',
      message: `${costs.lines.find((line) => line.label === 'Taxa de importação')?.value}, pago hoje (${formatDayMonth(today)}). Os lembretes param.`,
      actions: [
        { label: 'Registrar pagamento', icon: 'check', onPress: () => run(() => registerTaxPayment(db, purchase.id, today), 'Pagamento da taxa registrado.') },
      ],
    },
    receipt: {
      title: 'Confirmar recebimento?',
      message: `A compra passa a Entregue com a data de hoje (${formatDayMonth(today)}) e deixa de gerar alertas.`,
      actions: [
        {
          label: 'Confirmar recebimento',
          icon: 'check-circle',
          onPress: () => run(() => confirmReceipt(db, purchase.id, today), 'Recebimento confirmado. A situação muda na próxima sincronização.'),
        },
      ],
    },
  };

  return (
    <>
      <Screen
        header={<DetailHeader purchase={purchase} onBack={onBack} onMore={() => setSheet('menu')} onCopy={handleCopy} />}
        status="content"
        empty={{ icon: 'package', title: '', description: '' }}>
        {feedback && <Toast {...feedback} />}
        {taxAction && (
          <TaxActionCard
            taxAction={taxAction}
            onPress={taxAction.action === 'REGISTER_PAYMENT' ? () => setSheet('payment') : onEdit}
          />
        )}
        <Card title="Valores">
          {costs.lines.map((line) => (
            <CostLine key={line.label} {...line} />
          ))}
          {costs.total && <CostLine label="Custo total" value={costs.total} isTotal />}
        </Card>
        <Card style={styles.promise}>
          <View style={styles.promiseIcon}>
            <Icon name="clock" size={20} color="primaryDark" />
          </View>
          <View style={styles.promiseTexts}>
            <Text variant="body16Medium">{promise.title}</Text>
            <Text variant="caption12" color="textMuted">
              {promise.caption}
            </Text>
          </View>
        </Card>
        <Card title="Rastreio" gap={14}>
          <Timeline events={events} today={today} />
        </Card>
      </Screen>
      <ActionSheet isVisible={sheet !== null} onClose={() => setSheet(null)} {...(sheet ? sheets[sheet] : { actions: [] })} />
    </>
  );
}

type DetailHeaderProps = {
  purchase?: PurchaseDetail;
  onBack: () => void;
  onMore?: () => void;
  onCopy?: () => void;
};

// "cabecalho" da T04: barra, situação, produto, loja e código com o botão de copiar.
function DetailHeader({ purchase, onBack, onMore, onCopy }: DetailHeaderProps) {
  return (
    <View style={styles.header}>
      <StackBar onBack={onBack} onMore={onMore} />
      {purchase && (
        <View style={styles.summary}>
          <StatusBadge status={purchase.status} />
          <Text variant="title24" accessibilityRole="header">
            {purchase.productDescription}
          </Text>
          <View style={styles.meta}>
            <Text variant="body14" color="textMuted">
              {purchase.storeName} · {purchase.trackingCode}
            </Text>
            <Pressable onPress={onCopy} accessibilityRole="button" accessibilityLabel="Copiar código de rastreio" hitSlop={16}>
              <Icon name="copy" size={16} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.surfaceWhite, borderBottomWidth: 1, borderBottomColor: colors.borderDefault },
  summary: { gap: 6, paddingHorizontal: 20, paddingBottom: 16, alignItems: 'flex-start' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  promise: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 100 },
  promiseIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  promiseTexts: { flex: 1, gap: 2 },
});
