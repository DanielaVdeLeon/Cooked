-- Cooked — storage bucket for recipe photos + public search function

-- ----------------------------------------------------------------- storage
-- Public read (recipe photos are public content); writes are editor-only.

insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

create policy "recipe images: public read"
  on storage.objects for select
  using (bucket_id = 'recipe-images');

create policy "recipe images: editors can upload"
  on storage.objects for insert
  with check (bucket_id = 'recipe-images' and public.is_editor());

create policy "recipe images: editors can update"
  on storage.objects for update
  using (bucket_id = 'recipe-images' and public.is_editor())
  with check (bucket_id = 'recipe-images' and public.is_editor());

create policy "recipe images: editors can delete"
  on storage.objects for delete
  using (bucket_id = 'recipe-images' and public.is_editor());

-- ------------------------------------------------------------------ search
-- AC-PUB-002: case-insensitive partial match across titles, ingredient
-- names, and tags; AC-PUB-003: multi-tag filter, recipes match ALL selected
-- tags. SECURITY INVOKER (the default), so recipe RLS applies: anonymous
-- callers can only ever receive published recipes.

create function public.search_recipes(q text default '', tag_ids uuid[] default '{}')
returns setof public.recipes
language sql
stable
as $$
  with needle as (
    select '%' || replace(replace(replace(coalesce(q, ''), '\', '\\'), '%', '\%'), '_', '\_') || '%' as pat,
           coalesce(q, '') = '' as empty
  )
  select r.*
  from public.recipes r, needle n
  where (
    n.empty
    or r.title ilike n.pat
    or exists (
      select 1 from public.ingredients i
      where i.recipe_id = r.id and i.name ilike n.pat
    )
    or exists (
      select 1 from public.recipe_tags rt
      join public.tags t on t.id = rt.tag_id
      where rt.recipe_id = r.id and t.name::text ilike n.pat
    )
  )
  and (
    coalesce(cardinality(tag_ids), 0) = 0
    or not exists (
      select 1 from unnest(tag_ids) as wanted(tag_id)
      where not exists (
        select 1 from public.recipe_tags rt
        where rt.recipe_id = r.id and rt.tag_id = wanted.tag_id
      )
    )
  );
$$;

-- Tag usage counts for the filter panel and combobox ordering. Counts only
-- published usages so public counts never leak drafts.
create function public.tag_usage()
returns table (id uuid, name text, usage_count bigint)
language sql
stable
as $$
  select t.id, t.name::text, count(r.id) as usage_count
  from public.tags t
  left join public.recipe_tags rt on rt.tag_id = t.id
  left join public.recipes r on r.id = rt.recipe_id and r.status = 'published'
  group by t.id, t.name
  order by count(r.id) desc, t.name asc;
$$;
