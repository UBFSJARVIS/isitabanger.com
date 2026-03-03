import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import DownloadGate from "@/components/DownloadGate";
import { Music } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: track } = await supabase
    .from("tracks")
    .select("title, description, profiles(display_name)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!track) return { title: "Track Not Found" };

  return {
    title: `${track.title} — IsItABanger`,
    description: track.description ?? `Download ${track.title} for free`,
  };
}

export default async function TrackPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: track } = await supabase
    .from("tracks")
    .select(
      `
      id, title, description, genre, slug, gate_type,
      soundcloud_url, spotify_url, instagram_url,
      cover_art_path, view_count, download_count,
      profiles (display_name, username)
    `
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!track) notFound();

  // Get cover art public URL
  let coverUrl: string | null = null;
  if (track.cover_art_path) {
    const { data } = supabase.storage.from("covers").getPublicUrl(track.cover_art_path);
    coverUrl = data.publicUrl;
  }

  // Record page view (fire and forget)
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  await supabase.from("page_views").insert({ track_id: track.id, ip_address: ip });
  await supabase.rpc("increment_view_count", { track_id: track.id }).maybeSingle();

  const profile = Array.isArray(track.profiles) ? track.profiles[0] : track.profiles;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Ad banner top */}
      <div className="w-full bg-white/5 border-b border-white/10 flex items-center justify-center py-3 text-white/20 text-xs tracking-widest">
        ADVERTISEMENT
        {/* Google AdSense slot goes here */}
      </div>

      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link href="/" className="text-xl font-bold text-orange-400">
          IsItABanger
        </Link>
        <Link href="/signup" className="text-sm text-white/50 hover:text-white transition-colors">
          Upload your music →
        </Link>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-12">
        {/* Track info */}
        <div className="text-center mb-8">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={track.title}
              className="w-48 h-48 rounded-2xl object-cover mx-auto mb-6 shadow-2xl"
            />
          ) : (
            <div className="w-48 h-48 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Music className="w-16 h-16 text-white/20" />
            </div>
          )}

          <h1 className="text-2xl font-bold mb-1">{track.title}</h1>
          {profile && (
            <p className="text-white/50">
              by{" "}
              <span className="text-orange-400 font-medium">
                {profile.display_name ?? profile.username}
              </span>
            </p>
          )}
          {track.genre && (
            <span className="inline-block mt-2 text-xs bg-white/10 px-3 py-1 rounded-full text-white/50">
              {track.genre}
            </span>
          )}
          {track.description && (
            <p className="text-white/40 text-sm mt-4 leading-relaxed">{track.description}</p>
          )}

          <div className="flex justify-center gap-6 mt-4 text-white/30 text-xs">
            <span>{(track.view_count ?? 0).toLocaleString()} views</span>
            <span>{(track.download_count ?? 0).toLocaleString()} downloads</span>
          </div>
        </div>

        {/* Download Gate */}
        <DownloadGate
          trackId={track.id}
          gateType={track.gate_type as "social" | "email" | "both"}
          soundcloudUrl={track.soundcloud_url}
          spotifyUrl={track.spotify_url}
          instagramUrl={track.instagram_url}
        />
      </div>

      {/* Ad banner bottom */}
      <div className="w-full bg-white/5 border-t border-white/10 flex items-center justify-center py-8 text-white/20 text-xs tracking-widest mt-12">
        ADVERTISEMENT
        {/* Google AdSense slot goes here */}
      </div>

      <footer className="border-t border-white/10 px-6 py-6 text-center text-white/20 text-xs">
        © {new Date().getFullYear()} IsItABanger · Artists earn revenue from every download page visit
      </footer>
    </div>
  );
}
