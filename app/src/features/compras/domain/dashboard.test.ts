import type { ExchangeRate } from '@/features/referencia/domain/currencyConverter';

import { buildDashboard, periodOptions } from './dashboard';
import type { PurchaseDetail } from './purchaseDetail';

const today = '2026-10-12';
const rates: ExchangeRate[] = [{ currency: 'BRL', rateDate: '2026-01-01', source: 'API', rate: '1' }];

let sequence = 0;
function purchase(overrides: Partial<PurchaseDetail>): PurchaseDetail {
  sequence += 1;
  return {
    id: `p${sequence}`,
    productDescription: 'Produto',
    storeId: 'a',
    storeName: 'Loja A',
    trackingCode: `LP${sequence}0000000CN`,
    purchaseDate: '2026-10-02',
    promisedDate: '2026-10-28',
    amountMinor: 10000,
    shippingMinor: 0,
    currency: 'BRL',
    minorUnits: 2,
    taxMinor: null,
    taxDueDate: null,
    taxPaidAt: null,
    receivedAt: null,
    archivedAt: null,
    notes: null,
    status: 'INTERNATIONAL_TRANSIT',
    flags: [],
    lastEventAt: null,
    ...overrides,
  };
}

describe('buildDashboard (RF-18)', () => {
  it('CT-37: em trânsito soma as compras abertas em reais: 132,41 + 181,61 + 69,00', () => {
    const purchases = [
      purchase({ amountMinor: 13241, status: 'IN_BRAZIL', taxMinor: 4890 }),
      purchase({ amountMinor: 18161 }),
      purchase({ amountMinor: 6900, status: 'AWAITING_POSTING' }),
      purchase({ amountMinor: 35328, status: 'DELIVERED', lastEventAt: '2026-09-22T15:00:00Z' }),
    ];

    expect(buildDashboard(purchases, rates, today, 'MONTH').inTransit).toEqual({
      value: 'R$ 383,02',
      caption: '3 compras a caminho · 1 com taxa de R$ 48,90 a pagar',
    });
  });

  it('gasto e impostos ficam no período escolhido', () => {
    const purchases = [
      purchase({ amountMinor: 50000, purchaseDate: '2026-10-01', taxMinor: 4890, taxPaidAt: '2026-10-10' }),
      purchase({ amountMinor: 20000, purchaseDate: '2026-08-15' }),
    ];

    const month = buildDashboard(purchases, rates, today, 'MONTH');
    expect(month.spent).toEqual({ label: 'Gasto em outubro', value: 'R$ 500,00', caption: '1 compra' });
    expect(month.taxes).toEqual({ value: 'R$ 48,90', caption: '9,8% do gasto' });
    expect(buildDashboard(purchases, rates, today, 'QUARTER').spent.value).toBe('R$ 700,00');
  });

  it('compra arquivada sai do que está a caminho, como na lista de Compras', () => {
    const purchases = [purchase({ amountMinor: 10000 }), purchase({ amountMinor: 5000, archivedAt: '2026-10-10T12:00:00Z' })];

    expect(buildDashboard(purchases, rates, today, 'MONTH').inTransit).toEqual({ value: 'R$ 100,00', caption: '1 compra a caminho' });
  });

  it('compras por situação: as abertas e as entregues no período', () => {
    const { statuses } = buildDashboard(
      [purchase({ status: 'IN_BRAZIL' }), purchase({ status: 'DELIVERED', receivedAt: '2026-10-05' })],
      rates,
      today,
      'MONTH',
    );
    expect(statuses).toEqual([
      { label: 'No Brasil', count: 1 },
      { label: 'Trânsito internacional', count: 0 },
      { label: 'Aguardando postagem', count: 0 },
      { label: 'Entregues em outubro', count: 1 },
    ]);
  });

  it('gráfico tem os 6 últimos meses, o atual por último', () => {
    const { months } = buildDashboard([purchase({ amountMinor: 73530 })], rates, today, 'MONTH');
    expect(months.map((month) => month.label)).toEqual(['mai', 'jun', 'jul', 'ago', 'set', 'out']);
    expect(months[5]).toEqual({ label: 'out', valueMinor: 73530, isCurrent: true, caption: 'R$ 735' });
  });
});

describe('pontualidade (RF-19)', () => {
  const delivered = (storeName: string, promisedDate: string, receivedAt: string) =>
    purchase({ storeId: storeName, storeName, promisedDate, receivedAt, status: 'DELIVERED' });

  it('CT-39: entregas 8 e 10 dias atrasadas dão "+9 dias"; antecipada conta como zero', () => {
    const { punctuality, conclusion } = buildDashboard(
      [
        delivered('Loja B', '2026-09-01', '2026-09-09'),
        delivered('Loja B', '2026-09-01', '2026-09-11'),
        delivered('Loja A', '2026-09-10', '2026-09-05'),
        delivered('Loja A', '2026-09-10', '2026-09-10'),
      ],
      rates,
      today,
      'MONTH',
    );

    expect(punctuality).toEqual([
      { storeId: 'Loja A', storeName: 'Loja A', deliveries: 2, averageDelay: 0 },
      { storeId: 'Loja B', storeName: 'Loja B', deliveries: 2, averageDelay: 9 },
    ]);
    expect(conclusion).toBe('A Loja A entregou no prazo nas 2 compras. Com preço parecido, ela é a escolha mais segura.');
  });

  it('com uma loja só, não há conclusão', () => {
    expect(buildDashboard([delivered('Loja A', '2026-09-10', '2026-09-10')], rates, today, 'MONTH').conclusion).toBeNull();
  });
});

describe('periodOptions', () => {
  it('nomeia o mês corrente', () => {
    expect(periodOptions(today).map((option) => option.label)).toEqual(['Outubro', '3 meses', '12 meses']);
    expect(periodOptions('2027-01-05')[0].label).toBe('Janeiro');
  });
});
