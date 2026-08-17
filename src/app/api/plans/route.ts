import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { setPlanDoctors } from "@/lib/repo/plans";

// Manager-only: set the full list of doctors assigned to a rep for a given
// week (Saturday-start). Replaces the previous selection — items already
// marked done are kept regardless.
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "MANAGER") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json().catch(() => null);
  if (!body?.repId || !body?.weekStart || !Array.isArray(body?.doctorIds)) {
    return NextResponse.json({ error: "پارامترها نامعتبر است." }, { status: 400 });
  }
  await setPlanDoctors(
    Number(body.repId),
    String(body.weekStart),
    body.doctorIds.map((d: unknown) => Number(d))
  );
  return NextResponse.json({ ok: true });
}
