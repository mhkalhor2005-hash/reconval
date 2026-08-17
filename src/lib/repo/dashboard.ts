import { getDb } from "@/lib/db";

function isoStartOfTodayUTC() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

function isoStartOfMonthUTC() {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

// Rep performance is driven entirely by completed plan_visits — a "visit"
// only exists once a rep checks a planned doctor off with an outcome.
export async function repPerformance() {
  const db = getDb();
  const monthStart = isoStartOfMonthUTC();
  const todayStart = isoStartOfTodayUTC();
  return db
    .prepare(
      `SELECT u.id, u.name, u.region, u.monthly_target,
         COUNT(CASE WHEN pv.done = 1 AND pv.completed_at >= ? THEN 1 END) as visits_this_month,
         COUNT(CASE WHEN pv.done = 1 AND pv.completed_at >= ? THEN 1 END) as visits_today
       FROM users u
       LEFT JOIN plan_visits pv ON pv.rep_id = u.id
       WHERE u.role = 'REP' AND u.active = 1
       GROUP BY u.id
       ORDER BY u.name`
    )
    .all(monthStart, todayStart);
}

export async function overviewCounts() {
  const db = getDb();
  const weekStart = isoDaysAgo(7);
  const todayStart = isoStartOfTodayUTC();
  const totals = db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM doctors) as doctor_count,
        (SELECT COUNT(*) FROM pharmacies) as pharmacy_count,
        (SELECT COUNT(*) FROM users WHERE role='REP' AND active=1) as rep_count,
        (SELECT COUNT(*) FROM plan_visits WHERE done = 1 AND completed_at >= ?) as visits_this_week,
        (SELECT COUNT(*) FROM plan_visits WHERE done = 1 AND completed_at >= ?) as visits_today,
        (SELECT COUNT(*) FROM plan_visits WHERE done = 0) as pending_visits
      `
    )
    .get(weekStart, todayStart);
  return totals;
}
