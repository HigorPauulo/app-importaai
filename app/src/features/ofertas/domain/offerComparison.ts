import { convertToBrl, formatMoney } from '@/features/referencia/domain/currencyConverter';

import type { OfferGroup, OfferView } from './offerList';

type Part = 'PRODUCT' | 'SHIPPING' | 'IMPORT_TAX' | 'ICMS';

export type ComparedOffer = {
  offer: OfferView;
  shownPrice: string;
  product: number;
  shipping: number;
  importTax: number;
  icms: number;
  total: number;
};

export type Comparison = {
  title: string;
  explanation: string;
  columns: ComparedOffer[];
  rows: { label: string; values: string[]; isTotal?: boolean }[];
  differenceTitle: string;
  differences: { label: string; value: string; amount: number }[];
  cheapest: OfferView;
};

const PART_LABELS: Record<Part, string> = {
  SHIPPING: 'Frete',
  ICMS: 'ICMS',
  IMPORT_TAX: 'Imposto de importação',
  PRODUCT: 'Preço do produto',
};

// Separa produto e frete em reais. O frete é o que falta até o valor aduaneiro, para as linhas
// somarem exatamente o custo final (RN10: o total é a soma das parcelas exibidas).
function toCompared(offer: OfferView): ComparedOffer | null {
  if (offer.estimate.kind !== 'estimated') return null;
  const { customsMinor, importTaxMinor, icmsMinor, totalMinor, rate } = offer.estimate;
  const product = convertToBrl(offer.priceMinor, offer.minorUnits, offer.currency, rate.rateDate, [rate]);
  const productMinor = product.kind === 'converted' ? product.brlMinor : customsMinor;
  return {
    offer,
    shownPrice: formatMoney(offer.priceMinor, offer.currency, offer.minorUnits),
    product: productMinor,
    shipping: customsMinor - productMinor,
    importTax: importTaxMinor,
    icms: icmsMinor,
    total: totalMinor,
  };
}

const signed = (amount: number) => `${amount < 0 ? '−' : '+'} ${formatMoney(Math.abs(amount))}`;

// Por que a mais barata ganha, dito pela parcela que mais pesou na diferença.
function explain(best: ComparedOffer, runnerUp: ComparedOffer, mainPart: Part): string {
  const productGap = Math.abs(runnerUp.product - best.product);
  switch (mainPart) {
    case 'SHIPPING':
      return productGap * 20 <= best.product
        ? 'O produto custa quase o mesmo: a diferença vem do frete, que também é tributado.'
        : 'A maior parte da diferença vem do frete, que também é tributado.';
    case 'PRODUCT':
      return 'A maior parte da diferença vem do preço do produto.';
    case 'IMPORT_TAX':
      return 'A maior parte da diferença vem do imposto de importação, que muda de faixa acima de US$ 50.';
    case 'ICMS':
      return 'A maior parte da diferença vem do ICMS, calculado sobre o valor com o imposto.';
  }
}

// T12 (RF-06): veredito primeiro, tabela lado a lado e a diferença parcela por parcela entre a mais
// barata e a segunda. Ofertas sem estimativa ficam fora, porque não há com o que comparar.
export function compareOffers(group: OfferGroup): Comparison | null {
  const columns = group.offers.map(toCompared).filter((item): item is ComparedOffer => item !== null);
  if (columns.length < 2) return null;
  columns.sort((a, b) => a.total - b.total);
  const [best, runnerUp] = columns;
  const gap = runnerUp.total - best.total;

  const parts: { part: Part; amount: number }[] = [
    { part: 'SHIPPING' as const, amount: runnerUp.shipping - best.shipping },
    { part: 'ICMS' as const, amount: runnerUp.icms - best.icms },
    { part: 'IMPORT_TAX' as const, amount: runnerUp.importTax - best.importTax },
    { part: 'PRODUCT' as const, amount: runnerUp.product - best.product },
  ].sort((a, b) => b.amount - a.amount);

  const name = best.offer.storeName;
  const percent = Math.round((gap / runnerUp.total) * 100);
  const title = gap === 0 ? 'As ofertas custam o mesmo' : `${name} sai ${formatMoney(gap)} mais barato`;
  const explanation =
    gap === 0
      ? 'Com o mesmo custo final, vale a loja que entrega no prazo.'
      : `${percent}% a menos que a ${runnerUp.offer.storeName}. ${explain(best, runnerUp, parts[0].part)}`;

  const money = (pick: (item: ComparedOffer) => number) => columns.map((item) => formatMoney(pick(item)));
  return {
    title,
    explanation,
    columns,
    rows: [
      { label: 'Preço na loja', values: columns.map((item) => item.shownPrice) },
      { label: 'Produto em reais', values: money((item) => item.product) },
      { label: 'Frete', values: columns.map((item) => (item.shipping === 0 ? 'grátis' : formatMoney(item.shipping))) },
      { label: 'Imposto de importação', values: money((item) => item.importTax) },
      { label: 'ICMS', values: money((item) => item.icms) },
      { label: 'Custo final', values: money((item) => item.total), isTotal: true },
    ],
    differenceTitle: `De onde vêm os ${formatMoney(gap)}`,
    differences: parts.map(({ part, amount }) => ({ label: PART_LABELS[part], value: signed(amount), amount })),
    cheapest: best.offer,
  };
}
