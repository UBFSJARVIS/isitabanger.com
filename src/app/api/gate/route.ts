import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { trackId, gateType, email } = await req.json();

  if (!trackId || !gateType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (gateType === "email" && !email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const supabase = await createClient();

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  const { error } = await supabase.from("gate_completions").insert({
    track_id: trackId,
    gate_type: gateType,
    email: email ?? null,
    ip_address: ip,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
