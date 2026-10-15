import type { ExchangeRate } from '@/features/referencia/domain/currencyConverter';

import { describeCosts, describePromise, describeTaxAction, type PurchaseDetail } from './purchaseDetail';

const today = '2026-10-12';
const rates: ExchangeRate[] = [{ currency: 'CNY', rateDate: '2026-10-02', source: 'API', rate: '0.7356' }];

// O fone do protótipo (T04): no Brasil, taxa de R$ 48,90 vencendo em 15/10.
const headphones: PurchaseDetail = {
  id: 'fone',
  productDescription: 'Fone Bluetooth QCY T13',
  storeId: 'loja-a',
  storeName: 'Loja A',
  trackingCode: 'LP00123456789CN',
  purchaseDate: '2026-10-02',
  promisedDate: '2026-10-28',
  amountMinor: 18000,
  shippingMinor: 0,
  currency: 'CNY',
  minorUnits: 2,
  taxMinor: 4890,
  taxDueDate: '2026-10-15',
  taxPaidAt: null,
  receivedAt: null,
  archivedAt: null,
  notes: null,
  status: 'IN_BRAZIL',
  flags: ['TAX_PENDING'],
  lastEventAt: '2026-10-12T09:14:00Z',
};

describe('describeCosts', () => {
  it('mostra origem, reais pela cotação da compra, taxa e o total que fecha com as linhas', () => {
    expect(describeCosts(headphones, rates)).toEqual({
      lines: [
        { label: 'Pago na loja', caption: undefined, value: '180,00 CNY' },
        { label: 'Em reais', caption: 'cotação de 02/10 · 1 CNY = R$ 0,7356', value: 'R$ 132,41' },
        { label: 'Taxa de importação', caption: 'pendente', value: 'R$ 48,90' },
      ],
      total: 'R$ 181,31',
    });
  });

  it('sem cotação, não inventa total', () => {
    const { lines, total } = describeCosts(headphones, []);
    expect(lines[1]).toMatchObject({ label: 'Em reais', value: 'indisponível' });
    expect(total).toBeNull();
  });

  it('cotação sem zeros à direita, com pelo menos duas casas', () => {
    const dollar: ExchangeRate[] = [{ currency: 'CNY', rateDate: '2026-10-02', source: 'API', rate: '5.3500' }];
    expect(describeCosts(headphones, dollar).lines[1].caption).toBe('cotação de 02/10 · 1 CNY = R$ 5,35');
  });

  it('taxa paga mostra a data do pagamento', () => {
    expect(describeCosts({ ...headphones, taxPaidAt: '2026-10-13' }, rates).lines[2].caption).toBe('paga em 13/10');
  });
});

describe('describeTaxAction (RN04)', () => {
  it('taxa pendente: prazo, valor, dias restantes e consequência', () => {
    expect(describeTaxAction(headphones, today)).toEqual({
      tone: 'warning',
      title: 'Pague a taxa até 15/10',
      message: 'R$ 48,90 · faltam 3 dias. Sem pagamento, a encomenda volta ao remetente.',
      action: 'REGISTER_PAYMENT',
    });
  });

  it('taxa a registrar leva a informar valor e vencimento', () => {
    const action = describeTaxAction({ ...headphones, flags: ['TAX_TO_REGISTER'], taxMinor: null, taxDueDate: null }, today);
    expect(action).toMatchObject({ title: 'Registre a taxa cobrada', action: 'REGISTER_TAX' });
  });

  it('sem sinalização de taxa, não há card', () => {
    expect(describeTaxAction({ ...headphones, flags: [] }, today)).toBeNull();
  });
});

describe('describePromise', () => {
  it('conta os dias até o prazo', () => {
    expect(describePromise(headphones, today)).toEqual({ title: 'Prazo prometido: 28/10', caption: 'Faltam 16 dias' });
  });

  it('CT-30: atrasada mostra os dias de atraso e a janela', () => {
    const delayed = { ...headphones, promisedDate: '2026-10-04', flags: ['DELAYED' as const, 'CLAIM_WINDOW_CLOSING' as const] };
    expect(describePromise(delayed, today).caption).toBe('Atrasada 8 dias · janela de reclamação fecha em breve');
  });

  it('concluída mostra a data de entrega', () => {
    expect(describePromise({ ...headphones, status: 'DELIVERED', receivedAt: '2026-10-20' }, today).caption).toBe('Entregue em 20/10');
  });
});
