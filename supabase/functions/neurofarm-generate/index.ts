const RUNWAY_BASE = 'https://api.dev.runwayml.com/v1';
const RUNWAY_VERSION = '2024-11-06';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const runwayKey = Deno.env.get('RUNWAYML_API_SECRET') ?? Deno.env.get('RUNWAY_API_KEY');
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return json({ error: 'invalid_json' }, 400);

  const { job_kind, prompt_text, prompt_image, ratio = '1280:720', duration = 5 } = body as Record<string, unknown>;

  if (!runwayKey) {
    return json({
      status: 'waiting_for_generator',
      provider: 'runway',
      configured: false,
      message: 'Runway secret is not configured in the server runtime.',
    }, 503);
  }

  if (typeof prompt_text !== 'string' || !prompt_text.trim()) {
    return json({ error: 'prompt_text_required' }, 400);
  }

  let endpoint: string;
  let payload: Record<string, unknown>;

  if (job_kind === 'character_image' || job_kind === 'world_image') {
    endpoint = '/text_to_image';
    payload = {
      model: 'gen4_image',
      ratio: typeof ratio === 'string' ? ratio : '1920:1080',
      promptText: prompt_text,
      ...(typeof prompt_image === 'string' && prompt_image
        ? { referenceImages: [{ uri: prompt_image, tag: 'Character' }] }
        : {}),
    };
  } else if (job_kind === 'cinematic_shot') {
    if (typeof prompt_image !== 'string' || !prompt_image) {
      return json({ error: 'prompt_image_required_for_cinematic_shot' }, 400);
    }
    endpoint = '/image_to_video';
    payload = {
      model: 'gen4_turbo',
      promptImage: prompt_image,
      promptText: prompt_text,
      ratio: typeof ratio === 'string' ? ratio : '1280:720',
      duration: typeof duration === 'number' ? duration : 5,
    };
  } else {
    return json({ error: 'unsupported_job_kind' }, 400);
  }

  const response = await fetch(`${RUNWAY_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${runwayKey}`,
      'X-Runway-Version': RUNWAY_VERSION,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    return json({ status: 'failed', provider: 'runway', provider_status: response.status, details: result }, 502);
  }

  return json({
    status: 'queued',
    provider: 'runway',
    provider_job_id: (result as Record<string, unknown>).id ?? null,
  }, 202);
});
