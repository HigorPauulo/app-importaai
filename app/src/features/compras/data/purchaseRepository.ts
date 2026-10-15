import type { SQLiteDatabase } from 'expo-sqlite';

import type { ExchangeRate } from '@/features/referencia/domain/currencyConverter';
import { uuidV7 } from '@/shared/db/uuid';

import type { PurchaseDetail, TrackingEvent } from '../domain/purchaseDetail';
import { withoutResolvedFlags, type PurchaseFlag, type PurchaseStatus } from '../domain/purchaseList';

type PurchaseRow = Omit<PurchaseDetail, 'flags'> & { flags: string };

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

const toPurchase = (row: PurchaseRow): PurchaseDetail =>
  withoutResolvedFlags({ ...row, status: row.status as PurchaseStatus, flags: JSON.parse(row.flags) as PurchaseFlag[] });

// Inclui arquivadas: a lista as separa no filtro e o painel conta todas no histórico.
export async function listPurchases(db: SQLiteDatabase): Promise<PurchaseDetail[]> {
  const rows = await db.getAllAsync<PurchaseRow>(SELECT_PURCHASES);
  return rows.map(toPurchase);
}

export async function getPurchase(db: SQLiteDatabase, id: string): Promise<PurchaseDetail | null> {
  const row = await db.getFirstAsync<PurchaseRow>(`${SELECT_PURCHASES} and p.id = ?`, id);
  return row && toPurchase(row);
}

// Linha do tempo da T04, do evento mais recente para o mais antigo.
export async function listTrackingEvents(db: SQLiteDatabase, purchaseId: string): Promise<TrackingEvent[]> {
  return db.getAllAsync<TrackingEvent>(
    `select id, occurred_at as occurredAt, description, location
       from tracking_events where purchase_id = ? order by occurred_at desc, id desc`,
    purchaseId,
  );
}

export async function listExchangeRates(db: SQLiteDatabase): Promise<ExchangeRate[]> {
  return db.getAllAsync<ExchangeRate>(
    'select currency, rate_date as rateDate, source, rate from exchange_rates where currency in (select distinct currency from purchases)',
  );
}

type PurchaseChange = {
  archived_at?: string | null;
  deleted_at?: string;
  tax_paid_at?: string;
  received_at?: string;
};

// Toda alteração local entra na fila de envio: a própria linha, PENDING e com mutation_id novo
// (sincronizacao.md, "Várias edições offline, um envio"). As colunas vêm deste arquivo, nunca da tela;
// os valores vão sempre como parâmetro.
async function changePurchase(db: SQLiteDatabase, id: string, change: PurchaseChange): Promise<void> {
  const columns = Object.keys(change) as (keyof PurchaseChange)[];
  const assignments = columns.map((column) => `${column} = ?`).join(', ');
  await db.runAsync(
    `update purchases set ${assignments}, sync_state = 'PENDING', mutation_id = ?, updated_at = ? where id = ?`,
    ...columns.map((column) => change[column] ?? null),
    uuidV7(),
    new Date().toISOString(),
    id,
  );
}

export const archivePurchase = (db: SQLiteDatabase, id: string) => changePurchase(db, id, { archived_at: new Date().toISOString() });

export const unarchivePurchase = (db: SQLiteDatabase, id: string) => changePurchase(db, id, { archived_at: null });

// Exclusão lógica: a marca precisa chegar aos outros aparelhos antes de a linha sumir.
export const deletePurchase = (db: SQLiteDatabase, id: string) => changePurchase(db, id, { deleted_at: new Date().toISOString() });

export const registerTaxPayment = (db: SQLiteDatabase, id: string, paidOn: string) => changePurchase(db, id, { tax_paid_at: paidOn });

export const confirmReceipt = (db: SQLiteDatabase, id: string, receivedOn: string) => changePurchase(db, id, { received_at: receivedOn });

