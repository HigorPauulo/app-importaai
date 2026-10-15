import type { ExchangeRate } from '@/features/referencia/domain/currencyConverter';
import type { TaxParameters } from '@/features/referencia/domain/taxParameters';

import { estimateCost } from './costEstimator';
import { describeComposition, describeSources, describeTaxWeight, validateOfferDraft } from './offerSimulation';

const now = new Date('2026-10-12T12:00:00');
const rates: ExchangeRate[] = [
  { currency: 'USD', rateDate: '2026-10-12', source: 'API', rate: '5.52', fetchedAt: '2026-10-12T09:00:00' },
  { currency: 'CNY', rateDate: '2026-10-12', source: 'API', rate: '0.7356', fetchedAt: '2026-10-12T09:00:00' },
];
const taxes: TaxParameters[] = [
  { validFrom: '2026-09-01', thresholdUsd: '50.00', rateUpToThreshold: '0.20', rateAboveThreshold: '0.60', deductionUsd: '20.00', icmsRate: '0.17' },
];

function estimate(priceMinor: number, currency: string) {
  const result = estimateCost(priceMinor, 0, currency, 2, rates, taxes, now);
  if (result.kind !== 'estimated') throw new Error('sem estimativa');
  return result;
}

describe('composição (T11)', () => {
  it('as parcelas do fone, com peso e alíquota, como no protótipo', () => {
    expect(describeComposition(estimate(18000, 'CNY'))).toEqual([
      expect.objectContaining({ label: 'Produto + frete', percent: 69, value: 'R$ 132,41' }),
      expect.objectContaining({ label: 'Imposto de importação · 20%', percent: 14, value: 'R$ 26,48' }),
      expect.objectContaining({ label: 'ICMS · 17%', percent: 17, value: 'R$ 32,54' }),
    ]);
  });

  it('acima do limite, mostra a alíquota maior e a dedução', () => {
    expect(describeComposition(estimate(6000, 'USD'))[1].label).toBe('Imposto de importação · 60% menos US$ 20,00');
  });

  it('conclusão sobre o peso dos impostos', () => {
    expect(describeTaxWeight(estimate(18000, 'CNY'), '180,00 CNY')).toBe(
      'Os impostos somam R$ 59,02, ou 31% do custo final. Na vitrine você via só 180,00 CNY.',
    );
  });

  it('de onde vieram a cotação e os parâmetros', () => {
    expect(describeSources(estimate(18000, 'CNY'), 'CNY', now)).toBe('1 CNY = R$ 0,7356 hoje, 09:00 · parâmetros fiscais de 01/09/2026');
  });
});

describe('validateOfferDraft (RF-04)', () => {
  const draft = { productName: '', storeId: 'a', currency: 'CNY', price: '180,00', shipping: '' };

  it('produto só é pedido para grupo novo', () => {
    expect(validateOfferDraft(draft, 2, false).values).toMatchObject({ priceMinor: 18000, shippingMinor: 0 });
    expect(validateOfferDraft(draft, 2, true).errors).toEqual({ productName: 'Diga qual é o produto.' });
  });

  it('preço zero e loja em branco são recusados no campo', () => {
    expect(validateOfferDraft({ ...draft, storeId: null, price: '0' }, 2, false).errors).toEqual({
      storeId: 'Escolha a loja.',
      price: 'Informe um preço maior que zero.',
    });
  });
});
