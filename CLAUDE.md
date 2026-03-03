# IsItABanger — CLAUDE.md

## What This Is
Music download gate platform (similar to hypeddit.com). Artists upload tracks, fans complete a gate (social follow and/or email) to download for free. Artists earn a share of ad revenue from their download page visits.

## Repo
https://github.com/UBFSJARVIS/isitabanger.com

## Tech Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Database + Auth + Storage**: Supabase
- **Hosting**: Railway
- **Ads**: Google AdSense (slots in track/[slug]/page.tsx, to be wired up)

## Key Files
- `src/app/page.tsx` — marketing homepage
- `src/app/login/page.tsx` — artist login
- `src/app/signup/page.tsx` — artist signup
- `src/app/dashboard/page.tsx` — artist dashboard (stats, track list)
- `src/app/dashboard/upload/page.tsx` — upload a new track
- `src/app/track/[slug]/page.tsx` — public download gate page (fan-facing)
- `src/components/DownloadGate.tsx` — the gate UI (social follow + email)
- `src/app/api/gate/route.ts` — POST: record gate completion
- `src/app/api/download/[trackId]/route.ts` — POST: generate signed download URL
- `src/app/api/auth/logout/route.ts` — POST: sign out
- `src/lib/supabase/client.ts` — browser Supabase client
- `src/lib/supabase/server.ts` — server Supabase client
- `src/middleware.ts` — protects /dashboard routes
- `supabase/schema.sql` — full DB schema + RPC functions

## Supabase Setup Required
1. Create project at supabase.com
2. Run `supabase/schema.sql` in the SQL editor
3. Create Storage buckets:
   - `tracks` (private) — audio files
   - `covers` (public) — cover art
4. Fill in `.env.local` with project URL and keys

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=https://isitabanger.com
```

## Build & Dev
```bash
npm run dev     # local dev
npm run build   # production build
```

## Revenue Model
- Google AdSense ads shown on every track download page
- Artists get a % of ad revenue based on their page's share of total views
- Revenue tracked in `revenue_entries` table, shown in artist dashboard
- PayPal email collected in artist profile for payouts

## Color Scheme
- Background: black (#000)
- Accent: orange (#f97316 / orange-500)
- Cards: white/5 opacity

## TODO / Next Steps
- Wire up Google AdSense publisher ID
- Build revenue calculation + payout logic
- Add email list export for artists (from gate_completions)
- Add track editing / unpublish
- Add artist public profile page (/artist/[username])
- Add charts / trending tracks page
