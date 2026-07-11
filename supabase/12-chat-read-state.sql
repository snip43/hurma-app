alter table public.conversation_members
  add column if not exists last_read_at timestamptz;

create index if not exists conversation_members_read_state_idx
  on public.conversation_members(user_id, conversation_id, last_read_at);

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

revoke all on function public.mark_conversation_read(uuid) from public;
grant execute on function public.mark_conversation_read(uuid) to authenticated;
