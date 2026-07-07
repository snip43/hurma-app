-- Diagnostics for HurMa direct chats.
-- Run this in Supabase SQL Editor when registered users do not see each other in chats.

select
  'profiles' as section,
  p.id,
  p.display_name,
  p.role::text,
  p.city,
  p.search_area,
  p.created_at
from public.profiles p
order by p.created_at desc;

select
  'subscriptions' as section,
  p.display_name,
  s.user_id,
  s.status::text,
  s.plan_code,
  s.starts_at,
  s.ends_at,
  case
    when s.status in ('trial', 'active')
      and s.starts_at <= now()
      and (s.ends_at is null or s.ends_at > now())
    then true
    else false
  end as is_active_now
from public.profiles p
left join public.subscriptions s on s.user_id = p.id
order by p.created_at desc;

select
  'conversation_members' as section,
  c.id as conversation_id,
  c.conversation_type::text,
  c.is_readonly,
  c.created_at,
  p.display_name as member_name,
  cm.user_id,
  cm.member_role::text
from public.conversations c
join public.conversation_members cm on cm.conversation_id = c.id
join public.profiles p on p.id = cm.user_id
order by c.created_at desc, p.display_name;

select
  'messages' as section,
  c.id as conversation_id,
  p.display_name as sender_name,
  m.body,
  m.created_at
from public.messages m
join public.conversations c on c.id = m.conversation_id
join public.profiles p on p.id = m.sender_id
order by m.created_at desc
limit 30;
