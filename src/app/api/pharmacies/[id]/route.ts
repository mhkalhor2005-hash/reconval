import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { updatePharmacy, deletePharmacy } from "@/lib/repo/pharmacies";

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "MANAGER") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: "نام داروخانه الزامی است." }, { status: 400 });
  const ok = await updatePharmacy(Number(id), {
    name: body.name,
    address: body.address,
    phone: body.phone,
    notes: body.notes,
  });
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "MANAGER") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  await deletePharmacy(Number(id));
  return NextResponse.json({ ok: true });
}
