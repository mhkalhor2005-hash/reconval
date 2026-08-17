// Shared SQL schema for the Rekanwal field-sales platform (PostgreSQL / Neon).
// Applied automatically on first DB connection by src/lib/db.ts so a fresh
// database always ends up with the right tables, even before any seed data.

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('MANAGER','REP')),
  region TEXT,
  monthly_target INTEGER NOT NULL DEFAULT 60,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (now()::text)
);

CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT,
  facility_type TEXT NOT NULL DEFAULT 'CLINIC',
  address TEXT,
  lat REAL,
  lng REAL,
  phone TEXT,
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (now()::text)
);

-- Weekly visit planning: the manager assigns doctors to a rep for a given
-- week (Saturday-start). This IS the visit system now — there is no
-- separate GPS check-in/check-out flow. A "visit" only exists as a row in
-- plan_visits, created when the manager adds a doctor to a rep's weekly plan.
CREATE TABLE IF NOT EXISTS weekly_plans (
  id SERIAL PRIMARY KEY,
  rep_id INTEGER NOT NULL REFERENCES users(id),
  week_start TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (now()::text),
  UNIQUE(rep_id, week_start)
);

CREATE TABLE IF NOT EXISTS plan_visits (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES weekly_plans(id),
  doctor_id INTEGER NOT NULL REFERENCES doctors(id),
  rep_id INTEGER NOT NULL REFERENCES users(id),
  done INTEGER NOT NULL DEFAULT 0,
  outcome TEXT,
  note TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (now()::text)
);

-- Pharmacies: a section fully separate from doctors. Each pharmacy can have
-- many orders logged over time (by whichever rep placed/recorded the
-- order); "last order" is simply the most recent row per pharmacy.
CREATE TABLE IF NOT EXISTS pharmacies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (now()::text)
);

CREATE TABLE IF NOT EXISTS pharmacy_orders (
  id SERIAL PRIMARY KEY,
  pharmacy_id INTEGER NOT NULL REFERENCES pharmacies(id),
  rep_id INTEGER NOT NULL REFERENCES users(id),
  order_date TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (now()::text)
);

CREATE INDEX IF NOT EXISTS idx_plan_visits_plan ON plan_visits(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_visits_rep ON plan_visits(rep_id);
CREATE INDEX IF NOT EXISTS idx_plan_visits_doctor ON plan_visits(doctor_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_pharmacy ON pharmacy_orders(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_rep ON pharmacy_orders(rep_id);
`;
