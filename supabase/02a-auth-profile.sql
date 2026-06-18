create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_role public.user_role;
  selected_name text;
begin
  selected_role :=
    case
      when new.raw_user_meta_data ->> 'role' = 'executor' then 'executor'::public.user_role
      else 'client'::public.user_role
    end;

  selected_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    split_part(coalesce(new.email, 'Пользователь'), '@', 1)
  );

  insert into public.profiles (id, display_name, role, city, search_area)
  values (
    new.id,
    selected_name,
    selected_role,
    coalesce(nullif(new.raw_user_meta_data ->> 'city', ''), 'Хургада'),
    nullif(new.raw_user_meta_data ->> 'search_area', '')
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (
    user_id,
    status,
    plan_code,
    starts_at,
    ends_at,
    auto_renew
  )
  values (
    new.id,
    'trial',
    'trial-14-days',
    now(),
    now() + interval '14 days',
    false
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
