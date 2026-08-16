import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { listRepInventory, allocateStock, inventorySummaryAllReps } from "@/lib/repo/inventory";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (user.role === "MANAGER") {
    const repId = req.nextUrl.searchParams.get("repId");
    if (repId) return NextResponse.json(listRepInventory(Number(repId)));
    return NextResponse.json(inventorySummaryAllReps());
  }
  return NextResponse.json(listRepInventory(user.id));
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "MANAGER") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json().catch(() => null);
  if (!body?.repId || !body?.productId || typeof body?.delta !== "number") {
    return NextResponse.json({ error: "پارامترها نامعتبر است." }, { status: 400 });
  }
  allocateStock(Number(body.repId), Number(body.productId), Number(body.delta));
  return NextResponse.json({ ok: true });
}
