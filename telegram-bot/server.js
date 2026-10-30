import express from 'express';
import dotenv from 'dotenv';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { registerNeurofarmRoutes } from './neurofarm.js';
import { bezlikiSystemPrompt } from './bezliki-prompt.js';

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
