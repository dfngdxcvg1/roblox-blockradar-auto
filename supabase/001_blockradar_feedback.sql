create extension if not exists pgcrypto;

create table if not exists public.blockradar_feedback (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (char_length(scope) between 3 and 180),
  value text not null check (value in ('accurate', 'too-low', 'too-high', 'helpful', 'not-helpful', 'worked', 'expired', 'outdated', 'cleared')),
  page text not null check (char_length(page) between 1 and 240),
  session_id text not null check (char_length(session_id) between 8 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, scope)
);

create index if not exists blockradar_feedback_updated_at_idx
  on public.blockradar_feedback (updated_at desc);

create index if not exists blockradar_feedback_scope_idx
  on public.blockradar_feedback (scope, value);

alter table public.blockradar_feedback enable row level security;
revoke all on public.blockradar_feedback from anon, authenticated;

create or replace function public.submit_blockradar_feedback(
  p_scope text,
  p_value text,
  p_page text,
  p_session_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if char_length(p_scope) not between 3 and 180
    or p_scope !~ '^[A-Za-z0-9:_-]+$'
    or p_value not in ('accurate', 'too-low', 'too-high', 'helpful', 'not-helpful', 'worked', 'expired', 'outdated', 'cleared')
    or char_length(p_page) not between 1 and 240
    or left(p_page, 1) <> '/'
    or char_length(p_session_id) not between 8 and 80
    or p_session_id !~ '^[A-Za-z0-9_-]+$'
  then
    raise exception 'Invalid feedback payload';
  end if;

  insert into public.blockradar_feedback (scope, value, page, session_id)
  values (p_scope, p_value, p_page, p_session_id)
  on conflict (session_id, scope) do update
    set value = excluded.value,
        page = excluded.page,
        updated_at = now();
end;
$$;

revoke all on function public.submit_blockradar_feedback(text, text, text, text) from public;
grant execute on function public.submit_blockradar_feedback(text, text, text, text) to anon, authenticated;
