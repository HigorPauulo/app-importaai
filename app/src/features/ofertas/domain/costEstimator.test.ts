import type { ExchangeRate } from '@/features/referencia/domain/currencyConverter';

import { findTaxParameters, type TaxParameters } from '@/features/referencia/domain/taxParameters';

import { estimateCost } from './costEstimator';

// Dados de referência do plano de testes: hoje 12/10/2026, US$ 1 = R$ 5,52, 1 CNY = R$ 0,7356.
const now = new Date('2026-10-12T12:00:00');
const fetchedAt = '2026-10-12T09:00:00';
const rates: ExchangeRate[] = [
  { currency: 'USD', rateDate: '2026-10-12', source: 'API', rate: '5.52', fetchedAt },
  { currency: 'CNY', rateDate: '2026-10-12', source: 'API', rate: '0.7356', fetchedAt },
];
const parameters: TaxParameters = {
  validFrom: '2026-01-01',
  thresholdUsd: '50.00',
  rateUpToThreshold: '0.20',
  rateAboveThreshold: '0.60',
  deductionUsd: '20.00',
  icmsRate: '0.17',
};

describe('estimateCost (RN10)', () => {
  it('CT-09: 180 CNY sem frete dá 132,41 + 26,48 + 32,54 = R$ 191,43', () => {
    expect(estimateCost(18000, 0, 'CNY', 2, rates, [parameters], now)).toMatchObject({
      kind: 'estimated',
      customsMinor: 13241,
      importTaxMinor: 2648,
      icmsMinor: 3254,
      totalMinor: 19143,
      isStaleRate: false,
    });
  });

  it('CT-12: Loja B, US$ 24 + US$ 6 de frete, dá R$ 239,42', () => {
    expect(estimateCost(2400, 600, 'USD', 2, rates, [parameters], now)).toMatchObject({
      customsMinor: 16560,
      importTaxMinor: 3312,
      totalMinor: 23942,
    });
  });

  it('CT-11: US$ 50,00 fica na faixa de 20%; US$ 60,00 paga 60% menos a dedução', () => {
    // 50 × 5,52 = 276,00; 20% = 55,20
    expect(estimateCost(5000, 0, 'USD', 2, rates, [parameters], now)).toMatchObject({ importTaxMinor: 5520 });
    // 60 × 5,52 = 331,20; 60% = 198,72 menos US$ 20 (110,40) = 88,32
    expect(estimateCost(6000, 0, 'USD', 2, rates, [parameters], now)).toMatchObject({ importTaxMinor: 8832 });
  });

  it('CT-10: cotação recebida há 30 horas é usada, sinalizada como desatualizada', () => {
    const old = rates.map((rate) => ({ ...rate, fetchedAt: '2026-10-11T06:00:00' }));
    expect(estimateCost(18000, 0, 'CNY', 2, old, [parameters], now)).toMatchObject({ totalMinor: 19143, isStaleRate: true });
  });

  it('sem cotação ou sem parâmetros fiscais, não estima', () => {
    expect(estimateCost(18000, 0, 'EUR', 2, rates, [parameters], now)).toEqual({ kind: 'unavailable', reason: 'NO_RATE' });
    expect(estimateCost(18000, 0, 'CNY', 2, rates, [], now)).toEqual({ kind: 'unavailable', reason: 'NO_TAX_PARAMETERS' });
  });
});

describe('findTaxParameters', () => {
  it('CT-46: nova versão não vale para data anterior à vigência', () => {
    const next = { ...parameters, validFrom: '2026-11-01', rateUpToThreshold: '0.25' };
    expect(findTaxParameters([parameters, next], '2026-10-12')).toBe(parameters);
    expect(findTaxParameters([parameters, next], '2026-11-01')).toBe(next);
  });
});
