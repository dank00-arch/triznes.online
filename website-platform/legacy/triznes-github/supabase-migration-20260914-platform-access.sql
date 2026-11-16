-- TRIZNES platform access and LUBICOIN wallet migration
-- Run in Supabase SQL Editor after supabase-schema.sql.

alter table public.profiles
  add column if not exists updated_at timestamptz not null default now();
alter table public.user_data
  add column if not exists updated_at timestamptz not null default now();
alter table public.locations
  add column if not exists updated_at timestamptz not null default now();

alter table public.profiles
  add column if not exists community_access_status text not null default 'none',
  add column if not exists community_access_until timestamptz,
  add column if not exists mentor_operator_approved boolean not null default false,
  add column if not exists mentor_operator_confirmed_at timestamptz,
  add column if not exists lubicoin_balance numeric(24, 6) not null default 0,
  add column if not exists nls_balance numeric(24, 6) not null default 0;

alter table public.consents
  add column if not exists marketing_accepted_at timestamptz,
  add column if not exists location_accepted_at timestamptz;

alter table public.user_data
  add column if not exists state jsonb not null default '{}';

alter table public.communities
  add column if not exists link text,
  add column if not exists document_path text,
  add column if not exists media_paths jsonb not null default '[]';

alter table public.media_assets
  add column if not exists status text not null default 'pending';

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  provider text not null,
  provider_payment_id text,
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'RUB',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  purpose text not null,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  coin_type text not null check (coin_type in ('LUBICOIN', 'NLS')),
  amount numeric(24, 6) not null check (amount > 0),
  payout_method text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mentor_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  token_amount numeric(24, 6) not null default 0 check (token_amount >= 0),
  status text not null default 'draft',
  angel_id uuid references public.profiles(id) on delete set null,
  character_id uuid references public.profiles(id) on delete set null,
  mentor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_created_at_idx on public.payments(created_at desc);
create index if not exists withdrawal_requests_user_idx on public.withdrawal_requests(user_id, created_at desc);
create index if not exists mentor_tasks_status_idx on public.mentor_tasks(status, created_at desc);

alter table public.profiles
  drop constraint if exists profiles_community_access_status_check;

alter table public.profiles
  add constraint profiles_community_access_status_check
  check (community_access_status in ('none', 'pending', 'active', 'expired'));

create table if not exists public.payment_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'RUB',
  purpose text not null default 'community_access',
  status text not null default 'pending' check (status in ('pending', 'paid', 'rejected', 'refunded')),
  proof_url text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists payment_intents_user_idx on public.payment_intents(user_id, created_at desc);

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  chain text not null default 'ton',
  address text not null unique,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lubicoin_transactions (
  id uuid primary key default gen_random_uuid(),
  sender_user_id uuid references public.profiles(id) on delete set null,
  recipient_user_id uuid references public.profiles(id) on delete set null,
  amount numeric(24, 6) not null check (amount > 0),
  transaction_type text not null check (transaction_type in ('reward', 'support', 'transfer', 'deposit', 'withdrawal')),
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'failed')),
  external_hash text,
  description text,
  created_at timestamptz not null default now()
);

alter table public.payment_intents enable row level security;
alter table public.wallets enable row level security;
alter table public.lubicoin_transactions enable row level security;
alter table public.payments enable row level security;
alter table public.withdrawal_requests enable row level security;
alter table public.mentor_tasks enable row level security;

-- Replace the initial permissive policies with owner/admin access.
create or replace function public.is_admin_user()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and lower(role) in ('admin', 'administrator', 'администратор')
  );
$$;

revoke all on function public.is_admin_user() from public;
grant execute on function public.is_admin_user() to authenticated;

drop policy if exists "Allow insert profiles" on public.profiles;
drop policy if exists "Allow update profiles" on public.profiles;
drop policy if exists "Allow select profiles" on public.profiles;
drop policy if exists "Allow insert consents" on public.consents;
drop policy if exists "Allow select consents" on public.consents;
drop policy if exists "Allow insert user_data" on public.user_data;
drop policy if exists "Allow update user_data" on public.user_data;
drop policy if exists "Allow select user_data" on public.user_data;
drop policy if exists "Allow insert communities" on public.communities;
drop policy if exists "Allow select communities" on public.communities;
drop policy if exists "Allow insert locations" on public.locations;
drop policy if exists "Allow update locations" on public.locations;
drop policy if exists "Allow select locations" on public.locations;

drop policy if exists "Users read own profiles" on public.profiles;
create policy "Users read own profiles" on public.profiles
for select to authenticated using (id = auth.uid() or public.is_admin_user());
drop policy if exists "Users create own profiles" on public.profiles;
create policy "Users create own profiles" on public.profiles
for insert to authenticated with check (id = auth.uid());
drop policy if exists "Users update own profiles" on public.profiles;
create policy "Users update own profiles" on public.profiles
for update to authenticated using (id = auth.uid() or public.is_admin_user())
with check (id = auth.uid() or public.is_admin_user());

drop policy if exists "Users manage own consents" on public.consents;
create policy "Users manage own consents" on public.consents
for all to authenticated using (user_id = auth.uid() or public.is_admin_user())
with check (user_id = auth.uid() or public.is_admin_user());
drop policy if exists "Users manage own user data" on public.user_data;
create policy "Users manage own user data" on public.user_data
for all to authenticated using (user_id = auth.uid() or public.is_admin_user())
with check (user_id = auth.uid() or public.is_admin_user());
drop policy if exists "Authenticated users read communities" on public.communities;
create policy "Authenticated users read communities" on public.communities
for select to authenticated using (true);
drop policy if exists "Users create own communities" on public.communities;
create policy "Users create own communities" on public.communities
for insert to authenticated with check (owner_id = auth.uid());
drop policy if exists "Owners and admins update communities" on public.communities;
create policy "Owners and admins update communities" on public.communities
for update to authenticated using (owner_id = auth.uid() or public.is_admin_user())
with check (owner_id = auth.uid() or public.is_admin_user());
drop policy if exists "Users manage own locations" on public.locations;
create policy "Users manage own locations" on public.locations
for all to authenticated using (user_id = auth.uid() or public.is_admin_user())
with check (user_id = auth.uid() or public.is_admin_user());

drop policy if exists "Admins manage payments" on public.payments;
create policy "Admins manage payments" on public.payments
for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());
drop policy if exists "Users read own payments" on public.payments;
create policy "Users read own payments" on public.payments
for select to authenticated using (user_id = auth.uid());
drop policy if exists "Users manage own withdrawals" on public.withdrawal_requests;
create policy "Users manage own withdrawals" on public.withdrawal_requests
for all to authenticated using (user_id = auth.uid() or public.is_admin_user())
with check (user_id = auth.uid() or public.is_admin_user());
drop policy if exists "Admins manage mentor tasks" on public.mentor_tasks;
create policy "Admins manage mentor tasks" on public.mentor_tasks
for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());
drop policy if exists "Participants read mentor tasks" on public.mentor_tasks;
create policy "Participants read mentor tasks" on public.mentor_tasks
for select to authenticated using (angel_id = auth.uid() or character_id = auth.uid() or mentor_id = auth.uid());

drop policy if exists "Admins manage payment intents" on public.payment_intents;
create policy "Admins manage payment intents" on public.payment_intents
for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());
drop policy if exists "Admins read wallets" on public.wallets;
create policy "Admins read wallets" on public.wallets
for select to authenticated using (public.is_admin_user() or user_id = auth.uid());
drop policy if exists "Admins read ledger" on public.lubicoin_transactions;
create policy "Admins read ledger" on public.lubicoin_transactions
for select to authenticated using (public.is_admin_user() or sender_user_id = auth.uid() or recipient_user_id = auth.uid());
drop policy if exists "Admins manage media metadata" on public.media_assets;
create policy "Admins manage media metadata" on public.media_assets
for all to authenticated using (public.is_admin_user() or auth.uid() = user_id)
with check (public.is_admin_user() or auth.uid() = user_id);

drop policy if exists "Authenticated users create own payment intents" on public.payment_intents;
create policy "Authenticated users create own payment intents" on public.payment_intents
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users view own payment intents" on public.payment_intents;
create policy "Users view own payment intents" on public.payment_intents
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users manage own wallets" on public.wallets;
create policy "Users manage own wallets" on public.wallets
for select to authenticated using (auth.uid() = user_id);

create or replace function public.approve_community_payment(payment_id uuid, reviewer_id uuid)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  payment_row public.payment_intents;
  profile_row public.profiles;
begin
  if auth.uid() is null or auth.uid() <> reviewer_id then
    raise exception 'Reviewer must be the current authenticated user';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = reviewer_id
      and lower(role) in ('admin', 'administrator', 'администратор')
  ) then
    raise exception 'Only administrators can approve community payments';
  end if;
  select * into payment_row from public.payment_intents where id = payment_id for update;
  if payment_row.id is null then raise exception 'Payment not found'; end if;
  if payment_row.status <> 'pending' then raise exception 'Payment is not pending'; end if;
  if payment_row.amount < 5000 or payment_row.currency <> 'RUB' or payment_row.purpose <> 'community_access' then
    raise exception 'Payment does not qualify for platform access';
  end if;
  update public.payment_intents
    set status = 'paid', reviewed_by = reviewer_id, reviewed_at = now()
    where id = payment_id;
  update public.profiles
    set community_access_status = 'active',
        community_access_until = now() + interval '7 days'
    where id = payment_row.user_id
    returning * into profile_row;
  return profile_row;
end;
$$;

grant execute on function public.approve_community_payment(uuid, uuid) to authenticated;

create or replace function public.expire_community_access()
returns integer
language sql
security definer
set search_path = public
as $$
  with expired as (
    update public.profiles
      set community_access_status = 'expired'
      where community_access_status = 'active'
        and community_access_until is not null
        and community_access_until <= now()
      returning id
  ) select count(*)::integer from expired;
$$;

grant execute on function public.expire_community_access() to authenticated;

-- Start the public economy at zero. Future LUBICOIN changes must come from the server ledger.
update public.profiles set lubicoin_balance = 0, nls_balance = 0;

create table if not exists public.lubicoin_deposit_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount_rub numeric(12,2) not null check (amount_rub > 0),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.lubicoin_support_requests (
  id uuid primary key default gen_random_uuid(),
  sender_user_id uuid not null references public.profiles(id) on delete cascade,
  character_name text not null,
  amount numeric(24,6) not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

alter table public.lubicoin_deposit_requests enable row level security;
alter table public.lubicoin_support_requests enable row level security;
drop policy if exists "Users create own deposit requests" on public.lubicoin_deposit_requests;
create policy "Users create own deposit requests" on public.lubicoin_deposit_requests for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users view own deposit requests" on public.lubicoin_deposit_requests;
create policy "Users view own deposit requests" on public.lubicoin_deposit_requests for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users create own support requests" on public.lubicoin_support_requests;
create policy "Users create own support requests" on public.lubicoin_support_requests for insert to authenticated with check (auth.uid() = sender_user_id);
drop policy if exists "Users view own support requests" on public.lubicoin_support_requests;
create policy "Users view own support requests" on public.lubicoin_support_requests for select to authenticated using (auth.uid() = sender_user_id);
