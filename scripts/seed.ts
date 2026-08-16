// Idempotent seed script: creates demo users, doctors, product catalog,
// rep inventory and a history of visits so the dashboard has real data to show.
// Run with: node --experimental-strip-types scripts/seed.ts

import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import bcrypt from "bcryptjs";
import { ensureSchema } from "../src/lib/schema.ts";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, "app.db"));
db.exec("PRAGMA foreign_keys = ON;");
ensureSchema(db);

function count(table: string): number {
  const row = db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get() as { c: number };
  return row.c;
}

function hash(pw: string) {
  return bcrypt.hashSync(pw, 10);
}

// ---------- Users ----------
if (count("users") === 0) {
  const insUser = db.prepare(
    `INSERT INTO users (name, username, password_hash, role, region, monthly_target) VALUES (?, ?, ?, ?, ?, ?)`
  );
  insUser.run("الهام رضایی", "manager", hash("manager123"), "MANAGER", "تهران", 0);
  insUser.run("علی احمدی", "rep1", hash("rep123"), "REP", "تهران - شمال", 60);
  insUser.run("سارا محمدی", "rep2", hash("rep123"), "REP", "تهران - غرب", 60);
  insUser.run("رضا کریمی", "rep3", hash("rep123"), "REP", "کرج", 50);
  console.log("✓ users seeded (manager/manager123, rep1..3/rep123)");
}

// ---------- Doctors ----------
if (count("doctors") === 0) {
  const insDoc = db.prepare(
    `INSERT INTO doctors (name, specialty, facility_type, address, lat, lng, phone, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const doctors: [string, string, string, string, number, number, string, string][] = [
    ["دکتر مریم حسینی", "متخصص قلب و عروق", "HOSPITAL", "تهران، خیابان ولیعصر، بیمارستان دی", 35.7373, 51.4079, "021-88001122", "علاقه‌مند به داروهای قلبی جدید"],
    ["دکتر امیر رستمی", "متخصص داخلی", "OFFICE", "تهران، خیابان شریعتی، مطب پزشکان", 35.7595, 51.4381, "021-77002233", ""],
    ["دکتر نگار صادقی", "متخصص کودکان", "CLINIC", "تهران، سعادت‌آباد، کلینیک کودکان مهر", 35.7791, 51.3712, "021-22004455", "روزهای زوج در مطب حضور دارند"],
    ["دکتر بهروز نوری", "متخصص ارتوپدی", "HOSPITAL", "تهران، میدان ونک، بیمارستان آسیا", 35.7519, 51.4102, "021-88991122", ""],
    ["دکتر لیلا کاظمی", "داروساز", "PHARMACY", "تهران، خیابان انقلاب، داروخانه دکتر کاظمی", 35.7008, 51.3896, "021-66223344", "خرید عمده نمونه دارویی"],
    ["دکتر حسین یزدانی", "متخصص پوست و مو", "OFFICE", "تهران، جردن، مطب دکتر یزدانی", 35.7648, 51.4103, "021-26654433", ""],
    ["دکتر زهرا موسوی", "متخصص زنان و زایمان", "CLINIC", "تهران، پونک، کلینیک درمانگاه سلامت", 35.7614, 51.3335, "021-44556677", ""],
    ["دکتر کاوه شریفی", "متخصص گوارش", "HOSPITAL", "تهران، تجریش، بیمارستان شهدا", 35.8044, 51.4300, "021-22773344", "علاقه‌مند به نمونه رایگان"],
    ["دکتر مینا اکبری", "متخصص غدد و متابولیسم", "OFFICE", "تهران، فرشته، مطب دکتر اکبری", 35.7940, 51.4210, "021-22887766", ""],
    ["دکتر فرهاد قاسمی", "داروساز", "PHARMACY", "تهران، میدان فردوسی، داروخانه شبانه‌روزی قاسمی", 35.6961, 51.4126, "021-66112233", "سفارش ماهانه ثابت"],
    ["دکتر آرزو فرهادی", "متخصص روانپزشکی", "CLINIC", "کرج، فردیس، کلینیک آرامش", 35.7286, 50.9866, "026-32445566", ""],
    ["دکتر سینا محمودی", "پزشک عمومی", "OFFICE", "کرج، گوهردشت، مطب دکتر محمودی", 35.8168, 50.9668, "026-34556677", ""],
  ];
  for (const d of doctors) insDoc.run(...d);
  console.log(`✓ ${doctors.length} doctors seeded`);
}

// ---------- Products ----------
if (count("products") === 0) {
  const insP = db.prepare(`INSERT INTO products (name, type, unit_label) VALUES (?, ?, ?)`);
  const products: [string, string, string][] = [
    ["نمونه قرص آلفا ۲۰ میلی‌گرم", "SAMPLE", "بسته"],
    ["نمونه شربت بتا", "SAMPLE", "بطری"],
    ["آمپول گاما", "SAMPLE", "عدد"],
    ["نمونه کپسول دلتا", "SAMPLE", "بسته"],
    ["خودکار برند ریکنوال", "GIFT", "عدد"],
    ["کاتالوگ محصولات", "GIFT", "عدد"],
    ["ست هدیه پزشکان", "GIFT", "عدد"],
  ];
  for (const p of products) insP.run(...p);
  console.log(`✓ ${products.length} products seeded`);
}

// ---------- Rep inventory ----------
if (count("rep_inventory") === 0) {
  const reps = db.prepare(`SELECT id FROM users WHERE role='REP'`).all() as { id: number }[];
  const products = db.prepare(`SELECT id FROM products`).all() as { id: number }[];
  const insInv = db.prepare(
    `INSERT INTO rep_inventory (rep_id, product_id, qty_on_hand) VALUES (?, ?, ?)`
  );
  for (const r of reps) {
    for (const p of products) {
      insInv.run(r.id, p.id, 40 + Math.floor(Math.random() * 30));
    }
  }
  console.log(`✓ inventory allocated to ${reps.length} reps`);
}

// ---------- Visit history (last 30 days) ----------
if (count("visits") === 0) {
  const reps = db.prepare(`SELECT id FROM users WHERE role='REP'`).all() as { id: number }[];
  const doctors = db.prepare(`SELECT id, lat, lng FROM doctors`).all() as { id: number; lat: number; lng: number }[];
  const products = db.prepare(`SELECT id FROM products WHERE type='SAMPLE'`).all() as { id: number }[];
  const outcomes = ["POSITIVE", "NEUTRAL", "FOLLOW_UP", "NEGATIVE"];

  const insVisit = db.prepare(
    `INSERT INTO visits (doctor_id, rep_id, checkin_at, checkout_at, checkin_lat, checkin_lng, outcome, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insDelivery = db.prepare(
    `INSERT INTO sample_deliveries (visit_id, product_id, qty) VALUES (?, ?, ?)`
  );
  const decInv = db.prepare(
    `UPDATE rep_inventory SET qty_on_hand = MAX(qty_on_hand - ?, 0) WHERE rep_id = ? AND product_id = ?`
  );

  let visitCount = 0;
  const now = Date.now();
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    // 1 to 4 visits per day across reps, skip some days randomly to look realistic
    if (Math.random() < 0.15) continue;
    const visitsToday = 1 + Math.floor(Math.random() * 4);
    for (let i = 0; i < visitsToday; i++) {
      const rep = reps[Math.floor(Math.random() * reps.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const dayStart = now - dayOffset * 24 * 60 * 60 * 1000;
      const hour = 9 + Math.floor(Math.random() * 7); // 9am-4pm
      const checkin = new Date(dayStart);
      checkin.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
      const durationMin = 10 + Math.floor(Math.random() * 30);
      const checkout = new Date(checkin.getTime() + durationMin * 60000);
      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      const jitter = () => (Math.random() - 0.5) * 0.01;

      const result = insVisit.run(
        doctor.id,
        rep.id,
        checkin.toISOString(),
        checkout.toISOString(),
        doctor.lat + jitter(),
        doctor.lng + jitter(),
        outcome,
        ""
      );
      const visitId = Number(result.lastInsertRowid);
      visitCount++;

      // ~60% of visits deliver a sample
      if (Math.random() < 0.6 && products.length > 0) {
        const product = products[Math.floor(Math.random() * products.length)];
        const qty = 1 + Math.floor(Math.random() * 4);
        insDelivery.run(visitId, product.id, qty);
        decInv.run(qty, rep.id, product.id);
      }
    }
  }
  console.log(`✓ ${visitCount} historical visits seeded`);
}

console.log("Seed complete.");
