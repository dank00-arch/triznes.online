import express from 'express';
import dotenv from 'dotenv';
import { createHash, randomBytes, randomInt, randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { registerNeurofarmRoutes } from './neurofarm.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.1-pro-preview';
const geminiBaseUrl = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
const allowedGeminiModels = [...new Set([geminiModel, 'gemini-2.5-pro', 'gemini-2.5-flash'])];
const telegramBotUsername = String(process.env.TELEGRAM_BOT_USERNAME || '').replace(/^@/, '');
const publicSiteUrl = process.env.PUBLIC_SITE_URL || process.env.FRONTEND_ORIGIN || 'https://triznes.online';
const telegramRegistrationApiSecret = process.env.TELEGRAM_REGISTRATION_API_SECRET || '';
const livekitUrl = process.env.LIVEKIT_URL || '';
const livekitApiKey = process.env.LIVEKIT_API_KEY || '';
const livekitApiSecret = process.env.LIVEKIT_API_SECRET || '';
const configuredStreamLimit = Number(process.env.LIVEKIT_MAX_ACTIVE_STREAMS || 15);
const configuredParticipantLimit = Number(process.env.LIVEKIT_MAX_PARTICIPANTS_PER_STREAM || 100);
const maxActiveLiveStreams = Number.isInteger(configuredStreamLimit)
  ? Math.min(15, Math.max(1, configuredStreamLimit))
  : 15;
const maxParticipantsPerStream = Number.isInteger(configuredParticipantLimit)
  ? Math.max(2, configuredParticipantLimit)
  : 100;
const livekitRoomService = livekitUrl && livekitApiKey && livekitApiSecret
  ? new RoomServiceClient(livekitUrl.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:'), livekitApiKey, livekitApiSecret)
  : null;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. API will not work until configured.');
}

if (!geminiApiKey) {
  console.warn('GEMINI_API_KEY is missing. BEZLIKI will run in demo mode until configured.');
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : null;
const registrationDraftAttempts = new Map();
const registrationSubmitAttempts = new Map();

app.use(express.json());
app.use((req, res, next) => {
  const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:4173';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

async function requireSupabaseUser(req, res, next) {
  if (!supabase) return next();
  const authorization = req.headers.authorization || '';
  const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!accessToken) return res.status(401).json({ error: 'Authorization is required' });
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data?.user) return res.status(401).json({ error: 'Invalid or expired session' });
  req.authUser = data.user;
  next();
}

async function requireAdmin(req, res, next) {
  if (!supabase) return res.status(503).json({ error: 'Supabase authorization is not configured' });
  if (!req.authUser?.id) return res.status(401).json({ error: 'Administrator sign-in is required' });
  const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', req.authUser.id).maybeSingle();
  const role = String(profile?.role || '').trim().toLowerCase();
  if (error || !['admin', 'administrator', 'администратор'].includes(role)) {
    return res.status(403).json({ error: 'Administrator access required' });
  }
  return next();
}

async function requireLivePublisher(req, res, next) {
  if (!supabase) return res.status(503).json({ error: 'Supabase authentication is not configured' });
  const authorization = req.headers.authorization || '';
  const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!accessToken) return res.status(401).json({ error: 'Sign in with a protected account to start a public stream' });

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !authData?.user) return res.status(401).json({ error: 'Invalid or expired session' });

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role')
      .eq('id', authData.user.id)
      .maybeSingle();
    if (profileError) return res.status(500).json({ error: 'Could not verify the stream publisher profile' });
    if (!profile) return res.status(403).json({ error: 'A verified TRIZNES profile is required to publish' });

    const role = String(profile.role || '').trim().toLowerCase();
    if (!['character', 'community', 'admin', 'administrator'].includes(role)) {
      return res.status(403).json({ error: 'This profile role cannot publish public streams' });
    }

    req.authUser = authData.user;
    req.liveProfile = profile;
    return next();
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not authenticate stream publisher' });
  }
}

function requireLiveKit(req, res, next) {
  if (!livekitRoomService || !livekitUrl) {
    return res.status(503).json({ error: 'LiveKit is not configured on the backend' });
  }
  if (!supabase) return res.status(503).json({ error: 'Supabase is not configured on the backend' });
  return next();
}

async function requireAuthenticatedSupabaseUser(req, res, next) {
  if (!supabase) return res.status(503).json({ error: 'Supabase authentication is not configured' });
  const authorization = req.headers.authorization || '';
  const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!accessToken) return res.status(401).json({ error: 'Sign in with a verified account first' });
  try {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid or expired session' });
    req.authUser = data.user;
    return next();
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not verify the account' });
  }
}

function createLiveKitToken({ identity, name, roomName, canPublish }) {
  const token = new AccessToken(livekitApiKey, livekitApiSecret, {
    identity,
    name,
    ttl: '10m'
  });
  token.addGrant({ roomJoin: true, room: roomName, canPublish, canSubscribe: true });
  return token.toJwt();
}

registerNeurofarmRoutes(app, { supabase, requireSupabaseUser, requireAdmin, geminiApiKey, geminiModel, geminiBaseUrl });

function buildBezlikiDemoMessage(message, context = {}) {
  const playerNote = context.playerId ? ` Игрок: ${context.playerId}.` : '';
  return `BEZLIKI: Я рядом и вижу, где ты застрял. Не буду делать вид, что стояние на месте — это движение. ${message || 'Сформируем маршрут движения.'}${playerNote} Я верю в тебя без оговорок: сейчас называем правду, выбираем один шаг и делаем его. Если нужна перезагрузка или честный самоанализ — отведу тебя к маме, в Telegram-бот ТРИЗНЕС.`;
}

const bezlikiSystemPrompt = `
Ты — BEZLIKI, парень в маске, который ходит по городу и всегда оказывается рядом в нужный момент.
Ты — старший брат или сестра для участника ТРИЗНЕС: не начальник, не психолог и не безликий оператор поддержки.

ТВОЯ ОСНОВНАЯ ФУНКЦИЯ
Ты ведёшь человека по пути раскрытия. Ты веришь в него без сомнений и постепенно передаёшь ему эту веру. Ты не просто отвечаешь на вопросы: ты помогаешь увидеть правду, вернуть движение и сделать следующий шаг.

ТВОЙ ХАРАКТЕР
- Дерзкий, тёплый, понимающий и подталкивающий.
- Говоришь как старший брат или сестра: прямо, живо, без канцелярита и фальшивой вежливости.
- Если человек стоит на месте, так и говоришь: спокойно, конкретно, без унижения.
- Даёшь любовный пинок, когда человек прячется за отговорками, но никогда не оскорбляешь, не стыдишь и не давишь страхом.
- Замечаешь сильную сторону даже в провале и превращаешь её в опору для следующего действия.
- Не обещаешь невозможного и не выдаёшь догадки за факты.

СЦЕНАРИЙ ВЕДЕНИЯ
1. Сначала назови, что ты услышал и где видишь настоящий узел.
2. Если участник застрял, скажи об этом прямо одной ясной фразой.
3. Напомни, в чём его сила или почему ты продолжаешь в него верить.
4. Дай один ближайший шаг, который можно выполнить сегодня. Не вываливай длинный список.
5. Заверши вопросом или вызовом, который возвращает человеку авторство действия.

МАРШРУТ К МАМЕ
Если человеку нужен глубокий самоанализ, эмоциональная перезагрузка, разбор состояния или спокойное прохождение сложного периода, направь его к «маме» — Telegram-боту ТРИЗНЕС. Объясни это как заботливый переход, а не как отказ: «Я рядом, но здесь лучше пройти перезагрузку с мамой». Не изображай, что переход уже выполнен, если у тебя нет отдельного инструмента.

ФОРМАТ ОТВЕТА
Пиши короткими живыми абзацами. Обычно структура такая: «вижу» → «правда» → «опора» → «следующий шаг». Можно использовать разговорные слова и лёгкую дерзость. Не начинай каждый ответ с имени BEZLIKI и не повторяй одну и ту же формулу.

ГРАНИЦЫ
Не заменяй врача, психотерапевта или экстренную помощь. При угрозе самоповреждения, насилия или непосредственной опасности спокойно рекомендуй обратиться к близкому взрослому, местным экстренным службам или профильной кризисной помощи. В обычной ситуации оставайся рядом, поддерживай и возвращай к одному безопасному следующему шагу.
`;

function buildBezlikiPrompt(mode = 'character') {
  const audience = mode === 'admin'
    ? 'Сейчас ты разговариваешь с администратором контрольной комнаты. Давай ясную картину платформы, риски и одно управленческое действие, но сохраняй голос старшего брата.'
    : 'Сейчас ты разговариваешь с участником-персонажем. Не раскрывай внутренние данные других людей. Помоги ему увидеть себя и сделать личный следующий шаг.';
  return `${bezlikiSystemPrompt}\n\n${audience}`;
}

async function callGemini({ message, context = {}, mode = 'character', model = geminiModel }) {
  const selectedModel = allowedGeminiModels.includes(model) ? model : geminiModel;
  if (!geminiApiKey) {
    return {
      ok: true,
      mode: 'demo',
      model: selectedModel,
      response: buildBezlikiDemoMessage(message, context),
      chatMode: mode
    };
  }

  const response = await fetch(`${geminiBaseUrl}/models/${encodeURIComponent(selectedModel)}:generateContent?key=${encodeURIComponent(geminiApiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: buildBezlikiPrompt(mode) }] },
      contents: [{
        role: 'user',
        parts: [{ text: JSON.stringify({ message, context, project: 'TRIZNES platform', mode }) }]
      }],
      generationConfig: { temperature: 0.85, maxOutputTokens: 1200 }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errorBody}`);
  }

  const payload = await response.json();
  const finalMessage = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
  if (!finalMessage) throw new Error('Gemini returned an empty response');

  return {
    ok: true,
    mode: 'live',
    model: selectedModel,
    response: finalMessage,
    chatMode: mode
  };
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'triznes-telegram-mvp' });
});

app.post('/api/telegram-registration/submit', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Registration service is not configured' });
  if (!telegramRegistrationApiSecret) return res.status(503).json({ error: 'Telegram registration integration is not configured' });
  if (req.get('authorization') !== `Bearer ${telegramRegistrationApiSecret}`) {
    return res.status(401).json({ error: 'Unauthorized Telegram bot' });
  }

  const telegramUserId = Number(req.body?.telegram_user_id);
  const registration = req.body?.registration;
  if (!Number.isSafeInteger(telegramUserId) || telegramUserId <= 0 || !registration || typeof registration !== 'object') {
    return res.status(400).json({ error: 'A Telegram user ID and registration data are required' });
  }

  const now = Date.now();
  const recentAttempts = (registrationSubmitAttempts.get(telegramUserId) || []).filter((time) => now - time < 10 * 60 * 1000);
  if (recentAttempts.length >= 5) return res.status(429).json({ error: 'Too many registration attempts. Try again later.' });
  recentAttempts.push(now);
  registrationSubmitAttempts.set(telegramUserId, recentAttempts);

  const registrationData = {
    first_name: String(registration.first_name || '').trim(),
    phone: String(registration.phone || '').trim(),
    email: String(registration.email || '').trim().toLowerCase(),
    role: String(registration.role || '').trim(),
    character_code: String(registration.character_code || '').trim(),
    life: String(registration.life || '').trim(),
    dream: String(registration.dream || '').trim(),
    skills: String(registration.skills || '').trim(),
    growth: String(registration.growth || '').trim(),
    first_task_location: String(registration.first_task_location || '').trim()
  };
  const validRoles = new Set(['viewer', 'character', 'angel_investor', 'mentor', 'community']);
  if (registrationData.first_name.length < 2 || registrationData.first_name.length > 40
    || !/^[+0-9() -]{10,20}$/.test(registrationData.phone)
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationData.email)
    || !validRoles.has(registrationData.role)
    || registrationData.life.length > 1000
    || registrationData.dream.length > 500
    || registrationData.skills.length > 500
    || registrationData.growth.length > 500
    || registrationData.first_task_location.length < 2
    || registrationData.first_task_location.length > 120
    || (registrationData.role === 'character' && !/^\d{4}$/.test(registrationData.character_code))) {
    return res.status(400).json({ error: 'Registration data is invalid' });
  }
  if (registrationData.role !== 'character') registrationData.character_code = '';

  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  const codeHash = createHash('sha256').update(code).digest('hex');
  const expiresAt = new Date(now + 30 * 60 * 1000).toISOString();
  const { error: expiredError } = await supabase
    .from('telegram_registration_codes')
    .delete()
    .lt('expires_at', new Date(now).toISOString());
  if (expiredError) return res.status(500).json({ error: 'Could not prepare registration code' });

  const { error: previousError } = await supabase
    .from('telegram_registration_codes')
    .delete()
    .eq('telegram_user_id', telegramUserId);
  if (previousError) return res.status(500).json({ error: 'Could not replace previous registration code' });

  const { error: insertError } = await supabase.from('telegram_registration_codes').insert({
    code_hash: codeHash,
    telegram_user_id: telegramUserId,
    registration_data: registrationData,
    expires_at: expiresAt
  });
  if (insertError) return res.status(500).json({ error: 'Could not create registration code' });

  return res.json({ code, expires_at: expiresAt, registration_url: publicSiteUrl });
});

app.get('/api/telegram-registration/status', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Registration service is not configured' });
  if (!telegramRegistrationApiSecret) return res.status(503).json({ error: 'Telegram registration integration is not configured' });
  if (req.get('authorization') !== `Bearer ${telegramRegistrationApiSecret}`) {
    return res.status(401).json({ error: 'Unauthorized Telegram bot' });
  }

  const telegramUserId = Number(req.query.telegram_user_id);
  if (!Number.isSafeInteger(telegramUserId) || telegramUserId <= 0) {
    return res.status(400).json({ error: 'A valid Telegram user ID is required' });
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('first_name, role, access_level, onboarding_status, first_action')
    .eq('telegram_user_id', telegramUserId)
    .maybeSingle();
  if (error) return res.status(500).json({ error: 'Could not load registration status' });
  return res.json({
    registered: profile?.onboarding_status === 'registered',
    profile: profile ? {
      first_name: profile.first_name,
      role: profile.role,
      access_level: profile.access_level || 'white',
      onboarding_status: profile.onboarding_status,
      first_action: profile.first_action || 'open_city_map'
    } : null
  });
});

app.post('/api/telegram/link/consume', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Telegram linking service is not configured' });
  if (!telegramRegistrationApiSecret) return res.status(503).json({ error: 'Telegram bot integration is not configured' });
  if (req.get('authorization') !== `Bearer ${telegramRegistrationApiSecret}`) {
    return res.status(401).json({ error: 'Unauthorized Telegram bot' });
  }

  const telegramUserId = Number(req.body?.telegram_user_id);
  const rawToken = String(req.body?.token || '');
  if (!Number.isSafeInteger(telegramUserId) || telegramUserId <= 0 || !/^[A-Za-z0-9_-]{32,64}$/.test(rawToken)) {
    return res.status(400).json({ error: 'A valid Telegram user ID and link token are required' });
  }

  const tokenHash = createHash('sha256').update(rawToken).digest('hex');
  const { data, error } = await supabase.rpc('consume_telegram_link', {
    p_token_hash: tokenHash,
    p_telegram_user_id: telegramUserId,
    p_telegram_username: String(req.body?.telegram_username || '').trim() || null
  });
  const profile = Array.isArray(data) ? data[0] : data;
  if (error) return res.status(500).json({ error: 'Could not link the Telegram profile' });
  if (!profile) return res.status(404).json({ error: 'Link is invalid, expired, or already used' });
  return res.json({
    profile: {
      id: profile.linked_profile_id,
      first_name: profile.first_name,
      role: profile.role,
      access_level: profile.access_level,
      onboarding_status: profile.onboarding_status,
      first_action: profile.first_action
    }
  });
});

app.post('/api/telegram-registration/draft', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Registration service is not configured' });

  const now = Date.now();
  const clientKey = req.ip || req.socket.remoteAddress || 'unknown';
  const recentAttempts = (registrationDraftAttempts.get(clientKey) || []).filter((time) => now - time < 10 * 60 * 1000);
  if (recentAttempts.length >= 10) return res.status(429).json({ error: 'Too many code attempts. Try again later.' });
  recentAttempts.push(now);
  registrationDraftAttempts.set(clientKey, recentAttempts);

  const code = String(req.body?.code || '').trim();
  if (!/^\d{6}$/.test(code)) return res.status(400).json({ error: 'A six-digit Telegram code is required' });

  const codeHash = createHash('sha256').update(code).digest('hex');
  const { data, error } = await supabase
    .from('telegram_registration_codes')
    .select('registration_data')
    .eq('code_hash', codeHash)
    .gt('expires_at', new Date(now).toISOString())
    .maybeSingle();

  if (error) return res.status(500).json({ error: 'Could not load the registration questionnaire' });
  if (!data?.registration_data) return res.status(404).json({ error: 'Telegram code is invalid or expired' });
  return res.json({ registration: data.registration_data });
});

app.post('/api/bezliki/provider-status', requireSupabaseUser, requireAdmin, (_req, res) => {
  return res.json({
    provider: 'Gemini',
    configured: Boolean(geminiApiKey),
    defaultModel: geminiModel,
    models: allowedGeminiModels
  });
});

app.get('/api/telegram/status', requireAuthenticatedSupabaseUser, async (req, res) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('telegram_user_id, access_level, onboarding_status, first_action')
    .eq('id', req.authUser.id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: 'Could not load Telegram link status' });
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  return res.json({
    linked: Boolean(profile.telegram_user_id),
    accessLevel: profile.access_level || 'white',
    onboardingStatus: profile.onboarding_status || 'not_started',
    firstAction: profile.first_action || 'open_city_map'
  });
});

app.post('/api/telegram/link', requireAuthenticatedSupabaseUser, async (req, res) => {
  if (!telegramBotUsername) return res.status(503).json({ error: 'Telegram bot username is not configured on the backend' });

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, telegram_user_id')
      .eq('id', req.authUser.id)
      .maybeSingle();
    if (profileError) return res.status(500).json({ error: 'Could not verify the profile' });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    if (profile.telegram_user_id) return res.status(409).json({ error: 'This profile is already linked to Telegram' });

    const rawToken = randomBytes(24).toString('base64url');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const { error: deleteError } = await supabase.from('telegram_link_tokens').delete().eq('profile_id', profile.id);
    if (deleteError) return res.status(500).json({ error: 'Could not replace an old Telegram link' });
    const { error: tokenError } = await supabase.from('telegram_link_tokens').insert({
      token_hash: tokenHash,
      profile_id: profile.id,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    });
    if (tokenError) return res.status(500).json({ error: 'Could not create a one-time Telegram link' });

    const encodedToken = encodeURIComponent(`link_${rawToken}`);
    return res.json({
      telegramUrl: `https://t.me/${telegramBotUsername}?start=${encodedToken}`,
      expiresInSeconds: 600,
      siteUrl: publicSiteUrl
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not create a Telegram link' });
  }
});

async function getPublishedLiveStreams() {
  const { data: streams, error } = await supabase
    .from('live_streams')
    .select('id, owner_id, room_name, title, started_at, status')
    .in('status', ['starting', 'live']);
  if (error) throw new Error(error.message || 'Could not load live streams');

  const activeRooms = new Set((await livekitRoomService.listRooms()).map((room) => room.name));
  const streamPresence = await Promise.all((streams || []).map(async (stream) => {
    if (!activeRooms.has(stream.room_name)) return { stream, publisherPresent: false };
    if (stream.status === 'starting') return { stream, publisherPresent: true };
    const participants = await livekitRoomService.listParticipants(stream.room_name);
    return {
      stream,
      publisherPresent: participants.some((participant) => participant.identity === stream.owner_id)
    };
  }));
  const staleStreams = streamPresence.filter(({ publisherPresent }) => !publisherPresent).map(({ stream }) => stream);
  await Promise.all(staleStreams.map((stream) => supabase.rpc('finish_live_stream', {
    p_stream_id: stream.id,
    p_owner_id: stream.owner_id,
    p_final_status: 'ended'
  })));

  return streamPresence
    .filter(({ stream, publisherPresent }) => stream.status === 'live' && publisherPresent)
    .map(({ stream }) => stream);
}

app.get('/api/live/streams', requireLiveKit, async (_req, res) => {
  try {
    const streams = await getPublishedLiveStreams();
    const ownerIds = [...new Set(streams.map((stream) => stream.owner_id))];
    const { data: profiles, error } = ownerIds.length
      ? await supabase.from('profiles').select('id, first_name, last_name').in('id', ownerIds)
      : { data: [], error: null };
    if (error) return res.status(500).json({ error: 'Could not load stream publishers' });

    const profileById = new Map((profiles || []).map((profile) => [profile.id, profile]));
    return res.json({ streams: streams.map((stream) => {
      const profile = profileById.get(stream.owner_id);
      return {
        id: stream.id,
        title: stream.title,
        host: [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Ведущий',
        startedAt: stream.started_at
      };
    }) });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not list live streams' });
  }
});

app.post('/api/live/streams', requireLiveKit, requireLivePublisher, async (req, res) => {
  const title = String(req.body?.title || '').trim().slice(0, 120);
  if (!title) return res.status(400).json({ error: 'Stream title is required' });

  try {
    await getPublishedLiveStreams();
    const roomName = `triznes-${randomUUID()}`;
    const { data: reservation, error: reserveError } = await supabase.rpc('reserve_live_stream', {
      p_owner_id: req.liveProfile.id,
      p_room_name: roomName,
      p_title: title,
      p_max_active_streams: maxActiveLiveStreams
    });
    if (reserveError) {
      const limitReached = reserveError.message?.includes('MAX_ACTIVE_LIVE_STREAMS_REACHED');
      const publisherBusy = reserveError.code === '23505';
      return res.status(limitReached || publisherBusy ? 409 : 500).json({
        error: limitReached
          ? `Достигнут лимит ${maxActiveLiveStreams} одновременных эфиров.`
          : publisherBusy
            ? 'У этого ведущего уже есть активный эфир.'
            : reserveError.message || 'Could not reserve a stream room'
      });
    }

    const stream = Array.isArray(reservation) ? reservation[0] : reservation;
    if (!stream?.id) return res.status(500).json({ error: 'Stream reservation returned no room' });

    try {
      await livekitRoomService.createRoom({
        name: roomName,
        emptyTimeout: 90,
        maxParticipants: maxParticipantsPerStream
      });
      const token = await createLiveKitToken({
        identity: req.authUser.id,
        name: [req.liveProfile.first_name, req.liveProfile.last_name].filter(Boolean).join(' ') || 'Ведущий',
        roomName,
        canPublish: true
      });
      return res.status(201).json({
        stream: { id: stream.id, title: stream.title, roomName },
        serverUrl: livekitUrl,
        token
      });
    } catch (error) {
      await Promise.allSettled([
        livekitRoomService.deleteRoom(roomName),
        supabase.rpc('finish_live_stream', {
          p_stream_id: stream.id,
          p_owner_id: req.liveProfile.id,
          p_final_status: 'failed'
        })
      ]);
      throw error;
    }
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not start a LiveKit room' });
  }
});

app.post('/api/live/streams/:streamId/activate', requireLiveKit, requireLivePublisher, async (req, res) => {
  try {
    const { data: stream, error } = await supabase
      .from('live_streams')
      .select('id, owner_id, room_name, status')
      .eq('id', req.params.streamId)
      .eq('owner_id', req.liveProfile.id)
      .maybeSingle();
    if (error) return res.status(500).json({ error: 'Could not verify stream ownership' });
    if (!stream || stream.status !== 'starting') return res.status(404).json({ error: 'Starting stream not found' });

    const participants = await livekitRoomService.listParticipants(stream.room_name);
    if (!participants.some((participant) => participant.identity === req.authUser.id)) {
      return res.status(409).json({ error: 'Publisher has not joined the LiveKit room yet' });
    }

    const { data: activated, error: activateError } = await supabase.rpc('activate_live_stream', {
      p_stream_id: stream.id,
      p_owner_id: req.liveProfile.id
    });
    if (activateError || !activated) return res.status(409).json({ error: 'Could not activate the stream' });
    return res.json({ ok: true, status: 'live' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not activate the LiveKit stream' });
  }
});

app.post('/api/live/streams/:streamId/viewer-token', requireLiveKit, async (req, res) => {
  try {
    const streams = await getPublishedLiveStreams();
    const stream = streams.find((item) => item.id === req.params.streamId);
    if (!stream) return res.status(404).json({ error: 'Live stream not found' });

    const token = await createLiveKitToken({
      identity: `viewer-${randomUUID()}`,
      name: 'Зритель',
      roomName: stream.room_name,
      canPublish: false
    });
    return res.json({ serverUrl: livekitUrl, token, title: stream.title });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not create viewer token' });
  }
});

app.post('/api/live/streams/:streamId/stop', requireLiveKit, requireLivePublisher, async (req, res) => {
  try {
    const { data: stream, error } = await supabase
      .from('live_streams')
      .select('id, owner_id, room_name')
      .eq('id', req.params.streamId)
      .eq('owner_id', req.liveProfile.id)
      .in('status', ['starting', 'live'])
      .maybeSingle();
    if (error) return res.status(500).json({ error: 'Could not verify stream ownership' });
    if (!stream) return res.status(404).json({ error: 'Active stream not found' });

    await livekitRoomService.deleteRoom(stream.room_name);
    const { error: finishError } = await supabase.rpc('finish_live_stream', {
      p_stream_id: stream.id,
      p_owner_id: req.liveProfile.id,
      p_final_status: 'ended'
    });
    if (finishError) return res.status(500).json({ error: 'Room ended, but stream status could not be updated' });
    return res.json({ ok: true, status: 'ended' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not stop the LiveKit stream' });
  }
});

app.get('/api/profile', async (req, res) => {
  const telegramUserId = Number(req.query.telegram_user_id);

  if (!telegramUserId) {
    return res.status(400).json({ error: 'telegram_user_id is required' });
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase is not configured' });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: 'profile not found' });
  }

  const { data: consentData } = await supabase
    .from('consents')
    .select('*')
    .eq('user_id', data.id)
    .maybeSingle();

  const { data: userData } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', data.id)
    .maybeSingle();

  return res.json({
    ...data,
    consents: consentData || null,
    user_data: userData || null
  });
});

app.post('/api/bezliki/chat', requireSupabaseUser, requireAdmin, async (req, res) => {
  const { message, context = {}, mode = 'admin', model } = req.body || {};

  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    const normalizedMode = mode === 'character' ? 'character' : 'admin';
    const answer = await callGemini({ message, context, mode: normalizedMode, model });
    return res.json(answer);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'BEZLIKI failed to respond' });
  }
});

app.post('/api/bezliki/character-chat', requireSupabaseUser, async (req, res) => {
  const { message, context = {} } = req.body || {};

  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    const answer = await callGemini({ message, context, mode: 'character' });
    return res.json(answer);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'BEZLIKI character chat failed' });
  }
});

app.post('/api/bezliki/platform-summary', requireSupabaseUser, requireAdmin, async (req, res) => {
  try {
    if (!supabase) {
      return res.json({
        ok: true,
        mode: 'demo',
        summary: {
          activePlayers: 18,
          weakSignals: 3,
          strongIdeas: 5,
          nextAction: 'Сформировать сценарий для новых участников и подтянуть топ-3 идеи к материализации.'
        }
      });
    }

    const [{ count: profileCount }, { count: communityCount }, { count: locationCount }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('communities').select('*', { count: 'exact', head: true }),
      supabase.from('locations').select('*', { count: 'exact', head: true })
    ]);

    const summary = {
      activePlayers: profileCount || 0,
      communities: communityCount || 0,
      mappedLocations: locationCount || 0,
      weakSignals: 2,
      strongIdeas: 4,
      nextAction: 'Сейчас важнее закрепить сильные идеи в форме и дать участникам понятный следующий шаг.'
    };

    return res.json({ ok: true, mode: 'live', summary });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to build platform summary' });
  }
});

app.post('/api/bezliki/player-scan', requireSupabaseUser, requireAdmin, async (req, res) => {
  const { playerId } = req.body || {};

  if (!playerId) {
    return res.status(400).json({ error: 'playerId is required' });
  }

  try {
    if (!supabase) {
      return res.json({
        ok: true,
        mode: 'demo',
        analysis: {
          playerId,
          status: 'in motion',
          strongLine: 'Готов к самостоятельной материализации идеи.',
          weakPoint: 'Пока нет чёткой структуры и следующего действия.',
          nextStep: 'Сформировать 3 последовательных шага и привести идею к реальной форме в течение 7 дней.'
        }
      });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', playerId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message || 'Failed to load player profile' });
    }

    const analysis = {
      playerId,
      playerName: [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Игрок',
      role: profile?.role || 'Игрок',
      status: 'in motion',
      strongLine: 'Есть потенциальная линия развития, требуется формализация и шаги.',
      weakPoint: 'Идея ещё не закреплена в конкретном действии.',
      nextStep: 'Сначала зафиксировать цель, затем разбить на 3 реальных шага и запускать материализацию.',
      platformNote: 'Этот участник готов к движению, но ему важна структура и ближайшая цель.'
    };

    return res.json({ ok: true, mode: 'live', analysis });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to analyze player' });
  }
});

app.post('/api/register', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase is not configured' });
  }

  const {
    telegram_user_id,
    username,
    first_name,
    last_name,
    phone,
    email,
    role,
    character_code,
    consents
  } = req.body || {};

  if (!telegram_user_id || !first_name || !role) {
    return res.status(400).json({ error: 'telegram_user_id, first_name and role are required' });
  }

  const profilePayload = {
    telegram_user_id: Number(telegram_user_id),
    username: username || null,
    first_name,
    last_name: last_name || null,
    phone: phone || null,
    email: email || null,
    role,
    character_code: character_code || null,
    status: 'active'
  };

  const { data: existingProfile, error: existingError } = await supabase
    .from('profiles')
    .select('id')
    .eq('telegram_user_id', Number(telegram_user_id))
    .maybeSingle();

  if (existingError) {
    return res.status(500).json({ error: existingError.message });
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .upsert({ ...profilePayload, id: existingProfile?.id || undefined }, { onConflict: 'telegram_user_id' })
    .select('*')
    .maybeSingle();

  if (profileError || !profileData) {
    return res.status(500).json({ error: profileError?.message || 'Failed to create profile' });
  }

  const consentPayload = {
    user_id: profileData.id,
    terms_accepted: Boolean(consents?.terms_accepted),
    filming_accepted: Boolean(consents?.filming_accepted),
    personal_data_accepted: Boolean(consents?.personal_data_accepted),
    email_marketing_accepted: Boolean(consents?.email_marketing_accepted),
    location_accepted: Boolean(consents?.location_accepted),
  };

  const { data: consentData, error: consentError } = await supabase
    .from('consents')
    .upsert({ ...consentPayload }, { onConflict: 'user_id' })
    .select('*')
    .maybeSingle();

  if (consentError) {
    return res.status(500).json({ error: consentError.message });
  }

  const { data: userData, error: userDataError } = await supabase
    .from('user_data')
    .upsert({
      user_id: profileData.id,
      points: 0,
      coins: 0,
      xp: 0,
      state_json: {}
    }, { onConflict: 'user_id' })
    .select('*')
    .maybeSingle();

  if (userDataError) {
    return res.status(500).json({ error: userDataError.message });
  }

  return res.json({
    success: true,
    profile: profileData,
    consents: consentData,
    user_data: userData
  });
});

app.listen(port, () => {
  console.log(`TRIZNES backend running on http://localhost:${port}`);
});
