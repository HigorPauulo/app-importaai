import type { ExchangeRate } from '@/features/referencia/domain/currencyConverter';

import type { TaxParameters } from '@/features/referencia/domain/taxParameters';

import { describeEstimateNote, groupOffers, type OfferListItem } from './offerList';

const now = new Date('2026-10-12T12:00:00');
const rates: ExchangeRate[] = [
  { currency: 'USD', rateDate: '2026-10-12', source: 'API', rate: '5.52', fetchedAt: '2026-10-12T09:00:00' },
  { currency: 'CNY', rateDate: '2026-10-12', source: 'API', rate: '0.7356', fetchedAt: '2026-10-12T09:00:00' },
];
const taxes: TaxParameters[] = [
  { validFrom: '2026-01-01', thresholdUsd: '50.00', rateUpToThreshold: '0.20', rateAboveThreshold: '0.60', deductionUsd: '20.00', icmsRate: '0.17' },
];

const offer = (overrides: Partial<OfferListItem>): OfferListItem => ({
  id: 'o',
  groupId: 'fone',
  groupName: 'Fone Bluetooth QCY T13',
  storeId: 'a',
  storeName: 'Loja A',
  priceMinor: 18000,
  shippingMinor: 0,
  currency: 'CNY',
  minorUnits: 2,
  purchaseId: null,
  ...overrides,
});

describe('groupOffers (T10)', () => {
  it('CT-12: no grupo do fone, a Loja A é a menor e a Loja B custa R$ 47,99 a mais', () => {
    const [group] = groupOffers(
      [offer({ id: 'b', storeName: 'Loja B', priceMinor: 2400, shippingMinor: 600, currency: 'USD' }), offer({ id: 'a' })],
      rates,
      taxes,
      now,
    );

    expect(group.offers.map(({ storeName, origin, total, isCheapest, difference }) => ({ storeName, origin, total, isCheapest, difference }))).toEqual([
      { storeName: 'Loja A', origin: '180,00 CNY · frete grátis', total: 'R$ 191,43', isCheapest: true, difference: null },
      { storeName: 'Loja B', origin: '24,00 USD + 6,00 USD de frete', total: 'R$ 239,42', isCheapest: false, difference: '+ R$ 47,99' },
    ]);
  });

  it('com uma oferta só, não há selo nem diferença', () => {
    const [group] = groupOffers([offer({ groupId: 'mochila', groupName: 'Mochila antifurto' })], rates, taxes, now);
    expect(group.offers[0]).toMatchObject({ isCheapest: false, difference: null });
  });
});

describe('describeEstimateNote', () => {
  it('diz de quando é a cotação e avisa quando passa de 24 h', () => {
    const groups = groupOffers([offer({})], rates, taxes, now);
    expect(describeEstimateNote(groups, now)).toEqual({ text: 'Estimativa com a cotação de hoje, 09:00', isStale: false });

    const later = new Date('2026-10-13T12:00:00');
    expect(describeEstimateNote(groupOffers([offer({})], rates, taxes, later), later)).toEqual({
      text: 'Cotação desatualizada, de 12/10, 09:00',
      isStale: true,
    });
  });
});
