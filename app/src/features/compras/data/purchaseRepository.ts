import type { SQLiteDatabase } from 'expo-sqlite';

import type { ExchangeRate } from '@/features/referencia/domain/currencyConverter';

import type { PurchaseFlag, PurchaseListItem, PurchaseStatus } from '../domain/purchaseList';

type PurchaseRow = Omit<PurchaseListItem, 'flags'> & { flags: string };

// Compra ainda sem estado vindo da API (criada no aparelho, antes da sincronização) não tem
// evento: pela RN01, aguarda postagem e não tem sinalização.
const SELECT_PURCHASES = `
  select p.id, p.product_description as productDescription, p.store_id as storeId, s.name as storeName, p.tracking_code as trackingCode,
         p.purchase_date as purchaseDate, p.promised_date as promisedDate, p.amount_minor as amountMinor,
         p.shipping_minor as shippingMinor, p.currency, c.minor_units as minorUnits, p.tax_minor as taxMinor,
         p.tax_due_date as taxDueDate, p.tax_paid_at as taxPaidAt, p.received_at as receivedAt,
         p.archived_at as archivedAt, p.notes,
         coalesce(ps.status, 'AWAITING_POSTING') as status, coalesce(ps.flags, '[]') as flags,
         ps.last_event_at as lastEventAt
    from purchases p
    join stores s on s.id = p.store_id
    join currencies c on c.code = p.currency
    left join purchase_states ps on ps.purchase_id = p.id
   where p.deleted_at is null`;

export async function listPurchases(db: SQLiteDatabase): Promise<PurchaseListItem[]> {
  const rows = await db.getAllAsync<PurchaseRow>(SELECT_PURCHASES);
  return rows.map((row) => ({ ...row, status: row.status as PurchaseStatus, flags: JSON.parse(row.flags) as PurchaseFlag[] }));
}

export async function listExchangeRates(db: SQLiteDatabase): Promise<ExchangeRate[]> {
  return db.getAllAsync<ExchangeRate>(
    'select currency, rate_date as rateDate, source, rate from exchange_rates where currency in (select distinct currency from purchases)',
  );
}
