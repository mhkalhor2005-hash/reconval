import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { deletePharmacyOrder } from "@/lib/repo/pharmacies";

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "MANAGER") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  await deletePharmacyOrder(Number(id));
  return NextResponse.json({ ok: true });
}
