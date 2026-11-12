-- ============================================================================
-- SOCHI MATRIX // ЯДРО БАЗЫ ДАННЫХ SUPABASE (POSTGRESQL + REALTIME)
-- Архитектура Двух Миров: REAL SOCHI (SOCHIWOOD) & CYBER MATRIX (TRIZNES)
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. ТАБЛИЦА ФРАКЦИЙ И КЛАСТЕРОВ ЭКОСИСТЕМЫ
create table if not exists public.factions (
    id text primary key,
    name text not null,
    world_affinity text not null check (world_affinity in ('real', 'cyber', 'hybrid')),
    primary_color text not null default '#00FFCC',
    description text,
    created_at timestamptz default now()
);

-- 2. ТАБЛИЦА УЗЛОВ И ЛОКАЦИЙ ГОРОДА СОЧИ (SOCHI GEO NODES)
create table if not exists public.sochi_nodes (
    id text primary key,
    name text not null,
    real_world_title text not null,
    cyber_world_title text not null,
    category text not null,
    lat double precision not null,
    lng double precision not null,
    elevation_m double precision default 10,
    tier int not null default 1 check (tier between 1 and 13),
    owner_faction text references public.factions(id),
    color_hex text default '#00FFCC',
    active_pulse boolean default false,
    media_payload jsonb default '{}'::jsonb,
    updated_at timestamptz default now()
);

-- 3. ТАБЛИЦА ПЕРСОНАЖЕЙ И НЕЙРОЖИВЫХ АССИСТЕНТОВ (13 УРОВНЕЙ)
create table if not exists public.characters (
    id uuid primary key default gen_random_uuid(),
    handle text unique not null,
    telegram_id bigint unique,
    display_name text not null,
    archetype text default 'Резидент Сочи',
    faction_id text references public.factions(id),
    is_ai_core boolean default false,
    level int not null default 1 check (level between 1 and 13),
    xp bigint not null default 0,
    world_mode text not null default 'hybrid' check (world_mode in ('real', 'cyber', 'hybrid')),
    lat double precision not null default 43.5815,
    lng double precision not null default 39.7228,
    elevation double precision default 15,
    current_node_id text references public.sochi_nodes(id),
    status_text text default 'В матрице Сочи',
    avatar_url text,
    latest_media_url text,
    visual_config jsonb default '{"primary_hex": "#00FFCC", "aura_radius": 300}'::jsonb,
    last_ping timestamptz default now()
);

-- 4. ТАБЛИЦА ЖИВЫХ СОБЫТИЙ, КВЕСТОВ И ИМПУЛЬСОВ ОТ ЯДРА (ТРИСНАС / АПОЛЛОН)
create table if not exists public.world_events (
    id uuid primary key default gen_random_uuid(),
    initiator_handle text references public.characters(handle),
    target_node_id text references public.sochi_nodes(id),
    event_type text not null, -- 'APOLLO_WAVE', 'TRISNAS_DIRECTIVE', 'QUEST_DROP', 'MEDIA_DROP', 'REPAIR_BOOST'
    title text not null,
    description text,
    world_layer text default 'hybrid' check (world_layer in ('real', 'cyber', 'hybrid')),
    media_url text,
    reward_xp int default 100,
    is_active boolean default true,
    created_at timestamptz default now(),
    expires_at timestamptz default (now() + interval '4 hours')
);

-- 5. ВКЛЮЧЕНИЕ SUPABASE REALTIME ДЛЯ МГНОВЕННОЙ СИНХРОНИЗАЦИИ С 3D-КАРТОЙ
alter publication supabase_realtime add table public.sochi_nodes;
alter publication supabase_realtime add table public.characters;
alter publication supabase_realtime add table public.world_events;

-- 6. ФУНКЦИЯ АВТОМАТИЧЕСКОГО РАСЧЕТА УРОВНЯ (1..13) ПО ОПЫТУ (XP)
create or replace function public.recalculate_character_level()
returns trigger as $$
begin
    -- Не меняем уровень верховных ИИ-ассистентов Ядра (всегда 13)
    if new.is_ai_core = true then
        new.level := 13;
        return new;
    end if;

    new.level := least(13, greatest(1, floor(sqrt(new.xp / 100.0))::int + 1));
    new.last_ping := now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_character_level on public.characters;
create trigger trg_character_level
before insert or update of xp on public.characters
for each row execute function public.recalculate_character_level();
