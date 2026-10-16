import { convertToBrl, findLatestRate, type ExchangeRate } from '@/features/referencia/domain/currencyConverter';
import { findTaxParameters, type TaxParameters } from '@/features/referencia/domain/taxParameters';
import { toIsoDate } from '@/shared/date';

export type CostEstimate =
  | {
      kind: 'estimated';
      customsMinor: number;
      importTaxMinor: number;
      icmsMinor: number;
      totalMinor: number;
      rate: ExchangeRate;
      isStaleRate: boolean;
      // Para explicar a conta: qual faixa do imposto valeu e com quais parâmetros.
      isUpToThreshold: boolean;
      parameters: TaxParameters;
    }
  | { kind: 'unavailable'; reason: 'NO_RATE' | 'NO_TAX_PARAMETERS' };

// Decimal em texto ("0.7356") como fração exata, para nenhuma conta passar por ponto flutuante.
type Fraction = { numerator: bigint; denominator: bigint };

function fraction(decimal: string): Fraction {
  const [integer, digits = ''] = decimal.split('.');
  return { numerator: BigInt(integer + digits), denominator: 10n ** BigInt(digits.length) };
}

// Arredonda para centavos, meio para cima (RN10: cada parcela é arredondada antes da soma).
function roundHalfUp(numerator: bigint, denominator: bigint): number {
  if (numerator <= 0n) return 0;
  return Number((numerator * 2n + denominator) / (denominator * 2n));
}

const STALE_AFTER_MS = 24 * 60 * 60 * 1000;

// RN10, na ordem dos passos: valor aduaneiro em reais pela cotação mais recente (RN07, oferta),
// imposto de importação pela faixa em dólar e ICMS "por dentro". O total é a soma das parcelas exibidas.
export function estimateCost(
  priceMinor: number,
  shippingMinor: number,
  currency: string,
  minorUnits: number,
  rates: readonly ExchangeRate[],
  taxVersions: readonly TaxParameters[],
  now: Date,
): CostEstimate {
  const today = toIsoDate(now);
  const conversion = convertToBrl(priceMinor + shippingMinor, minorUnits, currency, today, rates);
  const dollar = findLatestRate(rates, 'USD', today);
  if (conversion.kind === 'unavailable' || !dollar) return { kind: 'unavailable', reason: 'NO_RATE' };
  const parameters = findTaxParameters(taxVersions, today);
  if (!parameters) return { kind: 'unavailable', reason: 'NO_TAX_PARAMETERS' };

  const customsMinor = conversion.brlMinor;
  const usd = fraction(dollar.rate);
  const threshold = fraction(parameters.thresholdUsd);
  const low = fraction(parameters.rateUpToThreshold);
  const high = fraction(parameters.rateAboveThreshold);
  const deduction = fraction(parameters.deductionUsd);
  const icms = fraction(parameters.icmsRate);

  // Comparar em dólar sem dividir: valor em reais ≤ limite × cotação do dólar. No limite, faixa inferior.
  const thresholdMinor = threshold.numerator * usd.numerator * 100n;
  const thresholdDenominator = threshold.denominator * usd.denominator;
  const isUpToThreshold = BigInt(customsMinor) * thresholdDenominator <= thresholdMinor;

  const importTaxMinor = isUpToThreshold
    ? roundHalfUp(BigInt(customsMinor) * low.numerator, low.denominator)
    : roundHalfUp(
        // valor × alíquota acima − dedução (em dólar, convertida), nunca negativo
        BigInt(customsMinor) * high.numerator * deduction.denominator * usd.denominator -
          deduction.numerator * usd.numerator * 100n * high.denominator,
        high.denominator * deduction.denominator * usd.denominator,
      );

  // ICMS "por dentro": (valor + imposto) × icms ÷ (1 − icms).
  const icmsMinor = roundHalfUp(BigInt(customsMinor + importTaxMinor) * icms.numerator, icms.denominator - icms.numerator);

  const fetchedAt = conversion.rate.fetchedAt;
  return {
    kind: 'estimated',
    customsMinor,
    importTaxMinor,
    icmsMinor,
    totalMinor: customsMinor + importTaxMinor + icmsMinor,
    rate: conversion.rate,
    isStaleRate: fetchedAt !== undefined && now.getTime() - new Date(fetchedAt).getTime() > STALE_AFTER_MS,
    isUpToThreshold,
    parameters,
  };
}
