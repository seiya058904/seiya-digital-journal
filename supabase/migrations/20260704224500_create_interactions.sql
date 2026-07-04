create table public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  target_type text not null,
  target_id text not null,
  body text not null,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comments_author_name_length_check check (char_length(author_name) between 1 and 80),
  constraint comments_target_type_length_check check (char_length(target_type) between 1 and 50),
  constraint comments_target_id_length_check check (char_length(target_id) between 1 and 120),
  constraint comments_body_length_check check (char_length(btrim(body)) between 1 and 500),
  constraint comments_status_check check (status in ('published', 'hidden'))
);

create index comments_target_created_at_idx
  on public.comments (target_type, target_id, created_at desc);

create index comments_user_created_at_idx
  on public.comments (user_id, created_at desc);

alter table public.comments enable row level security;
revoke all on public.comments from anon, authenticated;

create table public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null,
  target_id text not null,
  created_at timestamptz not null default now(),
  constraint likes_target_type_length_check check (char_length(target_type) between 1 and 50),
  constraint likes_target_id_length_check check (char_length(target_id) between 1 and 120),
  constraint likes_user_target_unique unique (user_id, target_type, target_id)
);

create index likes_target_idx
  on public.likes (target_type, target_id);

alter table public.likes enable row level security;
revoke all on public.likes from anon, authenticated;
