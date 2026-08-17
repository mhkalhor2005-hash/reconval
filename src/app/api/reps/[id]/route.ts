import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { updateRep } from "@/lib/repo/users";

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "MANAGER") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "بدنه درخواست نامعتبر است." }, { status: 400 });
  try {
    const ok = await updateRep(Number(id), {
      name: body.name,
      username: body.username,
      password: body.password || undefined,
      region: body.region,
      monthly_target: body.monthly_target ? Number(body.monthly_target) : undefined,
    });
    if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

// Manager-only: soft-delete (deactivate) a rep. Visit/inventory history for
// this rep stays intact — they just stop showing up in active lists and
// can no longer log in.
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "MANAGER") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const ok = await updateRep(Number(id), { active: false });
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
