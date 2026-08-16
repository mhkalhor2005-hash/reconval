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

export function listDoctors(search?: string): Doctor[] {
  const db = getDb();
  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    return db
      .prepare(
        `SELECT * FROM doctors WHERE name LIKE ? OR specialty LIKE ? OR address LIKE ? ORDER BY name`
      )
      .all(q, q, q) as unknown as Doctor[];
  }
  return db.prepare(`SELECT * FROM doctors ORDER BY name`).all() as unknown as Doctor[];
}

export function getDoctor(id: number): Doctor | undefined {
  const db = getDb();
  return db.prepare(`SELECT * FROM doctors WHERE id = ?`).get(id) as Doctor | undefined;
}

export function createDoctor(input: {
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
  const res = db
    .prepare(
      `INSERT INTO doctors (name, specialty, facility_type, address, lat, lng, phone, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
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

export function updateDoctor(
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
  const current = getDoctor(id);
  if (!current) return false;
  const merged = { ...current, ...input };
  db.prepare(
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

export function doctorVisitHistory(id: number) {
  const db = getDb();
  return db
    .prepare(
      `SELECT v.id, v.checkin_at, v.checkout_at, v.outcome, v.note, u.name as rep_name
       FROM visits v JOIN users u ON u.id = v.rep_id
       WHERE v.doctor_id = ? ORDER BY v.checkin_at DESC`
    )
    .all(id);
}
