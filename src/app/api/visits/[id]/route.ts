import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { endVisit, getVisitDeliveries } from "@/lib/repo/visits";

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body?.outcome) return NextResponse.json({ error: "نتیجه ویزیت را انتخاب کنید." }, { status: 400 });
  try {
    endVisit(Number(id), user.id, {
      outcome: body.outcome,
      note: body.note ?? "",
      deliveries: body.deliveries ?? [],
    });
    return NextResponse.json({ ok: true, deliveries: getVisitDeliveries(Number(id)) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
