import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { completePlanVisit, updatePlanVisitByManager, deletePlanVisit, getPlanItem } from "@/lib/repo/plans";

// A rep checks off their own planned doctor visit and records the outcome
// (this is what creates the "visit" — done=1). A manager may later correct
// the outcome/note on any item.
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const item = await getPlanItem(Number(id));
  if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (user.role !== "MANAGER" && user.id !== item.rep_id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  if (!body?.outcome) return NextResponse.json({ error: "نتیجه ویزیت را انتخاب کنید." }, { status: 400 });

  const result =
    user.role === "MANAGER"
      ? await updatePlanVisitByManager(Number(id), { outcome: body.outcome, note: body.note })
      : await completePlanVisit(Number(id), { outcome: body.outcome, note: body.note });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 404 });
  return NextResponse.json({ ok: true });
}

// Manager-only: remove a mistakenly-added item from a weekly plan.
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "MANAGER") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  await deletePlanVisit(Number(id));
  return NextResponse.json({ ok: true });
}
