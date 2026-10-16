import type { SQLiteDatabase } from 'expo-sqlite';

import type { ExchangeRate } from '../domain/currencyConverter';
import type { TaxParameters } from '../domain/taxParameters';

export type Currency = { code: string; name: string; minorUnits: number };

export async function listActiveCurrencies(db: SQLiteDatabase): Promise<Currency[]> {
  return db.getAllAsync<Currency>('select code, name, minor_units as minorUnits from currencies where is_active = 1 order by code');
}

export async function listAllExchangeRates(db: SQLiteDatabase): Promise<ExchangeRate[]> {
  return db.getAllAsync<ExchangeRate>(
    'select currency, rate_date as rateDate, source, rate, fetched_at as fetchedAt from exchange_rates',
  );
}

// Todas as versões: a estimativa escolhe a vigente na data (RN10).
export async function listTaxParameters(db: SQLiteDatabase): Promise<TaxParameters[]> {
  return db.getAllAsync<TaxParameters>(
    `select valid_from as validFrom, threshold_usd as thresholdUsd, rate_up_to_threshold as rateUpToThreshold,
            rate_above_threshold as rateAboveThreshold, deduction_usd as deductionUsd, icms_rate as icmsRate
       from tax_parameters`,
  );
}
