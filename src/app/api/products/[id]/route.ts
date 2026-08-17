import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { updateProduct, deleteProduct } from "@/lib/repo/products";

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "MANAGER") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.type) return NextResponse.json({ error: "نام و نوع محصول الزامی است." }, { status: 400 });
  const ok = await updateProduct(Number(id), {
    name: body.name,
    type: body.type,
    unit_label: body.unit_label,
  });
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

// Soft-delete: keeps historical sample_deliveries / rep_inventory rows intact,
// just hides the product from listProducts() (active = 0).
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "MANAGER") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  await deleteProduct(Number(id));
  return NextResponse.json({ ok: true });
}
