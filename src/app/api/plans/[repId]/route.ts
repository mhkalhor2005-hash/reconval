import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getPlanForRep } from "@/lib/repo/plans";

// Manager can view any rep's plan; a rep can only view their own.
export async function GET(req: NextRequest, ctx: { params: Promise<{ repId: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { repId } = await ctx.params;
  if (user.role !== "MANAGER" && user.id !== Number(repId)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const week = req.nextUrl.searchParams.get("week");
  if (!week) return NextResponse.json({ error: "week الزامی است." }, { status: 400 });
  const plan = await getPlanForRep(Number(repId), week);
  return NextResponse.json(plan);
}
