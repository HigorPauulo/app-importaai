import type { SQLiteDatabase } from 'expo-sqlite';

import { uuidV7 } from '@/shared/db/uuid';

import type { StoreWithUsage } from '../domain/stores';

export type Store = { id: string; name: string };

export type StoreInput = { name: string; countryCode: string | null };

export class StoreNameTakenError extends Error {}

export async function listStores(db: SQLiteDatabase): Promise<Store[]> {
  return db.getAllAsync<Store>('select id, name from stores where deleted_at is null order by name collate nocase');
}

// Uso de cada loja, para a T07 mostrar e para recusar a exclusão de loja em uso (RF-12).
export async function listStoresWithUsage(db: SQLiteDatabase): Promise<StoreWithUsage[]> {
  return db.getAllAsync<StoreWithUsage>(
    `select s.id, s.name, s.country_code as countryCode,
            (select count(*) from purchases p where p.store_id = s.id and p.deleted_at is null) as purchases,
            (select count(*) from offers o where o.store_id = s.id and o.deleted_at is null) as offers
       from stores s
      where s.deleted_at is null
      order by s.name collate nocase`,
  );
}

// Nome único sem diferenciar maiúsculas (RF-12): quem garante é o índice ux_stores_name do SQLite.
async function saveStore(write: () => Promise<unknown>): Promise<void> {
  try {
    await write();
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE')) throw new StoreNameTakenError();
    throw error;
  }
}

export async function createStore(db: SQLiteDatabase, input: StoreInput): Promise<Store> {
  const id = uuidV7();
  const now = new Date().toISOString();
  await saveStore(() =>
    db.runAsync(
      `insert into stores (id, name, country_code, sync_state, mutation_id, created_at, updated_at)
       values (?, ?, ?, 'PENDING', ?, ?, ?)`,
      id,
      input.name.trim(),
      input.countryCode,
      uuidV7(),
      now,
      now,
    ),
  );
  return { id, name: input.name.trim() };
}

export async function updateStore(db: SQLiteDatabase, id: string, input: StoreInput): Promise<void> {
  await saveStore(() =>
    db.runAsync(
      `update stores set name = ?, country_code = ?, sync_state = 'PENDING', mutation_id = ?, updated_at = ? where id = ?`,
      input.name.trim(),
      input.countryCode,
      uuidV7(),
      new Date().toISOString(),
      id,
    ),
  );
}

// Exclusão lógica, como a da compra; quem chama já conferiu que a loja não está em uso.
export async function deleteStore(db: SQLiteDatabase, id: string): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    `update stores set deleted_at = ?, sync_state = 'PENDING', mutation_id = ?, updated_at = ? where id = ?`,
    now,
    uuidV7(),
    now,
    id,
  );
}
