import { getDb } from "@/lib/db";

export type Product = {
  id: number;
  name: string;
  type: "SAMPLE" | "GIFT";
  unit_label: string;
  active: number;
};

export async function listProducts(): Promise<Product[]> {
  const db = getDb();
  return db.prepare(`SELECT * FROM products WHERE active = 1 ORDER BY type, name`).all() as unknown as Promise<
    Product[]
  >;
}

export async function createProduct(input: { name: string; type: "SAMPLE" | "GIFT"; unit_label?: string }) {
  const db = getDb();
  const res = await db
    .prepare(`INSERT INTO products (name, type, unit_label) VALUES (?, ?, ?) RETURNING id`)
    .run(input.name, input.type, input.unit_label ?? "عدد");
  const id = Number(res.lastInsertRowid);
  // Give every existing rep a zero-stock row so allocation UI is consistent.
  const reps = (await db.prepare(`SELECT id FROM users WHERE role = 'REP'`).all()) as { id: number }[];
  const ins = db.prepare(
    `INSERT INTO rep_inventory (rep_id, product_id, qty_on_hand) VALUES (?, ?, 0) ON CONFLICT (rep_id, product_id) DO NOTHING`
  );
  for (const r of reps) await ins.run(r.id, id);
  return id;
}
