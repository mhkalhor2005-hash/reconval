import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { startVisit, listVisitsForRep, listAllVisits } from "@/lib/repo/visits";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (user.role === "MANAGER") {
    const sinceDays = Number(req.nextUrl.searchParams.get("sinceDays") ?? "0") || undefined;
    return NextResponse.json(listAllVisits({ sinceDays }));
  }
  return NextResponse.json(listVisitsForRep(user.id));
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.doctorId) return NextResponse.json({ error: "پزشک انتخاب نشده است." }, { status: 400 });
  try {
    const id = startVisit({
      doctorId: Number(body.doctorId),
      repId: user.id,
      lat: body.lat ?? null,
      lng: body.lng ?? null,
      clientUuid: body.clientUuid,
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 409 });
  }
}
