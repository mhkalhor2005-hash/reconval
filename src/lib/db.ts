import { Pool, type QueryResultRow } from "pg";
import { SCHEMA_SQL } from "./schema";

// Persistent Postgres (Neon) connection pool shared across the Next.js
// server runtime. A global is used so hot-reload in dev / serverless
// re-invocations don't open a fresh pool every time.

declare global {
  // eslint-disable-next-line no-var
  var __rekanwalPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __rekanwalSchemaReady: Promise<void> | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL تنظیم نشده است. باید به دیتابیس Postgres (Neon) وصل شوید."
    );
  }
  return new Pool({
    connectionString,
    ssl: connectionString.includes("sslmode=") ? undefined : { rejectUnauthorized: false },
    max: 5,
  });
}

function getPool(): Pool {
  if (!global.__rekanwalPool) {
    global.__rekanwalPool = createPool();
  }
  return global.__rekanwalPool;
}

async function ensureSchemaOnce(): Promise<void> {
  if (!global.__rekanwalSchemaReady) {
    global.__rekanwalSchemaReady = getPool()
      .query(SCHEMA_SQL)
      .then(() => undefined);
  }
  return global.__rekanwalSchemaReady;
}

// Translates the sqlite-style "?" placeholders the repo layer already uses
// into Postgres's "$1, $2, ..." placeholders, so call sites don't need to
// change their SQL text.
function toPgPlaceholders(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

class Stmt {
  constructor(private sql: string) {}

  async get<T extends QueryResultRow = QueryResultRow>(...params: unknown[]): Promise<T | undefined> {
    const rows = await this.all<T>(...params);
    return rows[0];
  }

  async all<T extends QueryResultRow = QueryResultRow>(...params: unknown[]): Promise<T[]> {
    await ensureSchemaOnce();
    const res = await getPool().query<T>(toPgPlaceholders(this.sql), params as never[]);
    return res.rows;
  }

  // Mirrors node:sqlite's StatementSync#run() return shape closely enough
  // for the repo layer: lastInsertRowid comes from an "id" column returned
  // by an explicit "RETURNING id" on INSERT statements.
  async run(...params: unknown[]): Promise<{ lastInsertRowid: number; changes: number }> {
    await ensureSchemaOnce();
    const res = await getPool().query(toPgPlaceholders(this.sql), params as never[]);
    const id = (res.rows[0] as { id?: number } | undefined)?.id;
    return { lastInsertRowid: id ?? 0, changes: res.rowCount ?? 0 };
  }
}

export type Db = {
  prepare(sql: string): Stmt;
};

// getDb() is synchronous (matching the old node:sqlite call sites) but the
// returned statement methods are now async — every .get()/.all()/.run()
// call must be awaited.
export function getDb(): Db {
  return {
    prepare(sql: string) {
      return new Stmt(sql);
    },
  };
}
