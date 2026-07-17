-- Cooked — initial schema
-- Data model approved 2026-07-17. Length limits on all user-supplied text.

create extension if not exists citext with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- ---------------------------------------------------------------- profiles

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  role text not null default 'viewer' check (role in ('viewer', 'editor', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'One row per auth user. Public signup gets role=viewer; editor/admin are granted by an administrator.';

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile on signup. display_name may arrive via signup metadata.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 80)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role changes only by an admin (or service role / direct database admin).
create function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and not coalesce(public.is_admin(), false)
     and coalesce(auth.role(), '') <> 'service_role'
     and session_user <> 'postgres'
  then
    raise exception 'only an administrator can change roles';
  end if;
  return new;
end;
$$;

-- Role helpers. security definer so they can read profiles regardless of RLS;
-- role comes from the profiles table, so promotions apply without token refresh.
create function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('editor', 'admin')
  );
$$;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- Public view of author display names (notes attribution) without exposing
-- the profiles table. Owned by postgres, so it bypasses profiles RLS and
-- reveals exactly these two columns.
create view public.public_profiles as
  select id, display_name from public.profiles;

-- ---------------------------------------------------------------- recipes

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 1 and 120),
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  image_path text check (image_path is null or char_length(image_path) <= 300),
  source_name text not null default '' check (char_length(source_name) <= 120),
  source_url text check (source_url is null or (source_url ~* '^https?://' and char_length(source_url) <= 500)),
  servings text not null default '' check (char_length(servings) <= 40),
  prep_minutes integer check (prep_minutes between 0 and 6000),
  cook_minutes integer check (cook_minutes between 0 and 6000),
  total_minutes integer generated always as (coalesce(prep_minutes, 0) + coalesce(cook_minutes, 0)) stored,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_by uuid references public.profiles (id) on delete set null,
  last_edited_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger recipes_updated_at
  before update on public.recipes
  for each row execute function public.set_updated_at();

create index recipes_status_created_idx on public.recipes (status, created_at desc);
create index recipes_total_minutes_idx on public.recipes (total_minutes);
create index recipes_title_trgm_idx on public.recipes using gin (title extensions.gin_trgm_ops);

-- ------------------------------------------------------------- ingredients

create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  position integer not null check (position >= 0),
  quantity text not null default '' check (char_length(quantity) <= 40),
  unit text not null default '' check (char_length(unit) <= 40),
  name text not null check (char_length(name) between 1 and 120)
);

create index ingredients_recipe_idx on public.ingredients (recipe_id, position);
create index ingredients_name_trgm_idx on public.ingredients using gin (name extensions.gin_trgm_ops);

-- ------------------------------------------------------------ instructions

create table public.instructions (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  position integer not null check (position >= 0),
  section_heading text check (section_heading is null or char_length(section_heading) <= 120),
  text text not null check (char_length(text) between 1 and 2000),
  timer_minutes integer check (timer_minutes between 1 and 6000)
);

create index instructions_recipe_idx on public.instructions (recipe_id, position);

-- -------------------------------------------------------------------- tags

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name extensions.citext not null unique check (char_length(name::text) between 1 and 40),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.recipe_tags (
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (recipe_id, tag_id)
);

create index recipe_tags_tag_idx on public.recipe_tags (tag_id);

-- ------------------------------------------------------------------- notes

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger notes_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

create index notes_recipe_idx on public.notes (recipe_id, created_at desc);

-- -------------------------------------------------------------- favourites

create table public.favourites (
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  favourited_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create index favourites_user_recency_idx on public.favourites (user_id, favourited_at desc);
