import { describeDeleteBlock, describeStoreUsage, storeMonogram, type StoreWithUsage } from './stores';

const storeB: StoreWithUsage = { id: 'b', name: 'Loja B', countryCode: 'CN', purchases: 2, offers: 1 };

describe('describeStoreUsage', () => {
  it('país e o que usa a loja, sem o que está em zero', () => {
    expect(describeStoreUsage(storeB)).toBe('China · 2 compras · 1 oferta');
    expect(describeStoreUsage({ ...storeB, countryCode: 'HK', purchases: 1, offers: 0 })).toBe('Hong Kong · 1 compra');
    expect(describeStoreUsage({ ...storeB, countryCode: null, purchases: 0, offers: 0 })).toBe('Sem compras nem ofertas');
  });
});

describe('describeDeleteBlock (RF-12)', () => {
  it('CT-24: loja com 2 compras e 1 oferta é recusada, informando as quantidades', () => {
    expect(describeDeleteBlock(storeB)).toBe('2 compras e 1 oferta usam a Loja B. Troque a loja delas ou exclua-as antes.');
  });

  it('loja sem uso pode ser excluída', () => {
    expect(describeDeleteBlock({ ...storeB, purchases: 0, offers: 0 })).toBeNull();
  });
});

describe('storeMonogram', () => {
  it('usa a inicial da palavra que distingue a loja', () => {
    expect(storeMonogram('Loja A')).toBe('A');
    expect(storeMonogram('shein')).toBe('S');
  });
});
