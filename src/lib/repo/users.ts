import { getDb } from "@/lib/db";

export type RepUser = {
  id: number;
  name: string;
  username: string;
  role: "MANAGER" | "REP";
  region: string | null;
  monthly_target: number;
};

export function listReps(): RepUser[] {
  const db = getDb();
  return db
    .prepare(`SELECT id, name, username, role, region, monthly_target FROM users WHERE role = 'REP' AND active = 1 ORDER BY name`)
    .all() as unknown as RepUser[];
}

export function getRep(id: number): RepUser | undefined {
  const db = getDb();
  return db
    .prepare(`SELECT id, name, username, role, region, monthly_target FROM users WHERE id = ?`)
    .get(id) as RepUser | undefined;
}
