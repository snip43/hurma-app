create or replace function public.get_chat_messages(target_conversation_id uuid)
returns table (
  id uuid,
  sender_id uuid,
  body text,
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
    select m.id, m.sender_id, m.body, m.created_at
    from public.messages m
    where m.conversation_id = target_conversation_id
    order by m.created_at asc;
end;
$$;

revoke all on function public.get_chat_messages(uuid) from public;
grant execute on function public.get_chat_messages(uuid) to authenticated;
