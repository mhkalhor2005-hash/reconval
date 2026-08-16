import { getDb } from "@/lib/db";

function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

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

export function repPerformance() {
  const db = getDb();
  const monthStart = isoStartOfMonthUTC();
  const todayStart = isoStartOfTodayUTC();
  return db
    .prepare(
      `SELECT u.id, u.name, u.region, u.monthly_target,
         COUNT(CASE WHEN v.checkin_at >= ? THEN 1 END) as visits_this_month,
         COUNT(CASE WHEN v.checkin_at >= ? THEN 1 END) as visits_today
       FROM users u
       LEFT JOIN visits v ON v.rep_id = u.id
       WHERE u.role = 'REP'
       GROUP BY u.id
       ORDER BY u.name`
    )
    .all(monthStart, todayStart);
}

export function sampleConsumption(sinceDays = 30) {
  const db = getDb();
  const since = isoDaysAgo(sinceDays);
  return db
    .prepare(
      `SELECT p.name, p.type, p.unit_label, SUM(sd.qty) as total_qty, COUNT(DISTINCT sd.visit_id) as visit_count
       FROM sample_deliveries sd
       JOIN products p ON p.id = sd.product_id
       JOIN visits v ON v.id = sd.visit_id
       WHERE v.checkin_at >= ?
       GROUP BY p.id ORDER BY total_qty DESC`
    )
    .all(since);
}

export function visitsForMap(sinceDays = 14) {
  const db = getDb();
  const since = isoDaysAgo(sinceDays);
  return db
    .prepare(
      `SELECT v.id, v.checkin_lat as lat, v.checkin_lng as lng, v.checkin_at, v.outcome,
              d.name as doctor_name, u.name as rep_name
       FROM visits v
       JOIN doctors d ON d.id = v.doctor_id
       JOIN users u ON u.id = v.rep_id
       WHERE v.checkin_at >= ? AND v.checkin_lat IS NOT NULL
       ORDER BY v.checkin_at DESC LIMIT 300`
    )
    .all(since);
}

export function overviewCounts() {
  const db = getDb();
  const weekStart = isoDaysAgo(7);
  const todayStart = isoStartOfTodayUTC();
  const totals = db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM doctors) as doctor_count,
        (SELECT COUNT(*) FROM users WHERE role='REP' AND active=1) as rep_count,
        (SELECT COUNT(*) FROM visits WHERE checkin_at >= ?) as visits_this_week,
        (SELECT COUNT(*) FROM visits WHERE checkin_at >= ?) as visits_today,
        (SELECT COUNT(*) FROM visits WHERE checkout_at IS NULL) as active_visits
      `
    )
    .get(weekStart, todayStart);
  return totals;
}
