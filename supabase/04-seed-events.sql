insert into public.events (
  id, title, description, event_type, sport, age_limit, city, area,
  location_name, map_url, starts_at, request_enabled, is_published
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'Вечерняя прогулка по Marina Hurghada',
    'Набережная, кафе, закат и спокойный маршрут для первого знакомства с городом.',
    'general', null, null, 'Хургада', 'Marina', 'Hurghada Marina',
    'https://www.google.com/maps/search/?api=1&query=Hurghada%20Marina',
    date_trunc('day', now()) + interval '19 hours 30 minutes',
    false, true
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Снорклинг на островах',
    'Морская программа на день: трансфер, лодка, остановки у рифов и отдых на пляже.',
    'general', null, null, 'Хургада', 'Marina', 'New Marina Hurghada',
    'https://www.google.com/maps/search/?api=1&query=New%20Marina%20Hurghada',
    date_trunc('day', now()) + interval '1 day 9 hours',
    true, true
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'Семейная афиша на выходные',
    'Подборка мест для детей и взрослых: шоу, прогулки, рестораны и спокойные локации.',
    'kids', null, 6, 'Хургада', 'Mamsha', 'Hurghada Mamsha Promenade',
    'https://www.google.com/maps/search/?api=1&query=Hurghada%20Mamsha%20Promenade',
    date_trunc('week', now()) + interval '5 days 17 hours',
    false, true
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'Утренняя йога у моря',
    'Легкая тренировка на рассвете, дыхание, растяжка и спокойный темп.',
    'sport', 'Йога', null, 'Хургада', 'Sahl Hasheesh', 'Sahl Hasheesh Old Town',
    'https://www.google.com/maps/search/?api=1&query=Sahl%20Hasheesh%20Old%20Town',
    date_trunc('week', now()) + interval '4 days 7 hours 30 minutes',
    true, true
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    'Волейбол на пляже',
    'Открытая игра для жителей района, команды собираются на месте.',
    'sport', 'Волейбол', null, 'Хургада', 'Эль-Ахья', 'El Ahyaa Beach',
    'https://www.google.com/maps/search/?api=1&query=El%20Ahyaa%20Beach%20Hurghada',
    date_trunc('week', now()) + interval '9 days 18 hours 30 minutes',
    true, true
  ),
  (
    '10000000-0000-4000-8000-000000000006',
    'Баскетбол 3x3',
    'Вечерняя игра 3x3, можно прийти одному или своей командой.',
    'sport', 'Баскетбол', null, 'Хургада', 'Dahar', 'Dahar Sports Court',
    'https://www.google.com/maps/search/?api=1&query=Dahar%20Hurghada%20basketball',
    date_trunc('week', now()) + interval '10 days 20 hours',
    true, true
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  event_type = excluded.event_type,
  sport = excluded.sport,
  age_limit = excluded.age_limit,
  city = excluded.city,
  area = excluded.area,
  location_name = excluded.location_name,
  map_url = excluded.map_url,
  starts_at = excluded.starts_at,
  request_enabled = excluded.request_enabled,
  is_published = excluded.is_published,
  updated_at = now();
