create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.can_read_chat_attachment(attachment_object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.messages m
    join public.conversation_members cm
      on cm.conversation_id = m.conversation_id
    where m.attachment_path = attachment_object_name
      and cm.user_id = auth.uid()
  );
$$;

revoke all on function private.can_read_chat_attachment(text) from public;
grant execute on function private.can_read_chat_attachment(text) to authenticated;

drop policy if exists "chat attachments can be read by conversation members" on storage.objects;
create policy "chat attachments can be read by conversation members"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'chat-attachments'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or private.can_read_chat_attachment(name)
  )
);

drop function if exists public.can_read_chat_attachment(text);

notify pgrst, 'reload schema';
