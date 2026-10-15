// fetchedAt: quando o aparelho recebeu a cotação; serve para avisar "cotação desatualizada" (RN07).
export type ExchangeRate = { currency: string; rateDate: string; source: 'API' | 'MANUAL'; rate: string; fetchedAt?: string };

export type Conversion =
  | { kind: 'converted'; brlMinor: number; rate: ExchangeRate; isApproximate: boolean }
  | { kind: 'unavailable' };

// RN07, compra: cotação da data da compra; sem ela, a anterior mais próxima, marcada como aproximada.
// Na mesma data, a manual do administrador prevalece sobre a automática.
export function findRateOnDate(rates: readonly ExchangeRate[], currency: string, date: string): ExchangeRate | null {
  const candidates = rates.filter((rate) => rate.currency === currency && rate.rateDate <= date);
  candidates.sort((a, b) => b.rateDate.localeCompare(a.rateDate) || (a.source === 'MANUAL' ? -1 : 1));
  return candidates[0] ?? null;
}

// RN07, oferta: a cotação mais recente até a data. É a mesma busca da compra; o que muda é a data
// pedida (hoje, e não a da compra).
export const findLatestRate = findRateOnDate;

// Valor em reais por aritmética inteira: a cotação vem como texto decimal ("0.7356") e
// nunca passa por ponto flutuante. Arredonda meio para cima, como a RN10.
export function convertToBrl(
  amountMinor: number,
  minorUnits: number,
  currency: string,
  date: string,
  rates: readonly ExchangeRate[],
): Conversion {
  if (currency === 'BRL') {
    return { kind: 'converted', brlMinor: amountMinor, rate: { currency, rateDate: date, source: 'API', rate: '1' }, isApproximate: false };
  }
  const rate = findRateOnDate(rates, currency, date);
  if (!rate) return { kind: 'unavailable' };

  const [integer, fraction = ''] = rate.rate.split('.');
  const rateScaled = BigInt(integer + fraction);
  const numerator = BigInt(amountMinor) * rateScaled * 100n;
  const denominator = 10n ** BigInt(minorUnits + fraction.length);
  const brlMinor = Number((numerator * 2n + denominator) / (denominator * 2n));
  return { kind: 'converted', brlMinor, rate, isApproximate: rate.rateDate !== date };
}

// "R$ 1.234,56": formatação própria, e não Intl, para o texto ser o mesmo no aparelho e no teste.
export function formatMoney(minor: number, currency = 'BRL', minorUnits = 2): string {
  const negative = minor < 0 ? '-' : '';
  const digits = Math.abs(minor).toString().padStart(minorUnits + 1, '0');
  const integer = digits.slice(0, digits.length - minorUnits).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const fraction = minorUnits > 0 ? `,${digits.slice(-minorUnits)}` : '';
  return currency === 'BRL' ? `${negative}R$ ${integer}${fraction}` : `${negative}${integer}${fraction} ${currency}`;
}
