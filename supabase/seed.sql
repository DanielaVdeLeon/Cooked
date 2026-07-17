-- Cooked — development/preview seed data
-- Six published recipes, no images yet (exercises the missing-image state).
-- created_by is null: seed content predates any real editor account.

begin;

-- Tags -----------------------------------------------------------------

insert into public.tags (id, name) values
  ('a0000000-0000-4000-8000-000000000001', 'vegetarian'),
  ('a0000000-0000-4000-8000-000000000002', 'quick'),
  ('a0000000-0000-4000-8000-000000000003', 'pasta'),
  ('a0000000-0000-4000-8000-000000000004', 'dessert'),
  ('a0000000-0000-4000-8000-000000000005', 'soup'),
  ('a0000000-0000-4000-8000-000000000006', 'japanese'),
  ('a0000000-0000-4000-8000-000000000007', 'baking'),
  ('a0000000-0000-4000-8000-000000000008', 'weeknight'),
  ('a0000000-0000-4000-8000-000000000009', 'slow-cooked')
on conflict (name) do nothing;

-- Recipes ---------------------------------------------------------------

insert into public.recipes
  (id, slug, title, description, source_name, source_url, servings, prep_minutes, cook_minutes, status, created_at, updated_at)
values
  ('b0000000-0000-4000-8000-000000000001',
   'slow-braised-beef-ragu',
   'Slow-Braised Beef Ragù',
   'A deeply savoury ragù that simmers for hours until the beef collapses into the sauce. Worth every minute — make a double batch and freeze half.',
   'Serious Eats', 'https://www.seriouseats.com/', 'Serves 6', 30, 210, 'published',
   now() - interval '9 days', now() - interval '9 days'),
  ('b0000000-0000-4000-8000-000000000002',
   'lemon-yoghurt-cake',
   'Lemon Yoghurt Cake',
   'A one-bowl cake with a tender crumb and a sharp lemon syrup. Keeps for days, somehow never lasts that long.',
   'Smitten Kitchen', 'https://smittenkitchen.com/', 'Makes 1 loaf', 15, 50, 'published',
   now() - interval '7 days', now() - interval '2 days'),
  ('b0000000-0000-4000-8000-000000000003',
   'miso-butter-udon',
   'Miso Butter Udon',
   'Chewy udon in a glossy miso butter sauce, done faster than delivery. A back-pocket weeknight dinner.',
   'Just One Cookbook', 'https://www.justonecookbook.com/', 'Serves 2', 10, 10, 'published',
   now() - interval '6 days', now() - interval '6 days'),
  ('b0000000-0000-4000-8000-000000000004',
   'roasted-tomato-soup',
   'Roasted Tomato Soup',
   'Roasting concentrates everything good about tomatoes. Blend with basil and finish with cream — or don''t, it''s great either way.',
   '', null, 'Serves 4', 15, 45, 'published',
   now() - interval '4 days', now() - interval '4 days'),
  ('b0000000-0000-4000-8000-000000000005',
   'cacio-e-pepe',
   'Cacio e Pepe',
   'Three ingredients, one emulsion, zero places to hide. The trick is the pasta water — starchy, salty, and added a little at a time.',
   'Essen', 'https://www.essen.de/', 'Serves 2', 5, 15, 'published',
   now() - interval '3 days', now() - interval '1 day'),
  ('b0000000-0000-4000-8000-000000000006',
   'brown-butter-chocolate-chip-cookies',
   'Brown Butter Chocolate Chip Cookies',
   'Nutty brown butter, two sugars, and an overnight rest in the fridge. Bakes flat-edged and chewy-centred.',
   'Bon Appétit', 'https://www.bonappetit.com/', 'Makes 24', 20, 12, 'published',
   now() - interval '2 days', now() - interval '2 days');

-- Recipe tags -----------------------------------------------------------

insert into public.recipe_tags (recipe_id, tag_id) values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000003'),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000009'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000004'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000007'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000006'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000008'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000005'),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000003'),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000002'),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000008'),
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000004'),
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000007');

-- Ingredients -----------------------------------------------------------

insert into public.ingredients (recipe_id, position, quantity, unit, name) values
  -- Slow-Braised Beef Ragù
  ('b0000000-0000-4000-8000-000000000001', 0, '1.2', 'kg', 'beef chuck, cut into large chunks'),
  ('b0000000-0000-4000-8000-000000000001', 1, '2', 'tbsp', 'olive oil'),
  ('b0000000-0000-4000-8000-000000000001', 2, '1', '', 'onion, finely diced'),
  ('b0000000-0000-4000-8000-000000000001', 3, '2', '', 'carrots, finely diced'),
  ('b0000000-0000-4000-8000-000000000001', 4, '4', 'cloves', 'garlic, sliced'),
  ('b0000000-0000-4000-8000-000000000001', 5, '2', 'tbsp', 'tomato paste'),
  ('b0000000-0000-4000-8000-000000000001', 6, '250', 'ml', 'red wine'),
  ('b0000000-0000-4000-8000-000000000001', 7, '800', 'g', 'canned whole tomatoes'),
  ('b0000000-0000-4000-8000-000000000001', 8, '2', '', 'bay leaves'),
  ('b0000000-0000-4000-8000-000000000001', 9, '500', 'g', 'pappardelle'),
  -- Lemon Yoghurt Cake
  ('b0000000-0000-4000-8000-000000000002', 0, '240', 'g', 'plain flour'),
  ('b0000000-0000-4000-8000-000000000002', 1, '2', 'tsp', 'baking powder'),
  ('b0000000-0000-4000-8000-000000000002', 2, '240', 'g', 'greek yoghurt'),
  ('b0000000-0000-4000-8000-000000000002', 3, '200', 'g', 'caster sugar'),
  ('b0000000-0000-4000-8000-000000000002', 4, '3', '', 'eggs'),
  ('b0000000-0000-4000-8000-000000000002', 5, '2', '', 'lemons, zest and juice'),
  ('b0000000-0000-4000-8000-000000000002', 6, '120', 'ml', 'vegetable oil'),
  -- Miso Butter Udon
  ('b0000000-0000-4000-8000-000000000003', 0, '2', 'portions', 'frozen udon noodles'),
  ('b0000000-0000-4000-8000-000000000003', 1, '2', 'tbsp', 'white miso paste'),
  ('b0000000-0000-4000-8000-000000000003', 2, '40', 'g', 'butter'),
  ('b0000000-0000-4000-8000-000000000003', 3, '1', 'tbsp', 'soy sauce'),
  ('b0000000-0000-4000-8000-000000000003', 4, '2', '', 'spring onions, sliced'),
  ('b0000000-0000-4000-8000-000000000003', 5, '2', '', 'soft-boiled eggs'),
  -- Roasted Tomato Soup
  ('b0000000-0000-4000-8000-000000000004', 0, '1.5', 'kg', 'ripe tomatoes, halved'),
  ('b0000000-0000-4000-8000-000000000004', 1, '1', '', 'red onion, quartered'),
  ('b0000000-0000-4000-8000-000000000004', 2, '6', 'cloves', 'garlic, unpeeled'),
  ('b0000000-0000-4000-8000-000000000004', 3, '3', 'tbsp', 'olive oil'),
  ('b0000000-0000-4000-8000-000000000004', 4, '1', 'handful', 'basil leaves'),
  ('b0000000-0000-4000-8000-000000000004', 5, '100', 'ml', 'double cream (optional)'),
  -- Cacio e Pepe
  ('b0000000-0000-4000-8000-000000000005', 0, '200', 'g', 'spaghetti'),
  ('b0000000-0000-4000-8000-000000000005', 1, '100', 'g', 'pecorino romano, finely grated'),
  ('b0000000-0000-4000-8000-000000000005', 2, '2', 'tsp', 'black peppercorns, coarsely ground'),
  -- Brown Butter Chocolate Chip Cookies
  ('b0000000-0000-4000-8000-000000000006', 0, '225', 'g', 'butter'),
  ('b0000000-0000-4000-8000-000000000006', 1, '200', 'g', 'dark brown sugar'),
  ('b0000000-0000-4000-8000-000000000006', 2, '100', 'g', 'caster sugar'),
  ('b0000000-0000-4000-8000-000000000006', 3, '2', '', 'eggs'),
  ('b0000000-0000-4000-8000-000000000006', 4, '300', 'g', 'plain flour'),
  ('b0000000-0000-4000-8000-000000000006', 5, '1', 'tsp', 'bicarbonate of soda'),
  ('b0000000-0000-4000-8000-000000000006', 6, '250', 'g', 'dark chocolate, chopped'),
  ('b0000000-0000-4000-8000-000000000006', 7, '1', 'tsp', 'flaky sea salt');

-- Instructions ----------------------------------------------------------

insert into public.instructions (recipe_id, position, section_heading, text, timer_minutes) values
  ('b0000000-0000-4000-8000-000000000001', 0, 'The braise', 'Season the beef generously and brown it hard in olive oil, in batches. Set aside.', null),
  ('b0000000-0000-4000-8000-000000000001', 1, null, 'Soften the onion and carrot in the same pot, then add garlic and tomato paste and cook until brick red.', 8),
  ('b0000000-0000-4000-8000-000000000001', 2, null, 'Deglaze with the wine, scraping the bottom. Return the beef, add tomatoes and bay, and bring to a bare simmer.', null),
  ('b0000000-0000-4000-8000-000000000001', 3, null, 'Cover and braise low until the beef shreds with a spoon. Skim, shred, and season.', 180),
  ('b0000000-0000-4000-8000-000000000001', 4, 'To serve', 'Cook the pappardelle, toss with the ragù and a splash of pasta water, and finish with grated parmesan.', 10),
  ('b0000000-0000-4000-8000-000000000002', 0, null, 'Heat the oven to 175°C. Line a loaf tin with baking paper.', null),
  ('b0000000-0000-4000-8000-000000000002', 1, null, 'Whisk yoghurt, sugar, eggs, and lemon zest. Fold in flour and baking powder, then stream in the oil.', null),
  ('b0000000-0000-4000-8000-000000000002', 2, null, 'Bake until a skewer comes out clean.', 50),
  ('b0000000-0000-4000-8000-000000000002', 3, null, 'Simmer the lemon juice with two spoons of sugar and brush over the warm cake. Cool completely before slicing.', null),
  ('b0000000-0000-4000-8000-000000000003', 0, null, 'Drop the frozen udon into boiling water just until loosened.', 2),
  ('b0000000-0000-4000-8000-000000000003', 1, null, 'Melt the butter in a wide pan, whisk in miso and soy with a ladle of noodle water until glossy.', null),
  ('b0000000-0000-4000-8000-000000000003', 2, null, 'Toss the noodles through the sauce, top with spring onions and a jammy egg.', null),
  ('b0000000-0000-4000-8000-000000000004', 0, null, 'Heat the oven to 200°C. Roast tomatoes, onion, and garlic in olive oil until blistered and collapsing.', 45),
  ('b0000000-0000-4000-8000-000000000004', 1, null, 'Squeeze the garlic from its skins, then blend everything with the basil until smooth.', null),
  ('b0000000-0000-4000-8000-000000000004', 2, null, 'Reheat gently, season, and swirl in the cream if using.', null),
  ('b0000000-0000-4000-8000-000000000005', 0, null, 'Toast the pepper in a dry pan until fragrant. Add a ladle of water to stop the cooking.', 1),
  ('b0000000-0000-4000-8000-000000000005', 1, null, 'Cook the spaghetti in shallow, well-salted water so it turns extra starchy.', 9),
  ('b0000000-0000-4000-8000-000000000005', 2, null, 'Off the heat, toss the pasta with the pepper pan, then add pecorino and splashes of pasta water, tossing hard until a glossy sauce clings.', null),
  ('b0000000-0000-4000-8000-000000000006', 0, 'The night before', 'Brown the butter until nutty and deep gold, then cool slightly. Beat with both sugars, then the eggs.', null),
  ('b0000000-0000-4000-8000-000000000006', 1, null, 'Fold in flour, bicarb, chocolate, and salt. Rest the dough in the fridge overnight.', null),
  ('b0000000-0000-4000-8000-000000000006', 2, 'Baking day', 'Heat the oven to 180°C. Scoop generous balls onto lined trays, spaced widely.', null),
  ('b0000000-0000-4000-8000-000000000006', 3, null, 'Bake until the edges are set and the centres still look slightly underdone. Salt the tops and cool on the tray.', 12);

-- Notes ------------------------------------------------------------------
-- Author is null (no seed auth users); the UI shows dated, unattributed notes.

insert into public.notes (recipe_id, author_id, body, created_at, updated_at) values
  ('b0000000-0000-4000-8000-000000000001', null,
   'Used short ribs instead of chuck — richer, needed an extra half hour. Skim well or it''s greasy.',
   now() - interval '5 days', now() - interval '5 days'),
  ('b0000000-0000-4000-8000-000000000001', null,
   'Doubled and froze half in flat bags. Defrosts in the time the pasta takes.',
   now() - interval '2 days', now() - interval '2 days'),
  ('b0000000-0000-4000-8000-000000000005', null,
   'Water, not too much, and off the heat for the cheese — it clumps if the pan is screaming hot.',
   now() - interval '1 day', now() - interval '1 day');

commit;
