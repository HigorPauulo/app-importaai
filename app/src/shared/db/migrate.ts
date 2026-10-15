import type { SQLiteDatabase } from 'expo-sqlite';

import { baseline } from './migrations/001_baseline';

// A posição na lista é a versão: a migration de índice 0 leva a base à versão 1.
export const MIGRATIONS: readonly string[] = [baseline];

type MigratableDatabase = Pick<SQLiteDatabase, 'execAsync' | 'getFirstAsync' | 'withExclusiveTransactionAsync'>;

// Roda em SQLiteProvider.onInit, antes de qualquer tela ler a base.
export async function migrateDatabase(db: MigratableDatabase): Promise<void> {
  // Valem por conexão, então são ligadas a cada abertura, não na migration.
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  for (let version = currentVersion; version < MIGRATIONS.length; version++) {
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync(MIGRATIONS[version]);
      // PRAGMA não aceita parâmetro; o valor é um inteiro do próprio código, nunca entrada do usuário.
      await txn.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}
