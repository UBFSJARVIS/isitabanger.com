# IsItABanger

A music download gate platform for independent artists. Upload your tracks, set a download gate (social follow or email), and earn a share of ad revenue from every fan visit.

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (auth, database, file storage)
- Railway (hosting)

## Getting Started

1. Clone the repo
2. Create a Supabase project and run `supabase/schema.sql`
3. Create Storage buckets: `tracks` (private) and `covers` (public)
4. Copy `.env.local` and fill in your Supabase credentials
5. `npm install && npm run dev`

See `CLAUDE.md` for full project context.
