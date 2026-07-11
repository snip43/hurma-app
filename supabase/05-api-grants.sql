grant usage on schema public to anon, authenticated;

grant select on table public.executor_profiles to anon, authenticated;
grant select on table public.events to anon, authenticated;

grant select on table public.profiles to authenticated;
grant select on table public.subscriptions to authenticated;
grant select on table public.requests to authenticated;
grant select on table public.conversations to authenticated;
grant select on table public.conversation_members to authenticated;
grant select on table public.messages to authenticated;

grant update (display_name, city, search_area, avatar_url)
  on table public.profiles to authenticated;

grant insert, update, delete
  on table public.executor_profiles to authenticated;

grant insert on table public.requests to authenticated;
grant insert on table public.conversations to authenticated;
grant insert, delete on table public.conversation_members to authenticated;
grant insert on table public.messages to authenticated;

grant execute on function public.has_active_subscription(uuid) to authenticated;
grant execute on function public.user_email_exists(text) to anon, authenticated;
grant execute on function public.is_conversation_member(uuid) to authenticated;
grant execute on function public.can_send_message(uuid) to authenticated;
grant execute on function public.is_conversation_creator(uuid) to authenticated;
grant execute on function public.create_direct_conversation(uuid) to authenticated;
grant execute on function public.send_chat_message(uuid, text) to authenticated;
grant execute on function public.send_chat_message_with_attachment(uuid, text, text, text, text, bigint) to authenticated;
grant execute on function public.get_chat_messages(uuid) to authenticated;
grant execute on function public.mark_conversation_read(uuid) to authenticated;
grant execute on function public.list_my_conversations() to authenticated;
grant execute on function public.cancel_own_request(uuid) to authenticated;
grant execute on function public.set_executor_request_status(uuid, public.request_status) to authenticated;
