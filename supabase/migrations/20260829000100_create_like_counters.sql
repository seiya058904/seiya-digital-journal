create table public.like_counters (
  target_type text not null,
  target_id text not null,
  count integer not null default 0,
  primary key (target_type, target_id),
  constraint like_counters_count_check check (count >= 0),
  constraint like_counters_target_type_length_check check (char_length(target_type) between 1 and 50),
  constraint like_counters_target_id_length_check check (char_length(target_id) between 1 and 120)
);

insert into public.like_counters (target_type, target_id)
values ('archive', 'archive-stepper');

alter table public.like_counters enable row level security;
revoke all on public.like_counters from anon, authenticated;

create or replace function public.increment_like_counter(p_target_type text, p_target_id text)
returns table (count integer)
language sql
security definer
set search_path = public
as $$
  update public.like_counters
  set count = like_counters.count + 1
  where target_type = p_target_type and target_id = p_target_id
  returning like_counters.count;
$$;

revoke execute on function public.increment_like_counter(text, text) from public, anon, authenticated;
grant execute on function public.increment_like_counter(text, text) to service_role;
