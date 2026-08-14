import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body || !body.data) {
    return NextResponse.json({ ok: false, error: "Missing data." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("course_data")
    .update({ data: body.data, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
