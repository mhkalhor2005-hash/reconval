import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getActiveVisit } from "@/lib/repo/visits";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json((await getActiveVisit(user.id)) ?? null);
}
