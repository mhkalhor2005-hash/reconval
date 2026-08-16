import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createRep } from "@/lib/repo/users";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "MANAGER") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.username || !body?.password) {
    return NextResponse.json({ error: "نام، نام کاربری و رمز عبور الزامی است." }, { status: 400 });
  }
  try {
    const id = createRep({
      name: body.name,
      username: body.username,
      password: body.password,
      region: body.region,
      monthly_target: body.monthly_target ? Number(body.monthly_target) : undefined,
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
