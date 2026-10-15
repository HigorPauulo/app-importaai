import { convertToBrl, formatMoney, type ExchangeRate } from '@/features/referencia/domain/currencyConverter';
import { daysBetween, toLocalDate } from '@/shared/date';
import { plural } from '@/shared/text';

import type { PurchaseDetail } from './purchaseDetail';
import { isConcluded, type PurchaseStatus } from './purchaseList';

export type DashboardPeriod = 'MONTH' | 'QUARTER' | 'YEAR';

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

// Rótulos do filtro de período: o mês corrente pelo nome ("Outubro"), os outros pelo tamanho.
export function periodOptions(today: string): { value: DashboardPeriod; label: string; phrase: string }[] {
  const month = MONTHS[Number(today.slice(5, 7)) - 1];
  return [
    { value: 'MONTH', label: capitalize(month), phrase: `em ${month}` },
    { value: 'QUARTER', label: '3 meses', phrase: 'em 3 meses' },
    { value: 'YEAR', label: '12 meses', phrase: 'em 12 meses' },
  ];
}

// Primeiro dia do mês, `monthsBack` meses antes do mês de `today`.
export function monthStart(today: string, monthsBack: number): string {
  const index = Number(today.slice(0, 4)) * 12 + Number(today.slice(5, 7)) - 1 - monthsBack;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}-01`;
}

const PERIOD_MONTHS: Record<DashboardPeriod, number> = { MONTH: 0, QUARTER: 2, YEAR: 11 };

// Data em que a compra se concluiu: a confirmação manual vale sobre o último evento (RN01).
const concludedOn = (purchase: PurchaseDetail) => toLocalDate(purchase.receivedAt ?? purchase.lastEventAt ?? purchase.promisedDate);

// Valor pago (produto e frete) em reais pela cotação da data da compra (RN07); null sem cotação.
function paidInBrl(purchase: PurchaseDetail, rates: readonly ExchangeRate[]): number | null {
  const conversion = convertToBrl(
    purchase.amountMinor + purchase.shippingMinor,
    purchase.minorUnits,
    purchase.currency,
    purchase.purchaseDate,
    rates,
  );
  return conversion.kind === 'converted' ? conversion.brlMinor : null;
}

const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0);

export type StorePunctuality = { storeId: string; storeName: string; deliveries: number; averageDelay: number };

export type Dashboard = {
  inTransit: { value: string; caption: string };
  spent: { label: string; value: string; caption: string };
  taxes: { value: string; caption: string };
  months: { label: string; valueMinor: number; isCurrent: boolean; caption: string }[];
  statuses: { label: string; count: number }[];
  punctuality: StorePunctuality[];
  conclusion: string | null;
};

// RF-18 e RF-19: os números do painel saem das compras do aparelho, então funcionam sem rede.
// Arquivar tira a compra do que está a caminho, como na lista, mas ela continua contando no histórico.
export function buildDashboard(
  purchases: readonly PurchaseDetail[],
  rates: readonly ExchangeRate[],
  today: string,
  period: DashboardPeriod,
): Dashboard {
  const start = monthStart(today, PERIOD_MONTHS[period]);
  const phrase = periodOptions(today).find((option) => option.value === period)?.phrase ?? '';

  const open = purchases.filter((purchase) => !purchase.archivedAt && !isConcluded(purchase.status));
  const openValues = open.map((purchase) => paidInBrl(purchase, rates));
  const withoutRate = openValues.filter((value) => value === null).length;
  const pendingTaxes = open.filter((purchase) => purchase.taxMinor !== null && !purchase.taxPaidAt);
  const inTransitCaption = [
    `${plural(open.length, 'compra', 'compras')} a caminho`,
    pendingTaxes.length > 0 &&
      `${pendingTaxes.length} com taxa de ${formatMoney(sum(pendingTaxes.map((purchase) => purchase.taxMinor ?? 0)))} a pagar`,
    withoutRate > 0 && `${withoutRate} sem cotação, fora da soma`,
  ]
    .filter(Boolean)
    .join(' · ');

  const inPeriod = purchases.filter((purchase) => purchase.purchaseDate >= start && purchase.purchaseDate <= today);
  const spentMinor = sum(inPeriod.map((purchase) => paidInBrl(purchase, rates) ?? 0));
  const taxesMinor = sum(
    purchases
      .filter((purchase) => purchase.taxPaidAt && purchase.taxPaidAt >= start && purchase.taxPaidAt <= today)
      .map((purchase) => purchase.taxMinor ?? 0),
  );
  const taxShare = spentMinor > 0 ? `${((taxesMinor / spentMinor) * 100).toFixed(1).replace('.', ',')}% do gasto` : 'sem gasto no período';

  const months = [5, 4, 3, 2, 1, 0].map((monthsBack) => {
    const from = monthStart(today, monthsBack);
    const to = monthStart(today, monthsBack - 1);
    const valueMinor = sum(
      purchases
        .filter((purchase) => purchase.purchaseDate >= from && purchase.purchaseDate < to)
        .map((purchase) => paidInBrl(purchase, rates) ?? 0),
    );
    return {
      label: MONTHS[Number(from.slice(5, 7)) - 1].slice(0, 3),
      valueMinor,
      isCurrent: monthsBack === 0,
      // Reais inteiros no rótulo da barra: "R$ 735", sem os centavos.
      caption: formatMoney(Math.round(valueMinor / 100) * 100).replace(/,00$/, ''),
    };
  });

  // Nomes próprios, e não o selo em minúsculas: "No Brasil" leva maiúscula.
  const openStatuses: [PurchaseStatus, string][] = [
    ['IN_BRAZIL', 'No Brasil'],
    ['INTERNATIONAL_TRANSIT', 'Trânsito internacional'],
    ['AWAITING_POSTING', 'Aguardando postagem'],
  ];
  const concludedInPeriod = purchases.filter((purchase) => isConcluded(purchase.status) && concludedOn(purchase) >= start);
  const statuses = [
    ...openStatuses.map(([status, label]) => ({
      label,
      count: open.filter((purchase) => purchase.status === status).length,
    })),
    { label: `Entregues ${phrase}`, count: concludedInPeriod.filter((purchase) => purchase.status === 'DELIVERED').length },
    { label: `Devolvidas ${phrase}`, count: concludedInPeriod.filter((purchase) => purchase.status === 'RETURNED').length },
  ].filter((row, index) => index < 4 || row.count > 0);

  const punctuality = measurePunctuality(purchases, monthStart(today, 11));

  return {
    inTransit: { value: formatMoney(sum(openValues.map((value) => value ?? 0))), caption: inTransitCaption },
    spent: { label: `Gasto ${phrase}`, value: formatMoney(spentMinor), caption: plural(inPeriod.length, 'compra', 'compras') },
    taxes: { value: formatMoney(taxesMinor), caption: taxShare },
    months,
    statuses,
    punctuality,
    conclusion: describeSafestStore(punctuality),
  };
}

// RF-19: atraso médio da entrega em relação ao prazo prometido, por loja, nos últimos 12 meses.
// Entregar antes do prazo conta como zero, e não como atraso negativo: senão uma entrega adiantada
// esconderia um atraso de outra compra.
export function measurePunctuality(purchases: readonly PurchaseDetail[], since: string): StorePunctuality[] {
  const byStore = new Map<string, { storeName: string; delays: number[] }>();
  for (const purchase of purchases) {
    if (purchase.status !== 'DELIVERED' || concludedOn(purchase) < since) continue;
    const delay = Math.max(0, daysBetween(purchase.promisedDate, concludedOn(purchase)));
    const store = byStore.get(purchase.storeId) ?? { storeName: purchase.storeName, delays: [] };
    byStore.set(purchase.storeId, { ...store, delays: [...store.delays, delay] });
  }
  return [...byStore.entries()]
    .map(([storeId, { storeName, delays }]) => ({
      storeId,
      storeName,
      deliveries: delays.length,
      averageDelay: Math.round(sum(delays) / delays.length),
    }))
    .sort((a, b) => a.averageDelay - b.averageDelay || a.storeName.localeCompare(b.storeName));
}

// A conclusão só aparece quando há com o que comparar: duas lojas ou mais.
function describeSafestStore(punctuality: Dashboard['punctuality']): string | null {
  if (punctuality.length < 2) return null;
  const [best] = punctuality;
  const evidence =
    best.averageDelay === 0
      ? `A ${best.storeName} entregou no prazo ${best.deliveries === 1 ? 'na compra' : `nas ${best.deliveries} compras`}.`
      : `A ${best.storeName} tem o menor atraso médio, ${plural(best.averageDelay, 'dia', 'dias')}.`;
  return `${evidence} Com preço parecido, ela é a escolha mais segura.`;
}
