import { getDb } from "@/lib/db";

export type Outcome = "POSITIVE" | "NEUTRAL" | "FOLLOW_UP" | "NEGATIVE";

export const OUTCOME_LABELS: Record<Outcome, string> = {
  POSITIVE: "مثبت",
  NEUTRAL: "خنثی",
  FOLLOW_UP: "نیاز به پیگیری",
  NEGATIVE: "منفی",
};

export async function getActiveVisit(repId: number) {
  const db = getDb();
  return db
    .prepare(
      `SELECT v.*, d.name as doctor_name, d.address as doctor_address
       FROM visits v JOIN doctors d ON d.id = v.doctor_id
       WHERE v.rep_id = ? AND v.checkout_at IS NULL
       ORDER BY v.checkin_at DESC LIMIT 1`
    )
    .get(repId);
}

export async function startVisit(input: {
  doctorId: number;
  repId: number;
  lat?: number | null;
  lng?: number | null;
  clientUuid?: string;
}) {
  const db = getDb();
  const existing = await getActiveVisit(input.repId);
  if (existing) {
    throw new Error("یک ویزیت باز دارید؛ ابتدا آن را پایان دهید.");
  }
  const now = new Date().toISOString();
  const res = await db
    .prepare(
      `INSERT INTO visits (doctor_id, rep_id, checkin_at, checkin_lat, checkin_lng, client_uuid)
       VALUES (?, ?, ?, ?, ?, ?) RETURNING id`
    )
    .run(input.doctorId, input.repId, now, input.lat ?? null, input.lng ?? null, input.clientUuid ?? null);
  return Number(res.lastInsertRowid);
}

export async function endVisit(
  visitId: number,
  repId: number,
  input: { outcome: Outcome; note?: string; deliveries?: { productId: number; qty: number }[] }
) {
  const db = getDb();
  const visit = (await db.prepare(`SELECT * FROM visits WHERE id = ? AND rep_id = ?`).get(visitId, repId)) as
    | { id: number; checkout_at: string | null }
    | undefined;
  if (!visit) throw new Error("ویزیت پیدا نشد.");
  if (visit.checkout_at) throw new Error("این ویزیت قبلاً بسته شده است.");

  const now = new Date().toISOString();
  await db.prepare(`UPDATE visits SET checkout_at = ?, outcome = ?, note = ? WHERE id = ?`).run(
    now,
    input.outcome,
    input.note ?? "",
    visitId
  );

  const insDelivery = db.prepare(
    `INSERT INTO sample_deliveries (visit_id, product_id, qty) VALUES (?, ?, ?)`
  );
  const decInv = db.prepare(
    `UPDATE rep_inventory SET qty_on_hand = GREATEST(qty_on_hand - ?, 0) WHERE rep_id = ? AND product_id = ?`
  );
  for (const d of input.deliveries ?? []) {
    if (d.qty <= 0) continue;
    await insDelivery.run(visitId, d.productId, d.qty);
    await decInv.run(d.qty, repId, d.productId);
  }
  return true;
}

export async function listVisitsForRep(repId: number, limit = 50) {
  const db = getDb();
  return db
    .prepare(
      `SELECT v.*, d.name as doctor_name
       FROM visits v JOIN doctors d ON d.id = v.doctor_id
       WHERE v.rep_id = ? ORDER BY v.checkin_at DESC LIMIT ?`
    )
    .all(repId, limit);
}

export async function listAllVisits(opts: { limit?: number; sinceDays?: number } = {}) {
  const db = getDb();
  const limit = opts.limit ?? 200;
  if (opts.sinceDays) {
    const since = new Date(Date.now() - opts.sinceDays * 24 * 60 * 60 * 1000).toISOString();
    return db
      .prepare(
        `SELECT v.*, d.name as doctor_name, u.name as rep_name
         FROM visits v JOIN doctors d ON d.id = v.doctor_id JOIN users u ON u.id = v.rep_id
         WHERE v.checkin_at >= ? ORDER BY v.checkin_at DESC LIMIT ?`
      )
      .all(since, limit);
  }
  return db
    .prepare(
      `SELECT v.*, d.name as doctor_name, u.name as rep_name
       FROM visits v JOIN doctors d ON d.id = v.doctor_id JOIN users u ON u.id = v.rep_id
       ORDER BY v.checkin_at DESC LIMIT ?`
    )
    .all(limit);
}

export async function getVisit(visitId: number) {
  const db = getDb();
  return db
    .prepare(
      `SELECT v.*, d.name as doctor_name, u.name as rep_name
       FROM visits v JOIN doctors d ON d.id = v.doctor_id JOIN users u ON u.id = v.rep_id
       WHERE v.id = ?`
    )
    .get(visitId);
}

// Manager-side correction: unlike endVisit (which only the owning rep can call
// on a still-open visit), this lets a manager fix the outcome/note on any
// visit after the fact, without touching inventory or sample deliveries.
export async function updateVisitByManager(visitId: number, input: { outcome?: Outcome; note?: string }) {
  const db = getDb();
  const visit = await db.prepare(`SELECT id FROM visits WHERE id = ?`).get(visitId);
  if (!visit) throw new Error("ویزیت پیدا نشد.");
  if (input.outcome !== undefined) {
    await db.prepare(`UPDATE visits SET outcome = ? WHERE id = ?`).run(input.outcome, visitId);
  }
  if (input.note !== undefined) {
    await db.prepare(`UPDATE visits SET note = ? WHERE id = ?`).run(input.note, visitId);
  }
  return true;
}

export async function getVisitDeliveries(visitId: number) {
  const db = getDb();
  return db
    .prepare(
      `SELECT sd.*, p.name as product_name, p.unit_label
       FROM sample_deliveries sd JOIN products p ON p.id = sd.product_id
       WHERE sd.visit_id = ?`
    )
    .all(visitId);
}

// Used by the offline-sync endpoint to insert a fully-formed visit that was
// captured while the device had no connectivity. client_uuid gives us
// idempotency: replaying the same action twice is a no-op.
export async function createOfflineVisit(input: {
  doctorId: number;
  repId: number;
  checkinAt: string;
  checkoutAt: string | null;
  lat: number | null;
  lng: number | null;
  outcome: Outcome | null;
  note: string | null;
  clientUuid: string;
  deliveries?: { productId: number; qty: number }[];
}) {
  const db = getDb();
  const existing = await db.prepare(`SELECT id FROM visits WHERE client_uuid = ?`).get(input.clientUuid);
  if (existing) return { id: (existing as { id: number }).id, duplicate: true };

  const res = await db
    .prepare(
      `INSERT INTO visits (doctor_id, rep_id, checkin_at, checkout_at, checkin_lat, checkin_lng, outcome, note, client_uuid, offline_created)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1) RETURNING id`
    )
    .run(
      input.doctorId,
      input.repId,
      input.checkinAt,
      input.checkoutAt,
      input.lat,
      input.lng,
      input.outcome,
      input.note ?? "",
      input.clientUuid
    );
  const visitId = Number(res.lastInsertRowid);

  const insDelivery = db.prepare(`INSERT INTO sample_deliveries (visit_id, product_id, qty) VALUES (?, ?, ?)`);
  const decInv = db.prepare(
    `UPDATE rep_inventory SET qty_on_hand = GREATEST(qty_on_hand - ?, 0) WHERE rep_id = ? AND product_id = ?`
  );
  for (const d of input.deliveries ?? []) {
    if (d.qty <= 0) continue;
    await insDelivery.run(visitId, d.productId, d.qty);
    await decInv.run(d.qty, input.repId, d.productId);
  }
  return { id: visitId, duplicate: false };
}
