export type TaxParameters = {
  validFrom: string;
  thresholdUsd: string;
  rateUpToThreshold: string;
  rateAboveThreshold: string;
  deductionUsd: string;
  icmsRate: string;
};

// Parâmetros fiscais vigentes na data: a versão mais recente com vigência até ela (RN10).
export function findTaxParameters(versions: readonly TaxParameters[], date: string): TaxParameters | null {
  return [...versions].filter((version) => version.validFrom <= date).sort((a, b) => b.validFrom.localeCompare(a.validFrom))[0] ?? null;
}
