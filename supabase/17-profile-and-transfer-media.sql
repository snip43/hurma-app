alter table public.executor_profiles
  add column if not exists photo_url text,
  add column if not exists routes jsonb not null default '[]'::jsonb;

alter table public.executor_profiles
  drop constraint if exists executor_profiles_routes_array_check;

alter table public.executor_profiles
  add constraint executor_profiles_routes_array_check
  check (jsonb_typeof(routes) = 'array');

alter table public.executor_profiles
  drop constraint if exists executor_profiles_published_photo_check;

alter table public.executor_profiles
  add constraint executor_profiles_published_photo_check
  check (not is_published or photo_url is not null) not valid;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('profile-avatars', 'profile-avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('service-images', 'service-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "users upload own profile avatars" on storage.objects;
create policy "users upload own profile avatars"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "users update own profile avatars" on storage.objects;
create policy "users update own profile avatars"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "users delete own profile avatars" on storage.objects;
create policy "users delete own profile avatars"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "executors upload own service images" on storage.objects;
create policy "executors upload own service images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'service-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'executor'
  )
);

drop policy if exists "executors update own service images" on storage.objects;
create policy "executors update own service images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'service-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'service-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'executor'
  )
);

drop policy if exists "executors delete own service images" on storage.objects;
create policy "executors delete own service images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'service-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop function if exists public.list_my_conversations();

create function public.list_my_conversations()
returns table (
  conversation_id uuid,
  title text,
  subtitle text,
  avatar_url text,
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
  with current_user_id as (
    select auth.uid() as id
  ),
  my_members as (
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
    cross join current_user_id cu
    where cm.user_id = cu.id
  ),
  other_members as (
    select
      cm.conversation_id,
      p.display_name,
      p.role,
      p.city,
      p.search_area,
      p.avatar_url,
      row_number() over (partition by cm.conversation_id order by cm.joined_at asc) as member_rank
    from my_members mm
    join public.conversation_members cm
      on cm.conversation_id = mm.conversation_id
    cross join current_user_id cu
    join public.profiles p on p.id = cm.user_id
    where cm.user_id <> cu.id
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
    case when mm.conversation_type = 'direct' then om.avatar_url else null end as avatar_url,
    mm.is_readonly,
    mm.updated_at,
    coalesce(nullif(lm.body, ''), case when lm.attachment_name is not null then 'Файл: ' || lm.attachment_name end) as last_message_body,
    lm.created_at as last_message_at,
    coalesce(unread.unread_count, 0) as unread_count
  from my_members mm
  left join other_members om
    on om.conversation_id = mm.conversation_id
    and om.member_rank = 1
  left join lateral (
    select
      m.body,
      m.attachment_name,
      m.created_at
    from public.messages m
    where m.conversation_id = mm.conversation_id
    order by m.created_at desc
    limit 1
  ) lm on true
  left join lateral (
    select count(*)::integer as unread_count
    from public.messages unread
    cross join current_user_id cu
    where unread.conversation_id = mm.conversation_id
      and unread.sender_id <> cu.id
      and (mm.last_read_at is null or unread.created_at > mm.last_read_at)
  ) unread on true
  order by coalesce(lm.created_at, mm.updated_at) desc;
$$;

revoke all on function public.list_my_conversations() from public;
grant execute on function public.list_my_conversations() to authenticated;

notify pgrst, 'reload schema';
