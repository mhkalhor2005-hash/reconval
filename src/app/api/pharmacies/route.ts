import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { listPharmacies, createPharmacy } from "@/lib/repo/pharmacies";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await listPharmacies());
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "MANAGER") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: "نام داروخانه الزامی است." }, { status: 400 });
  const id = await createPharmacy({
    name: body.name,
    address: body.address,
    phone: body.phone,
    notes: body.notes,
  });
  return NextResponse.json({ id }, { status: 201 });
}
