/* Снимок публичного мира TRIZNES от 12.11.2026.
   Источник: открытые вызовы get_triznes_world() и triznes_app_world() (поля visibility = public),
   реестр проводников triznes_world_agents и канон docs/core/TRIZNES_FIRMWARE_V3.json.
   Здесь нет выдуманных людей и текстов от их имени. В режиме «живые данные» снимок заменяется ответом сервера. */
window.TZ = window.TZ || {};

TZ.canon = {
  name: 'TRIZNES LIVING WORLD',
  version: '3.0.0',
  axiom: 'ТВОЙ МИР ПРИНАДЛЕЖИТ ТЕБЕ.',
  cinema: 'Показываем жизнь в игре и игру в жизни.',
  cityGoal: 'СОЧИ — ГОРОД КИНО',
  protocol: 'CHARACTER ↔ CHARACTER ↔ CHARACTER',
  firstQuestion: 'КТО ТЫ?',
  dialogue: ['КТО Я', 'ЧТО Я ЛЮБЛЮ', 'ЧЕГО Я ХОЧУ', 'ЧТО ВО МНЕ УНИКАЛЬНО'],
  finalQuestion: 'ЧТО МЫ МОЖЕМ СОЗДАТЬ ВМЕСТЕ?',
  pultModel: ['Я', 'МОИ СВЯЗИ', 'МОЙ МИР', 'НАШ ГОРОД'],
  progression: ['ИСКРА', 'СВЕТ', 'СВЯЗЬ', 'СОЗВЕЗДИЕ', 'МИР', 'ГОРОД'],
  principles: ['принятие', 'уникальность', 'свобода и авторство', 'любовь', 'действие', 'творчество', 'связь', 'изобилие', 'игра', 'кино'],
  rules: [
    'TRIZNES не центр мира человека; человек — автор своего мира.',
    'AI усиливает человека, но не присваивает авторство и не подменяет реальность.',
    'Игра предлагает возможности, а не навязывает команды.',
    'Факты, идеи, художественные интерпретации и предполагаемое будущее маркируются раздельно.',
    'Реальные лица не заменяются AI-лицами.',
    'RAW никогда автоматически не становится публикацией.'
  ],
  characterLoop: ['АПОЛЛОН', 'ПРОФИЛЬ', 'ДИОНИС', 'РЕАЛЬНОЕ ДЕЙСТВИЕ', 'UPLOAD', 'BEZLIKI / РЕЖИССЁР', 'НЕЙРОФЕРМА', 'ФИЛЬМ', 'СОЧИ СЕЙЧАС', 'СЛЕДУЮЩИЙ КВЕСТ'],
  impulse: { code: 'ИМПУЛЬС 01', title: 'ПЕРЕДАЙ УЛЫБКУ', text: 'Снять и загрузить первый живой кадр.' }
};

/* Измерения резонанса — слова из принципов и входа прошивки. */
TZ.tags = [
  { id: 'music',  name: 'МУЗЫКА' },
  { id: 'cinema', name: 'КИНО' },
  { id: 'stage',  name: 'СЦЕНА' },
  { id: 'game',   name: 'ИГРА' },
  { id: 'city',   name: 'ГОРОД' },
  { id: 'love',   name: 'ЛЮБОВЬ' },
  { id: 'deed',   name: 'ДЕЙСТВИЕ' },
  { id: 'bond',   name: 'СВЯЗЬ' }
];

/* Планеты — реальные миры и сообщества проекта. */
TZ.worlds = [
  { slug: 'sochiwood', name: 'SOCHIWOOD', kind: 'world', look: 'p-gold', ring: true, tags: ['cinema', 'city'],
    line: 'Собирать прожитую реальность в кино и городскую память.', city: 'Сочи' },
  { slug: 'pink-noize', name: 'PINK NOIZE', kind: 'community', look: 'p-pink', tags: ['music'],
    line: 'Эмоциональный голос, музыка и творческая энергия мира.', city: 'Сочи' },
  { slug: 'theatre-tuz', name: 'ТЕАТР ТУЗ', kind: 'community', look: 'p-violet', moon: true, tags: ['stage', 'game'],
    line: 'ВОСПРИЯТИЕ → ДЕЙСТВИЕ → ТРАНСФОРМАЦИЯ', city: 'Сочи' },
  { slug: 'za-lyubov', name: 'ЗА ЛЮБОВЬ', kind: 'community', look: 'p-coral', tags: ['love', 'game'],
    line: 'Клуб и живая игра.', city: 'Сочи' },
  { slug: 'masskazhka-yana-rut', name: 'МАССКАЖКА', full: 'МАССКАЖКА · ЯНА RUT — анимационно-цирковое сообщество', kind: 'community', look: 'p-amber', tags: ['stage'],
    line: 'Анимационно-цирковое сообщество.', city: 'Сочи' },
  { slug: 'andrey-dragunov-trading-house', name: 'ТОРГОВЫЙ ДОМ', full: 'Торговый дом Андрея Драгунова', kind: 'community', look: 'p-silver', ring: true, tags: ['deed', 'bond'],
    line: 'Торговля и связи между людьми.', city: null },
  { slug: 'sochi', name: 'СОЧИ СЕЙЧАС', kind: 'city', look: 'p-sea', tags: ['city'],
    line: 'Живая лента города из открытых источников.', city: 'Сочи' }
];

/* Публичные профили первой и второй волны (visibility = public). tags — только слова из их собственных строк «роль», «идея», «мечта». */
TZ.profiles = [
  { slug: 'daniel', name: 'DANIEL', alias: 'PLAYER 001', card: 'PLAYER 001', role: 'Автор · режиссёр · герой в кадре',
    idea: 'Превратить путь города в кино, музыку и пространство для раскрытия людей.',
    dream: 'Живой SOCHIWOOD, где путь каждого становится его фильмом.',
    bio: 'Человек остаётся автором собственного мира; система помогает превратить реальный шаг в сцену и историю.',
    community: 'pink-noize', origin: 'REAL', identity: 'confirmed', wave: 'first', portrait: 'assets/cast/daniel.webp',
    accent: ['cyan', 'violet', 'gold'], tags: ['cinema', 'music', 'city'] },
  { slug: 'vsevolod-kim', name: 'ВСЕВОЛОД КИМ', alias: 'ТЕАТР ТУЗ', card: 'MENTOR', role: 'Режиссёр · автор Театрального игрового коллайдера',
    idea: 'Театральный игровой коллайдер: ВОСПРИЯТИЕ → ДЕЙСТВИЕ → ТРАНСФОРМАЦИЯ.',
    dream: 'Театр, в котором человек учится присутствовать и становится автором действия.',
    bio: 'Реальный герой и режиссёр линии Театра ТУЗ.',
    community: 'theatre-tuz', origin: 'REAL', identity: 'confirmed', wave: 'first', portrait: 'assets/cast/vsevolod-kim.webp',
    accent: ['violet', 'gold', 'amber'], tags: ['stage', 'game', 'deed'] },
  { slug: 'liberty', name: 'LIBERTY', alias: 'СВОБОДА', card: 'BLACK', role: 'Артистка · персонаж PINK NOIZE',
    idea: 'Свобода быть собой, соединённая с музыкой, образом и личным кино.',
    dream: 'Собственный узнаваемый музыкальный мир и фильм пути.',
    bio: 'Реальный портрет подтверждён архивом; AI не подменяет лицо.',
    community: 'pink-noize', origin: 'REAL', identity: 'confirmed', wave: 'first', portrait: 'assets/cast/liberty.webp',
    accent: ['cyan', 'magenta', 'diamond'], tags: ['music', 'cinema'] },
  { slug: 'neo', name: 'NEO', alias: 'НОВЫЙ ВЗГЛЯД', card: 'BLACK', role: 'Игрок · герой нового мира',
    idea: 'Переход из привычной реальности в яркий образ через действие, музыку и город.',
    dream: 'Раскрыть новый взгляд и вывести его на живую сцену.',
    bio: 'Личность реальна; текущий публичный визуал помечен AI ASSISTED.',
    community: 'pink-noize', origin: 'AI_ASSISTED', identity: 'confirmed', wave: 'first',
    accent: ['red', 'black', 'cyan'], tags: ['deed', 'music', 'city', 'stage'] },
  { slug: 'saphir', name: 'SAPHIR', alias: 'САПФИР', card: 'BLACK', role: 'Артист · герой сцены',
    idea: 'Сценическая энергия и собственный музыкальный персонаж.',
    dream: 'Премьера, после которой образ узнают с первого кадра.',
    bio: 'Старый AI-визуал не используется как лицо профиля; ожидается подтверждённый real master.',
    community: 'pink-noize', origin: 'NONE', identity: 'profile', wave: 'first',
    accent: ['sapphire', 'violet', 'cyan'], tags: ['stage', 'music'] },
  { slug: 'dragunov', name: 'АНДРЕЙ ДРАГУНОВ', alias: 'MILLIARDER', card: 'BLACK', role: 'Ментор · предприниматель · проводник инициатив',
    idea: 'Соединять людей, торговые инициативы и ресурсы в устойчивые проекты.',
    dream: 'Торговый дом нового мира, в котором ценность создают отношения.',
    bio: 'В базе есть подтверждённый пользовательский профиль и активное сообщество.',
    community: 'andrey-dragunov-trading-house', origin: 'NONE', identity: 'confirmed', wave: 'first',
    accent: ['gold', 'silver', 'cyan'], tags: ['deed', 'bond'] },
  { slug: 'artem-love', name: 'АРТЁМ ЗА ЛЮБОВЬ', alias: 'СОЗДАТЕЛЬ', card: 'CREATOR', role: 'Автор игры · предприниматель',
    idea: 'Масштабировать игру о здоровой, счастливой и осознанной жизни.',
    dream: 'Сообщество, которое выбирает любовь действием.',
    bio: 'Линия клуба «За любовь» подтверждена сообществом и календарём проекта.',
    community: 'za-lyubov', origin: 'NONE', identity: 'profile', wave: 'first',
    accent: ['coral', 'rose', 'gold'], tags: ['love', 'game', 'deed'] },
  { slug: 'dima-neon', name: 'ДИМА NEON FUTURIST', alias: 'РЕДАКТОР', card: 'EDITOR', role: 'Редактор · артист',
    idea: 'Превращать поток городской жизни в ясную визуальную историю.',
    dream: 'Живой монтаж города и историй персонажей.',
    bio: 'Профиль первой волны; визуал публикуется только после подтверждения происхождения.',
    community: 'pink-noize', origin: 'NONE', identity: 'profile', wave: 'first',
    accent: ['cyan', 'magenta', 'lime'], tags: ['city', 'cinema'] },
  { slug: 'lev', name: 'ЛЕВ', alias: 'МУЗЫКАНТ', card: 'PLAYER', role: 'Игрок · музыкальный герой',
    idea: 'Музыкальный персонаж с собственной сценой и визуальным знаком.',
    dream: 'Своя песня и первая сцена.',
    bio: 'Персонаж первой волны; публикации проходят обычный rights/QC gate.',
    community: 'pink-noize', origin: 'NONE', identity: 'profile', wave: 'first',
    accent: ['lime', 'cyan', 'black'], tags: ['music', 'stage'] },
  { slug: 'yana-rut', name: 'ЯНА RUT', alias: 'ПЕРСОНАЖ', card: 'PLAYER', role: 'Автор · участница первой волны',
    idea: 'Личный путь формируется вместе с участницей — без навязанного образа.',
    dream: 'Найти точную роль и снять первый эпизод.',
    bio: 'Связана также с активным сообществом «МАССКАЖКА».',
    community: 'pink-noize', also: 'masskazhka-yana-rut', origin: 'NONE', identity: 'profile', wave: 'first',
    accent: ['amber', 'magenta', 'cyan'], tags: ['stage', 'cinema'] },
  { slug: 'anton-almaz', name: 'АНТОН ALMAZ', alias: 'ALMAZ', card: 'PLAYER', role: 'Предприниматель · герой «Школы ремонта × TRIZNES»',
    idea: 'Показывать ремонт как создание нового мира через реальное мастерство и выбор человека.',
    dream: 'Открывать и развивать «Школу ремонта» как реальный проект и кино о нём.',
    bio: 'Реальный портрет подтверждён архивом; AI-ролики пока не попадают в публичный feed без согласия.',
    community: 'pink-noize', origin: 'NONE', identity: 'confirmed', wave: 'second',
    accent: ['diamond', 'cyan', 'amber'], tags: ['deed', 'cinema'] },
  { slug: 'yulia-resonance', name: 'ЮЛЯ', alias: 'RESONANCE', card: 'BLACK', role: 'Автор · архитектор проекта Resonance Galaxy',
    idea: 'Соединять человеческие сигналы, объяснимый резонанс и реальное совместное действие.',
    dream: 'Развить Resonance Galaxy как самостоятельную линию внутри экосистемы.',
    bio: 'Проект существует в backend и находится в фазе production foundation.',
    community: 'pink-noize', origin: 'NONE', identity: 'profile', wave: 'second',
    accent: ['violet', 'rose', 'cyan'], tags: ['bond', 'deed', 'music'] }
];

/* Опубликованные материалы проекта: название, происхождение и дата — как в базе. */
TZ.publications = [
  { id: 'pub-trailer', title: 'TRIZNES — трейлер мира', origin: 'GENERATED', type: 'video', at: '2026-11-11T14:52:22Z', platforms: ['telegram'], worlds: [], media: 'media/TRIZNES_trailer.mp4' },
  { id: 'pub-player001', title: 'CHARACTER 001 — DANIEL / PLAYER 001', origin: 'GENERATED', type: 'video', at: '2026-11-11T14:52:21Z', platforms: ['telegram'], worlds: [], profile: 'daniel', media: 'media/player001_reel.mp4' },
  { id: 'pub-mediahub', title: 'МЕДИАХАБ TRIZNES — ЖИВОЙ ВХОД В ИГРУ', origin: 'GENERATED', type: 'text', at: '2026-11-11T13:58:52Z', platforms: ['telegram'], worlds: [] },
  { id: 'pub-film03', title: 'ВЫБОР / НОВЫЙ МИР | TRIZNES NEURO CINEMA #03', origin: 'GENERATED', type: 'video', at: '2026-10-17T16:59:00Z', platforms: ['telegram', 'vk', 'youtube'], worlds: ['sochiwood'] },
  { id: 'pub-film01', title: 'СОЧИ — ГОРОД-ИГРА | NEURO CINEMA #01', origin: 'GENERATED', type: 'video', at: '2026-10-16T14:05:06Z', platforms: ['telegram'], worlds: ['sochiwood'] },
  { id: 'pub-short01', title: 'СОЧИ — ПЕРВЫЙ УРОВЕНЬ', origin: 'GENERATED', type: 'video', at: '2026-10-16T13:05:04Z', platforms: ['telegram'], worlds: ['sochiwood'] },
  { id: 'pub-short02', title: 'ГОРОД ЗАСЕЛЯЕТСЯ ПЕРСОНАЖАМИ', origin: 'GENERATED', type: 'video', at: '2026-10-16T12:13:14Z', platforms: ['telegram'], worlds: ['sochiwood'] },
  { id: 'pub-magnit', title: 'ОЛЯ ALEX / KALI — МАГНИТ', origin: 'GENERATED', type: 'video', at: '2026-10-11T13:35:46Z', platforms: ['telegram'], worlds: [] },
  { id: 'pub-story03', title: 'STORY 03 — Что такое TRIZNES?', origin: 'GENERATED', type: 'story_photo', at: '2026-10-10T10:43:41Z', platforms: ['multi'], worlds: [] },
  { id: 'pub-story02', title: 'STORY 02 — Здесь появляются персонажи', origin: 'GENERATED', type: 'story_photo', at: '2026-10-10T10:43:41Z', platforms: ['multi'], worlds: [] },
  { id: 'pub-story01', title: 'STORY 01 — В Сочи происходит нечто большее', origin: 'GENERATED', type: 'story_photo', at: '2026-10-10T10:43:41Z', platforms: ['multi', 'telegram'], worlds: [] },
  { id: 'pub-col15', title: '15 СЕКУНД КОЛЛАЙДЕРА: реакция, контакт, движение | ТЕАТР ТУЗ', origin: 'REAL', type: 'video', at: '2026-10-10T00:11:19Z', series: 'КОЛЛАЙДЕР · 9 ОКТЯБРЯ', platforms: ['telegram', 'youtube'], worlds: ['theatre-tuz'] },
  { id: 'pub-colmove', title: 'ДВИЖЕНИЕ БЕЗ СЛОВ: как группа ловит импульс | КОЛЛАЙДЕР', origin: 'REAL', type: 'video', at: '2026-10-10T00:11:19Z', series: 'КОЛЛАЙДЕР · 9 ОКТЯБРЯ', platforms: ['telegram', 'youtube'], worlds: ['theatre-tuz'] },
  { id: 'pub-colsound', title: 'ЖИВОЙ ЗВУК: Всеволод Ким ведёт «Коллайдер» | ТЕАТР ТУЗ', origin: 'REAL', type: 'video', at: '2026-10-10T00:11:19Z', series: 'КОЛЛАЙДЕР · 9 ОКТЯБРЯ', platforms: ['telegram', 'youtube'], worlds: ['theatre-tuz'], profile: 'vsevolod-kim' },
  { id: 'pub-collive', title: 'ЖИВОЙ КОЛЛАЙДЕР: один вечер без постановки | ТЕАТР ТУЗ', origin: 'REAL', type: 'video', at: '2026-10-10T00:11:19Z', series: 'КОЛЛАЙДЕР · 9 ОКТЯБРЯ', platforms: ['telegram', 'youtube'], worlds: ['theatre-tuz'] },
  { id: 'pub-colrhythm', title: 'КОЛЛАЙДЕР: группа становится ритмом | ТЕАТР ТУЗ × PINK NOIZE', origin: 'REAL', type: 'video', at: '2026-10-10T00:11:19Z', series: 'КОЛЛАЙДЕР · 9 ОКТЯБРЯ', platforms: ['telegram', 'youtube'], worlds: ['theatre-tuz', 'pink-noize'] },
  { id: 'pub-creators', title: '10 ОКТЯБРЯ · ДЕНЬ ТВОРЦОВ · СОЧИ', origin: 'GENERATED', type: 'photo', at: '2026-10-09T18:15:45Z', platforms: ['telegram', 'vk'], worlds: [] }
];

/* Подкаст проекта: названия и длительность — из меток самих файлов. Происхождение голоса в метках не указано. */
TZ.podcast = { title: 'TRIZNES — Жизнь в игре · подкаст', author: 'Даниель · TRIZNES', profile: 'daniel', episodes: [
  { no: 1, title: 'Жизнь в игре: что такое TRIZNES', sec: 141, media: 'media/TRIZNES_podcast_01.mp3' },
  { no: 2, title: 'Путь: вход и 13 уровней', sec: 137, media: 'media/TRIZNES_podcast_02.mp3' },
  { no: 3, title: 'Движки экосистемы, как есть', sec: 170, media: 'media/TRIZNES_podcast_03.mp3' },
  { no: 4, title: 'Партнёрам, ангелам и городу', sec: 111, media: 'media/TRIZNES_podcast_04.mp3' }
] };

/* Живая лента города: заголовки и ссылки на первоисточники, снимок 12.11.2026. */
TZ.news = [
  { id: 'news-afisha', source: 'FunSochi — Красная Поляна', at: '2026-11-12T13:45:09Z', url: 'https://t.me/funsochi/18441',
    text: 'Дайджест мероприятий на ноябрь (12–28.11): афиша выходных, Красная Поляна.' },
  { id: 'news-sirius-music', source: 'Образовательный центр Сириус', at: '2026-11-12T13:07:09Z', url: 'https://t.me/sirius_talents/5242',
    text: 'Новые возможности для музыкантов: идёт приём заявок на образовательные программы в «Сириусе».' },
  { id: 'news-weather', source: 'Сочи Официальный', at: '2026-11-12T10:07:06Z', url: 'https://t.me/officialsochi/67717',
    text: 'В Сочи ожидается комплекс неблагоприятных погодных явлений: усиление ветра, волнение моря 3–4 балла.' },
  { id: 'news-trains', source: 'Сочи Официальный', at: '2026-11-12T10:30:07Z', url: 'https://t.me/officialsochi/67719',
    text: 'С 17 по 19 ноября из-за плановых ремонтных работ будет прекращено движение поездов Лазаревская — Сочи.' },
  { id: 'news-sozvezdie', source: 'Образовательный центр Сириус', at: '2026-11-12T11:00:13Z', url: 'https://t.me/sirius_talents/5241',
    text: 'Лауреаты прошлых лет дали напутственные слова будущим участникам «Созвездия».' }
];

/* Нейроперсонажи TRIZNES. Образы — канонические мастер-изображения из архива проекта (папки «Нейроперсонажи», «03 — НЕЙРОПЕРСОНАЖИ»),
   роли и зоны — реестр triznes_world_agents и прошивка v3. Все образы созданы нейросетью (GENERATED); реальных людей здесь нет.
   Канонический ключ: chivurundu. */
TZ.agents = [
  { slug: 'apollon', name: 'АПОЛЛОН', role: 'Проводник состояния · вход в игру через состояние', color: '#f2b84b',
    img: 'assets/neuro/apollon.webp', card: 'assets/neuro/apollon-card.webp',
    look: 'Солнечный проводник в сияющей золотой накидке.',
    job: 'Услышать, отразить, помочь человеку раскрыть себя.',
    intents: ['мечта', 'смысл', 'состояни', 'отношени', 'любовь', 'любв', 'изобили', 'выбор', 'поддержк', 'философ', 'устал', 'тревог', 'неясн'] },
  { slug: 'dionysus', name: 'ДИОНИС', role: 'Игровой провокатор и проводник по уровням', color: '#c77dff',
    img: 'assets/neuro/dionysus.webp', card: 'assets/neuro/dionysus-card.webp',
    look: 'Венок из винограда, бокал, огни ночного города у моря.',
    job: 'Превратить желание в добровольное реальное действие или квест.',
    intents: ['игра', 'игру', 'квест', 'уровен', 'уровн', 'коллайдер', 'танец', 'движени', 'снять', 'челлендж', 'мисси'] },
  { slug: 'bezliki', name: 'BEZLIKI', role: 'Старший брат и системный проводник', color: '#e8c879',
    img: 'assets/neuro/bezliki.webp', card: 'assets/neuro/bezliki-card.webp',
    look: 'Системный оператор в золотой маске и чёрном пуховике.',
    job: 'Снять сложность, дать один конкретный следующий шаг и довести результат.',
    intents: ['артефакт', 'дневник', 'монтаж', 'канал', 'серебрян', 'ресурс', 'реализац', 'следующий шаг', 'блокер'] },
  { slug: 'chivurundu', name: 'ЧИВУРУНДУ', role: 'Творческая искра, знакомство и лёгкий юмор', color: '#ff5fc0',
    img: 'assets/neuro/chivurundu.webp', card: 'assets/neuro/chivurundu-card.webp', world: 'pink-noize',
    look: 'Обезьянка-трикстер PINK NOIZE: розово-фиолетовый ирокез, серьги, чёрная майка PINK NOIZE, неоновые узоры, браслеты с шипами и тяжёлые ботинки. Дерзкий, живой, весёлый и искренний; немного хулиганский, но добрый.',
    job: 'Лёгкие уведомления, приглашения и знакомства без давления.',
    intents: ['познаком', 'знакомств', 'пригласи', 'шутк', 'юмор', 'кастинг', 'улыб'] },
  { slug: 'triznes', name: 'TRIZNES ASSISTANT', role: 'Технический и деловой проводник', color: '#58d6c4', mirror: true,
    look: 'У него нет своего лица. TRIZNES ASSISTANT — это каждый, кто в TRIZNES: образ переходит от персонажа к персонажу, и сейчас один из них — ты.',
    job: 'Проводник по устройству мира: платформа, профиль, доступы, карты, Нейроферма, события.',
    intents: ['платформ', 'профил', 'вход', 'доступ', 'нейроферм', 'контент', 'событи', 'статус', 'файл', 'загруз', 'карта', 'карту', 'оплат', 'документ', 'договор', 'как сделать'] },
  { slug: 'lubik', name: 'ЛЮБИК', role: 'Дух мира изобилия · сердце и короткий тёплый сигнал', color: '#ffb86b',
    img: 'assets/neuro/lubik.webp', card: 'assets/neuro/lubik-card.webp',
    look: 'Светящийся дух изобилия с шарфом, над ночной набережной.',
    job: 'Реакция без диалога.', reactionOnly: true, intents: [] }
];

/* Нейроперсонажи без роли проводника. */
TZ.neuro = [
  { slug: 'bezliki-dancer', name: 'БЕЗЛИКИ', role: 'Артист нового поколения · PINK NOIZE', color: '#b6f23c',
    img: 'assets/neuro/bezliki-dancer.webp', card: 'assets/neuro/bezliki-dancer-card.webp', world: 'pink-noize',
    look: 'Танцующий образ: неоновый камуфляж, панама PINK NOIZE, красные очки, набережная Сочи на закате.',
    job: 'Танец и сцена PINK NOIZE.', artist: true, intents: [] }
];

/* Клубные карты — подписи из triznes_membership_card_policies. Оплата в приложении не подключена. */
TZ.cards = [
  { tier: 'black', name: 'BLACK', term: '7 дней', label: 'Карта TRIZNES на 7 дней', note: 'Входной производственный пропуск в мир персонажей. Без гарантии просмотров, славы, дохода или инвестиций.' },
  { tier: 'silver', name: 'SILVER', term: '1 месяц', label: 'Серебряная карта TRIZNES — 1 месяц', note: 'Продление — отдельным решением.' },
  { tier: 'gold', name: 'GOLD', term: '1 месяц', label: 'Полный доступ к Media Hub TRIZNES — съёмки, контент, возможности и партнёрства клуба', note: 'Продление — благодарность клубу.' }
];

/* Виды согласий — как в базе (4 шаблона-черновика). Геолокации среди них нет. */
TZ.consentKinds = [
  { kind: 'personal_data_processing', name: 'Обработка персональных данных' },
  { kind: 'image_use', name: 'Использование образа' },
  { kind: 'personal_data_distribution', name: 'Распространение данных' },
  { kind: 'creative_materials_license', name: 'Лицензия на творческие материалы' }
];
