import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const publicSiteUrl = process.env.PUBLIC_SITE_URL || process.env.FRONTEND_ORIGIN || 'https://triznes.online';
const backendBaseUrl = (process.env.TRIZNES_BACKEND_URL || publicSiteUrl).replace(/\/$/, '');
const telegramRegistrationApiSecret = process.env.TELEGRAM_REGISTRATION_API_SECRET || '';

if (!botToken) {
  throw new Error('TELEGRAM_BOT_TOKEN is missing');
}

if (!telegramRegistrationApiSecret) {
  throw new Error('TELEGRAM_REGISTRATION_API_SECRET is missing');
}

const bot = new TelegramBot(botToken, { polling: true });

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
const characterCodeQuestion = {
  step: 'character_code',
  field: 'character_code',
  prompt: 'Для роли «Персонаж» введите ваш отдельный 4-значный код доступа.',
  maxLength: 4
};

function getSession(chatId) {
  if (!userSessions.has(chatId)) userSessions.set(chatId, { step: 'start' });
  return userSessions.get(chatId);
}

async function issueRegistrationCode(chatId, registrationData) {
  if (!telegramRegistrationApiSecret) throw new Error('TELEGRAM_REGISTRATION_API_SECRET is missing');
  const response = await fetch(`${backendBaseUrl}/api/telegram-registration/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${telegramRegistrationApiSecret}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ telegram_user_id: Number(chatId), registration: registrationData })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Could not create registration code');
  return result;
}

async function getRegistrationStatus(chatId) {
  if (!telegramRegistrationApiSecret) throw new Error('TELEGRAM_REGISTRATION_API_SECRET is missing');
  const url = new URL('/api/telegram-registration/status', backendBaseUrl);
  url.searchParams.set('telegram_user_id', String(chatId));
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${telegramRegistrationApiSecret}` }
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Could not check registration status');
  return result;
}

async function consumeTelegramLink(rawToken, chatId, username) {
  const response = await fetch(`${backendBaseUrl}/api/telegram/link/consume`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${telegramRegistrationApiSecret}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token: rawToken, telegram_user_id: Number(chatId), telegram_username: username || null })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Could not link Telegram profile');
  return result.profile;
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
      const profile = await consumeTelegramLink(rawToken, chatId, msg.from?.username);

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
      console.error('Telegram profile linking failed', error?.message || error);
      await bot.sendMessage(chatId, 'Не удалось завершить подключение. Попробуйте создать новую ссылку на сайте чуть позже.');
      return;
    }
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

  if (callback === 'registration_check') {
    try {
      const status = await getRegistrationStatus(chatId);
      if (!status.registered) {
        await bot.sendMessage(chatId, 'Профиль ещё не подтверждён платформой. Завершите регистрацию на сайте; если включено подтверждение email, подтвердите адрес и войдите. Затем нажмите «Проверить регистрацию» ещё раз.');
        return;
      }

      session.step = 'level_2';
      await bot.sendMessage(chatId,
        `Регистрация подтверждена ✅\n\nУровень 2: ${gameLevels[1].title}\n${gameLevels[1].description}\n\nТвоё задание: ${gameLevels[1].task}`,
        { reply_markup: { inline_keyboard: [[{ text: 'Открыть профиль ТРИЗНЕС', url: publicSiteUrl }]] } }
      );
    } catch (error) {
      console.error('Telegram registration status check failed', error?.message || error);
      await bot.sendMessage(chatId, 'Не удалось проверить регистрацию. Попробуйте ещё раз чуть позже.');
    }
    return;
  }

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
    session.questions = selectedRole === 'character' ? [characterCodeQuestion, ...registrationQuestions] : registrationQuestions;
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
          [{ text: 'Ангел', callback_data: 'profile_role_angel_investor' }, { text: 'Ментор / оператор персонажа', callback_data: 'profile_role_mentor' }],
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

    session.registration[question.field] = value;
    const nextQuestion = session.questions[questionIndex + 1];
    if (nextQuestion) {
      session.step = nextQuestion.step;
      await bot.sendMessage(chatId, nextQuestion.prompt);
      return;
    }

    try {
      const registration = await issueRegistrationCode(chatId, session.registration);
      const registrationUrl = new URL(registration.registration_url || publicSiteUrl);
      registrationUrl.hash = `telegram-code=${registration.code}`;
      session.step = 'complete';
      await bot.sendMessage(chatId,
        `Анкета заполнена, вводный этап пройден ✅\n\nОдноразовый код регистрации: ${registration.code}\nКод действует 30 минут. Откройте сайт, введите код, проверьте ответы анкеты и задайте пароль. Юридические согласия вы подтвердите на сайте. После подтверждения email и первого входа вернитесь сюда и нажмите «Проверить регистрацию», чтобы перейти на уровень 2.\n\nЭтот код не является кодом входа персонажа.`,
        { reply_markup: { inline_keyboard: [
          [{ text: 'Открыть регистрацию ТРИЗНЕС', url: registrationUrl.toString() }],
          [{ text: 'Проверить регистрацию', callback_data: 'registration_check' }]
        ] } }
      );
    } catch (error) {
      console.error('Registration code creation failed', error?.message || error);
      await bot.sendMessage(chatId, 'Не удалось выдать код. Напишите /start, чтобы пройти вводный этап ещё раз.');
    }
    return;
  }

  if (session.step === 'complete') {
    await bot.sendMessage(chatId, 'Вводный этап уже пройден. Используйте код из предыдущего сообщения или напишите /start, чтобы получить новый.');
  }
});

console.log('Telegram bot started');
