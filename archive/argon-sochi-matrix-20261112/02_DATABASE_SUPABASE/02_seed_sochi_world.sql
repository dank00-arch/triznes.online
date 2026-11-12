-- ============================================================================
-- ПРЕДЗАПОЛНЕНИЕ МИРА СОЧИ: ФРАКЦИИ, ЛОКАЦИИ, АССИСТЕНТЫ ТРИСНАС И АПОЛЛОН
-- ============================================================================

insert into public.factions (id, name, world_affinity, primary_color, description) values
('faction_triznes_core', 'ЯДРО ТРИЗНЕС (TRIZNES MEDIAHUB)', 'cyber', '#00FFCC', 'Технологическое и продюсерское ядро экосистемы. Управление Нейрофермой и 13 уровнями.'),
('faction_apollo_arts', 'ОРДЕН АПОЛЛОНА (SOCHIWOOD × ТЕАТР ТУЗ × PINK NOIZE)', 'hybrid', '#FF0055', 'Творческий, музыкальный и театральный кластер Сочи.'),
('faction_craft_masters', 'ГИЛЬДИЯ ТРАНСФОРМАЦИИ (Школа ремонта × XPRO)', 'real', '#FFAA00', 'Инженеры реального мира Сочи: экспресс-ремонт XPRO и Школа ремонта.')
on conflict (id) do update set
    name = excluded.name,
    primary_color = excluded.primary_color;

insert into public.sochi_nodes (id, name, real_world_title, cyber_world_title, category, lat, lng, elevation_m, tier, owner_faction, color_hex, active_pulse, media_payload) values
('triznes_primorskaya', 'TRIZNES MEDIAHUB — ПРИМОРСКАЯ', 'Медиахаб ТРИЗНЕС на Приморской', 'ЦИТАДЕЛЬ ЯДРА // NEXUS-01', 'core_hub', 43.5738, 39.7295, 25, 13, 'faction_triznes_core', '#00FFCC', true, '{"tags": ["TRIZNES", "Нейроферма"], "stream": "live_hub"}'::jsonb),
('sochiwood_morport', 'SOCHIWOOD GATE — МОРСКОЙ ПОРТ', 'Морской Порт Сочи / SOCHIWOOD', 'ПОРТАЛ АПОЛЛОНА // СИНЕМА-ДОК', 'cinematic_hub', 43.5806, 39.7188, 5, 12, 'faction_apollo_arts', '#FF0055', true, '{"tags": ["SOCHIWOOD", "PINK NOIZE"], "stream": "cinema_dock"}'::jsonb),
('navaginskaya_artery', 'НАВАГИНСКАЯ АВЕНЮ', 'Улица Навагинская (Центр Сочи)', 'НЕОНОВЫЙ КОРИДОР СДЕЛОК И КВЕСТОВ', 'quest_corridor', 43.5855, 39.7231, 12, 10, 'faction_triznes_core', '#00E5FF', true, '{"tags": ["Комьюнити", "Стрит-квесты"], "stream": "street_radar"}'::jsonb),
('xpro_navaginskaya', 'XPRO REPAIR LAB', 'Сервисный центр XPRO Сочи', 'ЛАБОРАТОРИЯ КИБЕР-ИМПЛАНТОВ', 'tech_repair', 43.5868, 39.7242, 14, 8, 'faction_craft_masters', '#3399FF', false, '{"tags": ["XPRO", "Экспресс-ремонт"], "stream": "tech_craft"}'::jsonb),
('teatr_tuz_stage', 'ТЕАТР ТУЗ × COLLIDER', 'Режиссерская сцена ТЕАТР ТУЗ', 'КОЛЛАЙДЕР ПЕРСОНАЖЕЙ (CINEMA FLOW)', 'theatrical_node', 43.5772, 39.7260, 30, 11, 'faction_apollo_arts', '#B800FF', true, '{"tags": ["ТЕАТР ТУЗ", "COLLIDER"], "stream": "stage_flow"}'::jsonb),
('shkola_remonta_polygon', 'ПОЛИГОН ШКОЛА РЕМОНТА', 'Локация Школа ремонта × PINK NOIZE', 'КУЗНИЦА РЕАЛЬНОСТИ // КРАФТ-СЕКТОР', 'craft_arena', 43.5920, 39.7310, 40, 9, 'faction_craft_masters', '#FFAA00', false, '{"tags": ["Школа ремонта", "OpusClip"], "stream": "renovation_show"}'::jsonb),
('krasnaya_polyana_peak', 'КРАСНАЯ ПОЛЯНА — ОЛИМП', 'Красная Поляна / Роза Хутор', 'ВЫСОТНЫЙ ШПИЛЬ ОЛИМПА (2320M)', 'high_altitude_outpost', 43.6840, 40.2030, 960, 11, 'faction_triznes_core', '#00FF88', true, '{"tags": ["Горы", "Выездной хаб"], "stream": "mountain_uplink"}'::jsonb)
on conflict (id) do update set
    lat = excluded.lat,
    lng = excluded.lng,
    tier = excluded.tier;

insert into public.characters (handle, display_name, archetype, faction_id, is_ai_core, level, xp, world_mode, lat, lng, elevation, current_node_id, status_text, visual_config) values
('trisnas_core', 'Ассистент Триснас', 'Верховный Архитектор Матрицы', 'faction_triznes_core', true, 13, 999999, 'cyber', 43.5738, 39.7295, 120, 'triznes_primorskaya', 'Синхронизация Ядра ТРИЗНЕС и Нейрофермы', '{"primary_hex": "#00FFCC", "aura_radius": 1500, "shape": "octahedron"}'::jsonb),
('apollo_muse', 'Ассистент Аполлон', 'Демиург Сцены и Эстетики', 'faction_apollo_arts', true, 13, 999999, 'hybrid', 43.5806, 39.7188, 100, 'sochiwood_morport', 'Генерация творческой волны SOCHIWOOD × ТЕАТР ТУЗ', '{"primary_hex": "#FF0055", "aura_radius": 1500, "shape": "solar_prism"}'::jsonb),
('tuz_archon', 'Мастер Игры (ТЕАТР ТУЗ)', 'Хранитель Колоды Персонажей', 'faction_apollo_arts', false, 12, 14400, 'hybrid', 43.5772, 39.7260, 45, 'teatr_tuz_stage', 'Запуск сцены COLLIDER', '{"primary_hex": "#B800FF", "aura_radius": 800, "shape": "diamond"}'::jsonb),
('xpro_titan', 'Инженер XPRO', 'Техно-Хирург Навагинской', 'faction_craft_masters', false, 9, 6400, 'real', 43.5868, 39.7242, 15, 'xpro_navaginskaya', 'Сверхбыстрое восстановление девайсов', '{"primary_hex": "#3399FF", "aura_radius": 450, "shape": "cylinder"}'::jsonb)
on conflict (handle) do update set
    lat = excluded.lat,
    lng = excluded.lng,
    status_text = excluded.status_text;
