create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(lower(auth.jwt() ->> 'email') = 'maelajoly@gmail.com', false)
$$;

create table public.profiles (
  id uuid primary key,
  email text,
  pseudo text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create table public.story_parts (
  id uuid primary key default gen_random_uuid(),
  series_id text not null,
  episode int not null,
  part int not null,
  title text not null default 'Nouvelle partie',
  optional boolean not null default false,
  created_at timestamptz not null default now(),
  unique (series_id, episode, part)
);
grant select on public.story_parts to anon;
grant select, insert, update, delete on public.story_parts to authenticated;
grant all on public.story_parts to service_role;
alter table public.story_parts enable row level security;
create policy "story_parts_public_read" on public.story_parts for select using (true);
create policy "story_parts_admin_write" on public.story_parts for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.story_slides (
  id uuid primary key default gen_random_uuid(),
  part_id uuid not null references public.story_parts(id) on delete cascade,
  position int not null,
  media_url text,
  hangeul text not null default '',
  sfx_url text,
  ambient_url text,
  created_at timestamptz not null default now(),
  unique (part_id, position)
);
grant select on public.story_slides to anon;
grant select, insert, update, delete on public.story_slides to authenticated;
grant all on public.story_slides to service_role;
alter table public.story_slides enable row level security;
create policy "story_slides_public_read" on public.story_slides for select using (true);
create policy "story_slides_admin_write" on public.story_slides for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.lexicon_entries (
  id uuid primary key default gen_random_uuid(),
  part_id uuid not null references public.story_parts(id) on delete cascade,
  slide_position int not null,
  term text not null,
  explanation text not null default '',
  created_at timestamptz not null default now()
);
grant select on public.lexicon_entries to anon;
grant select, insert, update, delete on public.lexicon_entries to authenticated;
grant all on public.lexicon_entries to service_role;
alter table public.lexicon_entries enable row level security;
create policy "lexicon_public_read" on public.lexicon_entries for select using (true);
create policy "lexicon_admin_write" on public.lexicon_entries for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.lexicon_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  part_id uuid not null references public.story_parts(id) on delete cascade,
  slide_position int not null,
  term text not null,
  question text not null default '',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  answered_at timestamptz
);
grant select, insert, update on public.lexicon_requests to authenticated;
grant all on public.lexicon_requests to service_role;
alter table public.lexicon_requests enable row level security;
create policy "requests_select_own_or_admin" on public.lexicon_requests for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "requests_insert_own" on public.lexicon_requests for insert to authenticated with check (user_id = auth.uid());
create policy "requests_admin_update" on public.lexicon_requests for update to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  kind text not null default 'info',
  title text not null,
  body text not null default '',
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, update on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "notifications_select_own" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "notifications_update_own" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());