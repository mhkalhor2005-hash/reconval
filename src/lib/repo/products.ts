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

export async function updateProduct(
  id: number,
  input: Partial<{ name: string; type: "SAMPLE" | "GIFT"; unit_label: string }>
): Promise<boolean> {
  const db = getDb();
  const current = (await db.prepare(`SELECT * FROM products WHERE id = ?`).get(id)) as Product | undefined;
  if (!current) return false;
  const merged = { ...current, ...input };
  await db
    .prepare(`UPDATE products SET name=?, type=?, unit_label=? WHERE id=?`)
    .run(merged.name, merged.type, merged.unit_label, id);
  return true;
}

// Soft-delete: products.active already gates listProducts(), and rep_inventory /
// sample_deliveries keep referencing this row (historical visit data stays intact).
export async function deleteProduct(id: number): Promise<boolean> {
  const db = getDb();
  await db.prepare(`UPDATE products SET active = 0 WHERE id = ?`).run(id);
  return true;
}
