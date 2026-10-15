import type { ExchangeRate } from '@/features/referencia/domain/currencyConverter';
import type { TaxParameters } from '@/features/referencia/domain/taxParameters';

import { compareOffers } from './offerComparison';
import { groupOffers, type OfferListItem } from './offerList';

const now = new Date('2026-10-12T12:00:00');
const rates: ExchangeRate[] = [
  { currency: 'USD', rateDate: '2026-10-12', source: 'API', rate: '5.52', fetchedAt: '2026-10-12T09:00:00' },
  { currency: 'CNY', rateDate: '2026-10-12', source: 'API', rate: '0.7356', fetchedAt: '2026-10-12T09:00:00' },
];
const taxes: TaxParameters[] = [
  { validFrom: '2026-01-01', thresholdUsd: '50.00', rateUpToThreshold: '0.20', rateAboveThreshold: '0.60', deductionUsd: '20.00', icmsRate: '0.17' },
];
const base = { groupId: 'fone', groupName: 'Fone Bluetooth QCY T13', minorUnits: 2, purchaseId: null };
const offers: OfferListItem[] = [
  { ...base, id: 'a', storeId: 'a', storeName: 'Loja A', priceMinor: 18000, shippingMinor: 0, currency: 'CNY' },
  { ...base, id: 'b', storeId: 'b', storeName: 'Loja B', priceMinor: 2400, shippingMinor: 600, currency: 'USD' },
];

describe('compareOffers (RF-06)', () => {
  const [group] = groupOffers(offers, rates, taxes, now);
  const comparison = compareOffers(group);

  it('CT-12: veredito com a diferença e o motivo', () => {
    expect(comparison?.title).toBe('Loja A sai R$ 47,99 mais barato');
    expect(comparison?.explanation).toBe(
      '20% a menos que a Loja B. O produto custa quase o mesmo: a diferença vem do frete, que também é tributado.',
    );
  });

  it('tabela lado a lado, como no protótipo', () => {
    expect(comparison?.rows).toEqual([
      { label: 'Preço na loja', values: ['180,00 CNY', '24,00 USD'] },
      { label: 'Produto em reais', values: ['R$ 132,41', 'R$ 132,48'] },
      { label: 'Frete', values: ['grátis', 'R$ 33,12'] },
      { label: 'Imposto de importação', values: ['R$ 26,48', 'R$ 33,12'] },
      { label: 'ICMS', values: ['R$ 32,54', 'R$ 40,70'] },
      { label: 'Custo final', values: ['R$ 191,43', 'R$ 239,42'], isTotal: true },
    ]);
  });

  it('CT-12: frete (+R$ 33,12) é a maior parcela da diferença, e as parcelas fecham com ela', () => {
    expect(comparison?.differenceTitle).toBe('De onde vêm os R$ 47,99');
    expect(comparison?.differences.map(({ label, value }) => [label, value])).toEqual([
      ['Frete', '+ R$ 33,12'],
      ['ICMS', '+ R$ 8,16'],
      ['Imposto de importação', '+ R$ 6,64'],
      ['Preço do produto', '+ R$ 0,07'],
    ]);
    expect(comparison?.differences.reduce((total, item) => total + item.amount, 0)).toBe(4799);
  });

  it('com uma oferta estimável só, não há comparação', () => {
    const [single] = groupOffers([offers[0]], rates, taxes, now);
    expect(compareOffers(single)).toBeNull();
  });
});
