export type StoreWithUsage = {
  id: string;
  name: string;
  countryCode: string | null;
  purchases: number;
  offers: number;
};

// Países mais comuns nas compras internacionais; a loja pode ficar sem país.
export const COUNTRIES: readonly { value: string; label: string }[] = [
  { value: 'CN', label: 'China' },
  { value: 'HK', label: 'Hong Kong' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'JP', label: 'Japão' },
  { value: 'KR', label: 'Coreia do Sul' },
  { value: 'GB', label: 'Reino Unido' },
  { value: 'DE', label: 'Alemanha' },
];

const countryName = (code: string | null) => COUNTRIES.find((country) => country.value === code)?.label ?? code;

const plural = (count: number, singular: string, pluralForm: string) => `${count} ${count === 1 ? singular : pluralForm}`;

// "China · 3 compras · 2 ofertas": o que está em zero não aparece.
export function describeStoreUsage(store: StoreWithUsage): string {
  return [
    countryName(store.countryCode),
    store.purchases > 0 && plural(store.purchases, 'compra', 'compras'),
    store.offers > 0 && plural(store.offers, 'oferta', 'ofertas'),
  ]
    .filter(Boolean)
    .join(' · ') || 'Sem compras nem ofertas';
}

// RF-12: loja usada por oferta ou compra não pode ser excluída. A mensagem diz quantas e o que fazer (CT-24).
export function describeDeleteBlock(store: StoreWithUsage): string | null {
  if (store.purchases === 0 && store.offers === 0) return null;
  const usage = [store.purchases > 0 && plural(store.purchases, 'compra', 'compras'), store.offers > 0 && plural(store.offers, 'oferta', 'ofertas')]
    .filter(Boolean)
    .join(' e ');
  const verb = store.purchases + store.offers === 1 ? 'usa' : 'usam';
  const pronoun = store.purchases + store.offers === 1 ? 'dela' : 'delas';
  return `${usage} ${verb} a ${store.name}. Troque a loja ${pronoun} ou exclua-as antes.`.replace(/^./, (first) => first.toUpperCase());
}

// Letra do monograma: a inicial da última palavra, que é a que distingue ("Loja A" vira "A").
export function storeMonogram(name: string): string {
  const words = name.trim().split(/\s+/);
  return (words[words.length - 1] ?? '').charAt(0).toUpperCase();
}
