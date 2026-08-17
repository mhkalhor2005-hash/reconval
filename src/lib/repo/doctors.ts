import { getDb } from "@/lib/db";

export type Doctor = {
  id: number;
  name: string;
  specialty: string | null;
  facility_type: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
};

export async function listDoctors(search?: string): Promise<Doctor[]> {
  const db = getDb();
  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    return db
      .prepare(
        `SELECT * FROM doctors WHERE name LIKE ? OR specialty LIKE ? OR address LIKE ? ORDER BY name`
      )
      .all(q, q, q) as unknown as Promise<Doctor[]>;
  }
  return db.prepare(`SELECT * FROM doctors ORDER BY name`).all() as unknown as Promise<Doctor[]>;
}

export async function getDoctor(id: number): Promise<Doctor | undefined> {
  const db = getDb();
  return db.prepare(`SELECT * FROM doctors WHERE id = ?`).get(id) as Promise<Doctor | undefined>;
}

export async function createDoctor(input: {
  name: string;
  specialty?: string;
  facility_type: string;
  address?: string;
  lat?: number | null;
  lng?: number | null;
  phone?: string;
  notes?: string;
  created_by?: number;
}) {
  const db = getDb();
  const res = await db
    .prepare(
      `INSERT INTO doctors (name, specialty, facility_type, address, lat, lng, phone, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
    )
    .run(
      input.name,
      input.specialty ?? null,
      input.facility_type,
      input.address ?? null,
      input.lat ?? null,
      input.lng ?? null,
      input.phone ?? null,
      input.notes ?? null,
      input.created_by ?? null
    );
  return Number(res.lastInsertRowid);
}

export async function updateDoctor(
  id: number,
  input: Partial<{
    name: string;
    specialty: string;
    facility_type: string;
    address: string;
    lat: number | null;
    lng: number | null;
    phone: string;
    notes: string;
  }>
) {
  const db = getDb();
  const current = await getDoctor(id);
  if (!current) return false;
  const merged = { ...current, ...input };
  await db.prepare(
    `UPDATE doctors SET name=?, specialty=?, facility_type=?, address=?, lat=?, lng=?, phone=?, notes=? WHERE id=?`
  ).run(
    merged.name,
    merged.specialty,
    merged.facility_type,
    merged.address,
    merged.lat,
    merged.lng,
    merged.phone,
    merged.notes,
    id
  );
  return true;
}

export async function deleteDoctor(id: number): Promise<{ ok: boolean; error?: string }> {
  const db = getDb();
  const visitCount = (await db.prepare(`SELECT COUNT(*) as c FROM visits WHERE doctor_id = ?`).get(id)) as
    | { c: number | string }
    | undefined;
  if (visitCount && Number(visitCount.c) > 0) {
    return {
      ok: false,
      error: "این پزشک دارای تاریخچه ویزیت است و قابل حذف نیست. ابتدا ویزیت‌های مربوط به این پزشک را حذف کنید.",
    };
  }
  await db.prepare(`DELETE FROM doctors WHERE id = ?`).run(id);
  return { ok: true };
}

export async function doctorVisitHistory(id: number) {
  const db = getDb();
  return db
    .prepare(
      `SELECT v.id, v.checkin_at, v.checkout_at, v.outcome, v.note, u.name as rep_name
       FROM visits v JOIN users u ON u.id = v.rep_id
       WHERE v.doctor_id = ? ORDER BY v.checkin_at DESC`
    )
    .all(id);
}
