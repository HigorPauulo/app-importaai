import { parseMoney } from '@/shared/money';

import { maskDateInput, parseDateInput, validatePurchaseDraft, type PurchaseDraft } from './purchaseForm';

const today = '2026-10-12';

const draft: PurchaseDraft = {
  productDescription: 'Fone Bluetooth QCY T13',
  storeId: 'loja-a',
  trackingCode: 'lp 00123456789cn',
  currency: 'CNY',
  amount: '180,00',
  shipping: '',
  purchaseDate: '02/10/2026',
  promisedDate: '28/10/2026',
  hasTax: false,
  taxAmount: '',
  taxDueDate: '',
};

describe('validatePurchaseDraft (RF-08)', () => {
  it('CT-14: compra válida vira valores normalizados', () => {
    expect(validatePurchaseDraft(draft, 2, today)).toEqual({
      errors: {},
      values: {
        productDescription: 'Fone Bluetooth QCY T13',
        storeId: 'loja-a',
        trackingCode: 'LP00123456789CN',
        currency: 'CNY',
        amountMinor: 18000,
        shippingMinor: 0,
        purchaseDate: '2026-10-02',
        promisedDate: '2026-10-28',
        taxMinor: null,
        taxDueDate: null,
      },
    });
  });

  it('CT-16: data futura, prazo antes da compra e valor 0 dão três erros, cada um no seu campo', () => {
    const result = validatePurchaseDraft({ ...draft, purchaseDate: '20/10/2026', promisedDate: '15/10/2026', amount: '0' }, 2, today);

    expect(result.values).toBeNull();
    expect(result.errors).toEqual({
      purchaseDate: 'A compra não pode ser no futuro.',
      promisedDate: 'O prazo não pode ser antes da compra.',
      amount: 'Informe um valor maior que zero.',
    });
  });

  it('recusa código de rastreio fora do formato', () => {
    expect(validatePurchaseDraft({ ...draft, trackingCode: 'LP-1' }, 2, today).errors.trackingCode).toBeDefined();
  });

  it('taxa aberta exige valor; vencimento é opcional', () => {
    expect(validatePurchaseDraft({ ...draft, hasTax: true }, 2, today).errors).toEqual({ taxAmount: 'Informe o valor da taxa.' });
    expect(validatePurchaseDraft({ ...draft, hasTax: true, taxAmount: '48,90', taxDueDate: '15/10/2026' }, 2, today).values).toMatchObject({
      taxMinor: 4890,
      taxDueDate: '2026-10-15',
    });
  });
});

describe('parseMoney', () => {
  it.each([
    ['180,00', 2, 18000],
    ['1.234,5', 2, 123450],
    ['180', 2, 18000],
    ['1000', 0, 1000],
    ['1.5', 2, 150],
    ['180.00', 2, 18000],
    ['1.234', 2, 123400],
    ['1,234', 2, null],
    ['abc', 2, null],
    ['', 2, null],
  ])('"%s" com %i casas vale %p', (text, minorUnits, expected) => {
    expect(parseMoney(text, minorUnits)).toBe(expected);
  });
});

describe('datas', () => {
  it('aplica a máscara enquanto digita', () => {
    expect(maskDateInput('0210')).toBe('02/10');
    expect(maskDateInput('02102026')).toBe('02/10/2026');
  });

  it('recusa data que não existe', () => {
    expect(parseDateInput('31/02/2026')).toBeNull();
    expect(parseDateInput('29/02/2028')).toBe('2028-02-29');
  });
});
