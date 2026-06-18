create or replace function public.has_active_subscription(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.subscriptions s
    where s.user_id = check_user_id
      and s.status in ('trial', 'active')
      and s.starts_at <= now()
      and (s.ends_at is null or s.ends_at > now())
  );
$$;

create or replace function public.is_conversation_member(check_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = check_conversation_id
      and cm.user_id = (select auth.uid())
  );
$$;

create or replace function public.can_send_message(check_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversation_members cm
    join public.conversations c on c.id = cm.conversation_id
    where cm.conversation_id = check_conversation_id
      and cm.user_id = (select auth.uid())
      and (
        c.is_readonly = false
        or cm.member_role in ('admin', 'owner')
      )
  );
$$;

create or replace function public.is_conversation_creator(check_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversations c
    where c.id = check_conversation_id
      and c.created_by = (select auth.uid())
  );
$$;
