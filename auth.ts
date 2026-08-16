import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getDb } from "./db";

export const SESSION_COOKIE = "rekanwal_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days

function secretKey() {
  const secret = process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me";
  return new TextEncoder().encode(secret);
}

export type Role = "MANAGER" | "REP";

export type SessionPayload = {
  sub: string; // user id as string
  name: string;
  username: string;
  role: Role;
};

export function hashPassword(plain: string) {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compareSync(plain, hash);
}

export async function signSession(payload: SessionPayload) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// Server component / route-handler helper: read + verify the session cookie,
// and (optionally) hydrate a fresh copy of the user row from the DB.
export async function getSessionUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  const db = getDb();
  const row = db
    .prepare(`SELECT id, name, username, role, region, monthly_target FROM users WHERE id = ? AND active = 1`)
    .get(Number(payload.sub)) as
    | { id: number; name: string; username: string; role: Role; region: string | null; monthly_target: number }
    | undefined;
  if (!row) return null;
  return row;
}
