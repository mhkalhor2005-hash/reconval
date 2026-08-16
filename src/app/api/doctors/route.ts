import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { listDoctors, createDoctor } from "@/lib/repo/doctors";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const q = req.nextUrl.searchParams.get("q") ?? undefined;
  return NextResponse.json(await listDoctors(q));
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.facility_type) {
    return NextResponse.json({ error: "نام و نوع مرکز الزامی است." }, { status: 400 });
  }
  const id = await createDoctor({
    name: body.name,
    specialty: body.specialty,
    facility_type: body.facility_type,
    address: body.address,
    lat: body.lat ?? null,
    lng: body.lng ?? null,
    phone: body.phone,
    notes: body.notes,
    created_by: user.id,
  });
  return NextResponse.json({ id }, { status: 201 });
}
