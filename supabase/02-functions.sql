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
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  new_message_id uuid;
  clean_body text := nullif(trim(message_body), '');
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
  returning id into new_message_id;

  update public.conversations
  set updated_at = now()
  where id = target_conversation_id;

  return new_message_id;
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
