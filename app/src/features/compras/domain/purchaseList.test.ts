import {
  countOnTheWay,
  describeDeadline,
  describeFlag,
  filterPurchases,
  groupPurchases,
  withoutResolvedFlags,
  type PurchaseListItem,
} from './purchaseList';

const today = '2026-10-12';

function purchase(overrides: Partial<PurchaseListItem>): PurchaseListItem {
  return {
    id: 'p',
    productDescription: 'Produto',
    storeId: 'loja-a',
    storeName: 'Loja A',
    trackingCode: 'LP00000000000CN',
    purchaseDate: '2026-09-20',
    promisedDate: '2026-10-28',
    amountMinor: 10000,
    shippingMinor: 0,
    currency: 'CNY',
    minorUnits: 2,
    taxDueDate: null,
    receivedAt: null,
    archivedAt: null,
    status: 'INTERNATIONAL_TRANSIT',
    flags: [],
    lastEventAt: null,
    ...overrides,
  };
}

// As quatro compras do protótipo (T03), em 12/10/2026.
const headphones = purchase({ id: 'fone', productDescription: 'Fone Bluetooth QCY T13', status: 'IN_BRAZIL', flags: ['TAX_PENDING'], taxDueDate: '2026-10-15' });
const keyboard = purchase({
  id: 'teclado',
  productDescription: 'Teclado mecânico Redragon K552',
  storeName: 'Loja B',
  promisedDate: '2026-10-04',
  flags: ['DELAYED', 'STALLED'],
  lastEventAt: '2026-09-26T10:00:00Z',
});
const kindleCase = purchase({ id: 'capa', productDescription: 'Capa para Kindle Paperwhite', status: 'AWAITING_POSTING', promisedDate: '2026-11-15' });
const watch = purchase({ id: 'relogio', status: 'DELIVERED', lastEventAt: '2026-09-22T15:00:00Z' });
const archived = purchase({ id: 'antiga', status: 'DELIVERED', archivedAt: '2026-10-01T00:00:00Z' });
const all = [kindleCase, watch, headphones, keyboard, archived];

describe('groupPurchases', () => {
  it('agrupa por prioridade e ordena pelo prazo mais próximo', () => {
    const sections = groupPurchases(filterPurchases(all, 'ALL', ''));

    expect(sections.map((section) => [section.title, section.purchases.map((p) => p.id)])).toEqual([
      ['Precisa de atenção', ['teclado', 'fone']],
      ['A caminho', ['capa']],
      ['Entregues recentemente', ['relogio']],
    ]);
  });
});

describe('filterPurchases', () => {
  it('CT-28: busca "teclado" com o filtro "Com atenção"', () => {
    expect(filterPurchases(all, 'ATTENTION', 'teclado').map((p) => p.id)).toEqual(['teclado']);
    expect(filterPurchases(all, 'ATTENTION', 'kindle')).toEqual([]);
  });

  it('busca por loja e código, sem acento nem maiúscula', () => {
    expect(filterPurchases(all, 'ALL', 'loja b').map((p) => p.id)).toEqual(['teclado']);
    expect(filterPurchases(all, 'ALL', 'MECANICO').map((p) => p.id)).toEqual(['teclado']);
  });

  it('CT-21: arquivada sai da lista principal e aparece em "Arquivadas"', () => {
    expect(filterPurchases(all, 'ALL', '').map((p) => p.id)).not.toContain('antiga');
    expect(filterPurchases(all, 'ARCHIVED', '').map((p) => p.id)).toEqual(['antiga']);
  });

  it('"Em trânsito" não inclui a que aguarda postagem', () => {
    expect(filterPurchases(all, 'IN_TRANSIT', '').map((p) => p.id)).toEqual(['fone', 'teclado']);
  });
});

describe('describeFlag', () => {
  it('CT-30: prazo em 04/10, hoje 12/10, "Atrasada 8 dias"', () => {
    expect(describeFlag('DELAYED', keyboard, today)).toBe('Atrasada 8 dias');
  });

  it('CT-31: último evento há 16 dias, "Parada há 16 dias"', () => {
    expect(describeFlag('STALLED', keyboard, today)).toBe('Parada há 16 dias');
  });

  it('taxa com vencimento conta os dias até ele', () => {
    expect(describeFlag('TAX_PENDING', headphones, today)).toBe('Taxa vence em 3 dias');
    expect(describeFlag('TAX_PENDING', headphones, '2026-10-14')).toBe('Taxa vence amanhã');
    expect(describeFlag('TAX_PENDING', headphones, '2026-10-15')).toBe('Taxa vence hoje');
  });
});

describe('describeDeadline e countOnTheWay', () => {
  it('mostra o prazo da aberta e a data de entrega da concluída', () => {
    expect(describeDeadline(headphones)).toBe('prometido para 28/10');
    expect(describeDeadline(watch)).toBe('entregue em 22/09');
    expect(describeDeadline({ ...watch, receivedAt: '2026-09-25' })).toBe('entregue em 25/09');
  });

  it('conta as compras abertas e não arquivadas, como no subtítulo "3 a caminho"', () => {
    expect(countOnTheWay(all)).toBe(3);
  });
});

describe('withoutResolvedFlags', () => {
  it('pagamento registrado no aparelho tira a cobrança da taxa antes da sincronização', () => {
    const paid = { ...headphones, flags: ['TAX_PENDING' as const, 'DELAYED' as const], taxPaidAt: '2026-10-12' };
    expect(withoutResolvedFlags(paid).flags).toEqual(['DELAYED']);
    expect(withoutResolvedFlags({ ...paid, taxPaidAt: null }).flags).toEqual(['TAX_PENDING', 'DELAYED']);
  });
});
