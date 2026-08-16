import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export type RepUser = {
  id: number;
  name: string;
  username: string;
  role: "MANAGER" | "REP";
  region: string | null;
  monthly_target: number;
};

export async function listReps(): Promise<RepUser[]> {
  const db = getDb();
  return db
    .prepare(`SELECT id, name, username, role, region, monthly_target FROM users WHERE role = 'REP' AND active = 1 ORDER BY name`)
    .all() as unknown as Promise<RepUser[]>;
}

export async function getRep(id: number): Promise<RepUser | undefined> {
  const db = getDb();
  return db
    .prepare(`SELECT id, name, username, role, region, monthly_target FROM users WHERE id = ?`)
    .get(id) as Promise<RepUser | undefined>;
}

export async function createRep(input: {
  name: string;
  username: string;
  password: string;
  region?: string | null;
  monthly_target?: number;
}) {
  const db = getDb();
  const existing = await db.prepare(`SELECT id FROM users WHERE username = ?`).get(input.username);
  if (existing) throw new Error("این نام کاربری قبلاً استفاده شده است.");
  const res = await db
    .prepare(
      `INSERT INTO users (name, username, password_hash, role, region, monthly_target) VALUES (?, ?, ?, 'REP', ?, ?) RETURNING id`
    )
    .run(
      input.name,
      input.username,
      hashPassword(input.password),
      input.region ?? null,
      input.monthly_target ?? 60
    );
  return Number(res.lastInsertRowid);
}

export async function updateRep(
  id: number,
  input: Partial<{
    name: string;
    username: string;
    password: string;
    region: string | null;
    monthly_target: number;
    active: boolean;
  }>
) {
  const db = getDb();
  const current = await getRep(id);
  if (!current) return false;
  if (input.username && input.username !== current.username) {
    const clash = await db.prepare(`SELECT id FROM users WHERE username = ? AND id != ?`).get(input.username, id);
    if (clash) throw new Error("این نام کاربری قبلاً استفاده شده است.");
  }
  const merged = {
    name: input.name ?? current.name,
    username: input.username ?? current.username,
    region: input.region === undefined ? current.region : input.region,
    monthly_target: input.monthly_target ?? current.monthly_target,
  };
  await db.prepare(`UPDATE users SET name=?, username=?, region=?, monthly_target=? WHERE id=?`).run(
    merged.name,
    merged.username,
    merged.region,
    merged.monthly_target,
    id
  );
  if (input.password) {
    await db.prepare(`UPDATE users SET password_hash=? WHERE id=?`).run(hashPassword(input.password), id);
  }
  if (input.active === false) {
    await db.prepare(`UPDATE users SET active=0 WHERE id=?`).run(id);
  }
  return true;
}
