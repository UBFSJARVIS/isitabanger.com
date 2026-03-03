import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Music, Upload, Eye, Download, DollarSign, LogOut } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch artist profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch tracks with stats
  const { data: tracks } = await supabase
    .from("tracks")
    .select("id, title, slug, view_count, download_count, created_at, is_published, cover_art_path")
    .eq("artist_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch revenue
  const { data: revenue } = await supabase
    .from("revenue_entries")
    .select("amount_cents")
    .eq("artist_id", user.id);

  const totalRevenueCents = revenue?.reduce((sum, r) => sum + r.amount_cents, 0) ?? 0;
  const totalViews = tracks?.reduce((sum, t) => sum + (t.view_count ?? 0), 0) ?? 0;
  const totalDownloads = tracks?.reduce((sum, t) => sum + (t.download_count ?? 0), 0) ?? 0;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link href="/" className="text-xl font-bold text-orange-400">
          IsItABanger
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/50">{profile?.display_name ?? user.email}</span>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-white/40 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your Dashboard</h1>
            <p className="text-white/40 text-sm mt-1">Manage your tracks and track your earnings</p>
          </div>
          <Link
            href="/dashboard/upload"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Track
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 text-white/40 text-sm mb-2">
              <Eye className="w-4 h-4" /> Page Views
            </div>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 text-white/40 text-sm mb-2">
              <Download className="w-4 h-4" /> Downloads
            </div>
            <div className="text-2xl font-bold">{totalDownloads.toLocaleString()}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 text-white/40 text-sm mb-2">
              <DollarSign className="w-4 h-4" /> Revenue Earned
            </div>
            <div className="text-2xl font-bold text-orange-400">
              ${(totalRevenueCents / 100).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Tracks */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Your Tracks</h2>

          {!tracks || tracks.length === 0 ? (
            <div className="bg-white/5 rounded-2xl p-12 text-center">
              <Music className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 mb-4">No tracks yet. Upload your first track to get started.</p>
              <Link
                href="/dashboard/upload"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Your First Track
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center gap-4 bg-white/5 hover:bg-white/8 rounded-xl p-4 transition-colors"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Music className="w-5 h-5 text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{track.title}</div>
                    <div className="text-white/40 text-sm">
                      {new Date(track.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-white/50">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> {track.view_count ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" /> {track.download_count ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        track.is_published
                          ? "bg-green-500/10 text-green-400"
                          : "bg-white/10 text-white/40"
                      }`}
                    >
                      {track.is_published ? "Live" : "Draft"}
                    </span>
                    <Link
                      href={`/track/${track.slug}`}
                      target="_blank"
                      className="text-xs text-orange-400 hover:text-orange-300 underline"
                    >
                      View Page
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
