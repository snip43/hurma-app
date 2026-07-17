alter table public.executor_ratings
  add column if not exists request_id uuid;

alter table public.executor_ratings
  drop constraint if exists executor_ratings_unique_client;

alter table public.executor_ratings
  drop constraint if exists executor_ratings_request_id_fkey;

alter table public.executor_ratings
  add constraint executor_ratings_request_id_fkey
  foreign key (request_id) references public.requests(id) on delete cascade;

alter table public.executor_ratings
  alter column request_id set not null;

alter table public.executor_ratings
  drop constraint if exists executor_ratings_unique_request;

alter table public.executor_ratings
  add constraint executor_ratings_unique_request unique (request_id);

create index if not exists executor_ratings_request_id_idx
  on public.executor_ratings (request_id);

create unique index if not exists requests_one_active_executor_per_client_idx
  on public.requests (client_id, executor_id)
  where executor_id is not null
    and status in ('new', 'accepted');

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.validate_executor_rating_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE'
     and (
       new.request_id is distinct from old.request_id
       or new.executor_id is distinct from old.executor_id
       or new.client_id is distinct from old.client_id
     ) then
    raise exception 'Rating trip cannot be changed'
      using errcode = '23514';
  end if;

  if not exists (
    select 1
    from public.requests r
    where r.id = new.request_id
      and r.client_id = new.client_id
      and r.executor_id = new.executor_id
      and r.status = 'completed'
  ) then
    raise exception 'Only a completed trip can be rated'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_executor_rating_request()
  from public, anon, authenticated;

drop trigger if exists executor_ratings_validate_request
  on public.executor_ratings;

create trigger executor_ratings_validate_request
  before insert or update on public.executor_ratings
  for each row execute function private.validate_executor_rating_request();

drop policy if exists "Clients create own executor ratings"
  on public.executor_ratings;

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
    and exists (
      select 1
      from public.requests r
      where r.id = request_id
        and r.client_id = (select auth.uid())
        and r.executor_id = executor_id
        and r.status = 'completed'
    )
  );

drop policy if exists "Clients update own executor ratings"
  on public.executor_ratings;

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
    and exists (
      select 1
      from public.requests r
      where r.id = request_id
        and r.client_id = (select auth.uid())
        and r.executor_id = executor_id
        and r.status = 'completed'
    )
  );
