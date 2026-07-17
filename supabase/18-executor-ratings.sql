alter table public.executor_profiles
  add column if not exists avatar_url text;

update public.executor_profiles ep
set avatar_url = p.avatar_url
from public.profiles p
where p.id = ep.user_id
  and ep.avatar_url is distinct from p.avatar_url;

create table if not exists public.executor_ratings (
  id uuid primary key default gen_random_uuid(),
  executor_id uuid not null references public.executor_profiles(user_id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint executor_ratings_unique_client unique (executor_id, client_id),
  constraint executor_ratings_not_self check (executor_id <> client_id)
);

create index if not exists executor_ratings_executor_id_idx
  on public.executor_ratings (executor_id);

create index if not exists executor_ratings_client_id_idx
  on public.executor_ratings (client_id);

alter table public.executor_ratings enable row level security;

drop policy if exists "Clients read own executor ratings" on public.executor_ratings;
create policy "Clients read own executor ratings"
  on public.executor_ratings for select
  to authenticated
  using ((select auth.uid()) = client_id);

drop policy if exists "Clients create own executor ratings" on public.executor_ratings;
create policy "Clients create own executor ratings"
  on public.executor_ratings for insert
  to authenticated
  with check (
    (select auth.uid()) = client_id
    and exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'client'
    )
  );

drop policy if exists "Clients update own executor ratings" on public.executor_ratings;
create policy "Clients update own executor ratings"
  on public.executor_ratings for update
  to authenticated
  using ((select auth.uid()) = client_id)
  with check (
    (select auth.uid()) = client_id
    and exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'client'
    )
  );

drop policy if exists "Clients delete own executor ratings" on public.executor_ratings;
create policy "Clients delete own executor ratings"
  on public.executor_ratings for delete
  to authenticated
  using ((select auth.uid()) = client_id);

revoke all on table public.executor_ratings from anon, authenticated;
grant select, insert, update, delete on table public.executor_ratings to authenticated;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.refresh_executor_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_executor_id uuid;
begin
  target_executor_id := coalesce(new.executor_id, old.executor_id);

  update public.executor_profiles ep
  set rating = coalesce(
        (
          select round(avg(er.score)::numeric, 1)
          from public.executor_ratings er
          where er.executor_id = target_executor_id
        ),
        0
      ),
      review_count = (
        select count(*)::integer
        from public.executor_ratings er
        where er.executor_id = target_executor_id
      )
  where ep.user_id = target_executor_id;

  return coalesce(new, old);
end;
$$;

revoke all on function private.refresh_executor_rating() from public, anon, authenticated;

drop trigger if exists executor_ratings_refresh_aggregate on public.executor_ratings;
create trigger executor_ratings_refresh_aggregate
  after insert or update or delete on public.executor_ratings
  for each row execute function private.refresh_executor_rating();

drop trigger if exists executor_ratings_set_updated_at on public.executor_ratings;
create trigger executor_ratings_set_updated_at
  before update on public.executor_ratings
  for each row execute function public.set_updated_at();
