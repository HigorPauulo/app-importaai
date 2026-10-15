import { formatMoney } from '@/features/referencia/domain/currencyConverter';
import { formatDayMonth, toIsoDate } from '@/shared/date';
import { parseMoney } from '@/shared/money';

import type { CostEstimate } from './costEstimator';

type Estimated = Extract<CostEstimate, { kind: 'estimated' }>;

export type CompositionPart = { key: 'PAID' | 'IMPORT_TAX' | 'ICMS'; label: string; percent: number; value: string; share: number };

// "0.20" vira "20%"; "0.175" vira "17,5%".
const percentOf = (rate: string) => `${(Number(rate) * 100).toFixed(1).replace(/\.0$/, '').replace('.', ',')}%`;

// "Para onde vai o dinheiro" (T11): as três parcelas da RN10, quanto cada uma pesa no total
// e a alíquota que valeu, para a pessoa entender de onde vem cada real.
export function describeComposition(estimate: Estimated): CompositionPart[] {
  const { customsMinor, importTaxMinor, icmsMinor, totalMinor, parameters, isUpToThreshold } = estimate;
  const share = (value: number) => (totalMinor > 0 ? value / totalMinor : 0);
  const importRate = isUpToThreshold
    ? percentOf(parameters.rateUpToThreshold)
    : `${percentOf(parameters.rateAboveThreshold)} menos US$ ${parameters.deductionUsd.replace('.', ',')}`;
  return [
    { key: 'PAID', label: 'Produto + frete', value: customsMinor, share: share(customsMinor) },
    { key: 'IMPORT_TAX', label: `Imposto de importação · ${importRate}`, value: importTaxMinor, share: share(importTaxMinor) },
    { key: 'ICMS', label: `ICMS · ${percentOf(parameters.icmsRate)}`, value: icmsMinor, share: share(icmsMinor) },
  ].map((part) => ({ ...part, key: part.key as CompositionPart['key'], value: formatMoney(part.value), percent: Math.round(part.share * 100) }));
}

// A conclusão compara o que a vitrine mostrou com o que chega à casa.
export function describeTaxWeight(estimate: Estimated, shownPrice: string): string {
  const taxes = estimate.importTaxMinor + estimate.icmsMinor;
  const percent = estimate.totalMinor > 0 ? Math.round((taxes / estimate.totalMinor) * 100) : 0;
  return `Os impostos somam ${formatMoney(taxes)}, ou ${percent}% do custo final. Na vitrine você via só ${shownPrice}.`;
}

// "1 CNY = R$ 0,7356 hoje, 09:00 · parâmetros fiscais de 01/09/2026": de onde vieram os números.
export function describeSources(estimate: Estimated, currency: string, now: Date): string {
  const { rate, parameters } = estimate;
  const params = `parâmetros fiscais de ${formatDayMonth(parameters.validFrom)}/${parameters.validFrom.slice(0, 4)}`;
  if (currency === 'BRL' || !rate.fetchedAt) return params;
  const fetched = new Date(rate.fetchedAt);
  const day = toIsoDate(fetched) === toIsoDate(now) ? 'hoje' : `em ${formatDayMonth(toIsoDate(fetched))}`;
  const time = `${String(fetched.getHours()).padStart(2, '0')}:${String(fetched.getMinutes()).padStart(2, '0')}`;
  return `1 ${currency} = R$ ${rate.rate.replace(/(\.\d\d\d*?)0+$/, '$1').replace('.', ',')} ${day}, ${time} · ${params}`;
}

export type OfferDraft = { productName: string; storeId: string | null; currency: string; price: string; shipping: string };

export type OfferDraftErrors = Partial<Record<keyof OfferDraft, string>>;

export type OfferValues = { productName: string; storeId: string; currency: string; priceMinor: number; shippingMinor: number };

// Validação da oferta (RF-04). O nome do produto só é pedido quando a oferta abre um grupo novo.
export function validateOfferDraft(
  draft: OfferDraft,
  minorUnits: number,
  needsProductName: boolean,
): { errors: OfferDraftErrors; values: OfferValues | null } {
  const errors: OfferDraftErrors = {};
  const priceMinor = parseMoney(draft.price, minorUnits);
  const shippingMinor = draft.shipping.trim() ? parseMoney(draft.shipping, minorUnits) : 0;
  if (needsProductName && !draft.productName.trim()) errors.productName = 'Diga qual é o produto.';
  if (!draft.storeId) errors.storeId = 'Escolha a loja.';
  if (priceMinor === null || priceMinor <= 0) errors.price = 'Informe um preço maior que zero.';
  if (shippingMinor === null) errors.shipping = 'Informe o frete, ou 0,00 se for grátis.';
  if (Object.keys(errors).length > 0) return { errors, values: null };
  return {
    errors,
    values: {
      productName: draft.productName.trim(),
      storeId: draft.storeId as string,
      currency: draft.currency,
      priceMinor: priceMinor as number,
      shippingMinor: shippingMinor as number,
    },
  };
}
