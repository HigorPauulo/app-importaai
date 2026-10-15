import type { SQLiteDatabase } from 'expo-sqlite';

import { uuidV7 } from '@/shared/db/uuid';

import type { OfferListItem } from '../domain/offerList';

// Compra excluída (exclusão lógica) solta a oferta: ela volta a poder ser convertida, e "Ver compra"
// nunca abre uma compra que não existe mais.
export async function listOffers(db: SQLiteDatabase): Promise<OfferListItem[]> {
  return db.getAllAsync<OfferListItem>(
    `select o.id, o.product_group_id as groupId, g.name as groupName, o.store_id as storeId, s.name as storeName,
            o.price_minor as priceMinor, o.shipping_minor as shippingMinor, o.currency, c.minor_units as minorUnits,
            p.id as purchaseId
       from offers o
       join product_groups g on g.id = o.product_group_id and g.deleted_at is null
       join stores s on s.id = o.store_id
       join currencies c on c.code = o.currency
       left join purchases p on p.id = o.purchase_id and p.deleted_at is null
      where o.deleted_at is null`,
  );
}

export async function getOffer(db: SQLiteDatabase, id: string): Promise<OfferListItem | null> {
  return db.getFirstAsync<OfferListItem>(
    `select o.id, o.product_group_id as groupId, g.name as groupName, o.store_id as storeId, s.name as storeName,
            o.price_minor as priceMinor, o.shipping_minor as shippingMinor, o.currency, c.minor_units as minorUnits,
            p.id as purchaseId
       from offers o
       join product_groups g on g.id = o.product_group_id
       join stores s on s.id = o.store_id
       join currencies c on c.code = o.currency
       left join purchases p on p.id = o.purchase_id and p.deleted_at is null
      where o.id = ? and o.deleted_at is null`,
    id,
  );
}

export async function getGroupName(db: SQLiteDatabase, groupId: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ name: string }>('select name from product_groups where id = ? and deleted_at is null', groupId);
  return row?.name ?? null;
}

type OfferInput = { storeId: string; currency: string; priceMinor: number; shippingMinor: number };

// Oferta nova: num grupo que já existe ou abrindo um grupo com o nome do produto (RF-04).
// Os dois registros entram juntos, pendentes de envio, numa transação só.
export async function createOffer(db: SQLiteDatabase, group: { id: string } | { name: string }, input: OfferInput): Promise<string> {
  const id = uuidV7();
  const now = new Date().toISOString();
  await db.withExclusiveTransactionAsync(async (txn) => {
    let groupId: string;
    if ('id' in group) {
      groupId = group.id;
    } else {
      groupId = uuidV7();
      await txn.runAsync(
        `insert into product_groups (id, name, sync_state, mutation_id, created_at, updated_at) values (?, ?, 'PENDING', ?, ?, ?)`,
        groupId,
        group.name,
        uuidV7(),
        now,
        now,
      );
    }
    await txn.runAsync(
      `insert into offers (id, product_group_id, store_id, price_minor, shipping_minor, currency, sync_state, mutation_id, created_at, updated_at)
       values (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?)`,
      id,
      groupId,
      input.storeId,
      input.priceMinor,
      input.shippingMinor,
      input.currency,
      uuidV7(),
      now,
      now,
    );
  });
  return id;
}

export async function updateOffer(db: SQLiteDatabase, id: string, input: OfferInput): Promise<void> {
  await db.runAsync(
    `update offers set store_id = ?, price_minor = ?, shipping_minor = ?, currency = ?,
            sync_state = 'PENDING', mutation_id = ?, updated_at = ? where id = ?`,
    input.storeId,
    input.priceMinor,
    input.shippingMinor,
    input.currency,
    uuidV7(),
    new Date().toISOString(),
    id,
  );
}

// Exclusão lógica; o grupo que fica sem nenhuma oferta sai junto, para a T10 não mostrar grupo vazio.
export async function deleteOffer(db: SQLiteDatabase, id: string, groupId: string): Promise<void> {
  const now = new Date().toISOString();
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `update offers set deleted_at = ?, sync_state = 'PENDING', mutation_id = ?, updated_at = ? where id = ?`,
      now,
      uuidV7(),
      now,
      id,
    );
    await txn.runAsync(
      `update product_groups set deleted_at = ?, sync_state = 'PENDING', mutation_id = ?, updated_at = ?
        where id = ? and not exists (select 1 from offers where product_group_id = ? and deleted_at is null)`,
      now,
      uuidV7(),
      now,
      groupId,
      groupId,
    );
  });
}
