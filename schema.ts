// Shared SQL schema for the Rekanwal field-sales platform.
// Used both by the Next.js runtime (src/lib/db.ts) and the standalone seed script (scripts/seed.ts).

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('MANAGER','REP')),
  region TEXT,
  monthly_target INTEGER NOT NULL DEFAULT 60,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS doctors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  specialty TEXT,
  facility_type TEXT NOT NULL DEFAULT 'CLINIC',
  address TEXT,
  lat REAL,
  lng REAL,
  phone TEXT,
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('SAMPLE','GIFT')),
  unit_label TEXT NOT NULL DEFAULT 'عدد',
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS rep_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rep_id INTEGER NOT NULL REFERENCES users(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  qty_on_hand INTEGER NOT NULL DEFAULT 0,
  UNIQUE(rep_id, product_id)
);

CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id),
  rep_id INTEGER NOT NULL REFERENCES users(id),
  checkin_at TEXT NOT NULL,
  checkout_at TEXT,
  checkin_lat REAL,
  checkin_lng REAL,
  outcome TEXT,
  note TEXT,
  client_uuid TEXT UNIQUE,
  offline_created INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sample_deliveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visit_id INTEGER NOT NULL REFERENCES visits(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  qty INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_visits_rep ON visits(rep_id);
CREATE INDEX IF NOT EXISTS idx_visits_doctor ON visits(doctor_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_visit ON sample_deliveries(visit_id);
`;

export function ensureSchema(db: { exec: (sql: string) => void }) {
  db.exec(SCHEMA_SQL);
}
