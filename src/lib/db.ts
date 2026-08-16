import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { ensureSchema } from "./schema";

// Singleton sqlite connection shared across the Next.js server runtime.
// A global is used so hot-reload in dev doesn't open multiple handles.

declare global {
  // eslint-disable-next-line no-var
  var __rekanwalDb: DatabaseSync | undefined;
}

function openDb(): DatabaseSync {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const dbPath = path.join(dataDir, "app.db");
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  ensureSchema(db);
  return db;
}

export function getDb(): DatabaseSync {
  if (!global.__rekanwalDb) {
    global.__rekanwalDb = openDb();
  }
  return global.__rekanwalDb;
}
