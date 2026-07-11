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
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null default '',
  attachment_path text,
  attachment_name text,
  attachment_type text,
  attachment_size bigint,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  constraint messages_body_check check (
    char_length(body) <= 4000
    and (char_length(trim(body)) >= 1 or attachment_path is not null)
  )
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
create index if not exists conversation_members_read_state_idx
  on public.conversation_members(user_id, conversation_id, last_read_at);
create index if not exists messages_conversation_created_idx
  on public.messages(conversation_id, created_at);
create index if not exists messages_sender_id_idx on public.messages(sender_id);
