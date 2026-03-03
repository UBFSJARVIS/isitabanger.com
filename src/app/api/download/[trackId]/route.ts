import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  const { trackId } = await params;
  const supabase = await createClient();

  // Fetch track to get file path
  const { data: track, error: trackError } = await supabase
    .from("tracks")
    .select("file_path, is_published")
    .eq("id", trackId)
    .single();

  if (trackError || !track || !track.is_published) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }

  // Create a signed URL valid for 60 seconds
  const { data, error } = await supabase.storage
    .from("tracks")
    .createSignedUrl(track.file_path, 60);

  if (error || !data) {
    return NextResponse.json({ error: "Could not generate download link" }, { status: 500 });
  }

  // Increment download count
  await supabase.rpc("increment_download_count", { track_id: trackId }).maybeSingle();

  return NextResponse.json({ url: data.signedUrl });
}
