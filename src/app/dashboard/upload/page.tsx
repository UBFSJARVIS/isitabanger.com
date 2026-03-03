"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Upload, Music, ArrowLeft } from "lucide-react";

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60) +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [gateType, setGateType] = useState<"social" | "email" | "both">("both");
  const [soundcloudUrl, setSoundcloudUrl] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!audioFile) {
      setError("Please select an audio file.");
      return;
    }

    setUploading(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const slug = generateSlug(title);

    try {
      // Upload audio
      setProgress("Uploading audio file...");
      const audioPath = `${user.id}/${slug}/audio${audioFile.name.slice(audioFile.name.lastIndexOf("."))}`;
      const { error: audioError } = await supabase.storage
        .from("tracks")
        .upload(audioPath, audioFile);
      if (audioError) throw audioError;

      // Upload cover art (optional)
      let coverPath = null;
      if (coverFile) {
        setProgress("Uploading cover art...");
        coverPath = `${user.id}/${slug}/cover${coverFile.name.slice(coverFile.name.lastIndexOf("."))}`;
        const { error: coverError } = await supabase.storage
          .from("covers")
          .upload(coverPath, coverFile);
        if (coverError) throw coverError;
      }

      // Insert track record
      setProgress("Saving track...");
      const { error: dbError } = await supabase.from("tracks").insert({
        artist_id: user.id,
        title,
        description,
        genre,
        file_path: audioPath,
        cover_art_path: coverPath,
        slug,
        gate_type: gateType,
        soundcloud_url: soundcloudUrl || null,
        spotify_url: spotifyUrl || null,
        instagram_url: instagramUrl || null,
      });
      if (dbError) throw dbError;

      router.push(`/track/${slug}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed. Please try again.";
      setError(message);
      setUploading(false);
      setProgress("");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link href="/" className="text-xl font-bold text-orange-400">
          IsItABanger
        </Link>
        <Link href="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">Upload a Track</h1>
        <p className="text-white/40 text-sm mb-8">Fill in your track details and set up your download gate.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Audio upload */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Audio File *</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 hover:border-orange-500/50 rounded-xl p-8 cursor-pointer transition-colors">
              <Music className="w-8 h-8 text-white/30 mb-2" />
              <span className="text-white/50 text-sm">
                {audioFile ? audioFile.name : "Click to upload MP3, WAV, or FLAC"}
              </span>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {/* Cover art */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Cover Art (optional)</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 hover:border-orange-500/50 rounded-xl p-6 cursor-pointer transition-colors">
              <Upload className="w-6 h-6 text-white/30 mb-2" />
              <span className="text-white/50 text-sm">
                {coverFile ? coverFile.name : "JPG or PNG, square recommended"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {/* Track info */}
          <div>
            <label className="block text-sm text-white/60 mb-1">Track Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
              placeholder="My Hardest Track"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">Genre</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                placeholder="Hip-Hop, Trap, House..."
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Download Gate *</label>
              <select
                value={gateType}
                onChange={(e) => setGateType(e.target.value as "social" | "email" | "both")}
                className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
              >
                <option value="social">Social Follow</option>
                <option value="email">Email Signup</option>
                <option value="both">Both (Recommended)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 resize-none"
              placeholder="Tell fans about this track..."
            />
          </div>

          {/* Social links */}
          <div className="space-y-3">
            <p className="text-sm text-white/60">Social Links (for follow gate)</p>
            <input
              type="url"
              value={soundcloudUrl}
              onChange={(e) => setSoundcloudUrl(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
              placeholder="SoundCloud profile URL"
            />
            <input
              type="url"
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
              placeholder="Spotify artist URL"
            />
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
              placeholder="Instagram profile URL"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {uploading ? progress || "Uploading..." : "Publish Track"}
          </button>
        </form>
      </div>
    </div>
  );
}
