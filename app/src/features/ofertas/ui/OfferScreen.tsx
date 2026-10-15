import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listStores, type Store } from '@/features/compras/data/storeRepository';
import { StoreSheet } from '@/features/compras/ui/StoreSheet';
import {
  listActiveCurrencies,
  listAllExchangeRates,
  listTaxParameters,
  type Currency,
} from '@/features/referencia/data/currencyRepository';
import { formatMoney, type ExchangeRate } from '@/features/referencia/domain/currencyConverter';
import type { TaxParameters } from '@/features/referencia/domain/taxParameters';
import { formatMoneyInput, parseMoney } from '@/shared/money';
import {
  ActionSheet,
  Button,
  Card,
  EmptyState,
  Icon,
  InfoBox,
  SelectField,
  StackBar,
  StickyFooter,
  Text,
  TextField,
  Toast,
  colors,
  radius,
} from '@/shared/ui';

import { createOffer, deleteOffer, getGroupName, getOffer, updateOffer } from '../data/offerRepository';
import { estimateCost } from '../domain/costEstimator';
import type { OfferListItem } from '../domain/offerList';
import {
  describeComposition,
  describeSources,
  describeTaxWeight,
  validateOfferDraft,
  type OfferDraft,
  type OfferDraftErrors,
} from '../domain/offerSimulation';
import { CompositionChart } from './CompositionChart';

type OfferScreenProps = {
  // Com offerId, abre a oferta; sem ele, cria (no grupo groupId ou num grupo novo).
  offerId?: string;
  groupId?: string;
  onBack: () => void;
  onSaved: () => void;
  onConvert: (offerId: string) => void;
  onOpenPurchase: (purchaseId: string) => void;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'missing' }
  | {
      status: 'ready';
      offer: OfferListItem | null;
      groupName: string | null;
      stores: Store[];
      currencies: Currency[];
      rates: ExchangeRate[];
      taxVersions: TaxParameters[];
    };

async function loadOffer(db: SQLiteDatabase, offerId?: string, groupId?: string): Promise<LoadState> {
  try {
    const [offer, stores, currencies, rates, taxVersions] = await Promise.all([
      offerId ? getOffer(db, offerId) : Promise.resolve(null),
      listStores(db),
      listActiveCurrencies(db),
      listAllExchangeRates(db),
      listTaxParameters(db),
    ]);
    if (offerId && !offer) return { status: 'missing' };
    const groupName = offer?.groupName ?? (groupId ? await getGroupName(db, groupId) : null);
    return { status: 'ready', offer, groupName, stores, currencies, rates, taxVersions };
  } catch {
    return { status: 'error' };
  }
}

function initialDraft(offer: OfferListItem | null, currencies: Currency[]): OfferDraft {
  if (offer) {
    return {
      productName: offer.groupName,
      storeId: offer.storeId,
      currency: offer.currency,
      price: formatMoneyInput(offer.priceMinor, offer.minorUnits),
      shipping: formatMoneyInput(offer.shippingMinor, offer.minorUnits),
    };
  }
  const currency = currencies.some((item) => item.code === 'USD') ? 'USD' : (currencies[0]?.code ?? 'BRL');
  return { productName: '', storeId: null, currency, price: '', shipping: '' };
}

// T11 · Oferta e simulação (RF-04, RF-05, RF-07).
export function OfferScreen({ offerId, groupId, onBack, onSaved, onConvert, onOpenPurchase }: OfferScreenProps) {
  const db = useSQLiteContext();
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [draft, setDraft] = useState<OfferDraft | null>(null);
  const [errors, setErrors] = useState<OfferDraftErrors>({});
  const [sheet, setSheet] = useState<'menu' | 'delete' | 'method' | 'store' | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [busy, setBusy] = useState<'save' | 'convert' | null>(null);

  const load = useCallback(
    () =>
      loadOffer(db, offerId, groupId).then((loaded) => {
        setState(loaded);
        if (loaded.status === 'ready') setDraft(initialDraft(loaded.offer, loaded.currencies));
      }),
    [db, offerId, groupId],
  );

  useEffect(() => {
    load();
  }, [load]);

  if (state.status !== 'ready' || !draft) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <StackBar onBack={onBack} />
        </View>
        {(state.status === 'missing' || state.status === 'error') && (
          <EmptyState
            icon={state.status === 'missing' ? 'tag' : 'alert'}
            title={state.status === 'missing' ? 'Oferta não encontrada' : 'Não foi possível carregar'}
            description={
              state.status === 'missing'
                ? 'Ela pode ter sido excluída neste ou em outro aparelho.'
                : 'Os dados salvos no aparelho continuam aqui. Tente de novo em instantes.'
            }
            action={state.status === 'error' && <Button label="Tentar de novo" variant="secondary" onPress={load} style={styles.stretch} />}
          />
        )}
      </SafeAreaView>
    );
  }

  const { offer, groupName, stores, currencies, rates, taxVersions } = state;
  const now = new Date();
  const minorUnits = currencies.find((currency) => currency.code === draft.currency)?.minorUnits ?? 2;
  const priceMinor = parseMoney(draft.price, minorUnits);
  const shippingMinor = parseMoney(draft.shipping || '0', minorUnits) ?? 0;
  // Recálculo imediato: a estimativa acompanha cada tecla (telas.md, T11).
  const estimate = priceMinor && priceMinor > 0 ? estimateCost(priceMinor, shippingMinor, draft.currency, minorUnits, rates, taxVersions, now) : null;
  const storeName = stores.find((store) => store.id === draft.storeId)?.name;
  const needsProductName = !offer && !groupId;
  // O preço como a vitrine mostrou, para a conclusão comparar com o custo final.
  const shownPrice = priceMinor ? formatMoney(priceMinor, draft.currency, minorUnits) : '';

  function update(changes: Partial<OfferDraft>) {
    setDraft((current) => (current ? { ...current, ...changes } : current));
    setErrors((current) => {
      const next = { ...current };
      for (const field of Object.keys(changes) as (keyof OfferDraft)[]) delete next[field];
      return next;
    });
  }

  // Grava a oferta e devolve o id; null quando há erro de campo ou a gravação falha.
  async function save(): Promise<string | null> {
    const { errors: fieldErrors, values } = validateOfferDraft(draft as OfferDraft, minorUnits, needsProductName);
    setErrors(fieldErrors);
    setSaveFailed(false);
    if (!values) return null;
    const input = { storeId: values.storeId, currency: values.currency, priceMinor: values.priceMinor, shippingMinor: values.shippingMinor };
    try {
      if (offer) {
        await updateOffer(db, offer.id, input);
        return offer.id;
      }
      return await createOffer(db, groupId ? { id: groupId } : { name: values.productName }, input);
    } catch {
      setSaveFailed(true);
      return null;
    }
  }

  async function handleSave() {
    setBusy('save');
    const id = await save();
    setBusy(null);
    if (id) onSaved();
  }

  async function handleConvert() {
    if (offer?.purchaseId) return onOpenPurchase(offer.purchaseId);
    setBusy('convert');
    const id = await save();
    setBusy(null);
    if (id) onConvert(id);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <StackBar onBack={onBack} onMore={offer ? () => setSheet('menu') : undefined} />
        <View style={styles.summary}>
          <Text variant="body14" color="textMuted" numberOfLines={1}>
            {[groupName ?? (draft.productName.trim() || 'Nova oferta'), storeName].filter(Boolean).join(' · ')}
          </Text>
          <View style={styles.totalRow}>
            {estimate?.kind === 'estimated' ? (
              <>
                <Text variant="display34" color="primaryDark" accessibilityLabel={`Custo final estimado ${formatMoney(estimate.totalMinor)}`}>
                  {formatMoney(estimate.totalMinor)}
                </Text>
                <View style={styles.estimateBadge}>
                  <Text variant="caption11Bold" color="warningDark">
                    ESTIMATIVA
                  </Text>
                </View>
              </>
            ) : (
              <Text variant="title24" color="textMuted">
                {!estimate ? 'Informe o preço' : estimate.reason === 'NO_RATE' ? `Sem cotação de ${draft.currency}` : 'Sem parâmetros fiscais'}
              </Text>
            )}
          </View>
          <Text variant="caption13" color="textMuted">
            {estimate?.kind === 'unavailable'
              ? 'A estimativa aparece depois da próxima sincronização.'
              : 'Custo final para receber em casa, com frete e impostos'}
          </Text>
          {estimate?.kind === 'estimated' && estimate.isStaleRate && (
            <View style={styles.stale} accessibilityRole="alert">
              <Icon name="alert" size={14} color="warningDark" />
              <Text variant="caption12" color="warningDark">
                Cotação desatualizada, com mais de 24 horas. O valor pode ter mudado.
              </Text>
            </View>
          )}
        </View>
      </View>

      <KeyboardAvoidingView behavior="padding" style={styles.fill}>
        <ScrollView style={styles.body} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {estimate?.kind === 'estimated' && (
            <Card gap={14}>
              <View style={styles.cardTitle}>
                <Text variant="body16Medium" accessibilityRole="header">
                  Para onde vai o dinheiro
                </Text>
                <Pressable onPress={() => setSheet('method')} accessibilityRole="button" hitSlop={14}>
                  <Text variant="caption13SemiBold" color="primaryBase">
                    Como calculamos
                  </Text>
                </Pressable>
              </View>
              <CompositionChart parts={describeComposition(estimate)} />
              <InfoBox>
                <Text variant="caption13" color="primaryDark">
                  {describeTaxWeight(estimate, shownPrice)}
                </Text>
              </InfoBox>
            </Card>
          )}

          <Card title="Dados da oferta" isCompact gap={14}>
            {needsProductName && (
              <TextField
                label="Produto"
                icon="tag"
                value={draft.productName}
                error={errors.productName}
                onChangeText={(productName) => update({ productName })}
                autoCapitalize="sentences"
              />
            )}
            <SelectField
              label="Loja"
              icon="store"
              value={draft.storeId}
              options={stores.map((store) => ({ value: store.id, label: store.name }))}
              placeholder="Escolher a loja"
              error={errors.storeId}
              extraAction={{ label: 'Nova loja', icon: 'plus', onPress: () => setSheet('store') }}
              onChange={(storeId) => update({ storeId })}
            />
            <View style={styles.row}>
              <View style={styles.currency}>
                <SelectField
                  label="Moeda"
                  value={draft.currency}
                  options={currencies.map((currency) => ({ value: currency.code, label: currency.code }))}
                  onChange={(currency) => update({ currency })}
                />
              </View>
              <View style={styles.fill}>
                <TextField
                  label="Preço"
                  value={draft.price}
                  error={errors.price}
                  keyboardType="decimal-pad"
                  placeholder="0,00"
                  onChangeText={(price) => update({ price })}
                />
              </View>
            </View>
            <TextField
              label="Frete"
              value={draft.shipping}
              error={errors.shipping}
              keyboardType="decimal-pad"
              placeholder="0,00"
              hint={errors.shipping ? undefined : 'Deixe 0,00 se o frete for grátis.'}
              onChangeText={(shipping) => update({ shipping })}
            />
            {estimate?.kind === 'estimated' && (
              <Text variant="caption12" color="textMuted">
                {describeSources(estimate, draft.currency, now)}
              </Text>
            )}
          </Card>
          {saveFailed && <Toast type="error" title="Não foi possível salvar" message="Nada foi perdido. Tente de novo." />}
        </ScrollView>
        <StickyFooter>
          <View style={styles.actions}>
            <Button label="Salvar" variant="secondary" isLoading={busy === 'save'} onPress={handleSave} style={styles.saveButton} />
            <Button
              label={offer?.purchaseId ? 'Ver compra' : 'Converter em compra'}
              isLoading={busy === 'convert'}
              onPress={handleConvert}
              style={styles.fill}
            />
          </View>
        </StickyFooter>
      </KeyboardAvoidingView>

      <ActionSheet
        isVisible={sheet === 'menu' || sheet === 'delete' || sheet === 'method'}
        onClose={() => setSheet(null)}
        {...(sheet === 'menu'
          ? { actions: [{ label: 'Excluir oferta', icon: 'trash' as const, isDestructive: true, onPress: () => setSheet('delete') }] }
          : sheet === 'delete' && offer
            ? {
                title: `Excluir a oferta da ${offer.storeName}?`,
                message: offer.purchaseId
                  ? 'A compra criada a partir dela continua.'
                  : 'Ela sai deste aparelho e dos outros na próxima sincronização.',
                actions: [
                  {
                    label: 'Excluir oferta',
                    icon: 'trash' as const,
                    isDestructive: true,
                    onPress: () => deleteOffer(db, offer.id, offer.groupId).then(onSaved, () => setSaveFailed(true)),
                  },
                ],
              }
            : sheet === 'method'
              ? {
                  title: 'Como calculamos',
                  message:
                    'Preço e frete viram reais pela cotação mais recente. O imposto de importação usa a faixa em dólar: até o limite, uma alíquota; acima dele, outra, menos uma dedução. O ICMS é calculado "por dentro", sobre o valor com o imposto. É uma estimativa: não substitui a cobrança oficial nem considera isenções.',
                }
              : {})}
      />
      <StoreSheet
        isVisible={sheet === 'store'}
        onClose={() => setSheet(null)}
        onSaved={(store) => {
          setState((current) => (current.status === 'ready' ? { ...current, stores: [...current.stores, store] } : current));
          update({ storeId: store.id });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stretch: { alignSelf: 'stretch' },
  safeArea: { flex: 1, backgroundColor: colors.surfaceWhite },
  header: { backgroundColor: colors.surfaceWhite, borderBottomWidth: 1, borderBottomColor: colors.borderDefault },
  summary: { gap: 4, paddingHorizontal: 20, paddingBottom: 20 },
  totalRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  estimateBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm, backgroundColor: colors.warningBg },
  stale: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fill: { flex: 1 },
  body: { backgroundColor: colors.background },
  content: { gap: 12, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 24 },
  cardTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  currency: { width: 104 },
  actions: { flexDirection: 'row', gap: 12 },
  saveButton: { width: 112 },
});
