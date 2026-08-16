import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createOfflineVisit } from "@/lib/repo/visits";

// Accepts a batch of fully-formed visits captured while the rep's device was
// offline (start + end + sample deliveries all recorded locally), and
// upserts them idempotently using each visit's client-generated UUID.
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const visits = Array.isArray(body?.visits) ? body.visits : [];

  const results: { clientUuid: string; id: number; duplicate: boolean }[] = [];
  for (const v of visits) {
    if (!v?.clientUuid || !v?.doctorId || !v?.checkinAt) continue;
    const result = createOfflineVisit({
      doctorId: Number(v.doctorId),
      repId: user.id,
      checkinAt: v.checkinAt,
      checkoutAt: v.checkoutAt ?? null,
      lat: v.lat ?? null,
      lng: v.lng ?? null,
      outcome: v.outcome ?? null,
      note: v.note ?? "",
      clientUuid: v.clientUuid,
      deliveries: v.deliveries ?? [],
    });
    results.push({ clientUuid: v.clientUuid, ...result });
  }
  return NextResponse.json({ synced: results });
}
