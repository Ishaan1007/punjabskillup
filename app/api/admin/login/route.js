import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const { password } = body;

  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "Server is missing ADMIN_PASSWORD or ADMIN_TOKEN env vars." },
      { status: 500 }
    );
  }

  if (password && password === process.env.ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    const isProduction = process.env.NODE_ENV === "production";

    res.cookies.set("admin_session", process.env.ADMIN_TOKEN, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

  return NextResponse.json({ ok: false, error: "Incorrect password." }, { status: 401 });
}
