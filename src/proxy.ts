import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "rekanwal_session";

function secretKey() {
  const secret = process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me";
  return new TextEncoder().encode(secret);
}

async function readRole(req: NextRequest): Promise<"MANAGER" | "REP" | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return (payload.role as "MANAGER" | "REP") ?? null;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isDashboard = pathname.startsWith("/dashboard");
  const isRepApp = pathname.startsWith("/app");
  if (!isDashboard && !isRepApp) return NextResponse.next();

  const role = await readRole(req);

  if (!role) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isDashboard && role !== "MANAGER") {
    return NextResponse.redirect(new URL("/app", req.url));
  }
  // Managers are allowed into /app too, for QA / visibility into the rep experience.

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/app/:path*"],
};
