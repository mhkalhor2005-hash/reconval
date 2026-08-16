import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { listProducts, createProduct } from "@/lib/repo/products";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await listProducts());
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "MANAGER") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.type) return NextResponse.json({ error: "نام و نوع محصول الزامی است." }, { status: 400 });
  const id = await createProduct({ name: body.name, type: body.type, unit_label: body.unit_label });
  return NextResponse.json({ id }, { status: 201 });
}
