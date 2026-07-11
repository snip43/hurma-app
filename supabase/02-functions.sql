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

create or replace function public.send_chat_message_with_attachment(
  target_conversation_id uuid,
  message_body text default '',
  p_attachment_path text default null,
  p_attachment_name text default null,
  p_attachment_type text default null,
  p_attachment_size bigint default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  clean_body text := coalesce(nullif(trim(message_body), ''), '');
  clean_attachment_path text := nullif(trim(p_attachment_path), '');
  clean_attachment_name text := nullif(trim(p_attachment_name), '');
  clean_attachment_type text := nullif(trim(p_attachment_type), '');
  inserted_message public.messages%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if target_conversation_id is null then
    raise exception 'Conversation required';
  end if;

  if clean_body = '' and clean_attachment_path is null then
    raise exception 'Message is empty';
  end if;

  if char_length(clean_body) > 4000 then
    raise exception 'Message is too long';
  end if;

  if clean_attachment_path is not null and split_part(clean_attachment_path, '/', 1) <> current_user_id::text then
    raise exception 'Attachment path is not allowed';
  end if;

  if clean_attachment_path is not null and clean_attachment_name is null then
    clean_attachment_name := 'Файл';
  end if;

  if p_attachment_size is not null and p_attachment_size > 26214400 then
    raise exception 'Attachment is too large';
  end if;

  if not public.has_active_subscription(current_user_id) then
    raise exception 'Active subscription required';
  end if;

  if not public.can_send_message(target_conversation_id) then
    raise exception 'Cannot send message to this conversation';
  end if;

  insert into public.messages (
    conversation_id,
    sender_id,
    body,
    attachment_path,
    attachment_name,
    attachment_type,
    attachment_size
  )
  values (
    target_conversation_id,
    current_user_id,
    clean_body,
    clean_attachment_path,
    clean_attachment_name,
    coalesce(clean_attachment_type, 'application/octet-stream'),
    p_attachment_size
  )
  returning * into inserted_message;

  update public.conversations
  set updated_at = inserted_message.created_at
  where id = target_conversation_id;

  return jsonb_build_object(
    'id', inserted_message.id,
    'conversation_id', inserted_message.conversation_id,
    'sender_id', inserted_message.sender_id,
    'body', inserted_message.body,
    'attachment_path', inserted_message.attachment_path,
    'attachment_name', inserted_message.attachment_name,
    'attachment_type', inserted_message.attachment_type,
    'attachment_size', inserted_message.attachment_size,
    'created_at', inserted_message.created_at
  );
end;
$$;

drop function if exists public.get_chat_messages(uuid);

create function public.get_chat_messages(target_conversation_id uuid)
returns table (
  id uuid,
  sender_id uuid,
  body text,
  attachment_path text,
  attachment_name text,
  attachment_type text,
  attachment_size bigint,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if target_conversation_id is null then
    raise exception 'Conversation required';
  end if;

  if not exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = target_conversation_id
      and cm.user_id = current_user_id
  ) then
    raise exception 'Conversation not found';
  end if;

  return query
    select
      m.id,
      m.sender_id,
      m.body,
      m.attachment_path,
      m.attachment_name,
      m.attachment_type,
      m.attachment_size,
      m.created_at
    from public.messages m
    where m.conversation_id = target_conversation_id
    order by m.created_at asc;
end;
$$;

create or replace function public.mark_conversation_read(target_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if target_conversation_id is null then
    raise exception 'Conversation required';
  end if;

  update public.conversation_members cm
  set last_read_at = now()
  where cm.conversation_id = target_conversation_id
    and cm.user_id = current_user_id;

  if not found then
    raise exception 'Conversation not found';
  end if;
end;
$$;

create or replace function public.list_my_conversations()
returns table (
  conversation_id uuid,
  title text,
  subtitle text,
  is_readonly boolean,
  updated_at timestamptz,
  last_message_body text,
  last_message_at timestamptz,
  unread_count integer
)
language sql
stable
security definer
set search_path = ''
as $$
  with my_members as (
    select
      cm.conversation_id,
      cm.last_read_at,
      c.conversation_type,
      c.title,
      c.subtitle,
      c.is_readonly,
      c.updated_at
    from public.conversation_members cm
    join public.conversations c on c.id = cm.conversation_id
    where cm.user_id = (select auth.uid())
  ),
  other_members as (
    select
      cm.conversation_id,
      p.display_name,
      p.role,
      p.city,
      p.search_area,
      row_number() over (partition by cm.conversation_id order by cm.joined_at asc) as member_rank
    from public.conversation_members cm
    join public.profiles p on p.id = cm.user_id
    where cm.user_id <> (select auth.uid())
  ),
  latest_messages as (
    select distinct on (m.conversation_id)
      m.conversation_id,
      m.body,
      m.created_at
    from public.messages m
    join my_members mm on mm.conversation_id = m.conversation_id
    order by m.conversation_id, m.created_at desc
  )
  select
    mm.conversation_id,
    case
      when mm.conversation_type = 'direct' then coalesce(om.display_name, mm.title, 'Чат')
      else coalesce(mm.title, 'Чат ХурМа')
    end as title,
    case
      when mm.conversation_type = 'direct' then concat_ws(
        ' · ',
        case when om.role = 'executor' then 'Исполнитель' else 'Клиент' end,
        om.city,
        om.search_area
      )
      else coalesce(mm.subtitle, 'Групповой чат')
    end as subtitle,
    mm.is_readonly,
    mm.updated_at,
    lm.body as last_message_body,
    lm.created_at as last_message_at,
    coalesce((
      select count(*)::integer
      from public.messages unread
      where unread.conversation_id = mm.conversation_id
        and unread.sender_id <> (select auth.uid())
        and (mm.last_read_at is null or unread.created_at > mm.last_read_at)
    ), 0) as unread_count
  from my_members mm
  left join other_members om
    on om.conversation_id = mm.conversation_id
    and om.member_rank = 1
  left join latest_messages lm on lm.conversation_id = mm.conversation_id
  order by coalesce(lm.created_at, mm.updated_at) desc;
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
