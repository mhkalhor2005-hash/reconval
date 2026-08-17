import { getDb } from "@/lib/db";

// The weekly plan IS the visit system: a "visit" only exists as a row in
// plan_visits, created when the manager assigns a doctor to a rep for a
// given week. The rep later checks it off and records the outcome — no GPS,
// no separate check-in/check-out step.

export type Outcome = "POSITIVE" | "NEUTRAL" | "FOLLOW_UP" | "NEGATIVE";

export const OUTCOME_LABELS: Record<Outcome, string> = {
  POSITIVE: "مثبت",
  NEUTRAL: "خنثی",
  FOLLOW_UP: "نیاز به پیگیری",
  NEGATIVE: "منفی",
};

// Persian work week: شنبه (Saturday) تا جمعه (Friday). Returns the ISO
// (YYYY-MM-DD) date of the Saturday that starts the week containing `d`,
// computed in UTC to avoid timezone drift.
export function weekStartISO(d: Date = new Date()): string {
  const day = d.getUTCDay(); // Sun=0 ... Fri=5, Sat=6
  const daysSinceSaturday = (day + 1) % 7;
  const sat = new Date(d);
  sat.setUTCDate(sat.getUTCDate() - daysSinceSaturday);
  return sat.toISOString().slice(0, 10);
}

export function shiftWeek(weekStart: string, deltaWeeks: number): string {
  const d = new Date(weekStart + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + deltaWeeks * 7);
  return d.toISOString().slice(0, 10);
}

export function weekEndISO(weekStart: string): string {
  const d = new Date(weekStart + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 6);
  return d.toISOString().slice(0, 10);
}

async function getOrCreatePlan(repId: number, weekStart: string): Promise<number> {
  const db = getDb();
  const existing = (await db
    .prepare(`SELECT id FROM weekly_plans WHERE rep_id = ? AND week_start = ?`)
    .get(repId, weekStart)) as { id: number } | undefined;
  if (existing) return existing.id;
  const res = await db
    .prepare(`INSERT INTO weekly_plans (rep_id, week_start) VALUES (?, ?) RETURNING id`)
    .run(repId, weekStart);
  return Number(res.lastInsertRowid);
}

// Manager sets the full list of doctors assigned to a rep for a week.
// Doctors already marked done are never removed, even if unchecked in the
// UI — completed history is never silently discarded.
export async function setPlanDoctors(repId: number, weekStart: string, doctorIds: number[]) {
  const db = getDb();
  const planId = await getOrCreatePlan(repId, weekStart);

  const current = (await db
    .prepare(`SELECT id, doctor_id, done FROM plan_visits WHERE plan_id = ?`)
    .all(planId)) as { id: number; doctor_id: number; done: number }[];

  const wanted = new Set(doctorIds);
  const existingDoctorIds = new Set(current.map((c) => c.doctor_id));

  const toRemove = current.filter((c) => !wanted.has(c.doctor_id) && c.done === 0);
  const toAdd = doctorIds.filter((id) => !existingDoctorIds.has(id));

  for (const c of toRemove) {
    await db.prepare(`DELETE FROM plan_visits WHERE id = ?`).run(c.id);
  }
  const ins = db.prepare(`INSERT INTO plan_visits (plan_id, doctor_id, rep_id) VALUES (?, ?, ?)`);
  for (const doctorId of toAdd) {
    await ins.run(planId, doctorId, repId);
  }
  return planId;
}

export async function getPlanForRep(repId: number, weekStart: string) {
  const db = getDb();
  const plan = (await db
    .prepare(`SELECT id FROM weekly_plans WHERE rep_id = ? AND week_start = ?`)
    .get(repId, weekStart)) as { id: number } | undefined;
  if (!plan) return { planId: null as number | null, items: [] };
  const items = await db
    .prepare(
      `SELECT pv.id, pv.doctor_id, pv.done, pv.outcome, pv.note, pv.completed_at,
              d.name as doctor_name, d.specialty, d.address, d.phone
       FROM plan_visits pv JOIN doctors d ON d.id = pv.doctor_id
       WHERE pv.plan_id = ? ORDER BY pv.done ASC, d.name ASC`
    )
    .all(plan.id);
  return { planId: plan.id, items };
}

export async function getPlanItem(id: number) {
  const db = getDb();
  return db
    .prepare(
      `SELECT pv.*, d.name as doctor_name
       FROM plan_visits pv JOIN doctors d ON d.id = pv.doctor_id
       WHERE pv.id = ?`
    )
    .get(id) as Promise<
    | {
        id: number;
        plan_id: number;
        doctor_id: number;
        rep_id: number;
        done: number;
        outcome: string | null;
        note: string | null;
        completed_at: string | null;
        doctor_name: string;
      }
    | undefined
  >;
}

// Rep marks a planned doctor as visited and records the outcome. The
// outcome + note are also appended to the doctor's own notes field, so the
// manager sees a running log directly on the doctor's profile too.
export async function completePlanVisit(id: number, input: { outcome: Outcome; note?: string }) {
  const db = getDb();
  const item = await getPlanItem(id);
  if (!item) return { ok: false, error: "این مورد پیدا نشد." };
  const now = new Date().toISOString();
  await db
    .prepare(`UPDATE plan_visits SET done = 1, outcome = ?, note = ?, completed_at = ? WHERE id = ?`)
    .run(input.outcome, input.note ?? "", now, id);

  const dateLabel = new Date(now).toLocaleDateString("fa-IR");
  const rep = (await db.prepare(`SELECT name FROM users WHERE id = ?`).get(item.rep_id)) as
    | { name: string }
    | undefined;
  const entry = `--- ویزیت ${dateLabel} توسط ${rep?.name ?? "ویزیتور"} — نتیجه: ${OUTCOME_LABELS[input.outcome]} ---${
    input.note ? `\n${input.note}` : ""
  }`;
  await db
    .prepare(`UPDATE doctors SET notes = TRIM(BOTH E'\n' FROM COALESCE(notes, '') || E'\n\n' || ?) WHERE id = ?`)
    .run(entry, item.doctor_id);

  return { ok: true };
}

// Manager-side correction of an already-recorded outcome/note (does not
// re-append to doctor notes, to avoid duplicate log entries).
export async function updatePlanVisitByManager(id: number, input: { outcome?: Outcome; note?: string }) {
  const db = getDb();
  const item = await getPlanItem(id);
  if (!item) return { ok: false, error: "این مورد پیدا نشد." };
  if (input.outcome !== undefined) {
    await db.prepare(`UPDATE plan_visits SET outcome = ? WHERE id = ?`).run(input.outcome, id);
  }
  if (input.note !== undefined) {
    await db.prepare(`UPDATE plan_visits SET note = ? WHERE id = ?`).run(input.note, id);
  }
  return { ok: true };
}

export async function deletePlanVisit(id: number) {
  const db = getDb();
  await db.prepare(`DELETE FROM plan_visits WHERE id = ?`).run(id);
  return { ok: true };
}

// Full weekly-plan status for the manager's overview: every active rep,
// with their assigned doctors and completion status for the given week.
export async function planStatusForWeek(weekStart: string) {
  const db = getDb();
  const reps = (await db
    .prepare(`SELECT id, name, region FROM users WHERE role = 'REP' AND active = 1 ORDER BY name`)
    .all()) as { id: number; name: string; region: string | null }[];

  const items = (await db
    .prepare(
      `SELECT pv.id, pv.rep_id, pv.doctor_id, pv.done, pv.outcome, pv.note, pv.completed_at, d.name as doctor_name
       FROM plan_visits pv
       JOIN weekly_plans wp ON wp.id = pv.plan_id
       JOIN doctors d ON d.id = pv.doctor_id
       WHERE wp.week_start = ?
       ORDER BY d.name`
    )
    .all(weekStart)) as {
    id: number;
    rep_id: number;
    doctor_id: number;
    done: number;
    outcome: string | null;
    note: string | null;
    completed_at: string | null;
    doctor_name: string;
  }[];

  return reps.map((r) => ({
    ...r,
    items: items.filter((i) => i.rep_id === r.id),
  }));
}

// Doctor profile "تاریخچه تعاملات" — every planned/completed visit for a
// single doctor, across all reps and weeks.
export async function doctorVisitHistory(doctorId: number) {
  const db = getDb();
  return db
    .prepare(
      `SELECT pv.id, pv.done, pv.outcome, pv.note, pv.completed_at, pv.created_at, u.name as rep_name
       FROM plan_visits pv JOIN users u ON u.id = pv.rep_id
       WHERE pv.doctor_id = ? ORDER BY pv.created_at DESC`
    )
    .all(doctorId);
}

// Recent completed visits for one rep (rep's own detail page / manager's
// rep detail page).
export async function recentVisitsForRep(repId: number, limit = 15) {
  const db = getDb();
  return db
    .prepare(
      `SELECT pv.id, pv.done, pv.outcome, pv.note, pv.completed_at, d.name as doctor_name
       FROM plan_visits pv JOIN doctors d ON d.id = pv.doctor_id
       WHERE pv.rep_id = ? ORDER BY COALESCE(pv.completed_at, pv.created_at) DESC LIMIT ?`
    )
    .all(repId, limit);
}

// "همه ویزیت‌ها" history page: every completed visit across the whole team.
export async function listCompletedVisits(limit = 200) {
  const db = getDb();
  return db
    .prepare(
      `SELECT pv.id, pv.outcome, pv.note, pv.completed_at, d.id as doctor_id, d.name as doctor_name, u.name as rep_name
       FROM plan_visits pv
       JOIN doctors d ON d.id = pv.doctor_id
       JOIN users u ON u.id = pv.rep_id
       WHERE pv.done = 1
       ORDER BY pv.completed_at DESC LIMIT ?`
    )
    .all(limit);
}

export async function getVisit(id: number) {
  return getPlanItem(id);
}
