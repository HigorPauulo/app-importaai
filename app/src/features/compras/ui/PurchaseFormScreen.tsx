import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View, type TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getOffer, linkOfferToPurchase } from '@/features/ofertas/data/offerRepository';
import { listActiveCurrencies, listAllExchangeRates, type Currency } from '@/features/referencia/data/currencyRepository';
import { convertToBrl, formatMoney, type ExchangeRate } from '@/features/referencia/domain/currencyConverter';
import { formatDayMonth, toIsoDate } from '@/shared/date';
import { formatMoneyInput, parseMoney } from '@/shared/money';
import {
  Button,
  EmptyState,
  FormSection,
  Icon,
  InfoBox,
  SelectField,
  StackBar,
  StickyFooter,
  Text,
  TextField,
  Toast,
  colors,
} from '@/shared/ui';

import { createPurchase, findPurchaseIdByTrackingCode, getPurchase, updatePurchase } from '../data/purchaseRepository';
import { listStores, type Store } from '../data/storeRepository';
import {
  PROTECTED_FIELDS,
  formatDateInput,
  maskDateInput,
  validatePurchaseDraft,
  type PurchaseDraft,
  type PurchaseDraftErrors,
} from '../domain/purchaseForm';
import { isConcluded } from '../domain/purchaseList';
import { StoreSheet } from './StoreSheet';

type PurchaseFormScreenProps = {
  // Sem id, cadastra; com id, altera (RF-08, RF-10).
  purchaseId?: string;
  // Converter oferta em compra (RF-07): o formulário chega preenchido com os dados dela.
  offerId?: string;
  onBack: () => void;
  onSaved: (id: string) => void;
  onOpenPurchase: (id: string) => void;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'missing' }
  | {
      status: 'ready';
      stores: Store[];
      currencies: Currency[];
      rates: ExchangeRate[];
      draft: PurchaseDraft;
      isLocked: boolean;
      offerStoreName: string | null;
    };

const DUPLICATE_CODE = 'Você já cadastrou este código. Abrir compra existente';

function emptyDraft(today: string, currencies: Currency[]): PurchaseDraft {
  return {
    productDescription: '',
    storeId: null,
    trackingCode: '',
    currency: currencies.some((currency) => currency.code === 'USD') ? 'USD' : (currencies[0]?.code ?? 'BRL'),
    amount: '',
    shipping: '',
    purchaseDate: formatDateInput(today),
    promisedDate: '',
    hasTax: false,
    taxAmount: '',
    taxDueDate: '',
  };
}

async function loadFormState(db: SQLiteDatabase, purchaseId: string | undefined, offerId: string | undefined, today: string): Promise<LoadState> {
  try {
    const [stores, currencies, rates, purchase, offer] = await Promise.all([
      listStores(db),
      listActiveCurrencies(db),
      listAllExchangeRates(db),
      purchaseId ? getPurchase(db, purchaseId) : Promise.resolve(null),
      offerId ? getOffer(db, offerId) : Promise.resolve(null),
    ]);
    if (purchaseId && !purchase) return { status: 'missing' };

    const draft: PurchaseDraft = purchase
      ? {
          productDescription: purchase.productDescription,
          storeId: purchase.storeId,
          trackingCode: purchase.trackingCode,
          currency: purchase.currency,
          amount: formatMoneyInput(purchase.amountMinor, purchase.minorUnits),
          shipping: formatMoneyInput(purchase.shippingMinor, purchase.minorUnits),
          purchaseDate: formatDateInput(purchase.purchaseDate),
          promisedDate: formatDateInput(purchase.promisedDate),
          hasTax: purchase.taxMinor !== null,
          taxAmount: purchase.taxMinor === null ? '' : formatMoneyInput(purchase.taxMinor, 2),
          taxDueDate: purchase.taxDueDate ? formatDateInput(purchase.taxDueDate) : '',
        }
      : offer
        ? {
            ...emptyDraft(today, currencies),
            productDescription: offer.groupName,
            storeId: offer.storeId,
            currency: offer.currency,
            amount: formatMoneyInput(offer.priceMinor, offer.minorUnits),
            shipping: formatMoneyInput(offer.shippingMinor, offer.minorUnits),
          }
        : emptyDraft(today, currencies);
    return {
      status: 'ready',
      stores,
      currencies,
      rates,
      draft,
      isLocked: purchase ? isConcluded(purchase.status) : false,
      offerStoreName: offer?.storeName ?? null,
    };
  } catch {
    return { status: 'error' };
  }
}

// Carrega uma vez: recarregar ao ganhar foco apagaria o que a pessoa já digitou.
function usePurchaseForm(purchaseId: string | undefined, offerId: string | undefined, today: string) {
  const db = useSQLiteContext();
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const reload = useCallback(() => loadFormState(db, purchaseId, offerId, today).then(setState), [db, purchaseId, offerId, today]);

  useEffect(() => {
    loadFormState(db, purchaseId, offerId, today).then(setState);
  }, [db, purchaseId, offerId, today]);

  return { db, state, setState, reload };
}

// T05 · Formulário de compra (RF-08, RF-10, RF-16).
export function PurchaseFormScreen({ purchaseId, offerId, onBack, onSaved, onOpenPurchase }: PurchaseFormScreenProps) {
  const today = toIsoDate(new Date());
  const { db, state, setState, reload } = usePurchaseForm(purchaseId, offerId, today);
  const [errors, setErrors] = useState<PurchaseDraftErrors>({});
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isNewStoreOpen, setIsNewStoreOpen] = useState(false);
  const trackingRef = useRef<TextInput>(null);
  const title = purchaseId ? 'Editar compra' : 'Nova compra';

  if (state.status !== 'ready') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <StackBar title={title} onBack={onBack} />
        </View>
        {state.status !== 'loading' && (
          <EmptyState
            icon={state.status === 'missing' ? 'package' : 'alert'}
            title={state.status === 'missing' ? 'Compra não encontrada' : 'Não foi possível carregar'}
            description={
              state.status === 'missing'
                ? 'Ela pode ter sido excluída neste ou em outro aparelho.'
                : 'Os dados salvos no aparelho continuam aqui. Tente de novo em instantes.'
            }
            action={state.status === 'error' && <Button label="Tentar de novo" variant="secondary" onPress={reload} style={styles.stretch} />}
          />
        )}
      </SafeAreaView>
    );
  }

  const { stores, currencies, rates, draft, isLocked, offerStoreName } = state;
  const minorUnits = currencies.find((currency) => currency.code === draft.currency)?.minorUnits ?? 2;
  const isFieldLocked = (field: keyof PurchaseDraft) => isLocked && PROTECTED_FIELDS.includes(field);

  function update(changes: Partial<PurchaseDraft>) {
    setState((current) => (current.status === 'ready' ? { ...current, draft: { ...current.draft, ...changes } } : current));
    setErrors((current) => {
      const next = { ...current };
      for (const field of Object.keys(changes) as (keyof PurchaseDraft)[]) delete next[field];
      return next;
    });
    if ('trackingCode' in changes) setDuplicateId(null);
  }

  function textProps(field: 'productDescription' | 'trackingCode' | 'amount' | 'shipping' | 'taxAmount') {
    return {
      value: draft[field],
      error: errors[field],
      editable: !isFieldLocked(field),
      onChangeText: (value: string) => update({ [field]: value }),
    };
  }

  function dateProps(field: 'purchaseDate' | 'promisedDate' | 'taxDueDate') {
    return {
      value: draft[field],
      error: errors[field],
      editable: !isFieldLocked(field),
      placeholder: 'dd/mm/aaaa',
      keyboardType: 'number-pad' as const,
      maxLength: 10,
      onChangeText: (value: string) => update({ [field]: maskDateInput(value) }),
    };
  }

  async function handleSave() {
    const { errors: fieldErrors, values } = validatePurchaseDraft(draft, minorUnits, today);
    setErrors(fieldErrors);
    setSaveFailed(false);
    if (!values) return;

    setIsSaving(true);
    try {
      const existingId = await findPurchaseIdByTrackingCode(db, values.trackingCode);
      if (existingId && existingId !== purchaseId) {
        setDuplicateId(existingId);
        setErrors({ trackingCode: DUPLICATE_CODE });
        trackingRef.current?.focus();
        return;
      }
      if (purchaseId) {
        await updatePurchase(db, purchaseId, values);
        onSaved(purchaseId);
      } else {
        const id = await createPurchase(db, values);
        if (offerId) await linkOfferToPurchase(db, offerId, id);
        onSaved(id);
      }
    } catch {
      setSaveFailed(true);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <StackBar title={title} onBack={onBack} />
      </View>
      <KeyboardAvoidingView behavior="padding" style={styles.fill}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {offerStoreName && (
            <InfoBox icon="tag">
              <Text variant="caption13" color="primaryDark">
                Dados trazidos da sua oferta na {offerStoreName}. Confira e complete.
              </Text>
            </InfoBox>
          )}
          {isLocked && (
            <InfoBox icon="lock">
              <Text variant="caption13" color="primaryDark">
                Compra concluída: loja, código, valores e datas ficam travados para não mudar o que já foi
                contabilizado.
              </Text>
            </InfoBox>
          )}

          <FormSection label="Produto">
            <TextField {...textProps('productDescription')} label="Descrição" autoCapitalize="sentences" />
            <SelectField
              label="Loja"
              icon="store"
              value={draft.storeId}
              options={stores.map((store) => ({ value: store.id, label: store.name }))}
              placeholder="Escolher a loja"
              error={errors.storeId}
              isLocked={isFieldLocked('storeId')}
              extraAction={{ label: 'Nova loja', icon: 'plus', onPress: () => setIsNewStoreOpen(true) }}
              onChange={(storeId) => update({ storeId })}
            />
          </FormSection>

          <FormSection label="Rastreio">
            <TextField
              {...textProps('trackingCode')}
              ref={trackingRef}
              label="Código de rastreio"
              icon="package"
              autoCapitalize="characters"
              autoCorrect={false}
              onErrorPress={duplicateId ? () => onOpenPurchase(duplicateId) : undefined}
            />
          </FormSection>

          <FormSection label="Valores">
            <View style={styles.row}>
              <View style={styles.currency}>
                <SelectField
                  label="Moeda"
                  value={draft.currency}
                  options={currencies.map((currency) => ({ value: currency.code, label: currency.code }))}
                  isLocked={isFieldLocked('currency')}
                  onChange={(currency) => update({ currency })}
                />
              </View>
              <View style={styles.fill}>
                <TextField {...textProps('amount')} label="Valor pago" keyboardType="decimal-pad" placeholder="0,00" />
              </View>
            </View>
            <TextField
              {...textProps('shipping')}
              label="Frete"
              keyboardType="decimal-pad"
              placeholder="0,00"
              hint={errors.shipping ? undefined : 'Deixe 0,00 se o frete foi grátis.'}
            />
            <LiveConversion draft={draft} minorUnits={minorUnits} rates={rates} today={today} />
          </FormSection>

          <FormSection label="Prazos">
            <View style={styles.row}>
              <View style={styles.fill}>
                <TextField {...dateProps('purchaseDate')} label="Data da compra" />
              </View>
              <View style={styles.fill}>
                <TextField {...dateProps('promisedDate')} label="Prazo prometido" />
              </View>
            </View>
          </FormSection>

          {draft.hasTax ? (
            <FormSection label="Taxa de importação">
              <View style={styles.row}>
                <View style={styles.fill}>
                  <TextField {...textProps('taxAmount')} label="Valor (R$)" keyboardType="decimal-pad" placeholder="0,00" />
                </View>
                <View style={styles.fill}>
                  <TextField {...dateProps('taxDueDate')} label="Vencimento" />
                </View>
              </View>
              <LinkRow icon="trash" label="Remover taxa" onPress={() => update({ hasTax: false, taxAmount: '', taxDueDate: '' })} />
            </FormSection>
          ) : (
            <LinkRow icon="plus" label="Adicionar taxa de importação" onPress={() => update({ hasTax: true })} />
          )}

          {saveFailed && <Toast type="error" title="Não foi possível salvar" message="Nada foi perdido. Tente de novo." />}
        </ScrollView>
        <StickyFooter caption="Fica salva no aparelho mesmo sem conexão.">
          <Button label="Salvar compra" isLoading={isSaving} onPress={handleSave} />
        </StickyFooter>
      </KeyboardAvoidingView>
      <StoreSheet
        isVisible={isNewStoreOpen}
        onClose={() => setIsNewStoreOpen(false)}
        onSaved={(store) => {
          setState((current) =>
            current.status === 'ready'
              ? { ...current, stores: [...current.stores, store], draft: { ...current.draft, storeId: store.id } }
              : current,
          );
          setErrors((current) => ({ ...current, storeId: undefined }));
        }}
      />
    </SafeAreaView>
  );
}

type LiveConversionProps = { draft: PurchaseDraft; minorUnits: number; rates: readonly ExchangeRate[]; today: string };

// "conversao" da T05: estimativa ao vivo pela cotação mais recente (RN07, oferta); a compra
// gravada usa a cotação da própria data, por isso o texto avisa.
function LiveConversion({ draft, minorUnits, rates, today }: LiveConversionProps) {
  const amount = parseMoney(draft.amount, minorUnits);
  if (draft.currency === 'BRL' || amount === null || amount <= 0) return null;

  const shipping = parseMoney(draft.shipping, minorUnits) ?? 0;
  const conversion = convertToBrl(amount + shipping, minorUnits, draft.currency, today, rates);
  if (conversion.kind === 'unavailable') {
    return (
      <InfoBox>
        <Text variant="caption12" color="primaryDark">
          Sem cotação de {draft.currency} no aparelho. O valor em reais aparece depois da sincronização.
        </Text>
      </InfoBox>
    );
  }

  const source = conversion.isApproximate ? `Pela cotação mais recente (${formatDayMonth(conversion.rate.rateDate)})` : 'Pela cotação de hoje';
  return (
    <InfoBox>
      <Text variant="body16Medium" color="primaryDark">
        ≈ {formatMoney(conversion.brlMinor)}
      </Text>
      <Text variant="caption12" color="primaryDark">
        {source}. O valor final usa a cotação da data da compra.
      </Text>
    </InfoBox>
  );
}

// "adicionar-taxa": ação secundária em texto azul, com ícone, na altura de toque mínima.
function LinkRow({ icon, label, onPress }: { icon: 'plus' | 'trash'; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.linkRow}>
      <Icon name={icon} size={20} color="primaryBase" />
      <Text variant="body14Medium" color="primaryBase">
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surfaceWhite },
  header: { borderBottomWidth: 1, borderBottomColor: colors.borderDefault },
  fill: { flex: 1 },
  stretch: { alignSelf: 'stretch' },
  content: { gap: 20, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  currency: { width: 112 },
  linkRow: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
});
