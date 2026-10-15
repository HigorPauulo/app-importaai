import { DatabaseSync } from 'node:sqlite';

import { MIGRATIONS, migrateDatabase } from './migrate';

type MigratableDatabase = Parameters<typeof migrateDatabase>[0];

// SQLite real do Node no lugar do expo-sqlite, que só roda no aparelho: o SQL testado é o mesmo.
function openTestDatabase(): { sqlite: DatabaseSync; db: MigratableDatabase } {
  const sqlite = new DatabaseSync(':memory:');
  const db: MigratableDatabase = {
    execAsync: async (source: string) => {
      sqlite.exec(source);
    },
    getFirstAsync: async (source: string) => sqlite.prepare(source).get() ?? null,
    withExclusiveTransactionAsync: async (task) => {
      sqlite.exec('begin exclusive');
      try {
        // O adaptador faz o papel da transação: no teste há uma conexão só.
        await task(db as Parameters<typeof task>[0]);
        sqlite.exec('commit');
      } catch (error) {
        sqlite.exec('rollback');
        throw error;
      }
    },
  } as MigratableDatabase;
  return { sqlite, db };
}

const userVersion = (sqlite: DatabaseSync) => (sqlite.prepare('PRAGMA user_version').get() as { user_version: number }).user_version;

const now = '2026-10-12T17:30:05Z';

describe('migrateDatabase', () => {
  it('cria a base local na versão mais recente', async () => {
    const { sqlite, db } = openTestDatabase();

    await migrateDatabase(db);

    expect(userVersion(sqlite)).toBe(MIGRATIONS.length);
    const tables = sqlite.prepare("select name from sqlite_master where type = 'table'").all().map((row) => row.name as string);
    expect(tables).toEqual(expect.arrayContaining(['stores', 'purchases', 'offers', 'sync_state']));
  });

  it('não reaplica migration já aplicada ao abrir a base de novo', async () => {
    const { sqlite, db } = openTestDatabase();

    await migrateDatabase(db);
    await migrateDatabase(db);

    expect(userVersion(sqlite)).toBe(MIGRATIONS.length);
  });

  it('liga as chaves estrangeiras, que o SQLite deixa desligadas por padrão', async () => {
    const { sqlite, db } = openTestDatabase();

    await migrateDatabase(db);

    expect(() =>
      sqlite
        .prepare(
          `insert into purchases (id, store_id, product_description, tracking_code, purchase_date, promised_date,
                                  amount_minor, currency, created_at, updated_at)
           values ('p1', 'loja-inexistente', 'Fone', 'LP00123456789CN', '2026-10-02', '2026-10-28', 18000, 'CNY', ?, ?)`,
        )
        .run(now, now),
    ).toThrow(/FOREIGN KEY/);
  });

  it('recusa loja com o mesmo nome, sem diferenciar maiúsculas', async () => {
    const { sqlite, db } = openTestDatabase();
    await migrateDatabase(db);
    const insertStore = sqlite.prepare('insert into stores (id, name, created_at, updated_at) values (?, ?, ?, ?)');

    insertStore.run('s1', 'Loja A', now, now);

    expect(() => insertStore.run('s2', 'loja a', now, now)).toThrow(/UNIQUE/);
  });
});
