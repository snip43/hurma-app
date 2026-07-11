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

revoke all on function public.has_active_subscription(uuid) from public;
revoke all on function public.is_conversation_member(uuid) from public;
revoke all on function public.can_send_message(uuid) from public;
revoke all on function public.is_conversation_creator(uuid) from public;
revoke all on function public.get_chat_messages(uuid) from public;
revoke all on function public.mark_conversation_read(uuid) from public;
revoke all on function public.list_my_conversations() from public;
revoke all on function public.cancel_own_request(uuid) from public;
revoke all on function public.set_executor_request_status(uuid, public.request_status) from public;

grant execute on function public.has_active_subscription(uuid) to authenticated;
grant execute on function public.is_conversation_member(uuid) to authenticated;
grant execute on function public.can_send_message(uuid) to authenticated;
grant execute on function public.is_conversation_creator(uuid) to authenticated;
grant execute on function public.get_chat_messages(uuid) to authenticated;
grant execute on function public.mark_conversation_read(uuid) to authenticated;
grant execute on function public.list_my_conversations() to authenticated;
grant execute on function public.cancel_own_request(uuid) to authenticated;
grant execute on function public.set_executor_request_status(uuid, public.request_status) to authenticated;
