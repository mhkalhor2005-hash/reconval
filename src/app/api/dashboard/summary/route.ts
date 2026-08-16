import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { repPerformance, sampleConsumption, visitsForMap, overviewCounts } from "@/lib/repo/dashboard";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "MANAGER") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json({
    overview: overviewCounts(),
    reps: repPerformance(),
    samples: sampleConsumption(30),
    mapVisits: visitsForMap(14),
  });
}
