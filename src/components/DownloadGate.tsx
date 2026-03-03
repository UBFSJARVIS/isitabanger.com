"use client";

import { useState } from "react";
import { Download, ExternalLink, Mail, CheckCircle } from "lucide-react";

interface Props {
  trackId: string;
  gateType: "social" | "email" | "both";
  soundcloudUrl?: string | null;
  spotifyUrl?: string | null;
  instagramUrl?: string | null;
}

export default function DownloadGate({
  trackId,
  gateType,
  soundcloudUrl,
  spotifyUrl,
  instagramUrl,
}: Props) {
  const [email, setEmail] = useState("");
  const [socialDone, setSocialDone] = useState(false);
  const [emailDone, setEmailDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const needsSocial = gateType === "social" || gateType === "both";
  const needsEmail = gateType === "email" || gateType === "both";

  const socialLinks = [
    soundcloudUrl && { label: "Follow on SoundCloud", url: soundcloudUrl, color: "bg-orange-600 hover:bg-orange-500" },
    spotifyUrl && { label: "Follow on Spotify", url: spotifyUrl, color: "bg-green-600 hover:bg-green-500" },
    instagramUrl && { label: "Follow on Instagram", url: instagramUrl, color: "bg-pink-600 hover:bg-pink-500" },
  ].filter(Boolean) as { label: string; url: string; color: string }[];

  const canDownload =
    (!needsSocial || socialDone) && (!needsEmail || emailDone);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/gate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId, gateType: "email", email }),
    });

    if (!res.ok) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    setEmailDone(true);
    setSubmitting(false);
  }

  async function handleDownload() {
    const res = await fetch(`/api/download/${trackId}`, { method: "POST" });
    if (!res.ok) {
      setError("Download failed. Please try again.");
      return;
    }
    const { url } = await res.json();
    const a = document.createElement("a");
    a.href = url;
    a.download = "";
    a.click();
  }

  return (
    <div className="bg-white/5 rounded-2xl p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-1">Get Your Free Download</h2>
        <p className="text-white/40 text-sm">
          {gateType === "both"
            ? "Follow the artist and enter your email to unlock the download."
            : gateType === "social"
            ? "Follow the artist to unlock the download."
            : "Enter your email to unlock the download."}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg text-center">
          {error}
        </div>
      )}

      {/* Step 1: Social follows */}
      {needsSocial && (
        <div className={`space-y-3 ${socialDone ? "opacity-60" : ""}`}>
          <div className="flex items-center gap-2 text-sm font-medium">
            {socialDone ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <span className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center text-xs">1</span>
            )}
            <span>{socialDone ? "Followed!" : "Follow the artist"}</span>
          </div>

          {!socialDone && (
            <>
              <div className="space-y-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between w-full ${link.color} text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors`}
                  >
                    {link.label}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ))}
              </div>
              <button
                onClick={() => setSocialDone(true)}
                className="w-full text-sm text-white/40 hover:text-white border border-white/10 hover:border-white/20 py-2 rounded-lg transition-colors"
              >
                I&apos;ve followed ✓
              </button>
            </>
          )}
        </div>
      )}

      {/* Step 2: Email */}
      {needsEmail && (
        <div className={`space-y-3 ${emailDone ? "opacity-60" : ""}`}>
          <div className="flex items-center gap-2 text-sm font-medium">
            {emailDone ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <span className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center text-xs">
                {needsSocial ? "2" : "1"}
              </span>
            )}
            <span>{emailDone ? "Email saved!" : "Enter your email"}</span>
          </div>

          {!emailDone && (
            <form onSubmit={handleEmailSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-lg pl-9 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-sm"
                  placeholder="your@email.com"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white px-4 py-3 rounded-lg text-sm transition-colors"
              >
                {submitting ? "..." : "Submit"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={!canDownload}
        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-30 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-colors"
      >
        <Download className="w-5 h-5" />
        Download Free
      </button>

      {!canDownload && (
        <p className="text-center text-white/30 text-xs">
          Complete the step{gateType === "both" ? "s" : ""} above to unlock your download
        </p>
      )}
    </div>
  );
}
