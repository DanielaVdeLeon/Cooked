-- Auto-delete tags once no recipe references them.
--
-- Tags are user-generated and only meaningful while attached to a recipe, so
-- an unused tag should disappear rather than linger in the filter list.

-- 1) A tag is orphaned the moment its last recipe_tags link is removed —
-- whether from an edit that drops the tag or a recipe deletion cascade.
-- SECURITY DEFINER so it can delete tags regardless of the admin-only tags
-- RLS policy; the trigger is the authority here.
create function public.delete_orphan_tags()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.tags t
  where t.id = old.tag_id
    and not exists (
      select 1 from public.recipe_tags rt where rt.tag_id = t.id
    );
  return old;
end;
$$;

create trigger recipe_tags_orphan_cleanup
  after delete on public.recipe_tags
  for each row execute function public.delete_orphan_tags();

-- 2) Rework the recipe-children save so kept tags keep their link row. The
-- previous version deleted every link and re-inserted, which would trip the
-- cleanup trigger on tags that were only being re-assigned. Now we delete
-- only the links that are actually going away.
create or replace function public.save_recipe_children(
  p_recipe_id uuid,
  p_ingredients jsonb,
  p_instructions jsonb,
  p_tags text[]
) returns void
language plpgsql
as $$
declare
  tag_name text;
begin
  delete from public.ingredients where recipe_id = p_recipe_id;
  insert into public.ingredients (recipe_id, position, quantity, unit, name, is_heading)
  select
    p_recipe_id,
    x.ord - 1,
    coalesce(x.quantity, ''),
    coalesce(x.unit, ''),
    x.name,
    coalesce(x.is_heading, false)
  from rows from (
    jsonb_to_recordset(p_ingredients)
      as (quantity text, unit text, name text, is_heading boolean)
  ) with ordinality as x(quantity, unit, name, is_heading, ord);

  delete from public.instructions where recipe_id = p_recipe_id;
  insert into public.instructions (recipe_id, position, section_heading, text, timer_minutes)
  select
    p_recipe_id,
    x.ord - 1,
    x.section_heading,
    x.text,
    x.timer_minutes
  from rows from (
    jsonb_to_recordset(p_instructions)
      as (section_heading text, text text, timer_minutes int)
  ) with ordinality as x(section_heading, text, timer_minutes, ord);

  -- Ensure every wanted tag exists (citext unique dedupes case-insensitively).
  foreach tag_name in array p_tags loop
    insert into public.tags (name, created_by)
    values (tag_name, auth.uid())
    on conflict (name) do nothing;
  end loop;

  -- Remove only links this recipe no longer wants; a link that stays keeps
  -- its row, so the orphan-cleanup trigger never removes a still-used tag.
  delete from public.recipe_tags rt
  where rt.recipe_id = p_recipe_id
    and rt.tag_id not in (
      select id from public.tags where name = any (p_tags::extensions.citext[])
    );

  -- Add the newly-wanted links.
  insert into public.recipe_tags (recipe_id, tag_id)
  select p_recipe_id, t.id
  from public.tags t
  where t.name = any (p_tags::extensions.citext[])
  on conflict (recipe_id, tag_id) do nothing;
end;
$$;

-- 3) One-time sweep of tags that are already orphaned.
delete from public.tags t
where not exists (
  select 1 from public.recipe_tags rt where rt.tag_id = t.id
);
