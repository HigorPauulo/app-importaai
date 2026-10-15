import { formatMoney, type ExchangeRate } from '@/features/referencia/domain/currencyConverter';
import { formatDayMonth, toIsoDate } from '@/shared/date';

import type { TaxParameters } from '@/features/referencia/domain/taxParameters';

import { estimateCost, type CostEstimate } from './costEstimator';

export type OfferListItem = {
  id: string;
  groupId: string;
  groupName: string;
  storeId: string;
  storeName: string;
  priceMinor: number;
  shippingMinor: number;
  currency: string;
  minorUnits: number;
  purchaseId: string | null;
};

export type OfferView = OfferListItem & {
  estimate: CostEstimate;
  origin: string;
  total: string;
  isCheapest: boolean;
  difference: string | null;
};

export type OfferGroup = { id: string; name: string; offers: OfferView[] };

// "180,00 CNY · frete grátis" ou "24,00 USD + 6,00 USD de frete": o preço como a loja mostra.
export function describeOrigin({ priceMinor, shippingMinor, currency, minorUnits }: OfferListItem): string {
  const price = formatMoney(priceMinor, currency, minorUnits);
  return shippingMinor === 0 ? `${price} · frete grátis` : `${price} + ${formatMoney(shippingMinor, currency, minorUnits)} de frete`;
}

const totalOf = (offer: OfferView) => (offer.estimate.kind === 'estimated' ? offer.estimate.totalMinor : Number.POSITIVE_INFINITY);

// T10: ofertas agrupadas por produto, da mais barata para a mais cara. O selo "Menor custo" só
// aparece quando há com o que comparar; as outras mostram quanto custam a mais.
export function groupOffers(
  offers: readonly OfferListItem[],
  rates: readonly ExchangeRate[],
  taxVersions: readonly TaxParameters[],
  now: Date,
): OfferGroup[] {
  const groups = new Map<string, OfferGroup>();
  for (const offer of offers) {
    const estimate = estimateCost(offer.priceMinor, offer.shippingMinor, offer.currency, offer.minorUnits, rates, taxVersions, now);
    const view: OfferView = {
      ...offer,
      estimate,
      origin: describeOrigin(offer),
      total: estimate.kind === 'estimated' ? formatMoney(estimate.totalMinor) : 'sem estimativa',
      isCheapest: false,
      difference: null,
    };
    const group = groups.get(offer.groupId) ?? { id: offer.groupId, name: offer.groupName, offers: [] };
    groups.set(offer.groupId, { ...group, offers: [...group.offers, view] });
  }

  return [...groups.values()]
    .map((group) => {
      const sorted = [...group.offers].sort((a, b) => totalOf(a) - totalOf(b));
      const cheapest = totalOf(sorted[0]);
      const comparable = sorted.filter((offer) => Number.isFinite(totalOf(offer))).length >= 2;
      return {
        ...group,
        offers: sorted.map((offer, index) => ({
          ...offer,
          isCheapest: comparable && index === 0,
          difference: comparable && index > 0 && Number.isFinite(totalOf(offer)) ? `+ ${formatMoney(totalOf(offer) - cheapest)}` : null,
        })),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

// Rodapé da T10: de quando é a cotação usada (RN07). Mais de 24 h vira aviso.
export function describeEstimateNote(groups: readonly OfferGroup[], now: Date): { text: string; isStale: boolean } | null {
  const estimates = groups.flatMap((group) => group.offers.map((offer) => offer.estimate));
  const used = estimates.find((estimate) => estimate.kind === 'estimated');
  if (!used || used.kind !== 'estimated' || !used.rate.fetchedAt) return null;

  const fetched = new Date(used.rate.fetchedAt);
  const day = toIsoDate(fetched) === toIsoDate(now) ? 'hoje' : formatDayMonth(toIsoDate(fetched));
  const time = `${String(fetched.getHours()).padStart(2, '0')}:${String(fetched.getMinutes()).padStart(2, '0')}`;
  const isStale = estimates.some((estimate) => estimate.kind === 'estimated' && estimate.isStaleRate);
  return { text: isStale ? `Cotação desatualizada, de ${day}, ${time}` : `Estimativa com a cotação de ${day}, ${time}`, isStale };
}
