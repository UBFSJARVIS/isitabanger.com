import Link from "next/link";
import { Music, Download, DollarSign, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <span className="text-xl font-bold text-orange-400">IsItABanger</span>
        <div className="flex gap-4">
          <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-full transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold leading-tight mb-6">
          Share Your Music.<br />
          <span className="text-orange-400">Get Paid.</span>
        </h1>
        <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
          Upload your tracks, set a download gate, and earn a share of ad revenue every time
          a fan visits your download page. Built for independent artists.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/signup"
            className="bg-orange-500 hover:bg-orange-400 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors"
          >
            Upload Your First Track
          </Link>
          <Link
            href="#how-it-works"
            className="border border-white/20 hover:border-white/40 text-white px-8 py-3 rounded-full text-lg transition-colors"
          >
            How It Works
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-14">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/5 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Music className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">1. Upload Your Track</h3>
            <p className="text-white/50 text-sm">
              Upload your audio file, add cover art, and fill in the details. Takes under 2 minutes.
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">2. Set Your Gate</h3>
            <p className="text-white/50 text-sm">
              Require fans to follow you on SoundCloud, leave their email, or both — before they can download.
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">3. Earn Revenue</h3>
            <p className="text-white/50 text-sm">
              We run ads on your download page and share the revenue with you. Every visit counts.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 py-20 text-center px-6">
        <h2 className="text-3xl font-bold mb-4">Ready to share your music?</h2>
        <p className="text-white/50 mb-8">Free to start. No credit card required.</p>
        <Link
          href="/signup"
          className="bg-orange-500 hover:bg-orange-400 text-white px-10 py-3 rounded-full text-lg font-semibold transition-colors"
        >
          Create Your Free Account
        </Link>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-white/30 text-sm">
        © {new Date().getFullYear()} IsItABanger. All rights reserved.
      </footer>
    </div>
  );
}
