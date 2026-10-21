create table if not exists public.founder_tasks (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete set null,
  category text not null check (category in ('CORE_BOT','PLATFORM','NEUROFARM','PINK_NOIZE','CONTENT','PARTNERS','BOOK','SOCHI_OS')),
  title text not null,
  body text,
  status text not null default 'today' check (status in ('today','done','later','blocked','review')),
  priority integer not null default 0,
  due_at timestamptz,
  delivered_at timestamptz,
  completed_at timestamptz,
  source_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists founder_tasks_status_priority_idx on public.founder_tasks(status, priority desc, created_at asc);
