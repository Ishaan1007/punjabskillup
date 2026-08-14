import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("admin_session")?.value;
  const authed = session && process.env.ADMIN_TOKEN && session === process.env.ADMIN_TOKEN;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/api/admin") && pathname !== "/api/admin/login" && !authed) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
