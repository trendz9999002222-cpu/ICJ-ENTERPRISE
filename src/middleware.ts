import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_ROLES = ["super_admin", "admin"];
const ADVOCATE_ROLE = "advocate";
const MEMBER_ROLE = "member";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("icj_access_token")?.value;

  // ── Public paths — no auth needed ─────────────────────────────────────────
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/join") ||
    pathname.startsWith("/recovery") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // ── Protected zone — require token ────────────────────────────────────────
  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard");

  if (!isProtected) return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = decodeJwtPayload(token);
  const role = (payload?.role as string) ?? "";
  const roles = Array.isArray(payload?.roles) ? (payload.roles as string[]) : [role];

  // ── /admin/* — only admin roles ───────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const isAdmin = ADMIN_ROLES.includes(role) || roles.some((r) => ADMIN_ROLES.includes(r));
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // ── /dashboard/* — allow all authenticated users ───────────────────────────
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
