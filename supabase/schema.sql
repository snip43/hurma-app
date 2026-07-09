begin;

create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('client', 'executor');
exception when duplicate_object then null;
end;
$$;

do $$ begin
  create type public.subscription_status as enum ('trial', 'active', 'past_due', 'cancelled', 'expired');
exception when duplicate_object then null;
end;
$$;

do $$ begin
  create type public.service_category as enum ('transfer', 'cleaning');
exception when duplicate_object then null;
end;
$$;

do $$ begin
  create type public.event_type as enum ('general', 'sport', 'kids');
exception when duplicate_object then null;
end;
$$;

do $$ begin
  create type public.request_status as enum ('new', 'accepted', 'declined', 'cancelled', 'completed');
exception when duplicate_object then null;
end;
$$;

do $$ begin
  create type public.conversation_type as enum ('direct', 'community', 'news');
exception when duplicate_object then null;
end;
$$;

do $$ begin
  create type public.member_role as enum ('member', 'admin', 'owner');
exception when duplicate_object then null;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  role public.user_role not null default 'client',
  city text not null default 'Хургада',
  search_area text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  status public.subscription_status not null default 'trial',
  plan_code text not null default 'trial',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  auto_renew boolean not null default false,
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_date_order check (ends_at is null or ends_at > starts_at)
);

create table if not exists public.executor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  category public.service_category not null,
  headline text not null check (char_length(headline) between 5 and 140),
  bio text not null default '',
  city text not null default 'Хургада',
  service_area text,
  price_from numeric(10, 2) check (price_from is null or price_from >= 0),
  currency char(3) not null default 'USD',
  languages text[] not null default '{}',
  tags text[] not null default '{}',
  rating numeric(2, 1) not null default 0 check (rating between 0 and 5),
  review_count integer not null default 0 check (review_count >= 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 160),
  description text not null default '',
  event_type public.event_type not null default 'general',
  sport text,
  age_limit smallint check (age_limit is null or age_limit between 0 and 18),
  city text not null default 'Хургада',
  area text not null,
  location_name text not null,
  map_url text,
  starts_at timestamptz not null,
  request_enabled boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  executor_id uuid references public.executor_profiles(user_id) on delete set null,
  event_id uuid references public.events(id) on delete set null,
  comment text not null default '',
  status public.request_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint requests_single_target check (
    (executor_id is not null and event_id is null)
    or (executor_id is null and event_id is not null)
  )
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  conversation_type public.conversation_type not null,
  title text,
  subtitle text,
  created_by uuid references public.profiles(id) on delete set null,
  is_readonly boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_role public.member_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_active_idx
  on public.subscriptions(user_id, ends_at)
  where status in ('trial', 'active');
create index if not exists executor_profiles_user_id_idx on public.executor_profiles(user_id);
create index if not exists executor_profiles_catalog_idx
  on public.executor_profiles(category, city, service_area)
  where is_published = true;
create index if not exists events_catalog_idx
  on public.events(city, area, event_type, starts_at)
  where is_published = true;
create index if not exists requests_client_id_idx on public.requests(client_id, created_at desc);
create index if not exists requests_executor_id_idx on public.requests(executor_id, created_at desc);
create index if not exists requests_event_id_idx on public.requests(event_id);
create index if not exists conversations_created_by_idx on public.conversations(created_by);
create index if not exists conversation_members_user_id_idx
  on public.conversation_members(user_id, conversation_id);
create index if not exists messages_conversation_created_idx
  on public.messages(conversation_id, created_at);
create index if not exists messages_sender_id_idx on public.messages(sender_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_role public.user_role;
  selected_name text;
begin
  selected_role :=
    case
      when new.raw_user_meta_data ->> 'role' = 'executor' then 'executor'::public.user_role
      else 'client'::public.user_role
    end;

  selected_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    split_part(coalesce(new.email, 'Пользователь'), '@', 1)
  );

  insert into public.profiles (id, display_name, role, city, search_area)
  values (
    new.id,
    selected_name,
    selected_role,
    coalesce(nullif(new.raw_user_meta_data ->> 'city', ''), 'Хургада'),
    nullif(new.raw_user_meta_data ->> 'search_area', '')
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (
    user_id,
    status,
    plan_code,
    starts_at,
    ends_at,
    auto_renew
  )
  values (
    new.id,
    'trial',
    'trial-14-days',
    now(),
    now() + interval '14 days',
    false
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create or replace function public.has_active_subscription(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.subscriptions s
    where s.user_id = check_user_id
      and s.status in ('trial', 'active')
      and s.starts_at <= now()
      and (s.ends_at is null or s.ends_at > now())
  );
$$;

create or replace function public.user_email_exists(check_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    where lower(u.email) = lower(btrim(check_email))
  );
$$;

create or replace function public.is_conversation_member(check_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = check_conversation_id
      and cm.user_id = (select auth.uid())
  );
$$;

create or replace function public.can_send_message(check_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversation_members cm
    join public.conversations c on c.id = cm.conversation_id
    where cm.conversation_id = check_conversation_id
      and cm.user_id = (select auth.uid())
      and (
        c.is_readonly = false
        or cm.member_role in ('admin', 'owner')
      )
  );
$$;

create or replace function public.is_conversation_creator(check_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversations c
    where c.id = check_conversation_id
      and c.created_by = (select auth.uid())
  );
$$;

create or replace function public.create_direct_conversation(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  existing_conversation_id uuid;
  new_conversation_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if other_user_id is null or other_user_id = current_user_id then
    raise exception 'Choose another user';
  end if;

  if not public.has_active_subscription(current_user_id) then
    raise exception 'Active subscription required';
  end if;

  if not exists (select 1 from public.profiles p where p.id = other_user_id) then
    raise exception 'User not found';
  end if;

  select c.id
    into existing_conversation_id
  from public.conversations c
  join public.conversation_members own_member
    on own_member.conversation_id = c.id
    and own_member.user_id = current_user_id
  join public.conversation_members other_member
    on other_member.conversation_id = c.id
    and other_member.user_id = other_user_id
  where c.conversation_type = 'direct'
  limit 1;

  if existing_conversation_id is not null then
    return existing_conversation_id;
  end if;

  insert into public.conversations (
    conversation_type,
    created_by,
    is_readonly
  )
  values (
    'direct',
    current_user_id,
    false
  )
  returning id into new_conversation_id;

  insert into public.conversation_members (conversation_id, user_id, member_role)
  values
    (new_conversation_id, current_user_id, 'owner'),
    (new_conversation_id, other_user_id, 'member');

  return new_conversation_id;
end;
$$;

create or replace function public.send_chat_message(
  target_conversation_id uuid,
  message_body text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  clean_body text := nullif(trim(message_body), '');
  inserted_message public.messages%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if target_conversation_id is null then
    raise exception 'Conversation required';
  end if;

  if clean_body is null then
    raise exception 'Message is empty';
  end if;

  if not public.has_active_subscription(current_user_id) then
    raise exception 'Active subscription required';
  end if;

  if not public.can_send_message(target_conversation_id) then
    raise exception 'Cannot send message to this conversation';
  end if;

  insert into public.messages (conversation_id, sender_id, body)
  values (target_conversation_id, current_user_id, clean_body)
  returning * into inserted_message;

  update public.conversations
  set updated_at = inserted_message.created_at
  where id = target_conversation_id;

  return jsonb_build_object(
    'id', inserted_message.id,
    'conversation_id', inserted_message.conversation_id,
    'sender_id', inserted_message.sender_id,
    'body', inserted_message.body,
    'created_at', inserted_message.created_at
  );
end;
$$;

create or replace function public.cancel_own_request(request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.requests
  set status = 'cancelled', updated_at = now()
  where id = request_id
    and client_id = (select auth.uid())
    and status = 'new';

  if not found then
    raise exception 'Request cannot be cancelled';
  end if;
end;
$$;

create or replace function public.set_executor_request_status(
  request_id uuid,
  next_status public.request_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if next_status not in ('accepted', 'declined', 'completed') then
    raise exception 'Unsupported request status';
  end if;

  update public.requests
  set status = next_status, updated_at = now()
  where id = request_id
    and executor_id = (select auth.uid())
    and (
      (status = 'new' and next_status in ('accepted', 'declined'))
      or (status = 'accepted' and next_status = 'completed')
    );

  if not found then
    raise exception 'Request status cannot be changed';
  end if;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

drop trigger if exists executor_profiles_set_updated_at on public.executor_profiles;
create trigger executor_profiles_set_updated_at
  before update on public.executor_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

drop trigger if exists requests_set_updated_at on public.requests;
create trigger requests_set_updated_at
  before update on public.requests
  for each row execute function public.set_updated_at();

drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.executor_profiles enable row level security;
alter table public.events enable row level security;
alter table public.requests enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

drop policy if exists "Authenticated users read profiles" on public.profiles;
create policy "Authenticated users read profiles"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users read own subscription" on public.subscriptions;
create policy "Users read own subscription"
  on public.subscriptions for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Published executors are public" on public.executor_profiles;
create policy "Published executors are public"
  on public.executor_profiles for select
  to anon, authenticated
  using (is_published = true or (select auth.uid()) = user_id);

drop policy if exists "Executors create own profile" on public.executor_profiles;
create policy "Executors create own profile"
  on public.executor_profiles for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'executor'
    )
  );

drop policy if exists "Executors update own profile" on public.executor_profiles;
create policy "Executors update own profile"
  on public.executor_profiles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Executors delete own profile" on public.executor_profiles;
create policy "Executors delete own profile"
  on public.executor_profiles for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Published events are public" on public.events;
create policy "Published events are public"
  on public.events for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "Users read related requests" on public.requests;
create policy "Users read related requests"
  on public.requests for select
  to authenticated
  using (
    client_id = (select auth.uid())
    or executor_id = (select auth.uid())
  );

drop policy if exists "Clients create own requests" on public.requests;
create policy "Clients create own requests"
  on public.requests for insert
  to authenticated
  with check (
    client_id = (select auth.uid())
    and status = 'new'
    and (select public.has_active_subscription((select auth.uid())))
  );

drop policy if exists "Members read conversations" on public.conversations;
create policy "Members read conversations"
  on public.conversations for select
  to authenticated
  using ((select public.is_conversation_member(id)));

drop policy if exists "Subscribed users create conversations" on public.conversations;
create policy "Subscribed users create conversations"
  on public.conversations for insert
  to authenticated
  with check (
    created_by = (select auth.uid())
    and (select public.has_active_subscription((select auth.uid())))
  );

drop policy if exists "Members read memberships" on public.conversation_members;
create policy "Members read memberships"
  on public.conversation_members for select
  to authenticated
  using ((select public.is_conversation_member(conversation_id)));

drop policy if exists "Conversation creators add members" on public.conversation_members;
create policy "Conversation creators add members"
  on public.conversation_members for insert
  to authenticated
  with check (
    (select public.is_conversation_creator(conversation_id))
  );

drop policy if exists "Members leave conversations" on public.conversation_members;
create policy "Members leave conversations"
  on public.conversation_members for delete
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Members read messages" on public.messages;
create policy "Members read messages"
  on public.messages for select
  to authenticated
  using ((select public.is_conversation_member(conversation_id)));

drop policy if exists "Members send messages" on public.messages;
create policy "Members send messages"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = (select auth.uid())
    and (select public.has_active_subscription((select auth.uid())))
    and (select public.can_send_message(conversation_id))
  );

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.subscriptions from anon, authenticated;
revoke all on table public.executor_profiles from anon, authenticated;
revoke all on table public.events from anon, authenticated;
revoke all on table public.requests from anon, authenticated;
revoke all on table public.conversations from anon, authenticated;
revoke all on table public.conversation_members from anon, authenticated;
revoke all on table public.messages from anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.executor_profiles, public.events to anon;
grant select on public.profiles, public.subscriptions, public.executor_profiles, public.events,
  public.requests, public.conversations, public.conversation_members, public.messages to authenticated;
grant update (display_name, city, search_area, avatar_url) on public.profiles to authenticated;
grant insert, update, delete on public.executor_profiles to authenticated;
grant insert on public.requests to authenticated;
grant insert on public.conversations to authenticated;
grant insert, delete on public.conversation_members to authenticated;
grant insert on public.messages to authenticated;
grant execute on function public.create_direct_conversation(uuid) to authenticated;
grant execute on function public.send_chat_message(uuid, text) to authenticated;

revoke all on function public.has_active_subscription(uuid) from public;
revoke all on function public.user_email_exists(text) from public;
revoke all on function public.is_conversation_member(uuid) from public;
revoke all on function public.can_send_message(uuid) from public;
revoke all on function public.is_conversation_creator(uuid) from public;
revoke all on function public.cancel_own_request(uuid) from public;
revoke all on function public.set_executor_request_status(uuid, public.request_status) from public;

grant execute on function public.has_active_subscription(uuid) to authenticated;
grant execute on function public.user_email_exists(text) to anon, authenticated;
grant execute on function public.is_conversation_member(uuid) to authenticated;
grant execute on function public.can_send_message(uuid) to authenticated;
grant execute on function public.is_conversation_creator(uuid) to authenticated;
grant execute on function public.send_chat_message(uuid, text) to authenticated;
grant execute on function public.cancel_own_request(uuid) to authenticated;
grant execute on function public.set_executor_request_status(uuid, public.request_status) to authenticated;

insert into public.events (
  id, title, description, event_type, sport, age_limit, city, area,
  location_name, map_url, starts_at, request_enabled, is_published
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'Вечерняя прогулка по Marina Hurghada',
    'Набережная, кафе, закат и спокойный маршрут для первого знакомства с городом.',
    'general', null, null, 'Хургада', 'Marina', 'Hurghada Marina',
    'https://www.google.com/maps/search/?api=1&query=Hurghada%20Marina',
    date_trunc('day', now()) + interval '19 hours 30 minutes',
    false, true
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Снорклинг на островах',
    'Морская программа на день: трансфер, лодка, остановки у рифов и отдых на пляже.',
    'general', null, null, 'Хургада', 'Marina', 'New Marina Hurghada',
    'https://www.google.com/maps/search/?api=1&query=New%20Marina%20Hurghada',
    date_trunc('day', now()) + interval '1 day 9 hours',
    true, true
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'Семейная афиша на выходные',
    'Подборка мест для детей и взрослых: шоу, прогулки, рестораны и спокойные локации.',
    'kids', null, 6, 'Хургада', 'Mamsha', 'Hurghada Mamsha Promenade',
    'https://www.google.com/maps/search/?api=1&query=Hurghada%20Mamsha%20Promenade',
    date_trunc('week', now()) + interval '5 days 17 hours',
    false, true
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'Утренняя йога у моря',
    'Легкая тренировка на рассвете, дыхание, растяжка и спокойный темп.',
    'sport', 'Йога', null, 'Хургада', 'Sahl Hasheesh', 'Sahl Hasheesh Old Town',
    'https://www.google.com/maps/search/?api=1&query=Sahl%20Hasheesh%20Old%20Town',
    date_trunc('week', now()) + interval '4 days 7 hours 30 minutes',
    true, true
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    'Волейбол на пляже',
    'Открытая игра для жителей района, команды собираются на месте.',
    'sport', 'Волейбол', null, 'Хургада', 'Эль-Ахья', 'El Ahyaa Beach',
    'https://www.google.com/maps/search/?api=1&query=El%20Ahyaa%20Beach%20Hurghada',
    date_trunc('week', now()) + interval '9 days 18 hours 30 minutes',
    true, true
  ),
  (
    '10000000-0000-4000-8000-000000000006',
    'Баскетбол 3x3',
    'Вечерняя игра 3x3, можно прийти одному или своей командой.',
    'sport', 'Баскетбол', null, 'Хургада', 'Dahar', 'Dahar Sports Court',
    'https://www.google.com/maps/search/?api=1&query=Dahar%20Hurghada%20basketball',
    date_trunc('week', now()) + interval '10 days 20 hours',
    true, true
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  event_type = excluded.event_type,
  sport = excluded.sport,
  age_limit = excluded.age_limit,
  city = excluded.city,
  area = excluded.area,
  location_name = excluded.location_name,
  map_url = excluded.map_url,
  starts_at = excluded.starts_at,
  request_enabled = excluded.request_enabled,
  is_published = excluded.is_published,
  updated_at = now();

commit;
