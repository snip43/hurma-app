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

revoke all on function public.create_direct_conversation(uuid) from public;
grant execute on function public.create_direct_conversation(uuid) to authenticated;
