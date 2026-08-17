import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { listPharmacyOrders, createPharmacyOrder } from "@/lib/repo/pharmacies";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  return NextResponse.json(await listPharmacyOrders(Number(id)));
}

// Any logged-in user (rep or manager) can log a new order for a pharmacy —
// this is how "last order date / quantity" gets recorded per rep.
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body?.orderDate || !body?.quantity) {
    return NextResponse.json({ error: "تاریخ و تعداد سفارش الزامی است." }, { status: 400 });
  }
  const orderId = await createPharmacyOrder({
    pharmacyId: Number(id),
    repId: user.id,
    orderDate: String(body.orderDate),
    quantity: Number(body.quantity),
    note: body.note,
  });
  return NextResponse.json({ id: orderId }, { status: 201 });
}
