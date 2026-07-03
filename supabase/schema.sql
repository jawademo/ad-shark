# ── profiles ─────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

# ── scores ───────────────────────────────────────────────────
create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  username text not null,
  mode text not null default 'classic',
  score bigint not null,
  balance bigint not null,
  rounds_played int default 5,
  created_at timestamptz default now()
);

create index if not exists idx_scores_score on public.scores (score desc);
create index if not exists idx_scores_created on public.scores (created_at desc);

# ── plays (simple analytics) ────────────────────────────────
create table if not exists public.plays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  session_id text,
  mode text,
  completed boolean default false,
  final_balance bigint,
  created_at timestamptz default now()
);

create index if not exists idx_plays_created on public.plays (created_at desc);

# ── RLS Policies ─────────────────────────────────────────────
alter table public.scores enable row level security;
alter table public.plays enable row level security;

# Anyone can read leaderboard scores
create policy "Scores are publicly readable" on public.scores
  for select using (true);

# Users can insert their own scores
create policy "Users insert own scores" on public.scores
  for insert with check (auth.uid() = user_id);

# Anyone can insert plays (anonymous ok)
create policy "Anyone can insert plays" on public.plays
  for insert with check (true);

# Anyone can read plays count (for "X sharks played today")
create policy "Plays are publicly readable" on public.plays
  for select using (true);
