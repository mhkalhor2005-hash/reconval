import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { endVisit, getVisit, getVisitDeliveries, updateVisitByManager } from "@/lib/repo/visits";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const visit = await getVisit(Number(id));
  if (!visit) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(visit);
}

// Manager-only correction of a visit's outcome/note after the fact — separate
// from PUT below, which is the rep's own "close this active visit" action.
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "MANAGER") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "بدنه درخواست نامعتبر است." }, { status: 400 });
  try {
    await updateVisitByManager(Number(id), { outcome: body.outcome, note: body.note });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body?.outcome) return NextResponse.json({ error: "نتیجه ویزیت را انتخاب کنید." }, { status: 400 });
  try {
    await endVisit(Number(id), user.id, {
      outcome: body.outcome,
      note: body.note ?? "",
      deliveries: body.deliveries ?? [],
    });
    return NextResponse.json({ ok: true, deliveries: await getVisitDeliveries(Number(id)) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
