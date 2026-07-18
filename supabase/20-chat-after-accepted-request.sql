create or replace function public.create_direct_conversation(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_user_role text;
  other_user_role text;
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

  select p.role::text
    into current_user_role
  from public.profiles p
  where p.id = current_user_id;

  select p.role::text
    into other_user_role
  from public.profiles p
  where p.id = other_user_id;

  if current_user_role is null or other_user_role is null then
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

  if (
    (current_user_role = 'client' and other_user_role = 'executor')
    or (current_user_role = 'executor' and other_user_role = 'client')
  ) and not exists (
    select 1
    from public.requests r
    where r.client_id = case
      when current_user_role = 'client' then current_user_id
      else other_user_id
    end
      and r.executor_id = case
        when current_user_role = 'executor' then current_user_id
        else other_user_id
      end
      and r.status in ('accepted', 'completed')
  ) then
    raise exception 'Executor chat requires an accepted request';
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

revoke all on function public.create_direct_conversation(uuid) from public;
revoke all on function public.create_direct_conversation(uuid) from anon;
grant execute on function public.create_direct_conversation(uuid) to authenticated;
