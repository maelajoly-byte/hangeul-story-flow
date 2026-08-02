create or replace function public.is_admin()
returns boolean language sql stable security invoker set search_path = public as $$
  select coalesce(lower(auth.jwt() ->> 'email') = 'maelajoly@gmail.com', false)
$$;