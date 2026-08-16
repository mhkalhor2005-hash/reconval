import { getDb } from "@/lib/db";

export type Product = {
  id: number;
  name: string;
  type: "SAMPLE" | "GIFT";
  unit_label: string;
  active: number;
};

export function listProducts(): Product[] {
  const db = getDb();
  return db.prepare(`SELECT * FROM products WHERE active = 1 ORDER BY type, name`).all() as unknown as Product[];
}

export function createProduct(input: { name: string; type: "SAMPLE" | "GIFT"; unit_label?: string }) {
  const db = getDb();
  const res = db
    .prepare(`INSERT INTO products (name, type, unit_label) VALUES (?, ?, ?)`)
    .run(input.name, input.type, input.unit_label ?? "عدد");
  const id = Number(res.lastInsertRowid);
  // Give every existing rep a zero-stock row so allocation UI is consistent.
  const reps = db.prepare(`SELECT id FROM users WHERE role = 'REP'`).all() as { id: number }[];
  const ins = db.prepare(
    `INSERT OR IGNORE INTO rep_inventory (rep_id, product_id, qty_on_hand) VALUES (?, ?, 0)`
  );
  for (const r of reps) ins.run(r.id, id);
  return id;
}
