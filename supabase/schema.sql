-- Artists / Users profile (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  paypal_email text,
  total_revenue_cents integer default 0,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Tracks
create table public.tracks (
  id uuid default gen_random_uuid() primary key,
  artist_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  genre text,
  file_path text not null,          -- path in Supabase Storage
  cover_art_path text,
  slug text unique not null,        -- used in the download URL: /track/[slug]
  gate_type text not null check (gate_type in ('social', 'email', 'both')),
  soundcloud_url text,
  spotify_url text,
  instagram_url text,
  download_count integer default 0,
  view_count integer default 0,
  is_published boolean default true,
  created_at timestamptz default now()
);

alter table public.tracks enable row level security;

create policy "Published tracks are viewable by everyone"
  on public.tracks for select using (is_published = true);

create policy "Artists can manage their own tracks"
  on public.tracks for all using (auth.uid() = artist_id);

-- Download gates (records who completed the gate and unlocked a download)
create table public.gate_completions (
  id uuid default gen_random_uuid() primary key,
  track_id uuid references public.tracks(id) on delete cascade not null,
  gate_type text not null check (gate_type in ('social', 'email')),
  email text,
  ip_address text,
  completed_at timestamptz default now()
);

alter table public.gate_completions enable row level security;

create policy "Artists can view gates for their tracks"
  on public.gate_completions for select
  using (
    auth.uid() = (select artist_id from public.tracks where id = track_id)
  );

create policy "Anyone can insert a gate completion"
  on public.gate_completions for insert with check (true);

-- Page views / analytics
create table public.page_views (
  id uuid default gen_random_uuid() primary key,
  track_id uuid references public.tracks(id) on delete cascade not null,
  ip_address text,
  user_agent text,
  viewed_at timestamptz default now()
);

alter table public.page_views enable row level security;

create policy "Artists can view analytics for their tracks"
  on public.page_views for select
  using (
    auth.uid() = (select artist_id from public.tracks where id = track_id)
  );

create policy "Anyone can insert a page view"
  on public.page_views for insert with check (true);

-- Revenue tracking (ad revenue allocated per track per day)
create table public.revenue_entries (
  id uuid default gen_random_uuid() primary key,
  track_id uuid references public.tracks(id) on delete cascade not null,
  artist_id uuid references public.profiles(id) on delete cascade not null,
  amount_cents integer not null,
  date date not null,
  notes text,
  created_at timestamptz default now()
);

alter table public.revenue_entries enable row level security;

create policy "Artists can view their own revenue"
  on public.revenue_entries for select using (auth.uid() = artist_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper RPC functions for incrementing counters atomically
create or replace function increment_view_count(track_id uuid)
returns void as $$
  update public.tracks set view_count = view_count + 1 where id = track_id;
$$ language sql security definer;

create or replace function increment_download_count(track_id uuid)
returns void as $$
  update public.tracks set download_count = download_count + 1 where id = track_id;
$$ language sql security definer;

-- Storage buckets
-- Run in Supabase dashboard: Storage > New Bucket
-- Bucket name: "tracks" (private) — for audio files
-- Bucket name: "covers" (public) — for cover art
