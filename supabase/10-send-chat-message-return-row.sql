drop function if exists public.send_chat_message(uuid, text);

create function public.send_chat_message(
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

revoke all on function public.send_chat_message(uuid, text) from public;
grant execute on function public.send_chat_message(uuid, text) to authenticated;
