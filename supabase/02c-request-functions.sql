create or replace function public.cancel_own_request(request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.requests
  set status = 'cancelled', updated_at = now()
  where id = request_id
    and client_id = (select auth.uid())
    and status = 'new';

  if not found then
    raise exception 'Request cannot be cancelled';
  end if;
end;
$$;

create or replace function public.set_executor_request_status(
  request_id uuid,
  next_status public.request_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if next_status not in ('accepted', 'declined', 'completed') then
    raise exception 'Unsupported request status';
  end if;

  update public.requests
  set status = next_status, updated_at = now()
  where id = request_id
    and executor_id = (select auth.uid())
    and (
      (status = 'new' and next_status in ('accepted', 'declined'))
      or (status = 'accepted' and next_status = 'completed')
    );

  if not found then
    raise exception 'Request status cannot be changed';
  end if;
end;
$$;
