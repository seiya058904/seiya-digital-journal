create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_check check (char_length(btrim(display_name)) between 1 and 80),
  constraint profiles_avatar_key_check check (avatar_key ~ '^avatar-[0-9]{2}$')
);

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;

create or replace function public.sync_comment_author_name_from_profile()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.display_name is distinct from old.display_name then
    update public.comments
    set
      author_name = new.display_name,
      updated_at = now()
    where user_id = new.user_id
      and author_name is distinct from new.display_name;
  end if;

  return new;
end;
$$;

create trigger profiles_sync_comment_author_name
after update of display_name on public.profiles
for each row
execute function public.sync_comment_author_name_from_profile();
