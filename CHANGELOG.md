# Changelog

## 2026-03-02 — Initial Build

- Scaffolded Next.js 14 (App Router, TypeScript, Tailwind) project
- Set up Supabase client (browser + server), middleware for auth protection
- Built marketing homepage with hero, how-it-works, and CTA sections
- Artist auth: login + signup pages (Supabase Auth)
- Artist dashboard: track list, view/download/revenue stats, upload CTA
- Track upload page: audio file upload, cover art, gate type selection, social links
- Public download gate page (`/track/[slug]`): cover art, track info, ad slots, gate UI
- `DownloadGate` component: social follow step + email step + download button
- API routes: gate completion, signed download URL, logout
- Supabase schema: `profiles`, `tracks`, `gate_completions`, `page_views`, `revenue_entries`, RPC functions
- `CLAUDE.md` with full project context and TODO list
