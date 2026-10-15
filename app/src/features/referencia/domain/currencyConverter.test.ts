import { convertToBrl, findRateOnDate, formatMoney, type ExchangeRate } from './currencyConverter';

const rates: ExchangeRate[] = [
  { currency: 'CNY', rateDate: '2026-10-01', source: 'API', rate: '0.7310' },
  { currency: 'CNY', rateDate: '2026-10-02', source: 'API', rate: '0.7356' },
  { currency: 'CNY', rateDate: '2026-10-12', source: 'API', rate: '0.7500' },
  { currency: 'USD', rateDate: '2026-10-02', source: 'API', rate: '5.4000' },
  { currency: 'USD', rateDate: '2026-10-02', source: 'MANUAL', rate: '5.4500' },
];

describe('convertToBrl (RN07)', () => {
  it('CT-18: 180 CNY comprados em 02/10 usam a cotação de 02/10, mesmo com cotação mais nova', () => {
    expect(convertToBrl(18000, 2, 'CNY', '2026-10-02', rates)).toMatchObject({
      kind: 'converted',
      brlMinor: 13241,
      isApproximate: false,
    });
  });

  it('sem cotação na data, usa a anterior mais próxima e marca como aproximada', () => {
    const conversion = convertToBrl(10000, 2, 'CNY', '2026-10-05', rates);
    expect(conversion).toMatchObject({ kind: 'converted', brlMinor: 7356, isApproximate: true });
  });

  it('cotação manual da data prevalece sobre a automática', () => {
    expect(findRateOnDate(rates, 'USD', '2026-10-02')?.rate).toBe('5.4500');
  });

  it('sem nenhuma cotação da moeda, não converte', () => {
    expect(convertToBrl(10000, 2, 'EUR', '2026-10-02', rates)).toEqual({ kind: 'unavailable' });
    expect(convertToBrl(10000, 2, 'CNY', '2026-09-01', rates)).toEqual({ kind: 'unavailable' });
  });

  it('respeita moeda sem centavos e arredonda meio para cima', () => {
    const yen: ExchangeRate[] = [{ currency: 'JPY', rateDate: '2026-10-02', source: 'API', rate: '0.0365' }];
    // 1.000 JPY × 0,0365 = R$ 36,50
    expect(convertToBrl(1000, 0, 'JPY', '2026-10-02', yen)).toMatchObject({ brlMinor: 3650 });
    // 1 CNY × 0,73565 = R$ 0,73565 → R$ 0,74
    const halfUp: ExchangeRate[] = [{ currency: 'CNY', rateDate: '2026-10-02', source: 'API', rate: '0.73565' }];
    expect(convertToBrl(100, 2, 'CNY', '2026-10-02', halfUp)).toMatchObject({ brlMinor: 74 });
  });
});

describe('formatMoney', () => {
  it('formata reais e moeda de origem', () => {
    expect(formatMoney(13241)).toBe('R$ 132,41');
    expect(formatMoney(123456789)).toBe('R$ 1.234.567,89');
    expect(formatMoney(5)).toBe('R$ 0,05');
    expect(formatMoney(18000, 'CNY')).toBe('180,00 CNY');
    expect(formatMoney(1000, 'JPY', 0)).toBe('1.000 JPY');
  });
});
