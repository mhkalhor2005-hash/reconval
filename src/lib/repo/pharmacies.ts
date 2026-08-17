import { getDb } from "@/lib/db";

export type Pharmacy = {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
};

// List every pharmacy along with its most recent order (date, quantity,
// which rep placed it) — the "written down for each rep" summary the
// manager asked for.
export async function listPharmacies() {
  const db = getDb();
  return db
    .prepare(
      `SELECT p.id, p.name, p.address, p.phone, p.notes,
              lo.order_date as last_order_date, lo.quantity as last_order_qty, lo.rep_name as last_order_rep
       FROM pharmacies p
       LEFT JOIN LATERAL (
         SELECT po.order_date, po.quantity, u.name as rep_name
         FROM pharmacy_orders po JOIN users u ON u.id = po.rep_id
         WHERE po.pharmacy_id = p.id
         ORDER BY po.order_date DESC, po.id DESC
         LIMIT 1
       ) lo ON true
       ORDER BY p.name`
    )
    .all();
}

export async function getPharmacy(id: number): Promise<Pharmacy | undefined> {
  const db = getDb();
  return db.prepare(`SELECT * FROM pharmacies WHERE id = ?`).get(id) as Promise<Pharmacy | undefined>;
}

export async function createPharmacy(input: { name: string; address?: string; phone?: string; notes?: string }) {
  const db = getDb();
  const res = await db
    .prepare(`INSERT INTO pharmacies (name, address, phone, notes) VALUES (?, ?, ?, ?) RETURNING id`)
    .run(input.name, input.address ?? null, input.phone ?? null, input.notes ?? null);
  return Number(res.lastInsertRowid);
}

export async function updatePharmacy(
  id: number,
  input: Partial<{ name: string; address: string; phone: string; notes: string }>
) {
  const db = getDb();
  const current = await getPharmacy(id);
  if (!current) return false;
  const merged = { ...current, ...input };
  await db
    .prepare(`UPDATE pharmacies SET name=?, address=?, phone=?, notes=? WHERE id=?`)
    .run(merged.name, merged.address, merged.phone, merged.notes, id);
  return true;
}

export async function deletePharmacy(id: number) {
  const db = getDb();
  await db.prepare(`DELETE FROM pharmacy_orders WHERE pharmacy_id = ?`).run(id);
  await db.prepare(`DELETE FROM pharmacies WHERE id = ?`).run(id);
  return { ok: true };
}

export async function listPharmacyOrders(pharmacyId: number) {
  const db = getDb();
  return db
    .prepare(
      `SELECT po.id, po.order_date, po.quantity, po.note, po.created_at, u.name as rep_name, u.id as rep_id
       FROM pharmacy_orders po JOIN users u ON u.id = po.rep_id
       WHERE po.pharmacy_id = ? ORDER BY po.order_date DESC, po.id DESC`
    )
    .all(pharmacyId);
}

export async function createPharmacyOrder(input: {
  pharmacyId: number;
  repId: number;
  orderDate: string;
  quantity: number;
  note?: string;
}) {
  const db = getDb();
  const res = await db
    .prepare(
      `INSERT INTO pharmacy_orders (pharmacy_id, rep_id, order_date, quantity, note) VALUES (?, ?, ?, ?, ?) RETURNING id`
    )
    .run(input.pharmacyId, input.repId, input.orderDate, input.quantity, input.note ?? null);
  return Number(res.lastInsertRowid);
}

export async function deletePharmacyOrder(id: number) {
  const db = getDb();
  await db.prepare(`DELETE FROM pharmacy_orders WHERE id = ?`).run(id);
  return { ok: true };
}

// Per-rep summary: for the rep's own "داروخانه‌ها" view, their most recent
// order per pharmacy (so a rep can see at a glance what/when they last
// ordered without paging through full history).
export async function pharmacyOrdersByRep(repId: number) {
  const db = getDb();
  return db
    .prepare(
      `SELECT po.pharmacy_id, p.name as pharmacy_name, po.order_date, po.quantity, po.note
       FROM pharmacy_orders po JOIN pharmacies p ON p.id = po.pharmacy_id
       WHERE po.rep_id = ?
       ORDER BY po.order_date DESC, po.id DESC`
    )
    .all(repId);
}
