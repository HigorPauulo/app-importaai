import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { listAllExchangeRates, listTaxParameters } from '@/features/referencia/data/currencyRepository';
import type { ExchangeRate } from '@/features/referencia/domain/currencyConverter';
import type { TaxParameters } from '@/features/referencia/domain/taxParameters';

import { listOffers } from '../data/offerRepository';
import type { OfferListItem } from '../domain/offerList';

export type OffersState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; offers: OfferListItem[]; rates: ExchangeRate[]; taxVersions: TaxParameters[] };

// Ofertas, cotações e parâmetros fiscais do SQLite: a simulação funciona sem rede (RF-20).
export function useOffers(): { state: OffersState; reload: () => Promise<void> } {
  const db = useSQLiteContext();
  const [state, setState] = useState<OffersState>({ status: 'loading' });

  const load = useCallback(async () => {
    try {
      const [offers, rates, taxVersions] = await Promise.all([listOffers(db), listAllExchangeRates(db), listTaxParameters(db)]);
      setState({ status: 'ready', offers, rates, taxVersions });
    } catch {
      setState({ status: 'error' });
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { state, reload: load };
}
