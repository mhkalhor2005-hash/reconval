import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { repPerformance, sampleConsumption, visitsForMap, overviewCounts } from "@/lib/repo/dashboard";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "MANAGER") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const [overview, reps, samples, mapVisits] = await Promise.all([
    overviewCounts(),
    repPerformance(),
    sampleConsumption(30),
    visitsForMap(14),
  ]);
  return NextResponse.json({ overview, reps, samples, mapVisits });
}
