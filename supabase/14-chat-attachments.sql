alter table public.messages
  add column if not exists attachment_path text,
  add column if not exists attachment_name text,
  add column if not exists attachment_type text,
  add column if not exists attachment_size bigint;

alter table public.messages
  alter column body set default '';

alter table public.messages
  drop constraint if exists messages_body_check;

alter table public.messages
  add constraint messages_body_check check (
    char_length(body) <= 4000
    and (char_length(trim(body)) >= 1 or attachment_path is not null)
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chat-attachments', 'chat-attachments', false, 26214400, null)
on conflict (id) do update
set public = false,
    file_size_limit = 26214400,
    allowed_mime_types = null;

drop policy if exists "chat attachments can be uploaded by owner" on storage.objects;
create policy "chat attachments can be uploaded by owner"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'chat-attachments'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "chat attachments can be read by conversation members" on storage.objects;
create policy "chat attachments can be read by conversation members"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'chat-attachments'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or exists (
      select 1
      from public.messages m
      join public.conversation_members cm
        on cm.conversation_id = m.conversation_id
      where m.attachment_path = storage.objects.name
        and cm.user_id = (select auth.uid())
    )
  )
);

drop policy if exists "chat attachments can be deleted by owner" on storage.objects;
create policy "chat attachments can be deleted by owner"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'chat-attachments'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

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

revoke all on function public.send_chat_message_with_attachment(uuid, text, text, text, text, bigint) from public;
grant execute on function public.send_chat_message_with_attachment(uuid, text, text, text, text, bigint) to authenticated;

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

revoke all on function public.get_chat_messages(uuid) from public;
grant execute on function public.get_chat_messages(uuid) to authenticated;

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
      m.attachment_name,
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
    coalesce(nullif(lm.body, ''), case when lm.attachment_name is not null then 'Файл: ' || lm.attachment_name end) as last_message_body,
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

revoke all on function public.list_my_conversations() from public;
grant execute on function public.list_my_conversations() to authenticated;
