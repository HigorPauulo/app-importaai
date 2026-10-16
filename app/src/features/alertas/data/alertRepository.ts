import type { SQLiteDatabase } from 'expo-sqlite';

import type { AlertItem } from '../domain/alerts';

// Junta o alerta à compra para o título e a ação; left join porque a compra pode ter sido excluída.
export async function listAlerts(db: SQLiteDatabase): Promise<AlertItem[]> {
  return db.getAllAsync<AlertItem>(
    `select n.id, n.purchase_id as purchaseId, n.reason, n.message, n.created_at as createdAt, n.read_at as readAt,
            p.product_description as productDescription, p.tax_minor as taxMinor, p.tax_due_date as taxDueDate,
            p.tax_paid_at as taxPaidAt, ps.last_event_at as lastEventAt
       from notifications n
       left join purchases p on p.id = n.purchase_id and p.deleted_at is null
       left join purchase_states ps on ps.purchase_id = n.purchase_id
      order by n.created_at desc`,
  );
}

export async function countUnreadAlerts(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ unread: number }>('select count(*) as unread from notifications where read_at is null');
  return row?.unread ?? 0;
}

// Leitura feita no aparelho: read_pending leva o id no próximo envio (readNotifications),
// e o retrato do pull não a desfaz (sincronizacao.md, "Aplicação no aparelho").
export async function markAlertRead(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync(
    'update notifications set read_at = ?, read_pending = 1 where id = ? and read_at is null',
    new Date().toISOString(),
    id,
  );
}

export async function markAllAlertsRead(db: SQLiteDatabase): Promise<void> {
  await db.runAsync('update notifications set read_at = ?, read_pending = 1 where read_at is null', new Date().toISOString());
}
