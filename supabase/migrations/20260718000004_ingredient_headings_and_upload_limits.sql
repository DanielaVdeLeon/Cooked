-- Ingredient section headings (prototype: dashed heading rows inside the
-- ingredient list, rendered bold full-width on cards and recipe pages).
-- A heading row stores its label in `name` with is_heading = true.

alter table public.ingredients
  add column is_heading boolean not null default false;

-- Server-side upload constraints for recipe photos (AC: upload validation).
update storage.buckets
set file_size_limit = 5242880, -- 5 MB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'recipe-images';

-- Atomic children replace for recipe saves: one statement = one transaction,
-- so a failed save can never leave a recipe half-written (AC-AUTH-008/009).
-- SECURITY INVOKER — runs as the calling editor, so RLS still applies to
-- every write; anonymous or viewer callers fail on the first row.
create function public.save_recipe_children(
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

  -- Create any missing tags (citext unique handles case-insensitive dedupe),
  -- then reset the recipe's tag links.
  foreach tag_name in array p_tags loop
    insert into public.tags (name, created_by)
    values (tag_name, auth.uid())
    on conflict (name) do nothing;
  end loop;

  delete from public.recipe_tags where recipe_id = p_recipe_id;
  insert into public.recipe_tags (recipe_id, tag_id)
  select p_recipe_id, t.id
  from public.tags t
  where t.name = any (p_tags::extensions.citext[]);
end;
$$;
