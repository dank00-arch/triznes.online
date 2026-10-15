create table public.triznes_voice_requests (
id uuid primary key default gen_random_uuid(), telegram_user_id text not null, chat_id text not null, message_id bigint not null,
source_file_id text not null, source_file_unique_id text not null, mime_type text not null default 'audio/ogg',
source_storage_path text, source_update jsonb not null, transcript text, analysis jsonb,
status text not null default 'queued' check(status in ('queued','processing','review','dispatching','dispatched','cancelled','failed')),
attempts integer not null default 0, error_code text, dispatch_result jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
unique(telegram_user_id,chat_id,message_id));
alter table public.triznes_voice_requests enable row level security;
revoke all on public.triznes_voice_requests from anon, authenticated;
grant all on public.triznes_voice_requests to service_role;
create index triznes_voice_queue_idx on public.triznes_voice_requests(status,created_at);
comment on table public.triznes_voice_requests is 'Private Telegram voice intake. Original transcript is immutable editorial input; confirmation never grants publication or source rights.';
select cron.schedule('triznes-voice-worker','* * * * *',$worker$
select net.http_post(
 url := 'https://bbxhhtpmbtgfaxamgksf.supabase.co/functions/v1/telegram-publication-root/voice',
 headers := jsonb_build_object('Content-Type','application/json','x-voice-worker',(select setting_value from public.telegram_bot_settings where telegram_user_id='global' and setting_key='podcast_worker_secret_v1')),
 body := '{"action":"work"}'::jsonb,timeout_milliseconds := 120000);
$worker$);