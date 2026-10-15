import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { listAllExchangeRates } from '@/features/referencia/data/currencyRepository';
import type { ExchangeRate } from '@/features/referencia/domain/currencyConverter';

import { listPurchases } from '../data/purchaseRepository';
import type { PurchaseDetail } from '../domain/purchaseDetail';

export type PurchasesState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; purchases: PurchaseDetail[]; rates: ExchangeRate[] };

// Lista (T03) e painel (T06) leem as mesmas compras do SQLite, de novo a cada vez que a aba
// ganha foco: a tela nunca espera a rede.
export function usePurchases(): { state: PurchasesState; reload: () => Promise<void> } {
  const db = useSQLiteContext();
  const [state, setState] = useState<PurchasesState>({ status: 'loading' });

  const load = useCallback(async () => {
    try {
      const [purchases, rates] = await Promise.all([listPurchases(db), listAllExchangeRates(db)]);
      setState({ status: 'ready', purchases, rates });
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
