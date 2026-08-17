import { getDb } from "@/lib/db";

export async function listRepInventory(repId: number) {
  const db = getDb();
  return db
    .prepare(
      `SELECT ri.id, ri.product_id, ri.qty_on_hand, p.name, p.type, p.unit_label
       FROM rep_inventory ri JOIN products p ON p.id = ri.product_id
       WHERE ri.rep_id = ? AND p.active = 1 ORDER BY p.type, p.name`
    )
    .all(repId);
}

export async function allocateStock(repId: number, productId: number, delta: number) {
  const db = getDb();
  const existing = await db
    .prepare(`SELECT id FROM rep_inventory WHERE rep_id = ? AND product_id = ?`)
    .get(repId, productId);
  if (existing) {
    await db.prepare(
      `UPDATE rep_inventory SET qty_on_hand = GREATEST(qty_on_hand + ?, 0) WHERE rep_id = ? AND product_id = ?`
    ).run(delta, repId, productId);
  } else {
    await db.prepare(`INSERT INTO rep_inventory (rep_id, product_id, qty_on_hand) VALUES (?, ?, ?)`).run(
      repId,
      productId,
      Math.max(delta, 0)
    );
  }
}

export async function inventorySummaryAllReps() {
  const db = getDb();
  return db
    .prepare(
      `SELECT u.id as rep_id, u.name as rep_name, p.name as product_name, p.type, ri.qty_on_hand
       FROM rep_inventory ri
       JOIN users u ON u.id = ri.rep_id
       JOIN products p ON p.id = ri.product_id
       WHERE p.active = 1 AND u.active = 1
       ORDER BY u.name, p.type, p.name`
    )
    .all();
}
