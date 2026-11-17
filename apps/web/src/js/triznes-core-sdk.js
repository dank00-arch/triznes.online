/* ============================================================================
   TRIZNES CORE SDK (SIGNAL_013)
   - Динамическая конфигурация Supabase (без хардкода CORE/DANIEL).
   - Поддержка Auth, Белой/Чёрной/Серебряной/Золотой карт, APOLLON FSM,
     индивидуального AI-ключа в серверном хранилище и установки PWA на iOS/Android.
   ============================================================================ */
(() => {
  'use strict';


  const cfg = window.TRIZNES_CONFIG || {};
  const SUPABASE_URL = cfg.supabaseUrl || document.querySelector('meta[name="triznes-supabase-url"]')?.content || '';
  const SUPABASE_ANON_KEY = cfg.supabaseAnonKey || document.querySelector('meta[name="triznes-supabase-anon-key"]')?.content || '';


  const ENDPOINTS = {
    authToken: SUPABASE_URL ? `${SUPABASE_URL}/auth/v1/token?grant_type=password` : '',
    authSignup: SUPABASE_URL ? `${SUPABASE_URL}/auth/v1/signup` : '',
    authUser: SUPABASE_URL ? `${SUPABASE_URL}/auth/v1/user` : '',
    gateway: SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/apollon-core-gateway` : '',
    telegramSync: SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/telegram-bot-sync` : '',
    storageUpload: SUPABASE_URL ? `${SUPABASE_URL}/storage/v1/object/triznes-media` : '',
    restProfiles: SUPABASE_URL ? `${SUPABASE_URL}/rest/v1/profiles` : '',
    restMediaAssets: SUPABASE_URL ? `${SUPABASE_URL}/rest/v1/media_assets` : ''
  };


  // Канонический реестр 14 линий (DANIEL и НЕО строго разделены; KALI закрыта гейтом согласия)
  const CHARACTER_ROSTER = [
    { slug: 'daniel', name: 'DANIEL · DRIP MIND #001', pillar: 'CORE', guide: 'APOLLON', origin: 'REAL', verified: true, role: 'Основатель TRIZNES, композитор, автор книги «Жизнь в игре»', quest: 'Сформулируй главную идею своей жизни так, чтобы она стала первым кадром фильма.' },
    { slug: 'neo', name: 'НЕО (Промо-мастер)', pillar: 'ART', guide: 'DIONYSUS', origin: 'ARCHIVE', verified: false, role: 'Отдельная персонажная линия (требует прохождения Audio & Consent Gate)', quest: 'Выбери ритм и одну главную фразу своего выступления.' },
    { slug: 'dragunov', name: 'Андрей Николаевич Драгунов', pillar: 'TRADE', guide: 'BEZLIKI', origin: 'ARCHIVE', verified: true, role: 'Сооснователь, глава Торгового дома, направление «Великий Шёлковый Путь»', quest: 'Опиши реальный проект, площадку или компетенцию для партнёрской сети.' },
    { slug: 'bezliki', name: 'Системный Безлики (BEZLIKI)', pillar: 'CORE', guide: 'BEZLIKI', origin: 'CYBER', verified: true, role: 'Навигатор ясности и контроля качества следующего шага', quest: 'Отсеки три второстепенные задачи и выбери одно точное действие на сегодня.' },
    { slug: 'bezliki-dancer', name: 'Безлики-танцор', pillar: 'ART', guide: 'DIONYSUS', origin: 'REAL', verified: true, role: 'Артист нового поколения · поппинг и уличный футворк Сочи', quest: 'Сделай 60 секунд свободного движения под ритм PINK NOIZE.' },
    { slug: 'chivurundu', name: 'Чивурунду', pillar: 'ART', guide: 'DIONYSUS', origin: 'CYBER', verified: true, role: 'Трикстер живых знакомств и улыбки (Морской вокзал)', quest: 'Подари искреннюю улыбку или напиши человеку, с которым давно хотел создать общее дело.' },
    { slug: 'lubik', name: 'Любик', pillar: 'CORE', guide: 'APOLLON', origin: 'CYBER', verified: true, role: 'Хранитель тепла и микрореакций благодарности (Медиахаб)', quest: 'Запиши три вещи, за которые ты благодарен себе и людям сегодня.' },
    { slug: 'alex', name: 'ALEX (PINK NOIZE)', pillar: 'ART', guide: 'APOLLON', origin: 'ARCHIVE', verified: true, role: 'Поп-вокалистка творческого объединения PINK NOIZE', quest: 'Запиши голосом одну строчку мелодии или честную мысль о своём состоянии.' },
    { slug: 'vsevolod-kim', name: 'Всеволод Ким', pillar: 'ART', guide: 'DIONYSUS', origin: 'REAL', verified: true, role: 'Режиссёр театра ТУЗ и программы «Театральный коллайдер»', quest: 'Произнеси свою мечту вслух без заученных социальных масок.' },
    { slug: 'mityai', name: 'Митяй (DOCTOR)', pillar: 'ART', guide: 'DIONYSUS', origin: 'REAL', verified: true, role: 'Уличный музыкант, рэпер, фристайлер и промоутер Сочи', quest: 'Собери четырёхстрочный ритмический девиз сегодняшнего дня.' },
    { slug: 'alik-maslo', name: 'Алик (MASLO)', pillar: 'ART', guide: 'DIONYSUS', origin: 'REAL', verified: true, role: 'Стендап-комик, ведущий стримов и оператор SOCHIWOOD', quest: 'Посмотри на сегодняшнюю трудность через добрую самоиронию и точный кадр.' },
    { slug: 'gala', name: 'ГАЛА (Анжела)', pillar: 'CORE', guide: 'APOLLON', origin: 'ARCHIVE', verified: true, role: 'Проводник трансформационных карт и глубоких вопросов', quest: 'Ответь себе: какое действие ты выберешь, если никому ничего не нужно доказывать?' },
    { slug: 'anton-simko', name: 'Антон Симко (Salomon)', pillar: 'CORE', guide: 'BEZLIKI', origin: 'REAL', verified: true, role: 'Практик оздоровления, автор «Школы ремонта» ресурса тела', quest: 'Пройди 5 минут пешком на свежем воздухе у воды без телефона в руке.' },
    { slug: 'liberty', name: 'Екатерина (Liberty) и проводники комьюнити', pillar: 'TRADE', guide: 'ASSISTANT', origin: 'REAL', verified: true, role: 'Проводники живых встреч, локаций и «Клуба За Любовь»', quest: 'Поделись одним полезным контактом или поддержкой с участником сообщества.' }
  ];


  // Каталог публичных фильмов SOCHIWOOD и треков PINK NOIZE с честной маркировкой прав
  const PUBLIC_MEDIA_CATALOG = [
    {
      id: 'sochiwood_primorskaya_01',
      title: 'Медиахаб Приморская 6/4 · Живой Сочи',
      category: 'SOCHIWOOD',
      origin: 'REAL',
      rights: 'TRIZNES_VERIFIED',
      lang: 'RU / EN',
      duration: '01:45',
      playback_url: null,
      description: 'Документальная хроника пространства на Приморской 6/4. Ожидает подтверждения мастер-файла MP4 в каталоге.'
    },
    {
      id: 'pinknoize_manifest_02',
      title: 'PINK NOIZE — Жизнь в игре (Original Sound)',
      category: 'PINK NOIZE',
      origin: 'ARCHIVE',
      rights: 'CREATOR_OWNED_PINK_NOIZE',
      lang: 'RU',
      duration: '02:58',
      playback_url: null,
      description: 'Авторский звук лейбла PINK NOIZE (Prod by Dzen). Слот подключится после привязки signed URL.'
    },
    {
      id: 'tuz_collider_03',
      title: 'Театральный Коллайдер ТУЗ · Репетиция',
      category: 'SOCHIWOOD',
      origin: 'REAL',
      rights: 'ADMIN_APPROVED_EXTERNAL',
      lang: 'RU',
      duration: '03:12',
      playback_url: null,
      description: 'Живая сцена под руководством режиссёра Всеволода Кима.'
    },
    {
      id: 'cyber_sochi_portal_04',
      title: 'Киберпространство Сочи · Визуальный концепт',
      category: 'CYBER LAYER',
      origin: 'GENERATED',
      rights: 'TRIZNES_VERIFIED',
      lang: 'RU / EN',
      duration: '00:45',
      playback_url: null,
      description: 'Художественная визуализация игрового слоя Сочи (не является документальной фотографией).'
    }
  ];


  const REAL_SOCHI_LOCATIONS = [
    { id: 'loc_mediahub', name: 'Медиахаб TRIZNES', address: 'Сочи, ул. Приморская, 6/4', pillar: 'CORE', lat: 43.5754, lng: 39.7239, origin: 'REAL', note: 'Главная точка сборки, съёмок и встреч сообщества.' },
    { id: 'loc_navaginskaya', name: 'Аллея Навагинская', address: 'Сочи, ул. Навагинская', pillar: 'CORE', lat: 43.5855, lng: 39.7231, origin: 'REAL', note: 'Пешеходный маршрут квестов состояния и внимания.' },
    { id: 'loc_seaport', name: 'Морской вокзал Сочи', address: 'Сочи, ул. Войкова, 1', pillar: 'ART', lat: 43.5806, lng: 39.7187, origin: 'REAL', note: 'Локация съёмок SOCHIWOOD и живых знакомств.' },
    { id: 'loc_tuz', name: 'Театр ТУЗ / Коллайдер', address: 'Сочи, центр города', pillar: 'ART', lat: 43.5862, lng: 39.7265, origin: 'REAL', note: 'Сцена актёрской трансформации и импровизации.' }
  ];


  // Проверка допустимости воспроизведения медиа (блокирует playback_url === null)
  function evaluateMediaPlayback(item) {
    if (!item || !item.playback_url) {
      return {
        playable: false,
        statusLabel: 'В ПРОИЗВОДСТВЕ · ОЖИДАЕТ ПОДТВЕРЖДЁННОГО MP4 И QC',
        origin: item?.origin || 'ARCHIVE'
      };
    }
    return {
      playable: true,
      url: String(item.playback_url),
      statusLabel: 'READY · ПРОВЕРЕНО QC',
      origin: item.origin || 'REAL'
    };
  }


  // Управление сессией Supabase Auth
  class TriznesAuthSession {
    constructor() {
      this.storageKey = 'triznes_auth_session_v13';
    }


    getSession() {
      try {
        const raw = localStorage.getItem(this.storageKey);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }


    setSession(session) {
      try {
        if (!session) localStorage.removeItem(this.storageKey);
        else localStorage.setItem(this.storageKey, JSON.stringify(session));
      } catch {}
    }


    getAccessToken() {
      return this.getSession()?.access_token || null;
    }


    async signInWithPassword(email, password) {
      if (!ENDPOINTS.authToken || !SUPABASE_ANON_KEY) {
        throw new Error('Supabase конфигурация не подключена в window.TRIZNES_CONFIG');
      }
      const res = await fetch(ENDPOINTS.authToken, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error_description || data.msg || 'Ошибка входа');
      this.setSession(data);
      return data;
    }


    async signUpWithTelegramCode({ email, password, firstName, phone, registrationCode }) {
      if (!ENDPOINTS.authSignup || !SUPABASE_ANON_KEY) {
        throw new Error('Supabase конфигурация не подключена');
      }
      const res = await fetch(ENDPOINTS.authSignup, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({
          email,
          password,
          data: {
            first_name: firstName,
            phone,
            triznes_registration_code: registrationCode,
            role: 'character'
          }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error_description || data.msg || 'Ошибка регистрации');
      if (data.access_token) this.setSession(data);
      return data;
    }


    signOut() {
      this.setSession(null);
    }
  }


  // Контроллер кокпита и шлюза APOLLON / DIONYSUS / BEZLIKI
  class TriznesCockpitController {
    constructor(auth) {
      this.auth = auth;
      this.step = 'WELCOME';
      this.pillar = localStorage.getItem('tz_pillar') || 'CORE';
      this.participationMode = localStorage.getItem('tz_mode') || 'participant';
      this.selectedChar = CHARACTER_ROSTER[0];
      this.rawDream = '';
      this.suggestedGoal = null;
    }


    setPillar(pillar) {
      if (['ART', 'TRADE', 'CORE'].includes(pillar)) {
        this.pillar = pillar;
        try { localStorage.setItem('tz_pillar', pillar); } catch {}
      }
    }


    setMode(mode) {
      if (['guest', 'viewer', 'participant', 'character'].includes(mode)) {
        this.participationMode = mode;
        try { localStorage.setItem('tz_mode', mode); } catch {}
      }
    }


    selectCharacter(slug) {
      const found = CHARACTER_ROSTER.find((c) => c.slug === slug);
      if (found) {
        this.selectedChar = found;
        this.setPillar(found.pillar);
      }
      return this.selectedChar;
    }


    async callGateway(bodyPayload) {
      const token = this.auth.getAccessToken();
      if (!token || !ENDPOINTS.gateway || !SUPABASE_ANON_KEY) {
        return null;
      }
      const res = await fetch(ENDPOINTS.gateway, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json().catch(() => ({ error: 'invalid_json' }));
      if (!res.ok || !data.ok) throw new Error(data.error || `http_${res.status}`);
      return data;
    }


    async nextApollonStep({ message = '', confirmedByUser = null, issueWhiteCard = false } = {}) {
      if (this.step === 'DREAM' && message) this.rawDream = message;
      const token = this.auth.getAccessToken();


      if (!token || !ENDPOINTS.gateway) {
        return this.runOfflineOrGuestStep({ message, confirmedByUser });
      }


      const idempotencyKey = `tz_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const data = await this.callGateway({
        action: 'apollon_step',
        current_state: this.step,
        pillar: this.pillar,
        participation_mode: this.participationMode,
        character_slug: this.selectedChar.slug,
        message,
        confirmed_by_user: confirmedByUser,
        raw_dream: this.rawDream,
        suggested_goal: this.suggestedGoal,
        idempotency_key: idempotencyKey,
        issue_white_card: issueWhiteCard
      });


      this.step = data.state;
      if (data.assistant?.suggested_goal) this.suggestedGoal = data.assistant.suggested_goal;
      return data;
    }


    runOfflineOrGuestStep({ message, confirmedByUser }) {
      const order = ['WELCOME', 'DREAM', 'REFLECT', 'CONSENT', 'QUEST', 'REALITY'];
      const idx = order.indexOf(this.step);
      if (this.step === 'CONSENT') {
        this.step = confirmedByUser !== null ? 'QUEST' : 'CONSENT';
      } else {
        this.step = idx < order.length - 1 ? order[idx + 1] : 'REALITY';
      }
      if (this.step === 'REFLECT') {
        this.suggestedGoal = {
          title: (message || 'Моя история в TRIZNES').slice(0, 120),
          first_step: this.selectedChar.quest
        };
      }
      const replies = {
        WELCOME: 'Добро пожаловать в TRIZNES (Гостевой режим). Как тебя называть? Ты можешь остаться зрителем/гостем или выбрать образ персонажа.',
        DREAM: 'О чём ты мечтаешь? Расскажи голосом или текстом (для записи в облачный профиль потребуется вход в аккаунт).',
        REFLECT: `Я услышал твою мечту. Предлагаю первый шаг: ${this.suggestedGoal?.first_step || this.selectedChar.quest} Верно ли я понял?`,
        CONSENT: 'В гостевом режиме мечта хранится локально. Войди в аккаунт для сохранения в Supabase или нажми «Продолжить без сохранения».',
        QUEST: `Квест DIONYSUS (${this.selectedChar.name}): ${this.selectedChar.quest}`,
        REALITY: `Контроль BEZLIKI: сделай этот безопасный шаг в реальности — ${this.selectedChar.quest}`
      };
      return {
        ok: true,
        guest_mode: true,
        state: this.step,
        guide: this.selectedChar.guide,
        pillar: this.pillar,
        dream_saved: false,
        assistant: {
          reply_text: replies[this.step],
          suggested_goal: this.suggestedGoal,
          quest: { title: this.selectedChar.name, safe_next_step: this.selectedChar.quest }
        }
      };
    }
  }


  // Регистрация Service Worker и логика установки PWA на iPhone / Android
  function initPwaInstaller(installBtnId, hintElId) {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }


    let deferredPrompt = null;
    const btn = installBtnId ? document.getElementById(installBtnId) : null;
    const hint = hintElId ? document.getElementById(hintElId) : null;


    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;


    if (isStandalone && btn) {
      btn.style.display = 'none';
      return;
    }


    if (isIos && hint) {
      hint.textContent = 'iPhone: нажми «Поделиться» (□↑) в Safari → «На экран „Домой"» для установки TRIZNES.';
    }


    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (btn) btn.style.display = 'inline-flex';
    });


    if (btn) {
      btn.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          deferredPrompt = null;
          btn.style.display = 'none';
        } else if (isIos && hint) {
          hint.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  }


  window.TRIZNES_SDK = {
    ENDPOINTS,
    CHARACTER_ROSTER,
    PUBLIC_MEDIA_CATALOG,
    REAL_SOCHI_LOCATIONS,
    evaluateMediaPlayback,
    TriznesAuthSession,
    TriznesCockpitController,
    initPwaInstaller
  };
})();
