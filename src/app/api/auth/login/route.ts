import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyPassword, signSession, SESSION_COOKIE, type Role } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const username = (body?.username ?? "").toString().trim();
  const password = (body?.password ?? "").toString();

  if (!username || !password) {
    return NextResponse.json({ error: "نام کاربری و رمز عبور را وارد کنید." }, { status: 400 });
  }

  const db = getDb();
  const user = (await db
    .prepare(`SELECT id, name, username, password_hash, role FROM users WHERE username = ? AND active = 1`)
    .get(username)) as
    | { id: number; name: string; username: string; password_hash: string; role: Role }
    | undefined;

  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: "نام کاربری یا رمز عبور اشتباه است." }, { status: 401 });
  }

  const token = await signSession({
    sub: String(user.id),
    name: user.name,
    username: user.username,
    role: user.role,
  });

  const res = NextResponse.json({ role: user.role, name: user.name });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return res;
}
