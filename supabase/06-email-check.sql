create or replace function public.user_email_exists(check_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    where lower(u.email) = lower(btrim(check_email))
  );
$$;

revoke all on function public.user_email_exists(text) from public;
grant execute on function public.user_email_exists(text) to anon, authenticated;
