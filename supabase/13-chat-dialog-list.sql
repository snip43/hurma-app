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
