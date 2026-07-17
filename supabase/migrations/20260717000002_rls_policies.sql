-- Cooked — Row Level Security (AC-SEC-001)
-- RLS is the independent second lock behind route-handler authorisation.

alter table public.profiles     enable row level security;
alter table public.recipes      enable row level security;
alter table public.ingredients  enable row level security;
alter table public.instructions enable row level security;
alter table public.tags         enable row level security;
alter table public.recipe_tags  enable row level security;
alter table public.notes        enable row level security;
alter table public.favourites   enable row level security;

-- ---------------------------------------------------------------- profiles
-- Owners read and update their own row (role changes blocked by trigger).
-- Admins can read all. Inserts happen via the signup trigger only.

create policy "profiles: owner or admin can read"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles: owner can update"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------- recipes
-- Published recipes are public; editors also see drafts. Writes are editor-only.

create policy "recipes: published are public, editors see all"
  on public.recipes for select
  using (status = 'published' or public.is_editor());

create policy "recipes: editors can insert"
  on public.recipes for insert
  with check (public.is_editor());

create policy "recipes: editors can update"
  on public.recipes for update
  using (public.is_editor())
  with check (public.is_editor());

create policy "recipes: editors can delete"
  on public.recipes for delete
  using (public.is_editor());

-- ------------------------------------------- ingredients and instructions
-- Visible when the parent recipe is visible; writes are editor-only.

create policy "ingredients: visible with parent recipe"
  on public.ingredients for select
  using (exists (
    select 1 from public.recipes r
    where r.id = recipe_id and (r.status = 'published' or public.is_editor())
  ));

create policy "ingredients: editors can write"
  on public.ingredients for all
  using (public.is_editor())
  with check (public.is_editor());

create policy "instructions: visible with parent recipe"
  on public.instructions for select
  using (exists (
    select 1 from public.recipes r
    where r.id = recipe_id and (r.status = 'published' or public.is_editor())
  ));

create policy "instructions: editors can write"
  on public.instructions for all
  using (public.is_editor())
  with check (public.is_editor());

-- -------------------------------------------------------------------- tags
-- Reading and filtering by tags is public. New tags are created only via the
-- recipe form (editor auth); rename/delete is admin-only.

create policy "tags: public read"
  on public.tags for select
  using (true);

create policy "tags: editors can create"
  on public.tags for insert
  with check (public.is_editor());

create policy "tags: admins can update"
  on public.tags for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "tags: admins can delete"
  on public.tags for delete
  using (public.is_admin());

create policy "recipe_tags: visible with parent recipe"
  on public.recipe_tags for select
  using (exists (
    select 1 from public.recipes r
    where r.id = recipe_id and (r.status = 'published' or public.is_editor())
  ));

create policy "recipe_tags: editors can write"
  on public.recipe_tags for all
  using (public.is_editor())
  with check (public.is_editor());

-- ------------------------------------------------------------------- notes
-- Published-recipe notes are public. Editors add notes as themselves and can
-- modify only their own notes; admins can modify all (AC-AUTH-011).

create policy "notes: visible with parent recipe"
  on public.notes for select
  using (exists (
    select 1 from public.recipes r
    where r.id = recipe_id and (r.status = 'published' or public.is_editor())
  ));

create policy "notes: editors add their own"
  on public.notes for insert
  with check (public.is_editor() and author_id = auth.uid());

create policy "notes: author or admin can update"
  on public.notes for update
  using (public.is_editor() and (author_id = auth.uid() or public.is_admin()))
  with check (public.is_editor() and (author_id = auth.uid() or public.is_admin()));

create policy "notes: author or admin can delete"
  on public.notes for delete
  using (public.is_editor() and (author_id = auth.uid() or public.is_admin()));

-- -------------------------------------------------------------- favourites
-- Strictly per-user: reads and writes are scoped to the session user
-- (AC-FAV-001). No update policy — favourites are inserted and deleted.

create policy "favourites: own rows only (read)"
  on public.favourites for select
  using (user_id = auth.uid());

create policy "favourites: own rows only (insert)"
  on public.favourites for insert
  with check (user_id = auth.uid());

create policy "favourites: own rows only (delete)"
  on public.favourites for delete
  using (user_id = auth.uid());
