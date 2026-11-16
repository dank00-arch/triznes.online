import dotenv from 'dotenv';
import { createHash, randomInt } from 'node:crypto';
import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import { bezlikiSystemPrompt } from './bezliki-prompt.js';

dotenv.config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publicSiteUrl = process.env.PUBLIC_SITE_URL || process.env.FRONTEND_ORIGIN || 'https://triznes.online';

const geminiApiKey = process.env.GEMINI_API_KEY || '';
const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const geminiBaseUrl = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';

if (!botToken) {
  throw new Error('TELEGRAM_BOT_TOKEN is missing');
}

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
}

const bot = new TelegramBot(botToken, { polling: true });
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const userSessions = new Map();

const gameLevels = [
  { title: 'Старт', description: 'Знакомство с ТРИЗНЕС, выбор роли и первый шаг в игровом городе.', task: 'Заполни профиль и выбери, как хочешь участвовать.' },
  { title: 'Первый импульс', description: 'Ты переходишь от наблюдения к простому доброму действию.', task: 'Выполни задание «Улыбнись прохожему» и отправь подтверждение на сайте.' },
  { title: 'Голос героя', description: 'Ты пробуешь выразить себя через видео и творческую историю.', task: 'Сними ролик о записи песни и отправь его BEZLIKI на проверку.' },
  { title: 'Ясность', description: 'Ты формулируешь, что тебе важно и чем ты хочешь делиться.', task: 'Запиши короткое знакомство: кто ты и какую историю хочешь рассказать.' },
  { title: 'Практика проявления', description: 'Ты регулярно создаёшь контент и учишься говорить своим голосом.', task: 'Опубликуй полезную историю или наблюдение о своей жизни в городе.' },
  { title: 'Исследователь города', description: 'Ты замечаешь людей, места и события, из которых складывается городская история.', task: 'Пройди маршрут и расскажи об интересной точке, получив разрешение на съёмку.' },
  { title: 'Мастерство', description: 'Ты развиваешь один навык и показываешь, как меняется результат.', task: 'Выбери навык, потренируйся и сними короткое видео о своём прогрессе.' },
  { title: 'Сотрудничество', description: 'Ты объединяешься с другими участниками и создаёшь что-то вместе.', task: 'Предложи участнику совместный сюжет, эфир или небольшое задание.' },
  { title: 'Автор истории', description: 'Ты превращаешь идею в цельный сюжет с началом, действием и выводом.', task: 'Создай эпизод о реальном опыте, уважая границы и согласие всех участников.' },
  { title: 'Голос города', description: 'Ты помогаешь другим услышать город через людей, места и их истории.', task: 'Подготовь интервью или репортаж с разрешения собеседника и площадки.' },
  { title: 'Создатель события', description: 'Ты придумываешь и организуешь небольшую активность для сообщества.', task: 'Согласуй идею, место и правила, затем пригласи участников.' },
  { title: 'Наставник команды', description: 'Ты делишься опытом и помогаешь другому участнику сделать следующий шаг.', task: 'Поддержи новичка и вместе подготовьте его первую публикацию или задание.' },
  { title: 'Творец реальности', description: 'Финальная цель маршрута: осознанно проявляться, создавать значимые истории и усиливать сообщество.', task: 'Подведи итоги пути и выбери, какой проект или навык развивать дальше.' }
];

const registrationQuestions = [
  { step: 'nickname', field: 'first_name', prompt: 'Как к вам обращаться? Напишите игровой псевдоним (2–40 символов).', maxLength: 40 },
  { step: 'phone', field: 'phone', prompt: 'Укажите номер телефона для профиля.', maxLength: 20 },
  { step: 'email', field: 'email', prompt: 'Укажите email для входа в профиль. Пароль зададите на сайте.', maxLength: 120 },
  { step: 'life', field: 'life', prompt: 'Коротко расскажите о себе и своём пути (до 1000 символов).', maxLength: 1000 },
  { step: 'dream', field: 'dream', prompt: 'Какая у вас мечта? (до 500 символов)', maxLength: 500 },
  { step: 'skills', field: 'skills', prompt: 'Что вы умеете или чем хотели бы делиться? (до 500 символов)', maxLength: 500 },
  { step: 'growth', field: 'growth', prompt: 'Как хотите развиваться благодаря ТРИЗНЕС? (до 500 символов)', maxLength: 500 }
];

function getSession(chatId) {
  if (!userSessions.has(chatId)) userSessions.set(chatId, { step: 'start' });
  return userSessions.get(chatId);
}

async function issueRegistrationCode(chatId, registrationData) {
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  const codeHash = createHash('sha256').update(code).digest('hex');
  const { error: expiredError } = await supabase
    .from('telegram_registration_codes')
    .delete()
    .lt('expires_at', new Date().toISOString());
  if (expiredError) throw expiredError;
  const { error } = await supabase.from('telegram_registration_codes').delete().eq('telegram_user_id', Number(chatId));
  if (error) throw error;
  const { error: insertError } = await supabase.from('telegram_registration_codes').insert({
    code_hash: codeHash,
    telegram_user_id: Number(chatId),
    registration_data: registrationData,
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
  });
  if (insertError) throw insertError;
  return code;
}

async function findCharacterByTelegramId(chatId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('first_name, character_code')
    .eq('telegram_user_id', Number(chatId))
    .eq('role', 'character')
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function isCharacterNameTaken(name, chatId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('telegram_user_id')
    .eq('role', 'character')
    .ilike('first_name', name.replace(/[\\%_]/g, '\\$&'))
    .limit(1);
  if (error) throw error;
  return (data || []).some((row) => row.telegram_user_id !== Number(chatId));
}

async function registerCharacter(msg, registration) {
  const chatId = Number(msg.chat.id);
  const existing = await findCharacterByTelegramId(chatId);
  const code = existing?.character_code || String(randomInt(0, 10000)).padStart(4, '0');
  const { data: profile, error } = await supabase
    .from('profiles')
    .upsert({
      telegram_user_id: chatId,
      username: msg.from?.username || null,
      first_name: registration.first_name,
      last_name: null,
      phone: registration.phone,
      email: registration.email.toLowerCase(),
      role: 'character',
      character_code: code,
      status: 'active',
      onboarding_status: 'completed',
      updated_at: new Date().toISOString()
    }, { onConflict: 'telegram_user_id' })
    .select('id, first_name, character_code')
    .single();
  if (error) throw error;

  const { error: dataError } = await supabase
    .from('user_data')
    .upsert({
      user_id: profile.id,
      state_json: {
        telegram_registration: {
          first_task_location: registration.first_task_location,
          life: registration.life,
          dream: registration.dream,
          skills: registration.skills,
          growth: registration.growth
        }
      }
    }, { onConflict: 'user_id', ignoreDuplicates: true });
  if (dataError) throw dataError;
  return profile;
}

function characterCard(profile) {
  return `Имя персонажа: ${profile.first_name}\nКод персонажа: ${profile.character_code}\n\nНа сайте нажмите «Персонаж → Войти» и введите это имя и код. Никому не передавайте код. Напомнить его можно командой /code.`;
}

async function findProfileByTelegramId(chatId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, role, character_code')
    .eq('telegram_user_id', Number(chatId))
    .maybeSingle();
  if (error) throw error;
  return data;
}

const CHAT_HISTORY_LIMIT = 12;

async function askBezliki(session, profile, text) {
  if (!geminiApiKey) return 'Чат с BEZLIKI пока не подключён. Загляни позже, а пока можно открыть платформу и пройти задания.';
  const history = session.history || (session.history = []);
  history.push({ role: 'user', parts: [{ text }] });
  while (history.length > CHAT_HISTORY_LIMIT) history.shift();

  const response = await fetch(`${geminiBaseUrl}/models/${encodeURIComponent(geminiModel)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiApiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: `${bezlikiSystemPrompt}\n\nСейчас ты общаешься в Telegram с участником-персонажем по имени ${profile.first_name}. Отвечай коротко и по-живому. Не раскрывай данные других людей и никогда не называй коды доступа.` }] },
      contents: history,
      generationConfig: { temperature: 0.85, maxOutputTokens: 800 }
    })
  });
  if (!response.ok) {
    history.pop();
    throw new Error(`Gemini API error: ${response.status}`);
  }
  const payload = await response.json();
  const answer = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
  if (!answer) {
    history.pop();
    throw new Error('Gemini returned an empty response');
  }
  history.push({ role: 'model', parts: [{ text: answer }] });
  return answer.slice(0, 4000);
}

async function sendWelcomeBack(chatId, profile) {
  const body = profile.role === 'character' && profile.character_code
    ? characterCard(profile)
    : 'Войдите на платформу с аккаунтом, который вы создали при регистрации.';
  await bot.sendMessage(chatId,
    `С возвращением, ${profile.first_name || 'участник'}! Ты уже зарегистрирован, повторно проходить регистрацию не нужно ✅\n\n${body}\n\nМожешь просто писать мне сюда: я рядом, поговорим. Уровни игры: /levels`,
    { reply_markup: { inline_keyboard: [[{ text: 'Войти на ТРИЗНЕС', url: publicSiteUrl }]] } }
  );
}

async function cleanupExpiredRegistrationCodes() {
  const { error } = await supabase
    .from('telegram_registration_codes')
    .delete()
    .lt('expires_at', new Date().toISOString());
  if (error) console.error('Expired registration draft cleanup failed', error.message);
}

bot.onText(/^\/start(?:@\w+)?(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const session = getSession(chatId);
  const startPayload = String(match?.[1] || '').trim();

  if (startPayload.startsWith('link_')) {
    const rawToken = startPayload.slice(5);
    if (!/^[A-Za-z0-9_-]{32,64}$/.test(rawToken)) {
      await bot.sendMessage(chatId, 'Ссылка подключения некорректна. Вернитесь на сайт и создайте новую.');
      return;
    }

    try {
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');
      const { data, error } = await supabase.rpc('consume_telegram_link', {
        p_token_hash: tokenHash,
        p_telegram_user_id: Number(chatId),
        p_telegram_username: msg.from?.username || null
      });
      const profile = Array.isArray(data) ? data[0] : data;
      if (error || !profile) {
        console.error('Telegram profile linking failed', error?.message || 'Link is invalid or expired');
        await bot.sendMessage(chatId, 'Не удалось связать профиль. Ссылка могла истечь или уже быть использована. Вернитесь на сайт и запросите новую.');
        return;
      }

      userSessions.delete(chatId);
      const roleLabels = {
        viewer: 'Зритель',
        character: 'Персонаж',
        community: 'Площадка / сообщество',
        angel_investor: 'Поддержка заданий'
      };
      await bot.sendMessage(
        chatId,
        `Профиль связан с Telegram ✅\n\n🎬 Первая карточка ТРИЗНЕС\nИмя: ${profile.first_name || 'Участник'}\nРоль: ${roleLabels[profile.role] || 'Участник'}\nСтатус доступа: Уровень Белый\n\nПервый шаг сегодня: откройте город, посмотрите видеоисторию и выберите одну точку Сочи, куда вам хотелось бы прийти. Это вводное действие — снимать или отправлять материалы не нужно.`,
        {
          reply_markup: {
            inline_keyboard: [[{ text: 'Открыть город и карту', url: publicSiteUrl }]]
          }
        }
      );
      return;
    } catch (error) {
      console.error('Telegram profile linking failed', error);
      await bot.sendMessage(chatId, 'Не удалось завершить подключение. Попробуйте создать новую ссылку на сайте чуть позже.');
      return;
    }
  }

  if (msg.chat.type !== 'private') return;
  try {
    const profile = await findProfileByTelegramId(chatId);
    if (profile) {
      session.step = 'complete';
      session.profile = profile;
      await sendWelcomeBack(chatId, profile);
      return;
    }
  } catch (error) {
    console.error('Profile lookup failed', error?.message || error);
    await bot.sendMessage(chatId, 'Не удалось проверить регистрацию. Попробуйте /start чуть позже.');
    return;
  }

  session.step = 'philosophy';
  await bot.sendMessage(chatId,
    'Добро пожаловать в ТРИЗНЕС, ассистент Аполона на связи.\n\n' +
    'Философия ТРИЗНЕС: «Я БОГ ЛЮБОВЬ». Это путь уважения к себе и другим, доверия, творчества и добрых действий. Здесь не нужно доказывать свою ценность: важно замечать свой свет и проявляться бережно.\n\n' +
    'Прочитайте этот короткий вводный текст, затем продолжим знакомство.',
    { reply_markup: { inline_keyboard: [[{ text: 'Прочитал, дальше', callback_data: 'intro_philosophy' }]] } }
  );
});

bot.on('callback_query', async (query) => {
  const chatId = query.message?.chat?.id;
  if (!chatId || query.from?.id !== chatId) return;
  const session = getSession(chatId);
  const callback = query.data;
  await bot.answerCallbackQuery(query.id);

  if (callback === 'intro_philosophy' && session.step === 'philosophy') {
    session.step = 'videos';
    const videoLinks = [
      ['«Дверь в новый мир»', 'novy-mir-copy.mp4'],
      ['«Размах ТРИЗНЕС»', 'triznes-razmah-copy.mp4'],
      ['«ТРИЗНЕС: общее видео»', 'triznes-obshiy-copy.mp4']
    ].map(([title, file]) => `${title}: ${new URL(`/assets/${file}`, publicSiteUrl).toString()}`).join('\n');
    await bot.sendMessage(chatId,
      `Посмотрите вводные ролики о ТРИЗНЕС:\n${videoLinks}\n\nКогда закончите просмотр, нажмите кнопку.`,
      { reply_markup: { inline_keyboard: [[{ text: 'Ролики просмотрены', callback_data: 'intro_videos' }]] } }
    );
    return;
  }

  if (callback === 'intro_videos' && session.step === 'videos') {
    session.step = 'song';
    await bot.sendMessage(chatId,
      `Теперь прослушайте песню ТРИЗНЕС:\n${new URL('/assets/love-track.wav', publicSiteUrl).toString()}\n\nПосле прослушивания продолжим.`,
      { reply_markup: { inline_keyboard: [[{ text: 'Песню прослушал', callback_data: 'intro_song' }]] } }
    );
    return;
  }

  if (callback === 'intro_song' && session.step === 'song') {
    session.step = 'first_task';
    await bot.sendMessage(chatId,
      'Первое задание: откройте сайт ТРИЗНЕС, перейдите к карте города и выберите одну точку Сочи, куда вам хотелось бы прийти. Вернитесь сюда и напишите название этой точки. Снимать или отправлять материалы не нужно.',
      { reply_markup: { inline_keyboard: [[{ text: 'Открыть ТРИЗНЕС', url: publicSiteUrl }]] } }
    );
    return;
  }

  const selectedRole = callback.match(/^profile_role_(viewer|character|angel_investor|mentor|community)$/)?.[1];
  if (selectedRole && session.step === 'choose_role') {
    session.registration.role = selectedRole;
    session.questions = registrationQuestions;
    session.step = session.questions[0].step;
    await bot.sendMessage(chatId, session.questions[0].prompt);
  }
});

bot.on('message', async (msg) => {
  if (!msg.text) return;

  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const session = getSession(chatId);

  if (/^\/start(?:@\w+)?(?:\s|$)/i.test(text)) return;

  if (/^\/code(?:@\w+)?$/i.test(text)) {
    if (msg.chat.type !== 'private') return;
    try {
      const character = await findCharacterByTelegramId(chatId);
      await bot.sendMessage(chatId, character
        ? characterCard(character)
        : 'Персонаж ещё не зарегистрирован. Напишите /start и пройдите регистрацию, выбрав роль «Персонаж».');
    } catch (error) {
      console.error('Character code lookup failed', error?.message || error);
      await bot.sendMessage(chatId, 'Не удалось получить код. Попробуйте позже.');
    }
    return;
  }

  if (/^\/levels(?:@\w+)?$/i.test(text)) {
    const levelList = gameLevels
      .map((level, index) => `${index + 1}. ${level.title} — ${level.description}\n   Шаг: ${level.task}`)
      .join('\n\n');
    await bot.sendMessage(
      chatId,
      `Путь игрока ТРИЗНЕС: 13 уровней\n\n${levelList}\n\nИгровые уровни не являются картами доступа. LUBICOIN — игровые баллы без вывода в рубли.`
    );
    return;
  }

  const levelMatch = text.match(/^\/level(?:@\w+)?(?:\s+(\d+))?$/i);
  if (levelMatch) {
    if (!levelMatch[1]) {
      await bot.sendMessage(chatId, 'Напиши номер уровня от 1 до 13, например: /level 3. Все уровни: /levels');
      return;
    }

    const levelNumber = Number(levelMatch[1]);
    const level = gameLevels[levelNumber - 1];
    if (!level) {
      await bot.sendMessage(chatId, 'В игре 13 уровней. Укажи номер от 1 до 13 или напиши /levels.');
      return;
    }

    await bot.sendMessage(
      chatId,
      `Уровень ${levelNumber}: ${level.title}\n\n${level.description}\n\nТвой шаг: ${level.task}`
    );
    return;
  }

  if (session.step === 'first_task') {
    if (text.length < 2 || text.length > 120) {
      await bot.sendMessage(chatId, 'Напишите название выбранной точки в Сочи (от 2 до 120 символов).');
      return;
    }

    session.registration = { first_task_location: text };
    session.step = 'choose_role';
    await bot.sendMessage(chatId, 'Задание принято. Теперь выберите формат участия:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Зритель', callback_data: 'profile_role_viewer' }, { text: 'Персонаж', callback_data: 'profile_role_character' }],
          [{ text: 'Ангел', callback_data: 'profile_role_angel_investor' }, { text: 'Ментор', callback_data: 'profile_role_mentor' }],
          [{ text: 'Площадка / сообщество', callback_data: 'profile_role_community' }]
        ]
      }
    });
    return;
  }

  const questionIndex = (session.questions || []).findIndex((question) => question.step === session.step);
  if (questionIndex >= 0) {
    const question = session.questions[questionIndex];
    const value = text.trim();
    const invalid = value.length < 2 || value.length > question.maxLength
      || (question.field === 'phone' && !/^[+0-9() -]{10,20}$/.test(value))
      || (question.field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      || (question.field === 'character_code' && !/^\d{4}$/.test(value));
    if (invalid) {
      await bot.sendMessage(chatId, question.field === 'phone'
        ? 'Проверьте номер телефона и отправьте его ещё раз.'
        : question.field === 'email'
          ? 'Проверьте email и отправьте его ещё раз.'
          : `Ответ должен содержать от 2 до ${question.maxLength} символов.`);
      return;
    }

    if (question.step === 'nickname' && session.registration.role === 'character') {
      try {
        if (await isCharacterNameTaken(value, chatId)) {
          await bot.sendMessage(chatId, 'Это имя персонажа уже занято. Выберите другое.');
          return;
        }
      } catch (error) {
        console.error('Character name check failed', error?.message || error);
        await bot.sendMessage(chatId, 'Не удалось проверить имя. Попробуйте отправить его ещё раз.');
        return;
      }
    }

    session.registration[question.field] = value;
    const nextQuestion = session.questions[questionIndex + 1];
    if (nextQuestion) {
      session.step = nextQuestion.step;
      await bot.sendMessage(chatId, nextQuestion.prompt);
      return;
    }

    if (session.registration.role === 'character') {
      try {
        const profile = await registerCharacter(msg, session.registration);
        session.step = 'complete';
        await bot.sendMessage(chatId,
          `Регистрация завершена ✅\n\n${characterCard(profile)}`,
          { reply_markup: { inline_keyboard: [[{ text: 'Войти на ТРИЗНЕС', url: publicSiteUrl }]] } }
        );
      } catch (error) {
        console.error('Character registration failed', error?.message || error);
        await bot.sendMessage(chatId, error?.code === '23505'
          ? 'Это имя персонажа уже занято. Напишите /start и выберите другое.'
          : 'Не удалось завершить регистрацию. Напишите /start, чтобы пройти её ещё раз.');
      }
      return;
    }

    try {
      const code = await issueRegistrationCode(chatId, session.registration);
      session.step = 'complete';
      await bot.sendMessage(chatId,
        `Анкета заполнена, вводный этап пройден ✅\n\nОдноразовый код регистрации: ${code}\nКод действует 30 минут. Откройте сайт, введите код, проверьте ответы анкеты и задайте пароль. Юридические согласия вы подтвердите на сайте.\n\nЭтот код не является кодом входа персонажа.`,
        { reply_markup: { inline_keyboard: [[{ text: 'Открыть регистрацию ТРИЗНЕС', url: publicSiteUrl }]] } }
      );
    } catch (error) {
      console.error('Registration code creation failed', error?.message || error);
      await bot.sendMessage(chatId, 'Не удалось выдать код. Напишите /start, чтобы пройти вводный этап ещё раз.');
    }
    return;
  }

  if (msg.chat.type !== 'private' || text.startsWith('/')) return;
  if (!['complete', 'start'].includes(session.step)) return;

  let profile = session.profile;
  try {
    profile = await findProfileByTelegramId(chatId);
  } catch (error) {
    console.error('Profile lookup failed', error?.message || error);
    await bot.sendMessage(chatId, 'Не удалось проверить регистрацию. Попробуйте ещё раз.');
    return;
  }
  if (!profile) {
    await bot.sendMessage(chatId, session.step === 'complete'
      ? 'Вводный этап пройден. Откройте сайт и введите одноразовый код регистрации из предыдущего сообщения или напишите /start, чтобы получить новый.'
      : 'Напишите /start, чтобы пройти знакомство и регистрацию.');
    return;
  }

  session.profile = profile;
  const now = Date.now();
  if (session.lastChatAt && now - session.lastChatAt < 2000) return;
  session.lastChatAt = now;
  try {
    await bot.sendChatAction(chatId, 'typing');
    await bot.sendMessage(chatId, await askBezliki(session, profile, text.slice(0, 2000)));
  } catch (error) {
    console.error('BEZLIKI chat failed', error?.message || error);
    await bot.sendMessage(chatId, 'Я на секунду потерял связь. Напиши ещё раз.');
  }
});

console.log('Telegram bot started');
cleanupExpiredRegistrationCodes();
setInterval(cleanupExpiredRegistrationCodes, 60 * 60 * 1000).unref();
