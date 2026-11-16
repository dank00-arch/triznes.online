import express from 'express';
import { createHmac } from 'node:crypto';

const jobKinds = new Set(['text', 'video']);
const formats = new Set(['9:16', '16:9', '1:1']);
const jobStatuses = new Set(['draft', 'script_ready', 'approved', 'processing', 'completed', 'failed']);
const imageFormats = new Set(['1:1', '16:9', '9:16']);
const imageModels = new Set(['gemini-3.1-flash-image', 'gemini-3-pro-image']);

function jsonError(res, error, fallback = 'Не удалось выполнить операцию Neurofarm.') {
  const message = String(error?.message || fallback);
  if (message.includes('FARM_DAILY_LIMIT_REACHED')) return res.status(429).json({ error: 'Дневной лимит действий исчерпан.' });
  return res.status(error?.status || 500).json({ error: message || fallback });
}

function jobOutput(row) {
  return {
    id: row.id,
    title: row.title,
    brief: row.brief,
    kind: row.kind,
    format: row.format,
    status: row.status,
    script: row.script,
    error: row.error,
    driveUrl: row.drive_url,
    videoUrl: row.video_url,
    createdAt: row.created_at,
  };
}

function imageOutput(row) {
  return {
    id: row.id,
    title: row.title,
    prompt: row.prompt,
    format: row.format,
    model: row.model,
    status: row.status,
    description: row.description,
    error: row.error,
    imageUrl: null,
    createdAt: row.created_at,
  };
}

function montageOutput(row) {
  return {
    id: row.id,
    title: row.title,
    format: row.format,
    clips: row.clips,
    status: row.status,
    projectId: row.project_id,
    videoUrl: row.video_url,
    error: row.error,
    createdAt: row.created_at,
  };
}

async function reserveFarmAction(supabase, ownerId) {
  const { error } = await supabase.rpc('reserve_farm_action', {
    p_owner_id: ownerId,
    p_day: new Date().toISOString().slice(0, 10),
  });
  if (error) throw error;
}

async function generateScript({ job, apiKey, model, baseUrl }) {
  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY не настроен в окружении backend TRIZNES.');
    error.status = 503;
    throw error;
  }
  const response = await fetch(`${baseUrl}/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `Напиши оригинальный сценарий на русском для ${job.kind === 'video' ? 'видео' : 'текстовой истории'}, формат кадра ${job.format}. Название: ${job.title}\nБриф: ${job.brief}\nВерни только готовый сценарий.` }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1800 },
    }),
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error(`Gemini вернул ошибку ${response.status}. Проверьте ключ, модель и квоту.`);
  const payload = await response.json();
  const script = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n').trim();
  if (!script) throw new Error('Gemini не вернул текст сценария.');
  return script;
}

function klingToken() {
  const directKey = process.env.KLING_API_KEY;
  if (directKey) return directKey;
  const access = process.env.KLING_ACCESS_KEY;
  const secret = process.env.KLING_SECRET_KEY;
  if (!access || !secret) return null;
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ iss: access, exp: now + 1800, nbf: now - 5 })}`;
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('base64url')}`;
}

async function submitKlingVideo(job) {
  const token = klingToken();
  if (!token) {
    const error = new Error('Kling не настроен в окружении backend TRIZNES.');
    error.status = 503;
    throw error;
  }
  const response = await fetch('https://api-singapore.klingai.com/v1/videos/text2video', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model_name: 'kling-v2-5-turbo', prompt: job.script.slice(0, 2500), duration: '5', mode: 'pro', aspect_ratio: job.format, external_task_id: job.id }),
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error(`Kling вернул ошибку ${response.status}; проверьте доступ и квоту.`);
  const payload = await response.json();
  if (payload?.code !== 0 || !payload?.data?.task_id) throw new Error('Kling не подтвердил задачу; повторная отправка заблокирована.');
  return payload.data.task_id;
}

async function getKlingTask(taskId) {
  const token = klingToken();
  if (!token) return null;
  const response = await fetch(`https://api-singapore.klingai.com/v1/videos/text2video/${encodeURIComponent(taskId)}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) return null;
  const payload = await response.json();
  return payload?.code === 0 ? payload.data : null;
}

export function registerNeurofarmRoutes(app, { supabase, requireSupabaseUser, requireAdmin, geminiApiKey, geminiModel, geminiBaseUrl }) {
  const router = express.Router();
  router.use(requireSupabaseUser, requireAdmin);

  router.get('/session', (_req, res) => res.json({ authenticated: true, configured: Boolean(geminiApiKey), owner: true }));

  router.get('/jobs', async (req, res) => {
    const { data, error } = await supabase.from('farm_jobs').select('*').eq('owner_id', req.authUser.id).order('created_at', { ascending: false });
    if (error) return jsonError(res, error);
    const rows = data || [];
    await Promise.all(rows.map(async (row) => {
      if (row.status !== 'processing' || row.processing_action !== 'generate_video' || !row.provider_task_id || (row.last_polled_at && Date.now() - new Date(row.last_polled_at).getTime() < 15000)) return;
      const task = await getKlingTask(row.provider_task_id);
      if (!task) return;
      if (task.task_status === 'succeed' && task.task_result?.videos?.[0]?.url) {
        await supabase.from('farm_jobs').update({ status: 'completed', video_url: task.task_result.videos[0].url, processing_action: null, error: null }).eq('id', row.id).eq('owner_id', req.authUser.id);
        row.status = 'completed';
        row.video_url = task.task_result.videos[0].url;
      } else if (task.task_status === 'failed') {
        await supabase.from('farm_jobs').update({ status: 'failed', processing_action: null, error: 'Kling не создал видео; проверьте сценарий и квоту.' }).eq('id', row.id).eq('owner_id', req.authUser.id);
        row.status = 'failed';
        row.error = 'Kling не создал видео; проверьте сценарий и квоту.';
      } else {
        await supabase.from('farm_jobs').update({ last_polled_at: new Date().toISOString() }).eq('id', row.id).eq('owner_id', req.authUser.id);
      }
    }));
    return res.json(rows.map(jobOutput));
  });

  router.post('/jobs', async (req, res) => {
    const { title, brief, kind, format } = req.body || {};
    if (typeof title !== 'string' || !title.trim() || title.trim().length > 140 || typeof brief !== 'string' || brief.trim().length < 10 || brief.trim().length > 5000 || !jobKinds.has(kind) || !formats.has(format)) return res.status(400).json({ error: 'Проверьте название, бриф, тип и формат задачи.' });
    const { data, error } = await supabase.from('farm_jobs').insert({ owner_id: req.authUser.id, title: title.trim(), brief: brief.trim(), kind, format }).select('*').single();
    if (error) return jsonError(res, error);
    return res.status(201).json(jobOutput(data));
  });

  router.get('/jobs/:id', async (req, res) => {
    const { data, error } = await supabase.from('farm_jobs').select('*').eq('id', req.params.id).eq('owner_id', req.authUser.id).maybeSingle();
    if (error) return jsonError(res, error);
    if (!data) return res.status(404).json({ error: 'Творение не найдено.' });
    return res.json(jobOutput(data));
  });

  router.patch('/jobs/:id', async (req, res) => {
    const { title, brief, kind, format, script } = req.body || {};
    if (title !== undefined && (typeof title !== 'string' || !title.trim() || title.length > 140)) return res.status(400).json({ error: 'Некорректное название.' });
    if (brief !== undefined && (typeof brief !== 'string' || brief.trim().length < 10 || brief.length > 5000)) return res.status(400).json({ error: 'Некорректный бриф.' });
    if (kind !== undefined && !jobKinds.has(kind)) return res.status(400).json({ error: 'Некорректный тип задачи.' });
    if (format !== undefined && !formats.has(format)) return res.status(400).json({ error: 'Некорректный формат.' });
    if (script !== undefined && (typeof script !== 'string' || script.length > 20000)) return res.status(400).json({ error: 'Некорректный сценарий.' });
    const { data: existing, error: readError } = await supabase.from('farm_jobs').select('status').eq('id', req.params.id).eq('owner_id', req.authUser.id).maybeSingle();
    if (readError) return jsonError(res, readError);
    if (!existing) return res.status(404).json({ error: 'Творение не найдено.' });
    if (existing.status === 'processing') return res.status(409).json({ error: 'Задача обрабатывается; редактирование недоступно.' });
    const changes = {
      ...(title === undefined ? {} : { title: title.trim() }),
      ...(brief === undefined ? {} : { brief: brief.trim() }),
      ...(kind === undefined ? {} : { kind }),
      ...(format === undefined ? {} : { format }),
      ...(script === undefined ? {} : { script, status: script.trim() ? 'script_ready' : 'draft', video_url: null, drive_url: null }),
      error: null,
    };
    const { data, error } = await supabase.from('farm_jobs').update(changes).eq('id', req.params.id).eq('owner_id', req.authUser.id).select('*').maybeSingle();
    if (error) return jsonError(res, error);
    if (!data) return res.status(404).json({ error: 'Творение не найдено.' });
    return res.json(jobOutput(data));
  });

  router.delete('/jobs/:id', async (req, res) => {
    const { data, error } = await supabase.from('farm_jobs').delete().eq('id', req.params.id).eq('owner_id', req.authUser.id).neq('status', 'processing').select('id').maybeSingle();
    if (error) return jsonError(res, error);
    if (!data) return res.status(404).json({ error: 'Задача не найдена или сейчас обрабатывается.' });
    return res.sendStatus(204);
  });

  router.post('/jobs/:id/action', async (req, res) => {
    const action = req.body?.action;
    if (!['generate_script', 'approve', 'generate_video', 'export_drive'].includes(action)) return res.status(400).json({ error: 'Неизвестное действие.' });
    const { data: job, error: readError } = await supabase.from('farm_jobs').select('*').eq('id', req.params.id).eq('owner_id', req.authUser.id).maybeSingle();
    if (readError) return jsonError(res, readError);
    if (!job) return res.status(404).json({ error: 'Творение не найдено.' });
    if (job.status === 'processing') return res.status(409).json({ error: 'Задача уже обрабатывается; повторный запуск заблокирован.' });
    if (action === 'approve') {
      if (!job.script.trim()) return res.status(400).json({ error: 'Сначала создайте сценарий.' });
      const { data, error } = await supabase.from('farm_jobs').update({ status: 'approved', error: null }).eq('id', job.id).eq('owner_id', req.authUser.id).select('*').single();
      if (error) return jsonError(res, error);
      return res.json(jobOutput(data));
    }
    if (action === 'export_drive') return res.status(503).json({ error: 'Google Drive экспорт пока не перенесён из Replit Connectors.' });
    if (action === 'generate_video' && (job.kind !== 'video' || job.status !== 'approved' || job.provider_task_id)) return res.status(409).json({ error: 'Для видео сначала утвердите сценарий; повторная платная отправка заблокирована.' });

    const previousStatus = job.status;
    const { data: reserved, error: reserveJobError } = await supabase.from('farm_jobs').update({ status: 'processing', processing_action: action, error: null }).eq('id', job.id).eq('owner_id', req.authUser.id).eq('status', previousStatus).select('id').maybeSingle();
    if (reserveJobError) return jsonError(res, reserveJobError);
    if (!reserved) return res.status(409).json({ error: 'Задача уже запущена.' });
    try {
      await reserveFarmAction(supabase, req.authUser.id);
      if (action === 'generate_script') {
        const script = await generateScript({ job, apiKey: geminiApiKey, model: geminiModel, baseUrl: geminiBaseUrl });
        const { data, error } = await supabase.from('farm_jobs').update({ script, status: 'script_ready', processing_action: null, error: null }).eq('id', job.id).eq('owner_id', req.authUser.id).select('*').single();
        if (error) return jsonError(res, error);
        return res.json(jobOutput(data));
      }
      const providerTaskId = await submitKlingVideo(job);
      const { data, error } = await supabase.from('farm_jobs').update({ provider_task_id: providerTaskId, last_polled_at: null }).eq('id', job.id).eq('owner_id', req.authUser.id).select('*').single();
      if (error) return jsonError(res, error);
      return res.json(jobOutput(data));
    } catch (error) {
      const message = String(error?.message || 'Не удалось выполнить действие.');
      if (action === 'generate_script') await supabase.from('farm_jobs').update({ status: 'failed', processing_action: null, error: message }).eq('id', job.id).eq('owner_id', req.authUser.id);
      return res.status(error.status || 500).json({ error: message });
    }
  });

  router.get('/overview', async (req, res) => {
    const { data, error } = await supabase.from('farm_jobs').select('status').eq('owner_id', req.authUser.id);
    if (error) return jsonError(res, error);
    const rows = data || [];
    return res.json({ total: rows.length, drafts: rows.filter((row) => row.status === 'draft').length, completed: rows.filter((row) => row.status === 'completed').length, active: rows.filter((row) => ['processing', 'approved', 'script_ready'].includes(row.status)).length });
  });

  router.get('/integrations', (req, res) => res.json([
    { id: 'gemini', name: 'Gemini', status: geminiApiKey ? 'connected' : 'missing', detail: geminiApiKey ? `Модель ${geminiModel}` : 'Добавьте GEMINI_API_KEY в секреты backend TRIZNES.' },
    { id: 'kling', name: 'Kling AI', status: klingToken() ? 'connected' : 'missing', detail: klingToken() ? 'Ключ настроен на сервере.' : 'Добавьте KLING_API_KEY или KLING_ACCESS_KEY/KLING_SECRET_KEY.' },
    { id: 'json2video', name: 'JSON2Video', status: 'unavailable', detail: 'Провайдер ещё не перенесён из Replit.' },
    { id: 'google-drive', name: 'Google Drive', status: 'unavailable', detail: 'Google Drive Connector ещё не перенесён в TRIZNES.' },
  ]));

  router.get('/settings', async (req, res) => {
    const { data, error } = await supabase.from('farm_settings').select('*').eq('owner_id', req.authUser.id).maybeSingle();
    if (error) return jsonError(res, error);
    return res.json({ ownerId: req.authUser.id, workspaceName: data?.workspace_name || 'Нейроферма', dailyLimit: data?.daily_limit || 10 });
  });

  router.patch('/settings', async (req, res) => {
    const { workspaceName, dailyLimit } = req.body || {};
    if (workspaceName !== undefined && (typeof workspaceName !== 'string' || !workspaceName.trim() || workspaceName.length > 80)) return res.status(400).json({ error: 'Некорректное название фермы.' });
    if (dailyLimit !== undefined && (!Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 1000)) return res.status(400).json({ error: 'Дневной лимит должен быть от 1 до 1000.' });
    const { data, error } = await supabase.from('farm_settings').upsert({ owner_id: req.authUser.id, ...(workspaceName === undefined ? {} : { workspace_name: workspaceName.trim() }), ...(dailyLimit === undefined ? {} : { daily_limit: dailyLimit }) }).select('*').single();
    if (error) return jsonError(res, error);
    return res.json({ ownerId: data.owner_id, workspaceName: data.workspace_name, dailyLimit: data.daily_limit });
  });

  router.get('/images', async (req, res) => {
    const { data, error } = await supabase.from('farm_images').select('*').eq('owner_id', req.authUser.id).order('created_at', { ascending: false });
    if (error) return jsonError(res, error);
    return res.json((data || []).map(imageOutput));
  });
  router.post('/images', async (req, res) => {
    const { title, prompt, format, model } = req.body || {};
    if (typeof title !== 'string' || !title.trim() || title.length > 120 || typeof prompt !== 'string' || prompt.trim().length < 10 || prompt.length > 2000 || !imageFormats.has(format) || !imageModels.has(model)) return res.status(400).json({ error: 'Проверьте название, описание, формат и модель изображения.' });
    const { data, error } = await supabase.from('farm_images').insert({ owner_id: req.authUser.id, title: title.trim(), prompt: prompt.trim(), format, model }).select('*').single();
    if (error) return jsonError(res, error);
    return res.status(201).json(imageOutput(data));
  });
  router.post('/images/:id/generate', async (_req, res) => res.status(503).json({ error: 'Генератор изображений ещё не перенесён из Replit.' }));

  router.get('/montages', async (req, res) => {
    const { data, error } = await supabase.from('farm_montages').select('*').eq('owner_id', req.authUser.id).order('created_at', { ascending: false });
    if (error) return jsonError(res, error);
    return res.json((data || []).map(montageOutput));
  });
  router.post('/montages', async (req, res) => {
    const { title, format, clips } = req.body || {};
    const clipsValid = Array.isArray(clips) && clips.length > 0 && clips.length <= 20 && clips.every((clip) => typeof clip?.url === 'string' && Number.isFinite(clip.seek) && Number.isFinite(clip.duration) && clip.seek >= 0 && clip.duration > 0);
    if (typeof title !== 'string' || !title.trim() || !formats.has(format) || !clipsValid) return res.status(400).json({ error: 'Проверьте название, формат и клипы монтажа.' });
    const { data, error } = await supabase.from('farm_montages').insert({ owner_id: req.authUser.id, title: title.trim(), format, clips }).select('*').single();
    if (error) return jsonError(res, error);
    return res.status(201).json(montageOutput(data));
  });
  router.get('/montages/:id', async (req, res) => {
    const { data, error } = await supabase.from('farm_montages').select('*').eq('id', req.params.id).eq('owner_id', req.authUser.id).maybeSingle();
    if (error) return jsonError(res, error);
    if (!data) return res.status(404).json({ error: 'Монтаж не найден.' });
    return res.json(montageOutput(data));
  });
  router.patch('/montages/:id', async (req, res) => {
    const { title, format, clips } = req.body || {};
    if (typeof title !== 'string' || !title.trim() || !formats.has(format) || !Array.isArray(clips) || !clips.length) return res.status(400).json({ error: 'Некорректные данные монтажа.' });
    const { data, error } = await supabase.from('farm_montages').update({ title: title.trim(), format, clips }).eq('id', req.params.id).eq('owner_id', req.authUser.id).eq('status', 'draft').select('*').maybeSingle();
    if (error) return jsonError(res, error);
    if (!data) return res.status(409).json({ error: 'Можно редактировать только собственный черновик.' });
    return res.json(montageOutput(data));
  });
  router.post('/montages/:id/render', async (_req, res) => res.status(503).json({ error: 'JSON2Video render ещё не перенесён из Replit.' }));

  app.use('/api/farm', router);
}
