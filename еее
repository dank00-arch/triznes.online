<!DOCTYPE html>
<html lang="ru" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ТРИЗНЕС | Cyber Messenger & Gamified Ecosystem</title>
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- FontAwesome 6 CDN -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  
  <!-- Google Fonts: Orbitron & Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="">
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css">
  <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>

  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            cyber: ['Orbitron', 'sans-serif'],
          },
          colors: {
            neonBlue: '#00f3ff',
            neonPurple: '#9d4edd',
            neonPink: '#ff007f',
            neonRed: '#ff0555',
            neonGreen: '#00ff66',
            darkBg: '#090a10',
            cardBg: 'rgba(18, 15, 36, 0.75)',
          },
          boxShadow: {
            'neon-blue': '0 0 15px rgba(0, 243, 255, 0.4), 0 0 30px rgba(0, 243, 255, 0.2)',
            'neon-pink': '0 0 15px rgba(255, 0, 127, 0.4), 0 0 30px rgba(255, 0, 127, 0.2)',
            'neon-purple': '0 0 15px rgba(157, 78, 221, 0.4), 0 0 30px rgba(157, 78, 221, 0.2)',
            'neon-red': '0 0 15px rgba(255, 5, 85, 0.4), 0 0 30px rgba(255, 5, 85, 0.2)',
          }
        }
      }
    }
  </script>

  <style>
    :root {
      --cyber-ink: #090a10;
      --cyber-panel: rgba(18, 15, 36, 0.72);
      --cyber-line: rgba(255, 255, 255, 0.1);
      --cyber-cyan: #00f3ff;
      --cyber-pink: #ff007f;
    }

    body {
      background-color: #090a10;
      color: #e2e8f0;
      background-image: 
        radial-gradient(circle at 15% 15%, rgba(157, 78, 221, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 85% 85%, rgba(0, 243, 255, 0.12) 0%, transparent 40%),
        linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 30px 30px, 30px 30px;
      overflow-x: hidden;
    }

    body::before,
    body::after {
      content: '';
      position: fixed;
      z-index: -1;
      width: 34rem;
      height: 34rem;
      border-radius: 999px;
      filter: blur(70px);
      opacity: .14;
      pointer-events: none;
      animation: drift 18s ease-in-out infinite alternate;
    }

    body::before { top: 12%; left: -18rem; background: var(--cyber-pink); }
    body::after { right: -18rem; bottom: 8%; background: var(--cyber-cyan); animation-delay: -7s; }

    @keyframes drift {
      from { transform: translate3d(0, 0, 0) scale(.92); }
      to { transform: translate3d(5rem, -3rem, 0) scale(1.08); }
    }

    @keyframes reveal-up {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    main > .mb-5,
    main > .tab-content:not(.hidden) {
      animation: reveal-up .55s ease both;
    }

    .glass-panel {
      background: var(--cyber-panel);
      border-color: var(--cyber-line);
      box-shadow: 0 18px 55px rgba(0, 0, 0, .16);
    }

    .glass-card {
      background: linear-gradient(145deg, rgba(255, 255, 255, .075), rgba(255, 255, 255, .018));
      border-color: var(--cyber-line);
    }

    .glass-card:hover { transform: translateY(-4px); }

    #tab-quests { display: none !important; }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: .01ms !important;
      }
    }

    /* Custom Glassmorphism Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: rgba(10, 10, 20, 0.6);
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(157, 78, 221, 0.4);
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 243, 255, 0.7);
    }

    .glass-panel {
      background: rgba(18, 15, 36, 0.65);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .glass-card {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      transition: all 0.3s ease;
    }

    .glass-card:hover {
      border-color: rgba(0, 243, 255, 0.4);
      box-shadow: 0 0 20px rgba(0, 243, 255, 0.15);
      transform: translateY(-2px);
    }

    .neon-text-blue {
      text-shadow: 0 0 8px rgba(0, 243, 255, 0.6);
    }
    .neon-text-purple {
      text-shadow: 0 0 8px rgba(157, 78, 221, 0.6);
    }
    .neon-text-pink {
      text-shadow: 0 0 8px rgba(255, 0, 127, 0.6);
    }

    .neon-border-blue {
      box-shadow: 0 0 10px rgba(0, 243, 255, 0.3);
    }

    @keyframes pulse-glow {
      0%, 100% { opacity: 0.8; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.03); }
    }
    .animate-pulse-glow {
      animation: pulse-glow 3s infinite ease-in-out;
    }

    @keyframes scanline {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(1000%); }
    }
    .scanline {
      position: absolute;
      top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, transparent, rgba(0, 243, 255, 0.4), transparent);
      animation: scanline 8s linear infinite;
      pointer-events: none;
    }

    #sochi-map { min-height: 560px; background: #101923; }
    #sochi-map .maplibregl-ctrl-group { background: rgba(9, 10, 16, .88); border: 1px solid rgba(0, 243, 255, .35); }
    #sochi-map .maplibregl-ctrl button { filter: invert(1); }
    #sochi-map .maplibregl-ctrl-attrib { background: rgba(9, 10, 16, .72); color: #9ca3af; }
    #sochi-map .maplibregl-ctrl-attrib a { color: #00f3ff; }
    .map-video-frame { position: relative; width: 100%; aspect-ratio: 16 / 9; min-width: 0; overflow: hidden; }
    .map-video-frame > video,
    .map-video-frame > iframe { position: absolute; inset: 0; width: 100%; height: 100%; }
    .map-video-frame > video { object-fit: contain; background: #05070b; }
    .header-actions { display: flex; align-items: center; gap: .35rem; flex-wrap: wrap; }
    .header-action { border: 1px solid rgba(255, 255, 255, .14); border-radius: .65rem; padding: .5rem .7rem; color: #cbd5e1; background: rgba(255, 255, 255, .05); font: 700 10px Inter, sans-serif; cursor: pointer; transition: .2s ease; }
    .header-action:hover, .header-action:focus-visible { color: #fff; border-color: #00f3ff; background: rgba(0, 243, 255, .12); outline: none; }
    .header-action.register { color: #ff7abb; border-color: rgba(255, 0, 127, .45); }
    .header-action.register:hover, .header-action.register:focus-visible { border-color: #ff007f; background: rgba(255, 0, 127, .14); }
    #tab-map.map-layout { display: flex !important; flex-direction: column; }
    .map-layout > .map-block { order: 1; }
    .map-layout > .news-feed-section { order: 2; }
    .map-layout > .map-upload-section { order: 3; }
    .map-layout > .map-highlights-section { order: 4; }
    .map-layout > .map-discovery-section { order: 5; }
    #black-card-gate { background: radial-gradient(circle at 50% 0%, rgba(0, 243, 255, .12), transparent 38%), rgba(5, 7, 12, .97); }
    #black-card-gate .card-gate-panel { box-shadow: 0 0 70px rgba(0, 243, 255, .12), 0 25px 80px rgba(0, 0, 0, .45); }
    .leaflet-container { font-family: Inter, sans-serif; }
    .leaflet-popup-content-wrapper, .leaflet-popup-tip { background: #111827; color: #e2e8f0; }
    .leaflet-popup-content { margin: 12px 14px; }
    .map-popup-title { color: #00f3ff; font-family: Orbitron, sans-serif; font-weight: 700; margin-bottom: 6px; }
    .map-popup-meta { color: #9ca3af; font-size: 12px; line-height: 1.5; }
  </style>
</head>
<body class="min-h-screen flex flex-col font-sans text-gray-100 antialiased selection:bg-neonPink selection:text-white">

  <!-- Scanline Overlay -->
  <div class="scanline"></div>

  <!-- Public introduction and black card access gate -->
  <section id="black-card-gate" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="card-gate-panel w-full max-w-xl rounded-3xl border border-neonBlue/40 bg-darkBg/95 p-6 md:p-8 text-center">
      <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-neonBlue/50 bg-neonBlue/10 text-neonBlue shadow-neon-blue">
        <i class="fa-solid fa-id-card text-2xl"></i>
      </div>
      <div class="text-[10px] text-neonBlue font-mono uppercase tracking-[0.2em]">ТРИЗНЕС • вход в игру</div>
      <h1 class="mt-3 font-cyber text-2xl md:text-3xl font-bold text-white">Город, который создают участники</h1>
      <p class="mt-4 text-sm leading-6 text-gray-300">ТРИЗНЕС объединяет персонажей, сообщества, эфиры и игровые маршруты в одном живом городе.</p>
      <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 text-left text-xs">
        <div class="rounded-xl border border-white/10 bg-white/5 p-3"><i class="fa-solid fa-video text-neonPink"></i><strong class="mt-2 block text-white">Эфиры</strong><span class="mt-1 block text-gray-400">Поддержка персонажей</span></div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-3"><i class="fa-solid fa-map text-neonGreen"></i><strong class="mt-2 block text-white">Город</strong><span class="mt-1 block text-gray-400">Игровые локации</span></div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-3"><i class="fa-solid fa-users text-neonBlue"></i><strong class="mt-2 block text-white">Сообщества</strong><span class="mt-1 block text-gray-400">Реальные площадки</span></div>
      </div>
      <div class="mt-7 rounded-2xl border border-neonPink/40 bg-neonPink/10 p-4 text-left">
        <div class="flex items-center justify-between gap-3"><strong class="text-white">Чёрная карта сообщества</strong><span class="font-cyber text-neonPink">2 500 ₽</span></div>
        <p class="mt-2 text-xs leading-5 text-gray-300">Открывает вход в игру, эфиры, игровые локации и поддержку персонажей.</p>
        <div class="mt-4 flex flex-col sm:flex-row gap-2">
          <button type="button" id="black-card-link-button" class="flex-1 rounded-xl border border-neonPink/50 bg-neonPink/15 px-4 py-3 text-xs font-bold text-neonPink"><i class="fa-solid fa-link mr-2"></i>Получить ссылку</button>
          <button type="button" id="black-card-demo-button" class="flex-1 rounded-xl border border-neonGreen/50 bg-neonGreen/10 px-4 py-3 text-xs font-bold text-neonGreen"><i class="fa-solid fa-unlock mr-2"></i>Активировать карту</button>
        </div>
        <div class="mt-3 flex flex-col sm:flex-row gap-2">
          <button type="button" id="black-card-skip-button" class="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[11px] font-bold text-gray-200"><i class="fa-solid fa-forward mr-2"></i>Пропустить вход</button>
          <button type="button" id="black-card-demo-guest-button" class="flex-1 rounded-xl border border-neonBlue/40 bg-neonBlue/10 px-4 py-2.5 text-[11px] font-bold text-neonBlue"><i class="fa-solid fa-play mr-2"></i>Демо-режим</button>
        </div>
        <p id="black-card-link-status" class="mt-3 hidden text-[10px] text-neonBlue"></p>
      </div>
      <p class="mt-5 text-[10px] text-gray-500">Сейчас действует тестовая активация. Для запуска приёма оплаты подключите ссылку платёжного сервиса.</p>
    </div>
  </section>

  <!-- TOP HUD HEADER (GAMIFICATION BAR) -->
  <header class="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 py-2.5">
    <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
      
      <!-- Brand Logo -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl overflow-hidden border border-neonBlue/50 shadow-neon-blue cursor-pointer" onclick="switchTab('chats')">
          <img src="assets/triznes-emblem-drive.jpg" alt="Эмблема ТРИЗНЕС" class="w-full h-full object-cover">
        </div>
        <div>
          <div class="font-cyber text-lg font-bold tracking-widest text-white flex items-center gap-2">
            ТРИЗНЕС
          </div>
          <div class="text-xs text-gray-400 font-mono">Экосистема геймификации жизни</div>
        </div>
      </div>

      <!-- Gamification Stats HUD -->
      <div class="flex items-center flex-wrap gap-3 sm:gap-6 text-sm">
        
        <!-- User Level & Resonance -->
        <div class="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
          <div class="relative">
            <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-neonPurple to-neonPink p-0.5 shadow-neon-purple">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="Avatar" class="w-full h-full object-cover rounded-full">
            </div>
            <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-neonGreen border-2 border-darkBg rounded-full"></span>
          </div>
          <div class="hidden sm:block">
            <div class="flex items-center justify-between gap-2 text-xs">
              <span class="font-bold text-white" id="profile-user-name">Даниель</span>
              <span class="text-neonBlue font-mono font-semibold" id="hud-user-level">Lvl 14</span>
            </div>
            <!-- Resonance Bar -->
            <div class="w-28 h-2 bg-gray-800 rounded-full overflow-hidden mt-1 border border-white/10">
              <div id="hud-xp-bar" class="h-full bg-gradient-to-r from-neonBlue to-neonPurple transition-all duration-500" style="width: 74.5%;"></div>
            </div>
            <div class="text-[10px] text-gray-400 font-mono text-right mt-0.5" id="hud-xp-text">0 / 100 РЕЗОНАНСА</div>
          </div>
        </div>

        <!-- Core Currencies -->
        <div class="flex items-center gap-2">
          <button type="button" onclick="openNlsConnection()" class="flex items-center gap-2 bg-neonBlue/10 border border-neonBlue/30 px-3 py-1.5 rounded-xl text-neonBlue hover:bg-neonBlue/20 transition text-left" title="Подключить NLS">
            <i class="fa-solid fa-coins"></i>
            <div><div class="text-[10px] uppercase text-gray-400 font-mono leading-none">NLS · вклады</div><div class="font-cyber font-bold text-sm text-white" id="hud-nls-balance">0</div></div>
          </button>
          <div class="flex items-center gap-2 bg-neonPink/10 border border-neonPink/30 px-3 py-1.5 rounded-xl text-neonPink">
            <i class="fa-solid fa-heart"></i>
            <div><div class="text-[10px] uppercase text-gray-400 font-mono leading-none">LUBICOIN · поддержка</div><div class="font-cyber font-bold text-sm text-white" id="hud-lubikoin-balance">0</div></div>
          </div>
        </div>

        <!-- Membership Time -->
        <div class="flex items-center gap-2 bg-neonGreen/10 border border-neonGreen/30 px-3 py-1.5 rounded-xl text-neonGreen font-mono text-xs" title="Время участника в ТРИЗНЕС">
          <i class="fa-solid fa-clock"></i>
          <span id="member-duration">0 день • 0 ч</span>
        </div>

        <!-- System Controls -->
        <div class="header-actions">
          <button type="button" class="header-action register" id="app-register-button"><i class="fa-solid fa-user-plus mr-1"></i>Регистрация</button>
          <button type="button" class="header-action" id="app-light-theme-button"><i class="fa-solid fa-sun mr-1"></i>Светлая</button>
          <button type="button" class="header-action" id="app-cyber-theme-button"><i class="fa-solid fa-bolt mr-1"></i>Киберпанк</button>
          <button id="sound-toggle-btn" onclick="toggleSound()" class="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-neonBlue hover:border-neonBlue/50 transition">
            <i class="fa-solid fa-volume-high" id="sound-icon"></i>
          </button>
        </div>

      </div>

    </div>
  </header>

  <!-- MAIN BODY LAYOUT (SIDEBAR + WORKSPACE) -->
  <div class="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col md:flex-row gap-5">

    <!-- SIDEBAR NAVIGATION (VK / TG STYLE) -->
    <aside class="w-full md:w-64 flex-shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">

      <button onclick="switchTab('profile')" id="nav-btn-profile" class="nav-tab-btn flex items-center gap-3 px-4 py-3 rounded-xl glass-card text-left text-sm font-medium text-gray-300 hover:text-white transition w-full whitespace-nowrap">
        <div class="w-8 h-8 rounded-lg bg-neonPink/10 flex items-center justify-center text-neonPink">
          <i class="fa-solid fa-id-badge"></i>
        </div>
        <span class="flex-1">Мой профиль</span>
      </button>
      
      <button onclick="switchTab('chats')" id="nav-btn-chats" class="nav-tab-btn flex items-center gap-3 px-4 py-3 rounded-xl glass-card text-left text-sm font-medium text-gray-300 transition w-full whitespace-nowrap">
        <div class="w-8 h-8 rounded-lg bg-neonBlue/10 flex items-center justify-center text-neonBlue">
          <i class="fa-solid fa-comments"></i>
        </div>
        <span class="flex-1">Чаты</span>
        <span class="px-2 py-0.5 text-[11px] font-bold bg-neonPink text-white rounded-full">3</span>
      </button>

      <button onclick="switchTab('characters')" id="nav-btn-characters" class="nav-tab-btn flex items-center gap-3 px-4 py-3 rounded-xl glass-card text-left text-sm font-medium text-gray-300 hover:text-white transition w-full whitespace-nowrap">
        <div class="w-8 h-8 rounded-lg bg-neonPurple/10 flex items-center justify-center text-neonPurple">
          <i class="fa-solid fa-mask"></i>
        </div>
        <span class="flex-1">Персонажи</span>
        <span class="text-xs px-1.5 py-0.5 bg-neonPurple/30 text-neonPurple rounded font-mono">Гении</span>
      </button>

      <button onclick="switchTab('streams')" id="nav-btn-streams" class="nav-tab-btn flex items-center gap-3 px-4 py-3 rounded-xl glass-card text-left text-sm font-medium text-gray-300 hover:text-white transition w-full whitespace-nowrap">
        <div class="w-8 h-8 rounded-lg bg-neonRed/10 flex items-center justify-center text-neonRed">
          <i class="fa-solid fa-tower-broadcast animate-pulse"></i>
        </div>
        <span class="flex-1">Прямые эфиры</span>
        <span class="w-2.5 h-2.5 rounded-full bg-neonRed animate-ping"></span>
      </button>

      <button onclick="switchTab('communities')" id="nav-btn-communities" class="nav-tab-btn flex items-center gap-3 px-4 py-3 rounded-xl glass-card text-left text-sm font-medium text-gray-300 hover:text-white transition w-full whitespace-nowrap">
        <div class="w-8 h-8 rounded-lg bg-neonPink/10 flex items-center justify-center text-neonPink">
          <i class="fa-solid fa-users"></i>
        </div>
        <span class="flex-1">Сообщества</span>
      </button>

      <button onclick="switchTab('staking')" id="nav-btn-staking" class="nav-tab-btn flex items-center gap-3 px-4 py-3 rounded-xl glass-card text-left text-sm font-medium text-gray-300 hover:text-white transition w-full whitespace-nowrap">
        <div class="w-8 h-8 rounded-lg bg-neonGreen/10 flex items-center justify-center text-neonGreen">
          <i class="fa-solid fa-vault"></i>
        </div>
        <span class="flex-1">Вклады и Пулы</span>
        <span class="text-xs text-neonGreen font-mono">Проекты</span>
      </button>

      <button onclick="switchTab('clubcards')" id="nav-btn-clubcards" class="nav-tab-btn flex items-center gap-3 px-4 py-3 rounded-xl glass-card text-left text-sm font-medium text-gray-300 hover:text-white transition w-full whitespace-nowrap">
        <div class="w-8 h-8 rounded-lg bg-neonPink/10 flex items-center justify-center text-neonPink">
          <i class="fa-solid fa-id-card"></i>
        </div>
        <span class="flex-1">Клубные карты</span>
      </button>

      <button onclick="switchTab('map')" id="nav-btn-map" class="nav-tab-btn active-tab flex items-center gap-3 px-4 py-3 rounded-xl glass-card text-left text-sm font-medium text-white transition w-full whitespace-nowrap">
        <div class="w-8 h-8 rounded-lg bg-neonGreen/10 flex items-center justify-center text-neonGreen">
          <i class="fa-solid fa-map-location-dot"></i>
        </div>
        <span class="flex-1">Карта Сочи</span>
        <span class="text-[10px] text-neonGreen font-mono">LIVE</span>
      </button>

      <button onclick="switchTab('music')" id="nav-btn-music" class="nav-tab-btn flex items-center gap-3 px-4 py-3 rounded-xl glass-card text-left text-sm font-medium text-gray-300 hover:text-white transition w-full whitespace-nowrap">
        <div class="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400"><i class="fa-solid fa-music"></i></div>
        <span class="flex-1">Музыка</span><span class="text-[10px] text-amber-400 font-mono">FREE</span>
      </button>

      <button onclick="switchTab('realestate')" id="nav-btn-realestate" class="nav-tab-btn flex items-center gap-3 px-4 py-3 rounded-xl glass-card text-left text-sm font-medium text-gray-300 hover:text-white transition w-full whitespace-nowrap">
        <div class="w-8 h-8 rounded-lg bg-neonBlue/10 flex items-center justify-center text-neonBlue">
          <i class="fa-solid fa-city"></i>
        </div>
        <span class="flex-1">Недвижимость</span>
      </button>

      <!-- Passive Income Mini Widget in Navigation -->
      <div class="hidden md:block mt-auto p-4 rounded-xl glass-panel border border-neonPurple/30 bg-neonPurple/5">
        <div class="text-xs text-gray-400 font-mono mb-1">Пассивный доход:</div>
        <div class="text-lg font-cyber font-bold text-neonBlue flex items-center gap-1">
          +<span id="sidebar-passive-rate">0</span> <span class="text-xs font-sans text-gray-300">LUBIKOIN/час</span>
        </div>
        <div class="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mt-2">
          <div class="bg-neonBlue h-full w-2/3 animate-pulse"></div>
        </div>
        <div class="text-[10px] text-gray-400 mt-1 flex justify-between">
          <span>Сбор через:</span>
          <span class="font-mono text-neonPurple">42:18</span>
        </div>
      </div>

    </aside>

    <!-- CONTENT WORKSPACE AREA -->
    <main class="flex-1 min-w-0">
      <div class="mb-5 space-y-4">
        <div class="flex flex-wrap items-center gap-2 md:gap-3">
          <button type="button" class="mode-btn active px-3 py-2 rounded-xl border border-neonBlue/50 bg-neonBlue/15 text-neonBlue text-[11px] font-bold uppercase tracking-[0.12em]" data-mode="viewer">Я зритель</button>
          <button type="button" class="mode-btn px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-300 text-[11px] font-bold uppercase tracking-[0.12em]" data-mode="character">Я персонаж</button>
          <button type="button" class="mode-btn px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-300 text-[11px] font-bold uppercase tracking-[0.12em]" data-mode="angel">Я ангел-инвестор</button>
          <button type="button" class="mode-btn px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-300 text-[11px] font-bold uppercase tracking-[0.12em]" data-mode="community">Я сообщество/площадка</button>
        </div>

        <div class="mode-panel grid grid-cols-1 md:grid-cols-3 gap-4" data-mode="viewer">
          <button onclick="switchTab('map')" class="text-left glass-card p-4 rounded-2xl border border-neonBlue/30 hover:border-neonBlue transition">
            <div class="text-[10px] text-neonBlue font-mono">1. Открыть город</div>
            <h3 class="font-cyber mt-2 text-lg text-white">Пойди в первый поход</h3>
            <p class="text-xs text-gray-400 mt-1">Открой первую локацию Сочи и веди зрителей за собой.</p>
          </button>
          <button onclick="switchTab('streams')" class="text-left glass-card p-4 rounded-2xl border border-neonPink/30 hover:border-neonPink transition">
            <div class="text-[10px] text-neonPink font-mono">2. Смотреть эфир</div>
            <h3 class="font-cyber mt-2 text-lg text-white">Подключи DANIEL</h3>
            <p class="text-xs text-gray-400 mt-1">Смотри эфиры, участвуя в жизни города и поддерживая героев.</p>
          </button>
          <button onclick="switchTab('characters')" class="text-left glass-card p-4 rounded-2xl border border-neonGreen/30 hover:border-neonGreen transition">
            <div class="text-[10px] text-neonGreen font-mono">3. Выполнить задание</div>
            <h3 class="font-cyber mt-2 text-lg text-white">Получай LUBIKOIN</h3>
            <p class="text-xs text-gray-400 mt-1">Снимай контент, получай очки влияния и усиливай свой уровень.</p>
          </button>
        </div>

        <div class="mode-panel hidden grid grid-cols-1 gap-4" data-mode="character">
          <button onclick="switchTab('characters')" class="text-left glass-card p-5 rounded-2xl border border-neonPink/30 hover:border-neonPink transition"><div class="text-[10px] text-neonPink font-mono">ПРОФИЛЬ ПЕРСОНАЖА</div><h3 class="font-cyber mt-2 text-xl text-white">Открыть свой профиль</h3><p class="text-xs text-gray-400 mt-1">Здесь находятся эфиры, сериал, задания, поддержка и прокачка образа.</p></button>
        </div>

        <div class="mode-panel hidden grid grid-cols-1 md:grid-cols-3 gap-4" data-mode="angel">
          <button onclick="switchTab('profile')" class="text-left glass-card p-4 rounded-2xl border border-neonGreen/30 hover:border-neonGreen transition">
            <div class="text-[10px] text-neonGreen font-mono">Ангел</div>
            <h3 class="font-cyber mt-2 text-lg text-white">Поддержать проект</h3>
            <p class="text-xs text-gray-400 mt-1">Давай задания персонажам и запускай новый контент в экосистеме.</p>
          </button>
          <button onclick="switchTab('staking')" class="text-left glass-card p-4 rounded-2xl border border-neonBlue/30 hover:border-neonBlue transition">
            <div class="text-[10px] text-neonBlue font-mono">Вклад</div>
            <h3 class="font-cyber mt-2 text-lg text-white">Финансировать пул</h3>
            <p class="text-xs text-gray-400 mt-1">Помогай проектам, локациям и мероприятиям в городе.</p>
          </button>
          <button onclick="switchTab('communities')" class="text-left glass-card p-4 rounded-2xl border border-neonPink/30 hover:border-neonPink transition">
            <div class="text-[10px] text-neonPink font-mono">Площадка</div>
            <h3 class="font-cyber mt-2 text-lg text-white">Подключить пространство</h3>
            <p class="text-xs text-gray-400 mt-1">Запускай события, живой контент и новые локации для сообщества.</p>
          </button>
        </div>

        <div class="mode-panel hidden grid grid-cols-1 gap-4" data-mode="community">
          <button onclick="switchTab('communities')" class="text-left glass-card p-5 rounded-2xl border border-neonGreen/30 hover:border-neonGreen transition"><div class="text-[10px] text-neonGreen font-mono">ПРОФИЛЬ ПЛОЩАДКИ</div><h3 class="font-cyber mt-2 text-xl text-white">Открыть профиль сообщества</h3><p class="text-xs text-gray-400 mt-1">Здесь находятся медиа, эфиры, персонажи, очки, пулы и мерч площадки.</p></button>
        </div>
      </div>

      <!-- TAB: МУЗЫКА PINK NOIZE -->
      <section id="tab-music" class="tab-content hidden space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-amber-400/30">
          <div><div class="text-[10px] text-amber-400 font-mono">PINK NOIZE • БЕЗ ОПЛАТЫ</div><h2 class="font-cyber font-bold text-xl text-white flex items-center gap-2 mt-1"><i class="fa-solid fa-headphones text-amber-400"></i> Музыка ТРИЗНЕС</h2><p class="text-xs text-gray-400 mt-1">Песни, лайвы и саундтреки персонажей. Слушать можно бесплатно.</p></div>
          <span class="text-xs text-amber-400 font-mono"><i class="fa-solid fa-infinity mr-1"></i> свободное прослушивание</span>
        </div>
        <div class="glass-panel p-5 rounded-2xl border border-amber-400/30">
          <audio id="music-player" class="w-full" controls preload="metadata"></audio>
          <div class="flex flex-wrap items-center justify-between gap-3 mt-4"><div><div class="text-[10px] text-gray-400 font-mono">СЕЙЧАС ИГРАЕТ</div><strong id="music-now-playing" class="text-white">Выберите песню из плейлиста</strong></div><div class="flex flex-wrap items-center gap-2"><select id="music-track-character" class="bg-gray-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white"><option>DANIEL</option><option>ALIK MASLO</option><option>DOCTOR</option><option>SNEGOVIC</option><option>OLYA KALI</option><option>FLAIWA</option></select><label class="cursor-pointer py-2.5 px-3 rounded-xl bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs font-bold"><i class="fa-solid fa-upload mr-2"></i>Добавить трек персонажа<input id="music-upload" type="file" accept="audio/*" class="hidden"></label></div></div>
        </div>
        <div id="music-playlist" class="glass-panel rounded-2xl border border-white/10 overflow-hidden"></div>
        <p class="text-[11px] text-gray-500 font-mono">Загруженные треки доступны только в этом браузере и не отправляются на сервер.</p>
      </section>

      <!-- TAB: ПРОФИЛЬ И УРОВЕНЬ КОНТЕНТА -->
      <section id="tab-profile" class="tab-content hidden space-y-5">
        <div class="glass-panel p-5 rounded-2xl border border-neonPink/30">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-neonPink to-neonPurple p-0.5 shadow-neon-pink"><div class="w-full h-full rounded-[14px] bg-darkBg flex items-center justify-center font-cyber text-xl text-white">Т3</div></div>
              <div><h2 id="profile-card-name" class="font-cyber font-bold text-xl text-white">Даниель</h2><p class="text-xs text-gray-400 mt-1">Создатель игры ТРИЗНЕС</p></div>
            </div>
            <div class="text-right"><div class="text-[10px] text-gray-400 font-mono">УРОВЕНЬ КОНТЕНТА</div><strong id="profile-content-level" class="text-3xl font-cyber text-neonPink">1</strong></div>
          </div>
          <div class="mt-5"><div class="flex justify-between text-xs font-mono mb-2"><span class="text-gray-400">Резонанс контента</span><span id="profile-resonance-text" class="text-neonBlue">0 / 100</span></div><div class="h-3 bg-gray-800 rounded-full overflow-hidden border border-white/10"><div id="profile-resonance-bar" class="h-full bg-gradient-to-r from-neonPink to-neonBlue transition-all duration-500" style="width: 0%"></div></div></div>
        </div>
        <section class="glass-panel p-5 rounded-2xl border border-neonPink/40">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div><div class="text-[10px] text-neonPink font-mono uppercase">Твоя текущая миссия</div><h3 class="font-cyber text-xl text-white mt-1">Подключи эфир DANIEL и открой первую зону</h3><p class="text-sm text-gray-300 mt-2">Смотри эфир, участвуй в жизни города и получай LUBICOIN с очками влияния.</p></div>
            <div class="flex flex-wrap gap-2"><button onclick="switchTab('streams')" class="px-4 py-2.5 rounded-xl bg-neonPink/15 border border-neonPink/40 text-neonPink text-xs font-bold">Смотреть эфир</button><button onclick="switchTab('characters')" class="px-4 py-2.5 rounded-xl bg-neonBlue/15 border border-neonBlue/40 text-neonBlue text-xs font-bold">Выбрать задание</button></div>
          </div>
        </section>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="glass-card p-4 rounded-2xl border border-neonBlue/30"><div class="text-neonBlue text-2xl"><i class="fa-solid fa-video"></i></div><strong class="block text-white mt-3">Покажи достижение</strong><p class="text-xs text-gray-400 mt-1">Сними результат на камеру и открой новый уровень.</p><button onclick="createAchievement()" class="w-full mt-4 py-2.5 rounded-xl bg-neonBlue/15 border border-neonBlue/50 text-neonBlue text-xs font-bold"><i class="fa-solid fa-camera mr-2"></i>Создать достижение</button></div>
          <div class="glass-card p-4 rounded-2xl border border-neonGreen/30"><div class="text-neonGreen text-2xl"><i class="fa-solid fa-trophy"></i></div><strong class="block text-white mt-3">Первые шаги</strong><p class="text-xs text-gray-400 mt-1">Профиль создан и готов к первому эфиру.</p><span class="inline-block mt-4 text-[10px] text-neonGreen font-mono">ПОЛУЧЕНО</span></div>
          <div class="glass-card p-4 rounded-2xl border border-amber-400/30"><div class="text-amber-400 text-2xl"><i class="fa-solid fa-fire"></i></div><strong class="block text-white mt-3">Серия в эфире</strong><p class="text-xs text-gray-400 mt-1">Поддерживай активность и собирай резонанс.</p><span class="inline-block mt-4 text-[10px] text-amber-400 font-mono">В ПРОЦЕССЕ</span></div>
        </div>
        <div class="glass-panel p-5 rounded-2xl border border-neonGreen/30">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4"><div><h3 class="font-cyber font-bold text-lg text-white"><i class="fa-solid fa-hand-holding-dollar text-neonGreen mr-2"></i>Кабинет ангела-инвестора</h3><p class="text-xs text-gray-400 mt-1">Сформулируйте задание для персонажей. Команда PINK NOIZE проверит его и откроет в игре.</p></div><span class="text-[10px] text-neonGreen font-mono">ПРЯМОЕ ВЛИЯНИЕ</span></div>
          <form onsubmit="submitAngelTask(event)" class="space-y-3">
            <input id="angel-task-title" required maxlength="80" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neonGreen" placeholder="Название задания">
            <textarea id="angel-task-description" required maxlength="500" rows="3" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neonGreen" placeholder="Что должен сделать персонаж и какое достижение показать на камеру?"></textarea>
            <div class="flex flex-col sm:flex-row gap-3"><select id="angel-task-character" class="flex-1 bg-gray-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white"><option>DANIEL</option><option>ALIK MASLO</option><option>DOCTOR</option><option>SNEGOVIC</option></select><button type="submit" class="flex-1 py-2.5 rounded-xl bg-neonGreen/15 border border-neonGreen/50 text-neonGreen text-xs font-bold"><i class="fa-solid fa-paper-plane mr-2"></i>Отправить в PINK NOIZE</button></div>
          </form>
          <div id="angel-task-status" class="hidden mt-3 p-3 rounded-xl bg-neonGreen/10 border border-neonGreen/30 text-xs text-neonGreen"></div>
        </div>
      </section>

      <!-- TAB 1: ЧАТЫ (MESSENGER TG/VK STYLE) -->
      <section id="tab-chats" class="tab-content hidden h-[700px] rounded-2xl glass-panel overflow-hidden border border-white/10">
        <div class="h-full flex flex-col md:flex-row">
          
          <!-- Chat List Left Panel -->
          <div class="w-full md:w-80 border-r border-white/10 flex flex-col bg-darkBg/60">
            <!-- Search & Filter Header -->
            <div class="p-3 border-b border-white/10">
              <div class="relative">
                <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-gray-400 text-sm"></i>
                <input type="text" placeholder="Поиск чатов и гениев..." class="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neonBlue transition">
              </div>
            </div>

            <!-- Active Chats List -->
            <div class="flex-1 overflow-y-auto divide-y divide-white/5">
              
              <!-- Chat Item 1 (Active) -->
              <div onclick="selectChat(1)" id="chat-item-1" class="chat-item active p-3 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition border-l-2 border-neonBlue bg-neonBlue/10">
                <div class="relative flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" class="w-12 h-12 rounded-full object-cover border border-neonBlue">
                  <span class="absolute bottom-0 right-0 w-3 h-3 bg-neonGreen rounded-full border-2 border-darkBg"></span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-baseline">
                    <h4 class="font-bold text-sm text-white truncate">DANIEL (ИИ)</h4>
                    <span class="text-[10px] text-gray-400">14:32</span>
                  </div>
                  <p class="text-xs text-neonBlue truncate mt-0.5">Сформулируй противоречие в задаче...</p>
                </div>
                <span class="w-5 h-5 rounded-full bg-neonPink text-white text-[10px] font-bold flex items-center justify-center">2</span>
              </div>

              <!-- Chat Item 2 -->
              <div onclick="selectChat(2)" id="chat-item-2" class="chat-item p-3 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition border-l-2 border-transparent">
                <div class="relative flex-shrink-0">
                  <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-neonPurple to-neonBlue flex items-center justify-center text-white text-lg font-bold">
                    <i class="fa-solid fa-users"></i>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-baseline">
                    <h4 class="font-bold text-sm text-white truncate">Клуб Инвесторов ТРИЗНЕС</h4>
                    <span class="text-[10px] text-gray-400">12:15</span>
                  </div>
                  <p class="text-xs text-gray-400 truncate mt-0.5"><span class="text-neonPurple font-medium">Алексей:</span> Новые проекты PINK NOIZE уже в сборе.</p>
                </div>
              </div>

              <!-- Chat Item 3 -->
              <div onclick="selectChat(3)" id="chat-item-3" class="chat-item p-3 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition border-l-2 border-transparent">
                <div class="relative flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80" class="w-12 h-12 rounded-full object-cover border border-neonPurple">
                  <span class="absolute bottom-0 right-0 w-3 h-3 bg-neonGreen rounded-full border-2 border-darkBg"></span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-baseline">
                    <h4 class="font-bold text-sm text-white truncate">ALIK MASLO</h4>
                    <span class="text-[10px] text-gray-400">Вчера</span>
                  </div>
                  <p class="text-xs text-gray-400 truncate mt-0.5">Чертежи Кибер-Пентхауса готовы.</p>
                </div>
              </div>

              <!-- Chat Item 4 -->
              <div onclick="selectChat(4)" id="chat-item-4" class="chat-item p-3 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition border-l-2 border-transparent">
                <div class="relative flex-shrink-0">
                  <div class="w-12 h-12 rounded-full bg-neonPink/20 border border-neonPink flex items-center justify-center text-neonPink text-lg">
                    <i class="fa-solid fa-robot"></i>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-baseline">
                    <h4 class="font-bold text-sm text-white truncate">ТРИЗ-Ассистент ИИ</h4>
                    <span class="text-[10px] text-gray-400">Вчера</span>
                  </div>
                  <p class="text-xs text-gray-400 truncate mt-0.5">Ежедневный бонус готов к сбору!</p>
                </div>
              </div>

            </div>
          </div>

          <!-- Active Chat Right Conversation Window -->
          <div class="flex-1 flex flex-col h-full bg-darkBg/40">
            
            <!-- Active Chat Header -->
            <div class="p-3.5 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div class="flex items-center gap-3">
                <img id="active-chat-avatar" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" class="w-10 h-10 rounded-full object-cover border border-neonBlue">
                <div>
                  <h3 id="active-chat-name" class="font-bold text-sm text-white flex items-center gap-2">
                    DANIEL <span class="px-1.5 py-0.2 text-[10px] bg-neonBlue/20 text-neonBlue border border-neonBlue/40 rounded">ИИ-Гений</span>
                  </h3>
                  <div id="active-chat-status" class="text-[11px] text-neonGreen font-mono">● В сети | Анализирует задачи ТРИЗ</div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-neonBlue transition" onclick="showToast('Звонок в кибер-сеть...', 'info')">
                  <i class="fa-solid fa-phone text-xs"></i>
                </button>
                <button class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-neonBlue transition" onclick="showToast('Профиль Гения открыт', 'info')">
                  <i class="fa-solid fa-circle-info text-xs"></i>
                </button>
              </div>
            </div>

            <!-- Messages Stream Area -->
            <div id="chat-messages-container" class="flex-1 p-4 overflow-y-auto space-y-4">
              
              <!-- System Timestamp -->
              <div class="text-center">
                <span class="text-[10px] font-mono text-gray-400 px-3 py-1 rounded-full bg-white/5 border border-white/10">Сегодня, 14:30</span>
              </div>

              <!-- Message Incoming -->
              <div class="flex items-start gap-3 max-w-[80%]">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" class="w-8 h-8 rounded-full object-cover">
                <div>
                  <div class="bg-white/10 border border-white/10 text-gray-100 p-3 rounded-2xl rounded-tl-none text-sm">
                    Приветствую в ТРИЗНЕС! Я сгенерировал алгоритм решения вашей технической задачи. Готовы применить ИКР (Идеальный Конечный Результат)?
                  </div>
                  <div class="text-[10px] text-gray-400 mt-1 font-mono">14:31</div>
                </div>
              </div>

              <!-- Message Outgoing -->
              <div class="flex items-start gap-3 max-w-[80%] ml-auto flex-row-reverse">
                <div class="w-8 h-8 rounded-full bg-neonPurple flex items-center justify-center text-white text-xs font-bold">Я</div>
                <div>
                  <div class="bg-gradient-to-r from-neonPurple/80 to-neonBlue/80 border border-neonBlue/40 text-white p-3 rounded-2xl rounded-tr-none text-sm shadow-neon-blue">
                    Да, Тесла! Как использовать ресурсы системы для максимальной экономии энергии в Пуле #2?
                  </div>
                  <div class="text-[10px] text-right text-gray-300 mt-1 font-mono">14:32 <i class="fa-solid fa-check-double text-neonBlue ml-1"></i></div>
                </div>
              </div>

              <!-- Message Incoming -->
              <div class="flex items-start gap-3 max-w-[80%]">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" class="w-8 h-8 rounded-full object-cover">
                <div>
                  <div class="bg-white/10 border border-white/10 text-gray-100 p-3 rounded-2xl rounded-tl-none text-sm">
                    Используй принцип перевода в микроуровень. Вместо прямого нагрева подключи персонаж Да Винчи к связке с квартирой в Сочи! Это даст +25% к выработке LUBIKOIN!
                  </div>
                  <div class="text-[10px] text-gray-400 mt-1 font-mono">14:32</div>
                </div>
              </div>

            </div>

            <!-- Quick Action Tags -->
            <div class="px-4 py-1.5 flex gap-2 overflow-x-auto border-t border-white/5 bg-white/[0.02]">
              <button onclick="sendQuickPrompt('⚡ Какая задача ТРИЗ сейчас актуальна?')" class="text-xs px-2.5 py-1 rounded-lg bg-neonBlue/10 border border-neonBlue/30 text-neonBlue hover:bg-neonBlue/20 transition whitespace-nowrap">⚡ Какая задача ТРИЗ?</button>
              <button onclick="sendQuickPrompt('💡 Покажи формулу ИКР')" class="text-xs px-2.5 py-1 rounded-lg bg-neonPurple/10 border border-neonPurple/30 text-neonPurple hover:bg-neonPurple/20 transition whitespace-nowrap">💡 Формула ИКР</button>
              <button onclick="sendQuickPrompt('💎 Как прокачать твой уровень?')" class="text-xs px-2.5 py-1 rounded-lg bg-neonPink/10 border border-neonPink/30 text-neonPink hover:bg-neonPink/20 transition whitespace-nowrap">💎 Прокачать уровень</button>
            </div>

            <!-- Chat Message Input Bar -->
            <div class="p-3 border-t border-white/10 bg-white/5 flex items-center gap-2">
              <button class="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-neonBlue transition">
                <i class="fa-solid fa-paperclip"></i>
              </button>
              <input id="chat-input-field" type="text" placeholder="Напишите сообщение гению..." class="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neonBlue transition" onkeypress="handleChatKeyPress(event)">
              <button onclick="sendChatMessage()" class="w-10 h-10 rounded-xl bg-gradient-to-r from-neonBlue to-neonPurple flex items-center justify-center text-white shadow-neon-blue hover:scale-105 transition">
                <i class="fa-solid fa-paper-plane text-sm"></i>
              </button>
            </div>

          </div>

        </div>
      </section>

      <!-- TAB 2: ПЕРСОНАЖИ (ОБЗОР ГЕНИЕВ - REQUESTED CORE TAB) -->
      <section id="tab-characters" class="tab-content hidden space-y-5">
        
        <!-- Filter Bar & Section Header -->
        <div class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel">
          <div>
            <h2 class="font-cyber font-bold text-xl text-white flex items-center gap-2">
              <i class="fa-solid fa-crown text-neonPurple"></i> Пантеон ТРИЗНЕС
            </h2>
            <p class="text-xs text-gray-400 mt-0.5">Персонажи раскрываются через контент, задания и вклад в проекты.</p>
          </div>

          <!-- Category Filters -->
          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="filterGenius('all')" class="genius-filter-btn active px-3 py-1.5 rounded-xl text-xs font-medium bg-neonPurple text-white transition">Все (5)</button>
            <button onclick="filterGenius('artist')" class="genius-filter-btn px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-gray-300 hover:border-neonBlue transition">Артисты</button>
            <button onclick="filterGenius('actor')" class="genius-filter-btn px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-gray-300 hover:border-neonBlue transition">Актёры</button>
            <button onclick="filterGenius('entrepreneur')" class="genius-filter-btn px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-gray-300 hover:border-neonBlue transition">Предприниматели</button>
            <button onclick="filterGenius('healer')" class="genius-filter-btn px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-gray-300 hover:border-neonBlue transition">Целители</button>
            <button onclick="filterGenius('engineer')" class="genius-filter-btn px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-gray-300 hover:border-neonBlue transition">Инженеры</button>
            <button onclick="filterGenius('strategist')" class="genius-filter-btn px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-gray-300 hover:border-neonBlue transition">Стратеги</button>
          </div>
        </div>

        <div class="glass-panel p-5 rounded-2xl border border-amber-400/30">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div class="text-[10px] text-amber-400 font-mono uppercase">Задания персонажей</div>
              <h3 class="font-cyber font-bold text-lg text-white mt-1"><i class="fa-solid fa-bolt text-amber-400 mr-2"></i>Помоги герою раскрыться</h3>
              <p class="text-xs text-gray-400 mt-1">Выбери действие, загрузи результат и получи LUBIKOIN с очками влияния.</p>
            </div>
            <span class="text-xs text-amber-400 font-mono">2 задания сегодня</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label class="glass-card p-4 rounded-xl border border-neonBlue/30 cursor-pointer">
              <span class="flex items-center justify-between gap-2"><strong class="text-sm text-white">Улыбнись прохожему</strong><span class="text-[10px] text-neonBlue font-mono">+100</span></span>
              <span class="block text-xs text-gray-400 mt-1">Сними короткое видео или фото с добрым действием.</span>
              <input id="character-smile-content" type="file" accept="image/*,video/*" class="mt-3 w-full text-xs text-gray-400 file:mr-2 file:rounded-lg file:border-0 file:bg-neonBlue/20 file:px-2 file:py-1.5 file:text-neonBlue">
              <button type="button" onclick="submitQuestContent('character-smile-content', 100, 100, this)" class="w-full mt-3 py-2 rounded-lg bg-neonBlue/10 border border-neonBlue/40 text-neonBlue text-xs font-bold">Отправить результат</button>
            </label>
            <label class="glass-card p-4 rounded-xl border border-neonGreen/30 cursor-pointer">
              <span class="flex items-center justify-between gap-2"><strong class="text-sm text-white">Запиши песню</strong><span class="text-[10px] text-neonGreen font-mono">+250</span></span>
              <span class="block text-xs text-gray-400 mt-1">Покажи творческий результат из студии «ДО НЕБЕС».</span>
              <input id="character-studio-content" type="file" accept="image/*,video/*,audio/*" class="mt-3 w-full text-xs text-gray-400 file:mr-2 file:rounded-lg file:border-0 file:bg-neonGreen/20 file:px-2 file:py-1.5 file:text-neonGreen">
              <button type="button" onclick="submitQuestContent('character-studio-content', 250, 200, this)" class="w-full mt-3 py-2 rounded-lg bg-neonGreen/10 border border-neonGreen/40 text-neonGreen text-xs font-bold">Отправить результат</button>
            </label>
          </div>
        </div>

        <button onclick="switchTab('communities')" class="w-full text-left glass-panel p-4 rounded-2xl border border-neonPink/40 hover:border-neonPink transition">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="text-[10px] text-neonPink font-mono uppercase">Центральное сообщество пантеона</div>
              <h3 class="font-cyber font-bold text-lg text-white mt-1"><i class="fa-solid fa-users text-neonPink mr-2"></i>PINK NOIZE</h3>
              <p class="text-xs text-gray-400 mt-1">Медиа-хаб мероприятий, заданий и развития персонажей.</p>
            </div>
            <span class="px-3 py-2 rounded-xl bg-neonPink/15 border border-neonPink/40 text-neonPink text-xs font-bold">Открыть сообщество <i class="fa-solid fa-arrow-right ml-1"></i></span>
          </div>
        </button>

        <div id="pantheon-catalog" class="glass-panel p-4 rounded-2xl border border-neonPurple/30">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div class="text-[10px] text-neonPurple font-mono uppercase">Канон движения</div>
              <h3 class="font-cyber font-bold text-lg text-white mt-1">Персонажи PINK NOIZE</h3>
              <p class="text-xs text-gray-400 mt-1">Функции, истории и проявления пантеона. Каждый раскрывается через контент и реальные действия.</p>
            </div>
              <span class="text-xs font-mono text-neonPink">15 персонажей</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <div class="p-4 rounded-xl bg-neonBlue/10 border border-neonBlue/30"><b class="text-neonBlue">APOLLON • DANIEL</b><p class="text-xs text-gray-300 mt-2">Создатель, продюсер и артист нового поколения. Формула: медиа, технологии, любовь и раскрытие людей.</p></div>
            <div class="p-4 rounded-xl bg-neonPink/10 border border-neonPink/30"><b class="text-neonPink">OLYA KALI</b><p class="text-xs text-gray-300 mt-2">Певица и проводник женской силы. Музыка, голос, телесные и энергетические практики.</p></div>
            <div class="p-4 rounded-xl bg-amber-400/10 border border-amber-400/30"><b class="text-amber-400">ALIC MASLO</b><p class="text-xs text-gray-300 mt-2">Комик и ведущий. Через юмор, простоту и смелость помогает человеку проявиться.</p></div>
            <div class="p-4 rounded-xl bg-gray-700/30 border border-gray-500/30"><b class="text-gray-200">KING OF THE UNDERGROUND • DENIS</b><p class="text-xs text-gray-300 mt-2">Голос андеграунда и честной реальности. Превращает сложный путь в историю для кино и сцены.</p></div>
            <div class="p-4 rounded-xl bg-indigo-400/10 border border-indigo-400/30"><b class="text-indigo-300">BRITANIA</b><p class="text-xs text-gray-300 mt-2">Коммерческий директор и охотница за возможностями. Соединяет идеи, ресурсы и команду.</p></div>
            <div class="p-4 rounded-xl bg-cyan-400/10 border border-cyan-400/30"><b class="text-cyan-300">HERMES • VASILY</b><p class="text-xs text-gray-300 mt-2">Изобретатель будущего. Развивает технологии, освобождающие время для творчества и жизни.</p></div>
            <div class="p-4 rounded-xl bg-fuchsia-400/10 border border-fuchsia-400/30"><b class="text-fuchsia-300">FLAIWA</b><p class="text-xs text-gray-300 mt-2">Новая рэп-артистка. Свобода, энергия и современный звук без шаблонов.</p></div>
            <div class="p-4 rounded-xl bg-pink-300/10 border border-pink-300/30"><b class="text-pink-200">EKATERINA</b><p class="text-xs text-gray-300 mt-2">Артистка и инфлюенсер. История возвращения к себе через сцену, работу и новый выбор.</p></div>
            <div class="p-4 rounded-xl bg-green-400/10 border border-green-400/30"><b class="text-green-300">SNEZHOVIK</b><p class="text-xs text-gray-300 mt-2">Старший продюсер и DJ. Чувствует ритм зала и превращает голос в музыку.</p></div>
            <div class="p-4 rounded-xl bg-amber-300/10 border border-amber-300/30"><b class="text-amber-200">BOSYANYA</b><p class="text-xs text-gray-300 mt-2">Ментор GTA SOCHI. Ведёт разговоры у очага и помогает перейти из игры в реальную жизнь.</p></div>
            <div class="p-4 rounded-xl bg-violet-400/10 border border-violet-400/30"><b class="text-violet-300">BEGLYAR</b><p class="text-xs text-gray-300 mt-2">Философ нового времени. Разговаривает о жизни сейчас и строит новую картину мира прямо в кадре.</p></div>
            <div class="p-4 rounded-xl bg-slate-400/10 border border-slate-400/30"><b class="text-slate-200">FART</b><p class="text-xs text-gray-300 mt-2">Медиа-персонаж на пути раскрытия. Получает новую прошивку через голос, лицо и собственную историю.</p></div>
            <div class="p-4 rounded-xl bg-purple-400/10 border border-purple-400/30"><b class="text-purple-300">MILLIARDER DRAGUNOV</b><p class="text-xs text-gray-300 mt-2">Стратег ресурсов и роста. Помогает собирать проекты, команды и устойчивые планы развития.</p></div>
            <div class="p-4 rounded-xl bg-neonGreen/10 border border-neonGreen/30"><b class="text-neonGreen">SNEGOVIC</b><p class="text-xs text-gray-300 mt-2">Ритм и музыкальная энергия движения. DJ и участник живых событий PINK NOIZE.</p></div>
          </div>
        </div>

        <!-- Geniuses Cyber Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="geniuses-grid-container">
          
          <!-- Character 1: DANIEL -->
          <div class="genius-card glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between" data-category="artist entrepreneur engineer">
            <div class="absolute top-0 right-0 px-3 py-1 bg-neonBlue/20 border-b border-l border-neonBlue/40 text-neonBlue text-[10px] font-mono rounded-bl-xl">
              Свободен
            </div>

            <div>
              <div class="flex items-center gap-4 mb-4">
                <div class="relative">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" class="w-16 h-16 rounded-2xl object-cover border-2 border-neonBlue shadow-neon-blue">
                  <span class="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-darkBg text-neonBlue border border-neonBlue text-[9px] font-mono rounded font-bold">Lvl 8</span>
                </div>
                <div>
                  <h3 class="font-cyber font-bold text-lg text-white">DANIEL</h3>
                  <div class="text-xs text-neonBlue font-mono">Физика & Энергетика</div>
                  <div class="text-[11px] text-gray-400 mt-1"><i class="fa-solid fa-bolt text-amber-400 mr-1"></i>Мощность: <span class="text-white font-mono font-bold">9,450</span></div>
                </div>
              </div>

              <!-- Stats Bars -->
              <div class="space-y-2 mb-4 bg-white/5 p-3 rounded-xl border border-white/5 text-xs">
                <div>
                  <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-gray-400">Интеллект</span>
                    <span class="text-neonBlue font-mono">98/100</span>
                  </div>
                  <div class="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-neonBlue h-full" style="width: 98%;"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-gray-400">Креативность</span>
                    <span class="text-neonPurple font-mono">99/100</span>
                  </div>
                  <div class="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-neonPurple h-full" style="width: 99%;"></div>
                  </div>
                </div>
                <div class="pt-1 flex justify-between items-center text-xs border-t border-white/10">
                  <span class="text-gray-300">LUBIKOIN-Yield Boost:</span>
                  <span class="text-neonGreen font-mono font-bold">+120 LUBIKOIN/час</span>
                </div>
              </div>

              <div class="text-xs text-gray-300 bg-neonPurple/10 border border-neonPurple/20 p-2.5 rounded-xl mb-4">
                <span class="text-neonPurple font-bold">Спец-Навык:</span> <span class="italic">"Квантовый Резонанс"</span> — увеличивает скорость стейкинга на +15%.
              </div>
            </div>

            <div class="flex gap-2">
              <button onclick="makeCharacterDeposit('DANIEL')" class="flex-1 py-2.5 rounded-xl bg-neonBlue/10 hover:bg-neonBlue/20 border border-neonBlue/40 text-neonBlue text-xs font-bold transition">
                <i class="fa-solid fa-coins text-[10px] mr-1"></i> Сделать вклад
              </button>
              <button onclick="toggleFavorite(this, 'DANIEL')" class="py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-bold transition">
                <i class="fa-regular fa-heart"></i> В любимые
              </button>
            </div>
          </div>

          <!-- Character 2: ALIK MASLO -->
          <div class="genius-card glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between" data-category="artist actor engineer">
            <div class="absolute top-0 right-0 px-3 py-1 bg-neonPurple/20 border-b border-l border-neonPurple/40 text-neonPurple text-[10px] font-mono rounded-bl-xl">
              В Пуле #1
            </div>

            <div>
              <div class="flex items-center gap-4 mb-4">
                <div class="relative">
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" class="w-16 h-16 rounded-2xl object-cover border-2 border-neonPurple shadow-neon-purple">
                  <span class="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-darkBg text-neonPurple border border-neonPurple text-[9px] font-mono rounded font-bold">Lvl 10</span>
                </div>
                <div>
                  <h3 class="font-cyber font-bold text-lg text-white">ALIK MASLO</h3>
                  <div class="text-xs text-neonPurple font-mono">Инженерия & Арт</div>
                  <div class="text-[11px] text-gray-400 mt-1"><i class="fa-solid fa-bolt text-amber-400 mr-1"></i>Мощность: <span class="text-white font-mono font-bold">9,200</span></div>
                </div>
              </div>

              <!-- Stats Bars -->
              <div class="space-y-2 mb-4 bg-white/5 p-3 rounded-xl border border-white/5 text-xs">
                <div>
                  <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-gray-400">Интеллект</span>
                    <span class="text-neonBlue font-mono">96/100</span>
                  </div>
                  <div class="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-neonBlue h-full" style="width: 96%;"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-gray-400">Креативность</span>
                    <span class="text-neonPurple font-mono">100/100</span>
                  </div>
                  <div class="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-neonPurple h-full" style="width: 100%;"></div>
                  </div>
                </div>
                <div class="pt-1 flex justify-between items-center text-xs border-t border-white/10">
                  <span class="text-gray-300">LUBIKOIN-Yield Boost:</span>
                  <span class="text-neonGreen font-mono font-bold">+110 LUBIKOIN/час</span>
                </div>
              </div>

              <div class="text-xs text-gray-300 bg-neonPurple/10 border border-neonPurple/20 p-2.5 rounded-xl mb-4">
                <span class="text-neonPurple font-bold">Спец-Навык:</span> <span class="italic">"Универсальный Синтез"</span> — ускоряет доходность недвижимости на +20%.
              </div>
            </div>

            <div class="flex gap-2">
              <button onclick="makeCharacterDeposit('ALIK MASLO')" class="flex-1 py-2.5 rounded-xl bg-neonPurple/10 hover:bg-neonPurple/20 border border-neonPurple/40 text-neonPurple text-xs font-bold transition">
                <i class="fa-solid fa-coins text-[10px] mr-1"></i> Сделать вклад
              </button>
              <button onclick="toggleFavorite(this, 'ALIK MASLO')" class="py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-bold transition">
                <i class="fa-regular fa-heart"></i> В любимые
              </button>
            </div>
          </div>

          <!-- Character 3: DOCTOR -->
          <div class="genius-card glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between" data-category="healer artist">
            <div class="absolute top-0 right-0 px-3 py-1 bg-neonPink/20 border-b border-l border-neonPink/40 text-neonPink text-[10px] font-mono rounded-bl-xl">
              Свободен
            </div>

            <div>
              <div class="flex items-center gap-4 mb-4">
                <div class="relative">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" class="w-16 h-16 rounded-2xl object-cover border-2 border-neonPink shadow-neon-pink">
                  <span class="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-darkBg text-neonPink border border-neonPink text-[9px] font-mono rounded font-bold">Lvl 12</span>
                </div>
                <div>
                  <h3 class="font-cyber font-bold text-lg text-white">DOCTOR</h3>
                  <div class="text-xs text-neonPink font-mono">Квантовая Теория</div>
                  <div class="text-[11px] text-gray-400 mt-1"><i class="fa-solid fa-bolt text-amber-400 mr-1"></i>Мощность: <span class="text-white font-mono font-bold">9,600</span></div>
                </div>
              </div>

              <!-- Stats Bars -->
              <div class="space-y-2 mb-4 bg-white/5 p-3 rounded-xl border border-white/5 text-xs">
                <div>
                  <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-gray-400">Интеллект</span>
                    <span class="text-neonBlue font-mono">100/100</span>
                  </div>
                  <div class="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-neonBlue h-full" style="width: 100%;"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-gray-400">Креативность</span>
                    <span class="text-neonPink font-mono">95/100</span>
                  </div>
                  <div class="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-neonPink h-full" style="width: 95%;"></div>
                  </div>
                </div>
                <div class="pt-1 flex justify-between items-center text-xs border-t border-white/10">
                  <span class="text-gray-300">LUBIKOIN-Yield Boost:</span>
                  <span class="text-neonGreen font-mono font-bold">+135 LUBIKOIN/час</span>
                </div>
              </div>

              <div class="text-xs text-gray-300 bg-neonPink/10 border border-neonPink/20 p-2.5 rounded-xl mb-4">
                <span class="text-neonPink font-bold">Спец-Навык:</span> <span class="italic">"Относительный Сдвиг"</span> — даёт шанс 15% удвоить награды за квесты.
              </div>
            </div>

            <div class="flex gap-2">
              <button onclick="makeCharacterDeposit('DOCTOR')" class="flex-1 py-2.5 rounded-xl bg-neonPink/10 hover:bg-neonPink/20 border border-neonPink/40 text-neonPink text-xs font-bold transition">
                <i class="fa-solid fa-coins text-[10px] mr-1"></i> Сделать вклад
              </button>
              <button onclick="toggleFavorite(this, 'DOCTOR')" class="py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-bold transition">
                <i class="fa-regular fa-heart"></i> В любимые
              </button>
            </div>
          </div>

          <!-- Character 4: MILLIARDER DRAGUNOV -->
          <div class="genius-card glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between" data-category="entrepreneur strategist">
            <div class="absolute top-0 right-0 px-3 py-1 bg-neonGreen/20 border-b border-l border-neonGreen/40 text-neonGreen text-[10px] font-mono rounded-bl-xl">
              Свободен
            </div>

            <div>
              <div class="flex items-center gap-4 mb-4">
                <div class="relative">
                  <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80" class="w-16 h-16 rounded-2xl object-cover border-2 border-neonGreen shadow-neon-green">
                  <span class="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-darkBg text-neonGreen border border-neonGreen text-[9px] font-mono rounded font-bold">Lvl 9</span>
                </div>
                <div>
                  <h3 class="font-cyber font-bold text-lg text-white">MILLIARDER DRAGUNOV</h3>
                  <div class="text-xs text-neonGreen font-mono">Бизнес & Дизайн</div>
                  <div class="text-[11px] text-gray-400 mt-1"><i class="fa-solid fa-bolt text-amber-400 mr-1"></i>Мощность: <span class="text-white font-mono font-bold">9,350</span></div>
                </div>
              </div>

              <div class="space-y-2 mb-4 bg-white/5 p-3 rounded-xl border border-white/5 text-xs">
                <div>
                  <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-gray-400">Интеллект</span>
                    <span class="text-neonBlue font-mono">92/100</span>
                  </div>
                  <div class="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-neonBlue h-full" style="width: 92%;"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-gray-400">Креативность</span>
                    <span class="text-neonGreen font-mono">98/100</span>
                  </div>
                  <div class="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-neonGreen h-full" style="width: 98%;"></div>
                  </div>
                </div>
                <div class="pt-1 flex justify-between items-center text-xs border-t border-white/10">
                  <span class="text-gray-300">LUBIKOIN-Yield Boost:</span>
                  <span class="text-neonGreen font-mono font-bold">+150 LUBIKOIN/час</span>
                </div>
              </div>

              <div class="text-xs text-gray-300 bg-neonGreen/10 border border-neonGreen/20 p-2.5 rounded-xl mb-4">
                <span class="text-neonGreen font-bold">Спец-Навык:</span> <span class="italic">"Искажение Реальности"</span> — снижает стоимость покупка объектов на 10%.
              </div>
              <div class="text-xs bg-gray-950/70 border border-amber-400/40 p-3 rounded-xl mb-4"><div class="flex items-center justify-between gap-2"><span class="text-amber-400 font-bold"><i class="fa-solid fa-key mr-1"></i>Секретный квест</span><span class="text-[10px] text-neonPink font-mono">+800 РЕЗОНАНСА</span></div><p class="text-gray-300 mt-2">Найти Торговый дом миллиардера Андрея Драгунова. Локация неизвестна всем игрокам.</p><button onclick="completeDragunovQuest()" class="w-full mt-3 py-2 rounded-xl bg-amber-400/10 border border-amber-400/40 text-amber-300 text-[11px] font-bold"><i class="fa-solid fa-location-crosshairs mr-2"></i>Зафиксировать найденную локацию</button><div id="dragunov-quest-status" class="hidden mt-2 text-[10px] text-neonGreen font-mono"></div></div>
            </div>

            <div class="flex gap-2">
              <button onclick="makeCharacterDeposit('MILLIARDER DRAGUNOV')" class="flex-1 py-2.5 rounded-xl bg-neonGreen/10 hover:bg-neonGreen/20 border border-neonGreen/40 text-neonGreen text-xs font-bold transition">
                <i class="fa-solid fa-coins text-[10px] mr-1"></i> Сделать вклад
              </button>
              <button onclick="toggleFavorite(this, 'MILLIARDER DRAGUNOV')" class="py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-bold transition">
                <i class="fa-regular fa-heart"></i> В любимые
              </button>
            </div>
          </div>

          <!-- Character 5: SNEGOVIC -->
          <div class="genius-card glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between" data-category="artist engineer healer">
            <div class="absolute top-0 right-0 px-3 py-1 bg-neonBlue/20 border-b border-l border-neonBlue/40 text-neonBlue text-[10px] font-mono rounded-bl-xl">
              Свободен
            </div>

            <div>
              <div class="flex items-center gap-4 mb-4">
                <div class="relative">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" class="w-16 h-16 rounded-2xl object-cover border-2 border-neonBlue shadow-neon-blue">
                  <span class="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-darkBg text-neonBlue border border-neonBlue text-[9px] font-mono rounded font-bold">Lvl 7</span>
                </div>
                <div>
                  <h3 class="font-cyber font-bold text-lg text-white">SNEGOVIC</h3>
                  <div class="text-xs text-neonBlue font-mono">ИИ & Алгоритмы</div>
                  <div class="text-[11px] text-gray-400 mt-1"><i class="fa-solid fa-bolt text-amber-400 mr-1"></i>Мощность: <span class="text-white font-mono font-bold">9,100</span></div>
                </div>
              </div>

              <div class="space-y-2 mb-4 bg-white/5 p-3 rounded-xl border border-white/5 text-xs">
                <div>
                  <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-gray-400">Интеллект</span>
                    <span class="text-neonBlue font-mono">97/100</span>
                  </div>
                  <div class="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-neonBlue h-full" style="width: 97%;"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-gray-400">Креативность</span>
                    <span class="text-neonPurple font-mono">94/100</span>
                  </div>
                  <div class="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-neonPurple h-full" style="width: 94%;"></div>
                  </div>
                </div>
                <div class="pt-1 flex justify-between items-center text-xs border-t border-white/10">
                  <span class="text-gray-300">LUBIKOIN-Yield Boost:</span>
                  <span class="text-neonGreen font-mono font-bold">+105 LUBIKOIN/час</span>
                </div>
              </div>

              <div class="text-xs text-gray-300 bg-neonBlue/10 border border-neonBlue/20 p-2.5 rounded-xl mb-4">
                <span class="text-neonBlue font-bold">Спец-Навык:</span> <span class="italic">"Матричный Алгоритм"</span> — автоматизирует выполнение дневных квестов.
              </div>
            </div>

            <div class="flex gap-2">
              <button onclick="makeCharacterDeposit('SNEGOVIC')" class="flex-1 py-2.5 rounded-xl bg-neonBlue/10 hover:bg-neonBlue/20 border border-neonBlue/40 text-neonBlue text-xs font-bold transition">
                <i class="fa-solid fa-coins text-[10px] mr-1"></i> Сделать вклад
              </button>
              <button onclick="toggleFavorite(this, 'SNEGOVIC')" class="py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-bold transition">
                <i class="fa-regular fa-heart"></i> В любимые
              </button>
            </div>
          </div>

        </div>

      </section>

      <!-- TAB 3: ПРЯМЫЕ ЭФИРЫ (LIVE STREAMS) -->
      <section id="tab-streams" class="tab-content hidden space-y-5">
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          <!-- Stream Main Player Screen (Left 2 cols) -->
          <div class="lg:col-span-2 space-y-4">
            
            <!-- Video Mock Player -->
            <div class="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-neonRed/40 shadow-neon-red group">
              
              <!-- Animated Cyber Grid Canvas Simulation inside Player -->
              <canvas id="stream-canvas-mock" class="w-full h-full object-cover"></canvas>
              <video id="live-camera-preview" class="hidden absolute inset-0 w-full h-full object-cover" autoplay muted playsinline></video>

              <!-- Stream Overlay UI Top -->
              <div class="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                <div class="flex items-center gap-2">
                    <span id="property-stream-live-badge" class="px-2.5 py-1 rounded-md bg-neonRed text-white text-xs font-cyber font-bold flex items-center gap-1.5 shadow-neon-red">
                    <span class="w-2 h-2 rounded-full bg-white"></span> ОЖИДАЕТ ЗАПУСКА
                  </span>
                  <span class="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-mono">
                    <i class="fa-solid fa-eye text-neonRed mr-1"></i> <span id="stream-viewer-count">4,289</span>
                  </span>
                </div>
                <span id="property-stream-live-label" class="px-3 py-1 rounded-md bg-black/60 backdrop-blur-md border border-neonPurple/50 text-neonPurple text-xs font-cyber">
                  СИСТЕМА ГОТОВИТСЯ К ЗАПУСКУ
                </span>
              </div>

              <!-- Stream Center Play / Title Indicator -->
              <div class="absolute bottom-4 left-4 right-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 rounded-xl">
                <h3 class="font-cyber font-bold text-lg text-white">Эфир персонажей ТРИЗНЕС</h3>
                <p id="property-stream-live-description" class="text-xs text-gray-300 mt-1">Все персонажи ожидают запуска системы</p>
              </div>

            </div>

            <!-- Active Stream Selector Channels -->
            <div class="grid grid-cols-3 gap-3">
              <div class="p-3 rounded-xl glass-card border border-neonRed cursor-pointer bg-neonRed/10" onclick="startLiveBroadcast()">
                <div class="text-xs font-bold text-white truncate">Эфир персонажей ТРИЗНЕС</div>
                <div id="property-stream-channel-status" class="text-[10px] text-neonRed font-mono mt-0.5">ОЖИДАЕТ ЗАПУСКА • НАЖМИТЕ ДЛЯ СТАРТА</div>
              </div>
              <div class="p-3 rounded-xl glass-card border border-white/10 cursor-pointer hover:border-neonBlue transition" onclick="showToast('Медиа-хаб ОФИС ТРИЗНЕСА готовится к запуску', 'info')">
                <div class="text-xs font-bold text-gray-300 truncate">ОФИС ТРИЗНЕСА / МЕДИА-ХАБ РАСКРЫТИЯ ЛИЧНОСТИ</div>
                <div class="text-[10px] text-gray-400 font-mono mt-0.5">ОЖИДАЕТ ЗАПУСКА</div>
              </div>
              <div class="p-3 rounded-xl glass-card border border-white/10 cursor-pointer hover:border-neonPurple transition" onclick="showToast('Канал переключен на Квантовые Пулы', 'info')">
                <div class="text-xs font-bold text-gray-300 truncate">Вечер на крыше без алкоголя</div>
                <div class="text-[10px] text-gray-400 font-mono mt-0.5">МАМАЙКА, СОЧИ • ОЖИДАЕТ ЗАПУСКА</div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div class="glass-card p-3 rounded-xl border border-white/10"><div class="text-sm font-bold text-neonBlue">DANIEL</div><div class="text-[10px] text-gray-400 font-mono mt-1">Ожидает запуска системы</div></div>
              <div class="glass-card p-3 rounded-xl border border-white/10"><div class="text-sm font-bold text-neonPurple">ALIK MASLO</div><div class="text-[10px] text-gray-400 font-mono mt-1">Ожидает запуска системы</div></div>
              <div class="glass-card p-3 rounded-xl border border-white/10"><div class="text-sm font-bold text-neonPink">DOCTOR</div><div class="text-[10px] text-gray-400 font-mono mt-1">Ожидает запуска системы</div></div>
              <div class="glass-card p-3 rounded-xl border border-white/10"><div class="text-sm font-bold text-neonGreen">MILLIARDER DRAGUNOV</div><div class="text-[10px] text-gray-400 font-mono mt-1">Ожидает запуска системы</div></div>
              <div class="glass-card p-3 rounded-xl border border-white/10"><div class="text-sm font-bold text-neonBlue">SNEGOVIC</div><div class="text-[10px] text-gray-400 font-mono mt-1">Ожидает запуска системы</div></div>
            </div>

          </div>

          <!-- Live Stream Chat Column (Right 1 col) -->
          <div class="h-[500px] rounded-2xl glass-panel border border-white/10 flex flex-col">
            <div class="p-3 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h4 class="font-cyber font-bold text-sm text-white flex items-center gap-2">
                <i class="fa-solid fa-comments text-neonRed"></i> Чат Эфира
              </h4>
              <span id="property-stream-chat-status" class="text-[10px] text-amber-400 font-mono">● Ожидает запуска системы</span>
            </div>

            <!-- Dynamic Stream Chat Stream -->
            <div id="stream-chat-messages" class="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
              <div><span class="text-neonBlue font-bold">Cyber_Worker:</span> ТРИЗ реально удваивает доходность пулов!</div>
              <div><span class="text-neonPink font-bold">NeonRider:</span> Тесла в первом пуле — это пушка ⚡</div>
              <div><span class="text-amber-400 font-bold">Alex_TRIZ:</span> Когда следующий распределительный дроп?</div>
              <div><span class="text-neonPurple font-bold">Satoshi_N:</span> Отправил 500 LUBIKOIN в донат! 🔥</div>
            </div>

            <!-- Donate & Chat Inputs -->
            <div class="p-3 border-t border-white/10 bg-white/5 space-y-2">
              <button id="stream-donate-button" disabled class="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 font-cyber font-bold text-xs cursor-not-allowed flex items-center justify-center gap-2" onclick="donateToStream()">
                <i class="fa-solid fa-lock text-gray-500"></i> Донат будет доступен после запуска
              </button>
              <div class="flex gap-2">
                <input id="stream-chat-input" type="text" placeholder="Сообщение в стрим..." class="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-neonRed">
                <button onclick="sendStreamComment()" class="px-3 py-1.5 rounded-xl bg-neonRed text-white text-xs font-bold hover:bg-neonRed/80 transition">
                  <i class="fa-solid fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>

        </div>

        <div class="glass-panel p-3 rounded-2xl border border-white/10 flex flex-wrap items-center gap-2">
          <span class="text-[10px] text-gray-500 font-mono mr-2">ИНСТРУМЕНТЫ ЗРИТЕЛЯ</span>
          <button onclick="openStreamUtility('wallet')" class="w-11 h-11 rounded-xl bg-neonGreen/10 border border-neonGreen/40 text-neonGreen hover:bg-neonGreen/20" title="Кошелек внимания"><i class="fa-solid fa-wallet"></i></button>
          <button onclick="openStreamUtility('shop')" class="w-11 h-11 rounded-xl bg-neonPink/10 border border-neonPink/40 text-neonPink hover:bg-neonPink/20" title="Мерч и оборудование"><i class="fa-solid fa-store"></i></button>
          <button onclick="openStreamUtility('artifacts')" class="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/40 text-amber-400 hover:bg-amber-400/20" title="Артефакты персонажей"><i class="fa-solid fa-wand-magic-sparkles"></i></button>
        </div>

        <div id="stream-utility-modal" class="hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm items-center justify-center p-4">
          <div class="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-neonBlue/40 p-5 relative">
            <button onclick="closeStreamUtility()" class="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/5 text-gray-400 hover:text-white" title="Закрыть"><i class="fa-solid fa-xmark"></i></button>
            <div id="stream-utility-content"></div>
          </div>
        </div>

        <div class="hidden grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-4">
          <div class="glass-panel p-5 rounded-2xl border border-neonGreen/30">
            <div class="flex items-start justify-between gap-3"><div><div class="text-[10px] text-neonGreen font-mono">РЕЖИМ ЗРИТЕЛЯ</div><h3 class="font-cyber font-bold text-lg text-white mt-1"><i class="fa-solid fa-eye text-neonGreen mr-2"></i>Кошелек внимания</h3></div><strong id="viewer-balance" class="text-neonGreen font-cyber text-xl">0 LUBIKOIN</strong></div>
            <p class="text-xs text-gray-400 mt-3">Смотри эфиры, поддерживай персонажей и превращай внимание в игровые бонусы.</p>
            <div class="grid grid-cols-2 gap-2 mt-4 text-xs font-mono"><div class="bg-white/5 rounded-xl p-3"><span class="block text-gray-400">За просмотр</span><strong class="text-neonBlue">+10 LUBIKOIN</strong></div><div class="bg-white/5 rounded-xl p-3"><span class="block text-gray-400">За комментарий</span><strong class="text-neonPink">+5 LUBIKOIN</strong></div></div>
            <button id="viewer-watch-bonus" onclick="claimViewerBonus()" class="w-full mt-4 py-2.5 rounded-xl bg-neonGreen/15 border border-neonGreen/50 text-neonGreen text-xs font-bold"><i class="fa-solid fa-gift mr-2"></i>Забрать бонус зрителя +25 LUBIKOIN</button>
          </div>
          <div class="glass-panel p-5 rounded-2xl border border-neonPink/30">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-4"><div><div class="text-[10px] text-neonPink font-mono">МАГАЗИН ВЛИЯНИЯ</div><h3 class="font-cyber font-bold text-lg text-white mt-1"><i class="fa-solid fa-store text-neonPink mr-2"></i>Мерч и оборудование</h3></div><span class="text-xs text-gray-400">Покупки помогают героям снимать новые серии</span></div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button onclick="buyViewerItem('Футболка PINK NOIZE', 120, 'PINK NOIZE')" class="text-left p-3 rounded-xl bg-white/5 border border-neonPink/30 hover:border-neonPink transition"><i class="fa-solid fa-shirt text-neonPink text-xl"></i><strong class="block text-white text-xs mt-2">Футболка PINK NOIZE</strong><span class="text-[10px] text-neonGreen font-mono">120 LNS</span></button>
              <button onclick="buyViewerItem('Микрофон для DOCTOR', 450, 'DOCTOR')" class="text-left p-3 rounded-xl bg-white/5 border border-neonBlue/30 hover:border-neonBlue transition"><i class="fa-solid fa-microphone text-neonBlue text-xl"></i><strong class="block text-white text-xs mt-2">Микрофон для DOCTOR</strong><span class="text-[10px] text-neonGreen font-mono">450 LNS</span></button>
              <button onclick="buyViewerItem('Камера для DANIEL', 900, 'DANIEL')" class="text-left p-3 rounded-xl bg-white/5 border border-neonGreen/30 hover:border-neonGreen transition"><i class="fa-solid fa-camera text-neonGreen text-xl"></i><strong class="block text-white text-xs mt-2">Камера для DANIEL</strong><span class="text-[10px] text-neonGreen font-mono">900 LNS</span></button>
            </div>
            <div id="viewer-purchase-status" class="hidden mt-3 text-xs text-neonGreen font-mono"></div>
          </div>
        </div>
          <div class="hidden glass-panel p-5 rounded-2xl border border-amber-400/40">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-4"><div><div class="text-[10px] text-amber-400 font-mono">КЭШБЭК ПОДДЕРЖКИ • ТОЛЬКО ДЛЯ ГЕРОЕВ</div><h3 class="font-cyber font-bold text-lg text-white mt-1"><i class="fa-solid fa-wand-magic-sparkles text-amber-400 mr-2"></i>Артефакты персонажей</h3><p class="text-xs text-gray-400 mt-1">20% от доната возвращается Искрами. Искры нельзя потратить иначе, только на апгрейд персонажа.</p></div><strong id="artifact-balance" class="text-amber-400 font-cyber text-xl">0 ИСКР</strong></div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3"><button onclick="buyArtifact('Кристалл голоса', 80, 'DOCTOR')" class="text-left p-3 rounded-xl bg-white/5 border border-amber-400/30 hover:border-amber-400 transition"><i class="fa-solid fa-gem text-amber-400 text-xl"></i><strong class="block text-white text-xs mt-2">Кристалл голоса</strong><span class="text-[10px] text-amber-400 font-mono">80 ИСКР • DOCTOR</span></button><button onclick="buyArtifact('Оптика маршрута', 160, 'DANIEL')" class="text-left p-3 rounded-xl bg-white/5 border border-neonBlue/30 hover:border-neonBlue transition"><i class="fa-solid fa-eye text-neonBlue text-xl"></i><strong class="block text-white text-xs mt-2">Оптика маршрута</strong><span class="text-[10px] text-amber-400 font-mono">160 ИСКР • DANIEL</span></button><button onclick="buyArtifact('Модуль сцены', 240, 'ALIK MASLO')" class="text-left p-3 rounded-xl bg-white/5 border border-neonPink/30 hover:border-neonPink transition"><i class="fa-solid fa-bolt text-neonPink text-xl"></i><strong class="block text-white text-xs mt-2">Модуль сцены</strong><span class="text-[10px] text-amber-400 font-mono">240 ИСКР • ALIK MASLO</span></button></div>
            <div id="artifact-status" class="hidden mt-3 text-xs text-amber-300 font-mono"></div>
          </div>

      </section>

      <!-- TAB: КЛУБНЫЕ КАРТЫ -->
      <section id="tab-clubcards" class="tab-content hidden space-y-5">
        <div class="glass-panel p-5 rounded-2xl border border-neonPink/30"><div class="flex flex-wrap items-center justify-between gap-3"><div><div class="text-[10px] text-neonPink font-mono">СИСТЕМА ДОСТУПА ТРИЗНЕС</div><h2 class="font-cyber font-bold text-2xl text-white mt-1">Три карты клуба</h2><p class="text-sm text-gray-400 mt-1">Карта показывает роль участника и открывает доступ к игровому городу.</p></div><span class="text-xs text-neonGreen font-mono"><i class="fa-solid fa-shield-halved mr-1"></i> проверка доступа</span></div></div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <article class="glass-card rounded-2xl overflow-hidden border border-white/20 flex flex-col"><div class="h-28 bg-gradient-to-br from-gray-950 via-gray-800 to-black p-5 flex items-start justify-between"><div><div class="text-[10px] text-gray-400 font-mono">УРОВЕНЬ 01</div><h3 class="font-cyber font-bold text-xl text-white mt-1">Черная карта</h3></div><i class="fa-solid fa-id-card text-2xl text-gray-300"></i></div><div class="p-5 flex-1"><span class="inline-block text-[10px] text-neonGreen font-mono border border-neonGreen/30 rounded-lg px-2 py-1">ПОЛУЧАЮТ ВСЕ УЧАСТНИКИ</span><p class="text-sm text-gray-300 mt-4">Базовая карта участника ТРИЗНЕС. Она дает проход в медиа-хабы, на открытые события, эфиры и игровые локации города.</p><div class="mt-4 space-y-2 text-xs text-gray-400"><div><i class="fa-solid fa-check text-neonGreen mr-2"></i>Доступ в медиа-хаб</div><div><i class="fa-solid fa-check text-neonGreen mr-2"></i>Проход на открытые события</div><div><i class="fa-solid fa-check text-neonGreen mr-2"></i>Участие в заданиях и эфирах</div></div></div><button onclick="showToast('Черная карта активна для каждого участника', 'info')" class="m-5 mt-0 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold"><i class="fa-solid fa-unlock mr-2"></i>Активировать карту</button></article>
          <article class="glass-card rounded-2xl overflow-hidden border border-gray-300/40 flex flex-col"><div class="h-28 bg-gradient-to-br from-gray-200 via-gray-500 to-gray-900 p-5 flex items-start justify-between"><div><div class="text-[10px] text-gray-900/70 font-mono">УРОВЕНЬ 02</div><h3 class="font-cyber font-bold text-xl text-gray-950 mt-1">Серебряная карта</h3></div><i class="fa-solid fa-building text-2xl text-white"></i></div><div class="p-5 flex-1"><span class="inline-block text-[10px] text-gray-300 font-mono border border-gray-400/40 rounded-lg px-2 py-1">ДЛЯ СООБЩЕСТВ</span><p class="text-sm text-gray-300 mt-4">Выдается сообществу после регистрации и загрузки медиа заведения. Карта подключает площадку к городу ТРИЗНЕС.</p><div class="mt-4 space-y-2 text-xs text-gray-400"><div><i class="fa-solid fa-check text-gray-200 mr-2"></i>Профиль заведения на карте</div><div><i class="fa-solid fa-check text-gray-200 mr-2"></i>Эфиры и съемки на площадке</div><div><i class="fa-solid fa-file-signature text-amber-400 mr-2"></i>Услуги только по договору с ИП</div><div><i class="fa-solid fa-droplet text-neonBlue mr-2"></i>Питание, вода, массаж и другие бонусы заведения</div></div></div><button onclick="switchTab('communities')" class="m-5 mt-0 py-2.5 rounded-xl bg-gray-300/15 border border-gray-300/40 text-gray-200 text-xs font-bold"><i class="fa-solid fa-file-arrow-up mr-2"></i>Подключить сообщество</button></article>
          <article class="glass-card rounded-2xl overflow-hidden border border-amber-400/50 flex flex-col shadow-[0_0_20px_rgba(251,191,36,0.15)]"><div class="h-28 bg-gradient-to-br from-amber-200 via-amber-500 to-amber-900 p-5 flex items-start justify-between"><div><div class="text-[10px] text-amber-950/70 font-mono">УРОВЕНЬ 03</div><h3 class="font-cyber font-bold text-xl text-amber-950 mt-1">Золотая карта</h3></div><i class="fa-solid fa-crown text-2xl text-amber-950"></i></div><div class="p-5 flex-1"><span class="inline-block text-[10px] text-amber-300 font-mono border border-amber-400/40 rounded-lg px-2 py-1">АНГЕЛЬСКАЯ ПОДДЕРЖКА</span><p class="text-sm text-gray-300 mt-4">Для тех, кто вкладывает значимую сумму в ТРИЗНЕС и от души поддерживает сообщество PINK NOIZE, помогая развивать персонажей, медиа-хабы и весь игровой город.</p><div class="mt-4 space-y-2 text-xs text-gray-400"><div><i class="fa-solid fa-check text-amber-400 mr-2"></i>Выдается после подтверждения вклада</div><div><i class="fa-solid fa-check text-amber-400 mr-2"></i>Поддержка новых маршрутов и эфиров</div><div><i class="fa-solid fa-check text-amber-400 mr-2"></i>Создание заданий для персонажей</div><div><i class="fa-solid fa-check text-amber-400 mr-2"></i>Кураторство развития экосистемы</div></div></div><button onclick="switchTab('profile')" class="m-5 mt-0 py-2.5 rounded-xl bg-amber-400/15 border border-amber-400/50 text-amber-300 text-xs font-bold"><i class="fa-solid fa-hand-holding-dollar mr-2"></i>Поддержать ТРИЗНЕС</button></article>
        </div>
        <div class="glass-panel p-4 rounded-2xl border border-neonBlue/30 text-xs text-gray-400"><i class="fa-solid fa-circle-info text-neonBlue mr-2"></i>Серебряная карта дает игровые привилегии площадки только после подтверждения документов и отдельного договора с владельцем ИП. Набор услуг зависит от конкретного заведения.</div>
      </section>

      <!-- TAB: СООБЩЕСТВО PINK NOIZE -->
      <section id="tab-communities" class="tab-content hidden space-y-5">
        <div class="glass-panel p-5 rounded-2xl border border-neonPink/30">
          <h2 class="font-cyber font-bold text-xl text-white"><i class="fa-solid fa-users text-neonPink mr-2"></i>PINK NOIZE</h2>
          <p class="text-xs text-gray-400 mt-1">Закрытый клуб раскрытых людей в Сочи. Медиа-хаб, студия, события и пространство для живого контента.</p>
          <div class="flex flex-wrap items-center gap-3 mt-4">
            <span class="px-3 py-1 rounded-lg bg-neonPink/10 border border-neonPink/30 text-neonPink text-xs font-mono">Чёрная карта · 2 500 ₽</span>
            <a href="https://pinknoize-club-b45d8phj.agent.mira.tg/" target="_blank" rel="noopener noreferrer" class="px-3 py-2 rounded-xl bg-neonPink text-white text-xs font-bold"><i class="fa-solid fa-arrow-up-right-from-square mr-2"></i>Смотреть закрытый клуб</a>
            <button onclick="openCommunityProfile('PINK NOIZE')" class="px-3 py-2 rounded-xl bg-neonGreen/10 border border-neonGreen/40 text-neonGreen text-xs font-bold"><i class="fa-solid fa-layer-group mr-2"></i>Профиль сообщества</button>
          </div>
        </div>
        <div class="glass-panel p-5 rounded-2xl border border-neonBlue/30">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="text-[10px] text-neonBlue font-mono uppercase">Задание для площадки</div>
              <h3 class="font-cyber font-bold text-lg text-white mt-1"><i class="fa-solid fa-camera-retro text-neonBlue mr-2"></i>Покажите жизнь сообщества</h3>
              <p class="text-xs text-gray-400 mt-1">Загрузите фото, видео или афишу события. Материал попадёт в городскую ленту после проверки.</p>
            </div>
            <div class="flex w-full sm:w-auto gap-2">
              <label class="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-bold text-center cursor-pointer">
                <i class="fa-solid fa-paperclip mr-2"></i>Выбрать файл
                <input id="community-quest-content" type="file" accept="image/*,video/*,.pdf" class="hidden">
              </label>
              <button id="community-quest-submit" type="button" onclick="submitQuestContent('community-quest-content', 100, 100, this)" class="flex-1 px-4 py-2.5 rounded-xl bg-neonBlue/15 border border-neonBlue/40 text-neonBlue text-xs font-bold">Отправить</button>
            </div>
          </div>
        </div>
        <div class="glass-panel p-5 rounded-2xl border border-neonBlue/30">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 class="font-cyber font-bold text-lg text-white">Добавить сообщество</h3>
          <div id="pink-noize-pantheon"></div>
              <p class="text-xs text-gray-400 mt-1">Подключите клуб, медиа-хаб или проект к экосистеме.</p>
            </div>
            <span class="text-xs text-neonBlue font-mono">PINK NOIZE — первое сообщество</span>
          </div>
          <form onsubmit="addCommunity(event)" class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input id="community-name" required placeholder="Название сообщества" class="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neonBlue">
            <input id="community-city" required placeholder="Город / локация" class="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neonBlue">
            <input id="community-link" type="url" placeholder="Ссылка на сообщество" class="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neonBlue">
            <input id="community-ip" required type="file" accept="application/pdf,image/*" class="text-xs text-gray-400 file:mr-2 file:rounded-lg file:border-0 file:bg-neonBlue/15 file:px-2 file:py-2 file:text-neonBlue">
            <input id="community-media" required type="file" multiple accept="image/*,video/*,audio/*" class="text-xs text-gray-400 file:mr-2 file:rounded-lg file:border-0 file:bg-neonBlue/15 file:px-2 file:py-2 file:text-neonBlue">
            <button type="submit" class="rounded-xl bg-neonBlue/15 border border-neonBlue/40 text-neonBlue text-xs font-bold"><i class="fa-solid fa-plus mr-2"></i>Добавить</button>
          </form>
        </div>
        <div id="community-list" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
        <div class="glass-panel p-5 rounded-2xl border border-neonBlue/30">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 class="font-cyber font-bold text-lg text-white">Партнёры экосистемы</h3>
              <p class="text-xs text-gray-400 mt-1">Сообщества и реальные площадки Сочи, подключённые к проектам ТРИЗНЕС.</p>
            </div>
            <span class="text-xs text-neonBlue font-mono">3 партнёра</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <article class="glass-card p-4 rounded-2xl border border-neonPurple/30">
              <span class="text-[10px] text-neonPurple font-mono">ПАРТНЁР • СОЧИ</span>
              <h4 class="font-cyber font-bold text-white mt-2">ДО НЕБЕС</h4>
              <p class="text-xs text-gray-400 mt-1">Студия звукозаписи для песен, подкастов и контента участников.</p>
              <div class="flex gap-2 mt-4">
                <button onclick="showToast('Запрос отправлен в студию ДО НЕБЕС', 'info')" class="flex-1 py-2 rounded-xl bg-neonPurple/15 border border-neonPurple/40 text-neonPurple text-xs font-bold">Сотрудничество</button>
                <button onclick="openDepositModal('Поддержка студии ДО НЕБЕС', 0)" class="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs"><i class="fa-solid fa-coins"></i></button>
              </div>
            </article>
            <article class="glass-card p-4 rounded-2xl border border-neonPink/30">
              <span class="text-[10px] text-neonPink font-mono">ПАРТНЁР • СОЧИ</span>
              <h4 class="font-cyber font-bold text-white mt-2">MAMA ROMA</h4>
              <p class="text-xs text-gray-400 mt-1">Ресторан для встреч, событий и офлайн-активностей сообщества.</p>
              <div class="flex gap-2 mt-4">
                <button onclick="showToast('Запрос отправлен в ресторан MAMA ROMA', 'info')" class="flex-1 py-2 rounded-xl bg-neonPink/15 border border-neonPink/40 text-neonPink text-xs font-bold">Сотрудничество</button>
                <button onclick="openDepositModal('Поддержка ресторана MAMA ROMA', 0)" class="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs"><i class="fa-solid fa-coins"></i></button>
              </div>
            </article>
            <article class="glass-card p-4 rounded-2xl border border-neonGreen/30">
              <span class="text-[10px] text-neonGreen font-mono">ПАРТНЁР • СОЧИ</span>
              <h4 class="font-cyber font-bold text-white mt-2">МАССАЖНЫЙ САЛОН ЛОТОС</h4>
              <p class="text-xs text-gray-400 mt-1">Партнёр пространства заботы, восстановления и телесных практик.</p>
              <div class="flex gap-2 mt-4">
                <button onclick="showToast('Запрос отправлен в массажный салон ЛОТОС', 'info')" class="flex-1 py-2 rounded-xl bg-neonGreen/15 border border-neonGreen/40 text-neonGreen text-xs font-bold">Сотрудничество</button>
                <button onclick="openDepositModal('Поддержка массажного салона ЛОТОС', 0)" class="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs"><i class="fa-solid fa-coins"></i></button>
              </div>
            </article>
          </div>
        </div>
        <div class="glass-card p-5 rounded-2xl border border-white/10">
          <h3 class="font-cyber font-bold text-lg text-white">Что входит в клуб</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 text-xs">
            <div class="p-3 rounded-xl bg-white/5"><b class="text-neonPink">ЧАЙ ЙОУ ЧЕК</b><span class="block text-gray-400 mt-1">Медиа-хаб и офис PINK NOIZE в центре Сочи</span></div>
            <div class="p-3 rounded-xl bg-white/5"><b class="text-neonBlue">Съёмки и подкасты</b><span class="block text-gray-400 mt-1">Живой контент, разговоры и раскрытие на камеру</span></div>
            <div class="p-3 rounded-xl bg-white/5"><b class="text-neonPurple">Студия и аппаратура</b><span class="block text-gray-400 mt-1">Запись песни и подкаста на профессиональном оборудовании</span></div>
            <div class="p-3 rounded-xl bg-white/5"><b class="text-amber-400">Стендап-вечера</b><span class="block text-gray-400 mt-1">Сцена для участников, ALIC MASLO и артистов клуба</span></div>
            <div class="p-3 rounded-xl bg-white/5"><b class="text-neonGreen">Закрытое комьюнити</b><span class="block text-gray-400 mt-1">Обмен идеями, проектами и контактами в Сочи</span></div>
            <div class="p-3 rounded-xl bg-white/5"><b class="text-neonPink">Нейросети для творчества</b><span class="block text-gray-400 mt-1">Инструменты для треков, обложек и сценариев</span></div>
          </div>
        </div>
        <div id="community-roof-card" class="glass-card rounded-2xl overflow-hidden border border-neonPink/40">
          <div class="p-5">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span class="text-[10px] text-neonPink font-mono">СОЧИ • МАМАЙКА</span>
                <h3 class="font-cyber font-bold text-xl text-white mt-1">Вечер на крыше без алкоголя</h3>
                <p class="text-sm text-gray-300 mt-2">Танцы, музыка и безопасная атмосфера без алкоголя. Локация и дата подтверждаются сообществом.</p>
              </div>
              <span class="px-3 py-1 rounded-full bg-neonGreen/15 border border-neonGreen/30 text-neonGreen text-xs font-mono">Сбор участников</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 text-xs font-mono">
              <div class="p-3 rounded-xl bg-white/5"><span class="block text-gray-400">Формат</span><span class="text-white">Музыка и танцы</span></div>
              <div class="p-3 rounded-xl bg-white/5"><span class="block text-gray-400">Организатор</span><span class="text-neonPink">PINK NOIZE</span></div>
              <div class="p-3 rounded-xl bg-white/5"><span class="block text-gray-400">Участники</span><span class="text-white">DOCTOR, DANIEL, SNEGOVIC</span></div>
            </div>
            <div class="flex flex-col sm:flex-row gap-3 mt-5">
              <button onclick="openDepositModal('Вклад в PINK NOIZE: Вечер на крыше без алкоголя', 0)" class="flex-1 py-2.5 rounded-xl bg-neonPink/15 border border-neonPink/40 text-neonPink font-bold text-xs"><i class="fa-solid fa-coins mr-2"></i>Вложиться в сообщество</button>
              <button onclick="showToast('Заявка на проведение отправлена в PINK NOIZE', 'info')" class="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 font-bold text-xs"><i class="fa-solid fa-paper-plane mr-2"></i>Предложить проведение</button>
            </div>
          </div>
        </div>
        <div class="glass-card rounded-2xl overflow-hidden border border-neonBlue/40">
          <div class="p-5">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span class="text-[10px] text-neonBlue font-mono">СОЧИ • МАМАЙКА</span>
                <h3 class="font-cyber font-bold text-xl text-white mt-1">Провести живой концерт</h3>
                <p class="text-sm text-gray-300 mt-2">Музыкальное событие PINK NOIZE с живым выступлением, DJ-сетом и стендапом.</p>
              </div>
              <span class="px-3 py-1 rounded-full bg-neonBlue/15 border border-neonBlue/30 text-neonBlue text-xs font-mono">Цель: 100 000 LUBIKOIN</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-5 text-xs font-mono">
              <div class="p-3 rounded-xl bg-white/5"><span class="block text-gray-400">Аппаратура</span><span class="text-white">Звук и свет</span></div>
              <div class="p-3 rounded-xl bg-white/5"><span class="block text-gray-400">DJ</span><span class="text-neonBlue">SNEGOVIC</span></div>
              <div class="p-3 rounded-xl bg-white/5"><span class="block text-gray-400">Стендап</span><span class="text-neonPurple">ALIK MASLO</span></div>
              <div class="p-3 rounded-xl bg-white/5"><span class="block text-gray-400">Артист</span><span class="text-neonPink">DANIEL</span></div>
              <div class="p-3 rounded-xl bg-white/5"><span class="block text-gray-400">Рэп</span><span class="text-neonGreen">DOCTOR</span></div>
            </div>
            <div class="flex flex-col sm:flex-row gap-3 mt-5">
              <button onclick="openDepositModal('Провести живой концерт / PINK NOIZE', 0, 100000)" class="flex-1 py-2.5 rounded-xl bg-neonBlue/15 border border-neonBlue/40 text-neonBlue font-bold text-xs"><i class="fa-solid fa-coins mr-2"></i>Внести вклад 100 000</button>
              <button onclick="switchTab('communities')" class="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 font-bold text-xs"><i class="fa-solid fa-users mr-2"></i>Открыть PINK NOIZE</button>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 4: ВКЛАДЫ И ПУЛЫ (STAKING & DEFI) -->
      <section id="tab-staking" class="tab-content hidden space-y-5">
        
        <!-- Available Staking Pools Grid -->
        <div class="flex items-center justify-between gap-3"><h3 class="font-cyber font-bold text-lg text-white">Пулы для вкладов в NLS</h3><span class="text-[10px] text-gray-500 font-mono">Персонажи и сообщества</span></div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <!-- Pool Card 1 -->
          <div class="glass-card rounded-2xl p-5 border border-neonBlue/30 hover:border-neonBlue flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start mb-3">
                <span class="px-2.5 py-1 rounded-lg bg-neonBlue/10 border border-neonBlue/30 text-neonBlue text-xs font-mono font-bold">Мероприятие</span>
                <span class="text-neonBlue font-cyber font-black text-xl">Сочи</span>
              </div>
              <h4 class="font-cyber font-bold text-lg text-white">Вечер на крыше без алкоголя</h4>
              <p class="text-xs text-gray-400 mt-1">Мамайка, Сочи. Танцы и музыка в безопасном формате без алкоголя.</p>
              
              <div class="my-4 space-y-1.5 text-xs text-gray-300 font-mono bg-white/5 p-3 rounded-xl">
                <div class="flex justify-between"><span>Локация:</span><span class="text-white">Мамайка, Сочи</span></div>
                <div class="flex justify-between"><span>Организатор:</span><span class="text-white">PINK NOIZE</span></div>
                <div class="flex justify-between"><span>Статус:</span><span class="text-neonBlue">Сбор участников</span></div>
              </div>
            </div>

            <button onclick="openDepositModal('Вечер на крыше без алкоголя / PINK NOIZE', 0)" class="w-full py-2.5 rounded-xl bg-neonBlue/20 hover:bg-neonBlue/30 border border-neonBlue/50 text-neonBlue font-cyber font-bold text-xs transition">
              Вложиться в мероприятие
            </button>
          </div>

          <!-- Pool Card 3: SKAZKA PRO 2.0 -->
          <div class="glass-card rounded-2xl p-5 border border-neonPink/40 hover:border-neonPink flex flex-col justify-between shadow-neon-pink">
            <div>
              <div class="flex justify-between items-start mb-3">
                <span class="px-2.5 py-1 rounded-lg bg-neonPink/15 border border-neonPink/40 text-neonPink text-xs font-mono font-bold">Создание проекта</span>
                <span class="text-neonPink font-cyber font-black text-xl">2.0</span>
              </div>
              <h4 class="font-cyber font-bold text-lg text-white">SKAZKA PRO 2.0</h4>
              <p class="text-xs text-gray-400 mt-1">Сбор пула на создание и запуск обновлённого проекта в экосистеме ТРИЗНЕС и медиа-хабе PINK NOIZE.</p>

              <div class="my-4 space-y-1.5 text-xs text-gray-300 font-mono bg-white/5 p-3 rounded-xl">
                <div class="flex justify-between"><span>Назначение:</span><span class="text-white">Создание SKAZKA PRO 2.0</span></div>
                <div class="flex justify-between"><span>Источник:</span><span class="text-white">Документ VK</span></div>
                <div class="flex justify-between"><span>Статус:</span><span class="text-neonPink">Сбор участников</span></div>
              </div>
            </div>

            <div class="space-y-2">
              <button onclick="openDepositModal('Создание SKAZKA PRO 2.0', 0)" class="w-full py-2.5 rounded-xl bg-neonPink/15 hover:bg-neonPink/25 border border-neonPink/50 text-neonPink font-cyber font-bold text-xs transition">
                Вложиться в проект
              </button>
              <a href="https://vk.ru/doc412138142_691539306?hash=6CelmPUU5qPV3ZQCBKdXkCmGbtjNd8dpwZBgc54Nlvs&dl=p5u8h5aJyNtrtzuwNNJPnIpTHwLq3D2UBBj4in2zLYw&from_module=vkmsg_desktop" target="_blank" rel="noopener noreferrer" class="block text-center text-[11px] text-gray-400 hover:text-white transition">
                Открыть описание проекта в VK <i class="fa-solid fa-arrow-up-right-from-square ml-1"></i>
              </a>
            </div>
          </div>

          <!-- Pool Card: SKAZKA 1.0 -->
          <div class="glass-card rounded-2xl overflow-hidden border border-neonBlue/40 hover:border-neonBlue flex flex-col justify-between">
            <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80" alt="Домик проекта SKAZKA 1.0" class="w-full h-40 object-cover">
            <div class="p-5">
              <div class="flex justify-between items-start mb-3">
                <span class="px-2.5 py-1 rounded-lg bg-neonBlue/15 border border-neonBlue/40 text-neonBlue text-xs font-mono font-bold">Возврат проекта</span>
                <span class="text-neonBlue font-cyber font-black text-xl">55 000</span>
              </div>
              <h4 class="font-cyber font-bold text-lg text-white">SKAZKA 1.0</h4>
              <p class="text-xs text-gray-400 mt-1">Возврат проекта с домиком в экосистему ТРИЗНЕС и медиа-хаб PINK NOIZE.</p>
              <div class="my-4 space-y-1.5 text-xs text-gray-300 font-mono bg-white/5 p-3 rounded-xl">
                <div class="flex justify-between"><span>Цель пула:</span><span class="text-white">55 000 NLS</span></div>
                <div class="flex justify-between"><span>Назначение:</span><span class="text-white">Возврат SKAZKA 1.0</span></div>
                <div class="flex justify-between"><span>Статус:</span><span class="text-neonBlue">Сбор участников</span></div>
              </div>
              <button onclick="openDepositModal('Возврат SKAZKA 1.0', 0, 55000)" class="w-full py-2.5 rounded-xl bg-neonBlue/15 hover:bg-neonBlue/25 border border-neonBlue/50 text-neonBlue font-cyber font-bold text-xs transition">Вложиться в проект</button>
            </div>
          </div>

        </div>

        <section class="glass-panel p-5 rounded-2xl border border-amber-400/30">
          <div class="flex flex-wrap items-end justify-between gap-3 mb-4"><div><div class="text-[10px] text-amber-400 font-mono uppercase">Поддержка любимого персонажа</div><h3 class="font-cyber font-bold text-lg text-white mt-1"><i class="fa-solid fa-hand-holding-heart text-amber-400 mr-2"></i>Выбери, что ему нужно</h3><p class="text-xs text-gray-400 mt-1">Направь вклад в NLS на артефакт, новый образ, эфир или развитие героя.</p></div><span class="text-[10px] text-amber-400 font-mono">Для ангелов</span></div>
          <div class="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3"><select id="angel-character-pool" class="bg-gray-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white"><option>DANIEL</option><option>ALIK MASLO</option><option>DOCTOR</option><option>SNEGOVIC</option><option>OLYA KALI</option></select><select id="angel-need-pool" class="bg-gray-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white"><option>Артефакт</option><option>Новый образ</option><option>Прямой эфир</option><option>Новая серия</option></select><button onclick="openAngelCharacterPool()" class="rounded-xl bg-amber-400/15 border border-amber-400/50 px-4 py-2.5 text-xs font-bold text-amber-300"><i class="fa-solid fa-coins mr-2"></i>Сделать вклад</button></div>
        </section>

        <!-- Staking ROI Calculator Widget -->
        <div class="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
          <h3 class="font-cyber font-bold text-md text-white flex items-center gap-2">
            <i class="fa-solid fa-calculator text-neonBlue"></i> Калькулятор Доходности Стейкинга
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-xs font-mono mb-2">
                  <span class="text-gray-400">Сумма инвестиций:</span>
                  <span class="text-neonBlue font-bold" id="calc-amount-label">5,000 NLS</span>
                </div>
                <input type="range" id="calc-amount-slider" min="100" max="50000" step="100" value="5000" oninput="updateCalculator()" class="w-full accent-neonBlue cursor-pointer">
              </div>

              <div>
                <label class="text-xs font-mono text-gray-400 block mb-2">Период стейкинга:</label>
                <div class="grid grid-cols-3 gap-2">
                  <button onclick="setCalcDays(30)" id="calc-day-30" class="calc-day-btn active py-2 rounded-xl bg-neonBlue/20 border border-neonBlue text-xs text-white font-mono">30 Дней</button>
                  <button onclick="setCalcDays(90)" id="calc-day-90" class="calc-day-btn py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 font-mono">90 Дней</button>
                  <button onclick="setCalcDays(365)" id="calc-day-365" class="calc-day-btn py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 font-mono">1 Год</button>
                </div>
              </div>
            </div>

            <div class="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
              <div class="flex justify-between text-xs">
                <span class="text-gray-400">Прогнозируемый ежедневный доход:</span>
                <span class="text-neonGreen font-mono font-bold" id="calc-daily-profit">+4.93 NLS</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-gray-400">Итоговая чистая прибыль:</span>
                <span class="text-neonBlue font-mono font-bold" id="calc-total-profit">+148.00 NLS</span>
              </div>
              <div class="pt-2 border-t border-white/10 flex justify-between text-sm">
                <span class="text-white font-bold">Итоговый баланс:</span>
                <span class="text-neonPurple font-cyber font-bold" id="calc-final-balance">5,148.00 NLS</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      <!-- TAB: ИГРОВАЯ КАРТА СОЧИ -->
      <section id="tab-map" class="tab-content map-layout block space-y-5">
        <section class="map-upload-section glass-panel p-5 rounded-2xl border border-neonPink/40 shadow-neon-pink">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4"><div><div class="text-[10px] text-neonPink font-mono">ГЛАВНЫЙ КАДР ТРИЗНЕС</div><h2 class="font-cyber font-bold text-xl text-white mt-1"><i class="fa-solid fa-clapperboard text-neonPink mr-2"></i>Ролики, которые раскрывают город</h2><p class="text-xs text-gray-400 mt-1">Смотри бесплатно. Загружай ролики о ТРИЗНЕС и добавляй их в историю похода по Сочи.</p></div><span class="text-xs text-neonGreen font-mono"><i class="fa-solid fa-play mr-1"></i>БЕЗ ОПЛАТЫ</span></div>
          <div class="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
            <div class="map-video-frame rounded-2xl bg-black border border-white/10"><video id="main-triznes-video" class="hidden" controls playsinline></video><iframe id="main-triznes-drive" class="hidden border-0" allow="autoplay" allowfullscreen title="Главный ролик ТРИЗНЕС"></iframe><div id="main-video-empty" class="absolute inset-0 flex flex-col items-center justify-center text-center p-6"><i class="fa-solid fa-film text-4xl text-neonPink mb-3"></i><strong class="text-white">Главный ролик еще не загружен</strong><span class="text-xs text-gray-500 mt-2">Добавьте видео с компьютера или подключите Google Drive</span></div></div>
            <div class="glass-card rounded-2xl p-4 border border-neonBlue/30"><div class="text-[10px] text-neonBlue font-mono mb-3">ДОБАВИТЬ В ГЛАВНЫЕ</div><label class="block text-xs text-gray-300 mb-2">Видео с компьютера<input id="main-video-upload" type="file" accept="video/*" class="block w-full mt-2 text-xs text-gray-400 file:mr-2 file:rounded-lg file:border-0 file:bg-neonBlue/15 file:px-2 file:py-2 file:text-neonBlue"></label><div class="border-t border-white/10 my-4"></div><label class="block text-xs text-gray-300">Ссылка Google Drive<input id="drive-video-url" type="url" placeholder="https://drive.google.com/file/d/.../view" class="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-neonBlue"></label><button onclick="loadDriveVideo()" class="w-full mt-3 py-2.5 rounded-xl bg-neonBlue/15 border border-neonBlue/40 text-neonBlue text-xs font-bold"><i class="fa-solid fa-link mr-2"></i>Подключить ролик</button><p class="text-[10px] text-gray-500 mt-3">Для Google Drive включите доступ «Все, у кого есть ссылка», иначе ролик не откроется зрителям.</p></div>
          </div>
        </section>
        <section class="news-feed-section glass-panel p-5 rounded-2xl border border-neonPink/30">
          <div class="flex flex-wrap items-end justify-between gap-3 mb-4"><div><div class="text-[10px] text-neonPink font-mono uppercase">Лента новостей & В ЭФИРЕ</div><h2 class="font-cyber font-bold text-xl text-white mt-1"><i class="fa-solid fa-tower-broadcast text-neonPink mr-2"></i>Что происходит сейчас</h2></div><span class="text-xs text-gray-400 font-mono">Сначала новое</span></div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4"><div><div class="mb-2 text-[10px] text-neonBlue font-mono uppercase">Персонажи</div><div id="character-news-feed" class="space-y-2"></div></div><div><div class="mb-2 text-[10px] text-neonGreen font-mono uppercase">Сообщества</div><div id="community-news-feed" class="space-y-2"></div></div></div>
        </section>
        <section class="map-highlights-section glass-panel p-5 rounded-2xl border border-amber-400/30"><div class="flex items-center justify-between mb-4"><div><div class="text-[10px] text-amber-400 font-mono">ДОПОЛНИТЕЛЬНО</div><h3 class="font-cyber font-bold text-lg text-white mt-1"><i class="fa-solid fa-ranking-star text-amber-400 mr-2"></i>Лучшие ролики</h3></div><span id="video-highlights-count" class="text-xs text-amber-400 font-mono">0 роликов</span></div><div id="video-highlights" class="grid grid-cols-1 md:grid-cols-3 gap-3"></div></section>
        <div class="map-block flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-neonGreen/30">
          <div><div class="text-[10px] text-neonGreen font-mono">ПОХОД 001 • КАРТА НУЛЕВОГО УРОВНЯ</div><h2 class="font-cyber font-bold text-xl text-white flex items-center gap-2 mt-1"><i class="fa-solid fa-compass text-neonGreen"></i> Сочи: город в процессе открытия</h2><p class="text-xs text-gray-400 mt-1">Первый реальный персонаж идет по городу в прямом эфире и открывает игровой маршрут.</p></div>
          <div class="text-right"><div class="text-[10px] text-gray-400 font-mono">ОТКРЫТО</div><strong id="map-reveal-count" class="text-2xl font-cyber text-neonGreen">0 / 4</strong></div>
        </div>
        <div class="map-block grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
          <div class="relative overflow-hidden rounded-2xl border border-neonGreen/30 shadow-neon-blue"><div id="sochi-map" aria-label="Карта экспедиции по Сочи"></div><div class="absolute top-3 left-3 z-[500] glass-panel rounded-xl px-3 py-2 text-[10px] font-mono text-gray-300"><span class="text-gray-500">○</span> карта не раскрыта &nbsp; <span class="text-neonGreen">●</span> открытый маршрут</div></div>
          <aside class="glass-panel rounded-2xl p-4 border border-neonPink/30 flex flex-col justify-between"><div><div class="text-[10px] text-neonPink font-mono">ПЕРВЫЙ ПРОВОДНИК</div><h3 class="font-cyber font-bold text-lg text-white mt-1">DANIEL</h3><p class="text-xs text-gray-400 mt-2">Блогер запускает первый поход: показывает реальное достижение, отмечает место и раскрывает механику игры зрителям.</p><div class="mt-4 space-y-2 text-xs font-mono"><div class="flex justify-between"><span class="text-gray-400">Статус</span><strong id="expedition-status" class="text-amber-400">Готов к старту</strong></div><div class="flex justify-between"><span class="text-gray-400">Маршрут</span><strong class="text-white">Центр Сочи</strong></div><div class="flex justify-between"><span class="text-gray-400">Награда</span><strong class="text-neonPink">+500 РЕЗОНАНСА</strong></div></div></div><button id="start-expedition-btn" onclick="startSochiExpedition()" class="w-full mt-5 py-3 rounded-xl bg-neonPink/20 border border-neonPink/60 text-neonPink font-cyber font-bold text-xs"><i class="fa-solid fa-person-hiking mr-2"></i>Начать поход в эфире</button></aside>
        </div>
        <div id="map-discovery-feed" class="map-discovery-section grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs"><div class="glass-card rounded-xl p-3 border border-white/10 opacity-50"><strong class="text-gray-500">Зона 01 • ???</strong><p class="text-gray-600 mt-1">Откроется первым походом</p></div><div class="glass-card rounded-xl p-3 border border-white/10 opacity-50"><strong class="text-gray-500">Зона 02 • ???</strong><p class="text-gray-600 mt-1">Следующая глава маршрута</p></div><div class="glass-card rounded-xl p-3 border border-white/10 opacity-50"><strong class="text-gray-500">Зона 03 • ???</strong><p class="text-gray-600 mt-1">Скрытая локация</p></div><div class="glass-card rounded-xl p-3 border border-amber-400/30 opacity-70"><strong class="text-amber-400">СЕКРЕТНЫЙ ОБЪЕКТ • ???</strong><p class="text-gray-500 mt-1">Торговый дом. Координаты отсутствуют.</p></div></div>
      </section>

      <!-- TAB 5: НЕДВИЖИМОСТЬ (CYBER REAL ESTATE) -->
      <section id="tab-realestate" class="tab-content hidden space-y-5">
        
        <div class="flex justify-between items-center p-4 rounded-2xl glass-panel">
          <div>
            <h2 class="font-cyber font-bold text-xl text-white flex items-center gap-2">
              <i class="fa-solid fa-city text-neonBlue"></i> Недвижимость Сочи
            </h2>
            <p class="text-xs text-gray-400 mt-0.5">Реальные дома и квартиры в районах Сочи с игровой системой уровней</p>
          </div>
          <div class="text-right font-mono text-xs text-neonBlue">
            Объектов в подборке: <span class="text-white font-bold" id="re-total-hourly">4</span>
          </div>
        </div>

        <div class="glass-panel p-4 rounded-2xl border border-neonPink/30 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 text-neonPink font-cyber font-bold text-sm">
                <i class="fa-solid fa-gavel"></i> Аукцион внимания
              </div>
              <p class="text-xs text-gray-400 mt-1">Рейтинг объекта растет вместе с просмотрами прямых эфиров его актера или блогера.</p>
            </div>
            <div class="flex items-center gap-2 text-xs font-mono">
              <span class="text-gray-400">Раунд:</span><span class="text-neonGreen font-bold">LIVE / 24:00:00</span>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div class="bg-white/5 rounded-xl p-3 border border-white/10"><span class="text-gray-400 block">Всего просмотров</span><strong id="auction-total-views" class="text-white text-lg">0</strong></div>
            <div class="bg-white/5 rounded-xl p-3 border border-white/10"><span class="text-gray-400 block">Лидер рейтинга</span><strong id="auction-leader" class="text-neonBlue">Определяется...</strong></div>
            <div class="bg-white/5 rounded-xl p-3 border border-white/10"><span class="text-gray-400 block">Минимальная ставка</span><strong id="auction-min-bid" class="text-neonGreen">100 LNS</strong></div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" onclick="sortRealEstateAuction('views')" class="auction-sort active px-3 py-2 rounded-xl bg-neonPink/20 border border-neonPink/50 text-neonPink text-xs font-bold" data-sort="views"><i class="fa-solid fa-chart-line mr-1"></i>По просмотрам</button>
            <button type="button" onclick="sortRealEstateAuction('bid')" class="auction-sort px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-bold" data-sort="bid"><i class="fa-solid fa-coins mr-1"></i>По ставке</button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <!-- Property 1 -->
          <div class="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-neonBlue transition flex flex-col justify-between">
            <div class="relative h-44">
              <img src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-gradient-to-t from-darkBg via-transparent to-transparent"></div>
              <div class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-neonBlue/40 text-neonBlue text-xs font-mono">
                Центральный район, Сочи
              </div>
              <div class="absolute bottom-2 left-3">
                <h3 class="font-cyber font-bold text-lg text-white">Квартира у моря</h3>
                <p class="text-xs text-neonBlue font-mono">2-комн. • 61 м²</p>
              </div>
            </div>

            <div class="p-4 space-y-3">
              <div class="grid grid-cols-2 gap-2 text-xs font-mono bg-white/5 p-2.5 rounded-xl">
                <div><span class="text-gray-400">Цена от:</span> <span class="text-neonGreen font-bold">18,5 млн ₽</span></div>
                <div><span class="text-gray-400">Статус:</span> <span class="text-white font-bold">Подборка</span></div>
              </div>

              <button onclick="showToast('Запрос на подборку отправлен', 'info')" class="w-full py-2.5 rounded-xl bg-neonBlue/20 hover:bg-neonBlue/30 border border-neonBlue/50 text-neonBlue font-cyber font-bold text-xs transition">
                Запросить подборку
              </button>
            </div>
          </div>

          <!-- Property 2 -->
          <div class="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-neonPurple transition flex flex-col justify-between">
            <div class="relative h-44">
              <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-gradient-to-t from-darkBg via-transparent to-transparent"></div>
              <div class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-neonPurple/40 text-neonPurple text-xs font-mono">
                Светлана, Сочи
              </div>
              <div class="absolute bottom-2 left-3">
                <h3 class="font-cyber font-bold text-lg text-white">Апартаменты с видом</h3>
                <p class="text-xs text-neonPurple font-mono">1-комн. • 43 м²</p>
              </div>
            </div>

            <div class="p-4 space-y-3">
              <div class="grid grid-cols-2 gap-2 text-xs font-mono bg-white/5 p-2.5 rounded-xl">
                <div><span class="text-gray-400">Цена от:</span> <span class="text-neonGreen font-bold">12,8 млн ₽</span></div>
                <div><span class="text-gray-400">Статус:</span> <span class="text-white font-bold">Подборка</span></div>
              </div>

              <button onclick="showToast('Запрос на подборку отправлен', 'info')" class="w-full py-2.5 rounded-xl bg-neonPurple/20 hover:bg-neonPurple/30 border border-neonPurple/50 text-neonPurple font-cyber font-bold text-xs transition">
                Запросить подборку
              </button>
            </div>
          </div>

          <!-- Property 3 -->
          <div class="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-neonPink transition flex flex-col justify-between">
            <div class="relative h-44">
              <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-gradient-to-t from-darkBg via-transparent to-transparent"></div>
              <div class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-neonPink/40 text-neonPink text-xs font-mono">
                Хоста, Сочи
              </div>
              <div class="absolute bottom-2 left-3">
                <h3 class="font-cyber font-bold text-lg text-white">Дом с участком</h3>
                <p class="text-xs text-neonPink font-mono">4-комн. • 148 м²</p>
              </div>
            </div>

            <div class="p-4 space-y-3">
              <div class="grid grid-cols-2 gap-2 text-xs font-mono bg-white/5 p-2.5 rounded-xl">
                <div><span class="text-gray-400">Цена от:</span> <span class="text-neonGreen font-bold">32 млн ₽</span></div>
                <div><span class="text-gray-400">Статус:</span> <span class="text-neonPink font-bold">Подборка</span></div>
              </div>

              <button onclick="showToast('Запрос на подборку отправлен', 'info')" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-neonPink to-neonPurple text-white font-cyber font-bold text-xs shadow-neon-pink hover:scale-102 transition">
                Запросить подборку
              </button>
            </div>
          </div>

          <!-- Property 4 -->
          <div class="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-neonBlue transition flex flex-col justify-between">
            <div class="relative h-44">
              <img src="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-gradient-to-t from-darkBg via-transparent to-transparent"></div>
              <div class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-neonBlue/40 text-neonBlue text-xs font-mono">
                Красная Поляна, Сочи
              </div>
              <div class="absolute bottom-2 left-3">
                <h3 class="font-cyber font-bold text-lg text-white">Шале у курорта</h3>
                <p class="text-xs text-neonBlue font-mono">3-комн. • 96 м²</p>
              </div>
            </div>

            <div class="p-4 space-y-3">
              <div class="grid grid-cols-2 gap-2 text-xs font-mono bg-white/5 p-2.5 rounded-xl">
                <div><span class="text-gray-400">Цена от:</span> <span class="text-neonGreen font-bold">24,7 млн ₽</span></div>
                <div><span class="text-gray-400">Статус:</span> <span class="text-white font-bold">Подборка</span></div>
              </div>

              <button onclick="showToast('Запрос на подборку отправлен', 'info')" class="w-full py-2.5 rounded-xl bg-neonBlue/20 hover:bg-neonBlue/30 border border-neonBlue/50 text-neonBlue font-cyber font-bold text-xs transition">
                Запросить подборку
              </button>
            </div>
          </div>

        </div>

      </section>

      <!-- Legacy rewards area kept for compatibility; user entry points live in profiles. -->
      <section id="tab-quests" class="tab-content hidden space-y-5">
        
        <div class="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl glass-panel">
          <div>
            <h2 class="font-cyber font-bold text-xl text-white flex items-center gap-2">
              <i class="fa-solid fa-trophy text-amber-400"></i> Ежедневные Квесты & Награды
            </h2>
            <p class="text-xs text-gray-400 mt-0.5">Выполняйте задания, прокачивайте уровень и получайте LUBIKOIN</p>
          </div>

          <span class="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 font-mono">Награда только за контент</span>
        </div>

        <div class="glass-panel p-5 rounded-2xl border border-neonPink/30">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 class="font-cyber font-bold text-lg text-white">Квест PINK NOIZE</h3>
              <p class="text-xs text-gray-400 mt-1">Загрузите фото, видео или отчёт. После проверки материал начислит LUBIKOIN в профиль.</p>
            </div>
                <span class="text-xs font-mono text-neonPink">+100 LUBIKOIN / +100 РЕЗОНАНСА</span>
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <input id="pink-noize-content" type="file" accept="image/*,video/*,.pdf" class="flex-1 text-xs text-gray-400 file:mr-2 file:rounded-lg file:border-0 file:bg-neonPink/20 file:px-3 file:py-2 file:text-neonPink">
            <button onclick="submitQuestContent('pink-noize-content', 100, 100, this)" class="px-4 py-2 rounded-xl bg-neonPink/15 border border-neonPink/40 text-neonPink text-xs font-bold">Отправить контент</button>
          </div>
        </div>

        <!-- Quests Checklist Grid -->
        <div class="space-y-3">
          
          <!-- Quest 1 -->
          <div class="glass-card p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-neonBlue/10 border border-neonBlue/30 flex items-center justify-center text-neonBlue">
                <i class="fa-solid fa-comments"></i>
              </div>
              <div>
                <h4 class="font-bold text-sm text-white">Улыбнись прохожему</h4>
                <p class="text-xs text-gray-400">Улыбнитесь прохожему, снимите видео или фото и загрузите подтверждение</p>
                <input id="smile-content" type="file" accept="image/*,video/*" class="mt-3 w-full text-xs text-gray-400 file:mr-2 file:rounded-lg file:border-0 file:bg-neonBlue/20 file:px-3 file:py-2 file:text-neonBlue">
                <!-- Progress Bar -->
                <div class="w-36 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-2">
                  <div class="bg-neonBlue h-full" style="width: 60%;"></div>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-xs font-mono text-neonBlue">+100 LUBIKOIN / +100 РЕЗОНАНСА</span>
              <button onclick="submitQuestContent('smile-content', 100, 100, this)" class="px-4 py-2 rounded-xl bg-neonBlue/15 border border-neonBlue/40 text-neonBlue text-xs font-bold">
                Загрузить
              </button>
            </div>
          </div>

          <!-- Quest 2: studio -->
          <div class="glass-card p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-neonGreen/40 bg-neonGreen/5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-neonGreen/20 border border-neonGreen/40 flex items-center justify-center text-neonGreen">
                <i class="fa-solid fa-mask"></i>
              </div>
              <div>
                <h4 class="font-bold text-sm text-white">Запись песни в студии «ДО НЕБЕС»</h4>
                <p class="text-xs text-gray-400">Медиа-хаб ТРИЗНЕС, Навагинская, 7. Запишите песню и загрузите фото, видео или аудио.</p>
                <input id="studio-quest-content" type="file" accept="image/*,video/*,audio/*" class="mt-3 w-full text-xs text-gray-400 file:mr-2 file:rounded-lg file:border-0 file:bg-neonGreen/20 file:px-3 file:py-2 file:text-neonGreen">
                <div class="w-36 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-2">
                  <div class="bg-neonGreen h-full" style="width: 100%;"></div>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-xs font-mono text-neonGreen">+250 LUBIKOIN / +200 РЕЗОНАНСА</span>
              <button onclick="submitQuestContent('studio-quest-content', 250, 200, this)" class="px-4 py-2 rounded-xl bg-gradient-to-r from-neonGreen to-emerald-500 text-darkBg font-bold text-xs shadow-neon-green hover:scale-105 transition">
                Загрузить запись
              </button>
            </div>
          </div>

          <!-- Quest 3 -->
          <div class="glass-card p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-neonPurple/10 border border-neonPurple/30 flex items-center justify-center text-neonPurple">
                <i class="fa-solid fa-vault"></i>
              </div>
              <div>
                <h4 class="font-bold text-sm text-white">Стейкер ТРИЗ</h4>
                <p class="text-xs text-gray-400">Сделайте вклад в любой Пул Инвестиций</p>
                <div class="w-36 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-2">
                  <div class="bg-neonPurple h-full" style="width: 0%;"></div>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-xs font-mono text-neonPurple">+500 LUBIKOIN / +300 РЕЗОНАНСА</span>
              <button onclick="switchTab('staking')" class="px-4 py-2 rounded-xl bg-neonPurple/20 hover:bg-neonPurple/30 border border-neonPurple/40 text-neonPurple text-xs font-bold transition">
                Перейти
              </button>
            </div>
          </div>

        </div>

      </section>

      <footer class="mt-10 pb-5 text-center text-[10px] text-gray-600 font-mono">
        Профиль создателя Даниель • игра ТРИЗНЕС · Дмитрий Глазунов
      </footer>
    </main>
  </div>

  <div id="character-profile-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden items-center justify-center p-4">
    <div class="glass-panel w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl border border-neonBlue/40 p-5 md:p-7 relative">
      <button onclick="closeCharacterProfile()" class="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/5 text-gray-400 hover:text-white" title="Закрыть"><i class="fa-solid fa-xmark"></i></button>
      <div class="flex flex-wrap items-center gap-4 border-b border-white/10 pb-5"><div id="character-profile-avatar" class="w-16 h-16 rounded-2xl bg-neonBlue/15 border border-neonBlue/50 flex items-center justify-center text-neonBlue text-2xl"><i class="fa-solid fa-user"></i></div><div><div class="text-[10px] text-neonBlue font-mono">ПРОФИЛЬ ПЕРСОНАЖА</div><h2 id="character-profile-name" class="font-cyber text-2xl text-white mt-1">DANIEL</h2><p id="character-profile-role" class="text-xs text-gray-400 mt-1">Создатель историй и эфиров</p></div><button onclick="startLiveBroadcast()" class="ml-auto rounded-xl bg-neonRed/15 border border-neonRed/40 px-4 py-2.5 text-xs font-bold text-neonRed"><i class="fa-solid fa-tower-broadcast mr-2"></i>Выйти в эфир</button></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        <section class="glass-card rounded-2xl border border-neonPink/30 p-4"><div class="text-[10px] text-neonPink font-mono">СЕРИАЛ ПЕРСОНАЖА</div><h3 class="font-cyber text-lg text-white mt-1">Новый выпуск</h3><p class="text-xs text-gray-400 mt-1">Покажи реальное достижение в кадре и получи +500 очков влияния.</p><input id="profile-serial-title" maxlength="80" class="w-full mt-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500" placeholder="Название выпуска"><button onclick="submitProfileEpisode()" class="w-full mt-3 py-2.5 rounded-xl bg-neonPink/15 border border-neonPink/40 text-neonPink text-xs font-bold"><i class="fa-solid fa-video mr-2"></i>Опубликовать выпуск</button><div id="profile-serial-status" class="hidden mt-3 text-xs text-neonGreen font-mono"></div></section>
        <section class="glass-card rounded-2xl border border-neonPurple/30 p-4"><div class="text-[10px] text-neonPurple font-mono">ПРОКАЧКА ОБРАЗА · В ЭФИРЕ</div><h3 class="font-cyber text-lg text-white mt-1">Покажи новый образ</h3><p class="text-xs text-gray-400 mt-1">Оденься круче, выйди в эфир и получи +50 очков влияния. Раз в день.</p><input id="profile-look-content" type="file" accept="image/*,video/*" class="w-full mt-3 text-xs text-gray-400 file:mr-2 file:rounded-lg file:border-0 file:bg-neonPurple/20 file:px-2 file:py-2 file:text-neonPurple"><button onclick="submitProfileLook()" class="w-full mt-3 py-2.5 rounded-xl bg-neonPurple/15 border border-neonPurple/40 text-neonPurple text-xs font-bold"><i class="fa-solid fa-shirt mr-2"></i>Показать образ</button><div id="profile-look-status" class="hidden mt-3 text-xs text-neonGreen font-mono"></div></section>
      </div>
      <section class="mt-4 rounded-2xl border border-neonGreen/30 bg-neonGreen/5 p-4"><div class="flex flex-wrap items-center justify-between gap-3"><div><div class="text-[10px] text-neonGreen font-mono">ПОДДЕРЖКА ПЕРСОНАЖА</div><p class="text-xs text-gray-300 mt-1">Поддержи героя LUBICOIN и помоги выпускать новые серии.</p></div><button onclick="donateToStream()" class="rounded-xl bg-neonPink/15 border border-neonPink/40 px-4 py-2.5 text-xs font-bold text-neonPink">Поддержать · 100 LUBICOIN</button></div></section>
    </div>
  </div>

  <div id="community-profile-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden items-center justify-center p-4">
    <div class="glass-panel w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl border border-neonGreen/40 p-5 md:p-7 relative">
      <button onclick="closeCommunityProfile()" class="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/5 text-gray-400 hover:text-white" title="Закрыть"><i class="fa-solid fa-xmark"></i></button>
      <div class="border-b border-white/10 pb-5"><div class="text-[10px] text-neonGreen font-mono">ПРОФИЛЬ СООБЩЕСТВА</div><h2 id="community-profile-name" class="font-cyber text-2xl text-white mt-1">PINK NOIZE</h2><p class="text-xs text-gray-400 mt-1">Площадка, эфиры и персонажи в одном пространстве</p></div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5"><section class="glass-card rounded-2xl p-4 border border-neonBlue/30"><i class="fa-solid fa-photo-film text-neonBlue text-xl"></i><h3 class="font-cyber text-white mt-3">Медиа</h3><p class="text-xs text-gray-400 mt-1">Фото, видео и афиши сообщества.</p><button onclick="switchTab('map'); closeCommunityProfile()" class="mt-4 text-xs font-bold text-neonBlue">Открыть ленту</button></section><section class="glass-card rounded-2xl p-4 border border-neonRed/30"><i class="fa-solid fa-tower-broadcast text-neonRed text-xl"></i><h3 class="font-cyber text-white mt-3">Прямые эфиры</h3><p class="text-xs text-gray-400 mt-1">Живые события и трансляции площадки.</p><button onclick="switchTab('streams'); closeCommunityProfile()" class="mt-4 text-xs font-bold text-neonRed">Смотреть эфиры</button></section><section class="glass-card rounded-2xl p-4 border border-neonPink/30"><i class="fa-solid fa-users text-neonPink text-xl"></i><h3 class="font-cyber text-white mt-3">Персонажи</h3><p class="text-xs text-gray-400 mt-1">Герои, которые создают контент сообщества.</p><button onclick="switchTab('characters'); closeCommunityProfile()" class="mt-4 text-xs font-bold text-neonPink">Открыть персонажей</button></section></div>
      <div class="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3"><section class="rounded-2xl border border-neonBlue/30 bg-neonBlue/5 p-4"><div class="text-[10px] text-neonBlue font-mono">ОЧКИ СООБЩЕСТВА</div><strong class="block mt-2 text-2xl text-white">0</strong><p class="text-xs text-gray-400 mt-1">Начисляются за события и материалы площадки.</p><button onclick="showToast('Материал сообщества отправлен на проверку', 'info')" class="mt-3 text-xs font-bold text-neonBlue">Добавить активность</button></section><section class="rounded-2xl border border-neonGreen/30 bg-neonGreen/5 p-4"><div class="text-[10px] text-neonGreen font-mono">ПУЛЫ СООБЩЕСТВА</div><strong class="block mt-2 text-lg text-white">Общий пул</strong><p class="text-xs text-gray-400 mt-1">Объединяйте NLS участников на развитие площадки.</p><button onclick="switchTab('staking'); closeCommunityProfile()" class="mt-3 text-xs font-bold text-neonGreen">Открыть пулы</button></section><section class="rounded-2xl border border-neonPink/30 bg-neonPink/5 p-4"><div class="text-[10px] text-neonPink font-mono">МЕРЧ ПЛОЩАДКИ</div><strong class="block mt-2 text-lg text-white">Витрина сообщества</strong><p class="text-xs text-gray-400 mt-1">Показывайте вещи, которые поддерживают команду.</p><button onclick="openStreamUtility('shop'); closeCommunityProfile()" class="mt-3 text-xs font-bold text-neonPink">Открыть мерч</button></section></div>
      <div class="mt-5 rounded-2xl border border-white/10 p-4"><div class="text-[10px] text-neonPink font-mono">ПЕРСОНАЖИ СООБЩЕСТВА</div><div class="flex flex-wrap gap-2 mt-3"><button onclick="openCharacterProfile('DANIEL'); closeCommunityProfile()" class="rounded-xl bg-neonBlue/10 border border-neonBlue/30 px-3 py-2 text-xs text-neonBlue">DANIEL</button><button onclick="openCharacterProfile('OLYA KALI'); closeCommunityProfile()" class="rounded-xl bg-neonPink/10 border border-neonPink/30 px-3 py-2 text-xs text-neonPink">OLYA KALI</button><button onclick="openCharacterProfile('ALIK MASLO'); closeCommunityProfile()" class="rounded-xl bg-amber-400/10 border border-amber-400/30 px-3 py-2 text-xs text-amber-400">ALIK MASLO</button></div></div>
    </div>
  </div>

  <!-- MODAL 1: WHEEL OF FORTUNE SPIN MODAL -->
  <div id="spin-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden flex items-center justify-center p-4">
    <div class="glass-panel border border-neonPink p-6 rounded-3xl max-w-md w-full text-center space-y-4 relative animate-pulse-glow">
      <button onclick="closeSpinModal()" class="absolute top-4 right-4 text-gray-400 hover:text-white">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>

      <h3 class="font-cyber font-bold text-xl text-white">Колесо Фортуны ТРИЗНЕС</h3>
      <p class="text-xs text-gray-300">Испытайте удачу и выиграйте NLS, LUBICOIN или бонусные очки влияния!</p>

      <!-- Canvas Wheel -->
      <div class="relative w-64 h-64 mx-auto my-4">
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 z-20 text-neonPink text-2xl">
          <i class="fa-solid fa-caret-down"></i>
        </div>
        <canvas id="wheel-canvas" width="256" height="256" class="w-full h-full rounded-full border-4 border-neonPurple shadow-neon-purple"></canvas>
      </div>

      <button id="spin-btn" onclick="spinWheel()" class="w-full py-3 rounded-2xl bg-gradient-to-r from-neonPink via-neonPurple to-neonBlue text-white font-cyber font-bold text-sm shadow-neon-pink hover:scale-105 transition">
        КРУТИТЬ (БЕСПЛАТНО)
      </button>
    </div>
  </div>

  <!-- MODAL 2: STAKING DEPOSIT MODAL -->
  <div id="deposit-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden flex items-center justify-center p-4">
    <div class="glass-panel border border-neonBlue p-6 rounded-3xl max-w-md w-full space-y-4 relative">
      <button onclick="closeDepositModal()" class="absolute top-4 right-4 text-gray-400 hover:text-white">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>

      <h3 id="modal-pool-title" class="font-cyber font-bold text-lg text-white">Внести вклад в Пул</h3>
      <p id="modal-pool-desc" class="text-xs text-gray-300">Ставка APY: <span class="text-neonBlue font-mono font-bold">36%</span></p>

      <div class="space-y-2">
        <label class="text-xs text-gray-400 font-mono">Сумма вклада (NLS):</label>
        <input id="deposit-amount-input" type="number" placeholder="1000" value="1000" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-neonBlue">
      </div>

      <button onclick="confirmDeposit()" class="w-full py-3 rounded-xl bg-gradient-to-r from-neonBlue to-neonPurple text-white font-cyber font-bold text-xs shadow-neon-blue hover:scale-102 transition">
        Подтвердить Вклад
      </button>
    </div>
  </div>

  <div id="nls-connection-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden items-center justify-center p-4">
    <div class="glass-panel border border-neonBlue/50 p-6 rounded-3xl max-w-md w-full space-y-4 relative">
      <button type="button" onclick="closeNlsConnection()" class="absolute top-4 right-4 text-gray-400 hover:text-white" title="Закрыть"><i class="fa-solid fa-xmark text-lg"></i></button>
      <div class="text-[10px] text-neonBlue font-mono">NLS · ПОДКЛЮЧЕНИЕ</div>
      <h3 class="font-cyber font-bold text-xl text-white">Пополнение NLS</h3>
      <p class="text-sm text-gray-300">Подключение кошелька и пополнение NLS скоро будут доступны.</p>
      <a href="admin.html" class="block text-center text-xs text-neonBlue hover:text-white transition">Открыть ручное начисление NLS</a>
      <div class="rounded-xl border border-neonBlue/20 bg-neonBlue/5 p-3 text-xs text-gray-400">Ваш текущий баланс: <strong id="nls-connection-balance" class="text-neonBlue">0 NLS</strong></div>
      <button type="button" onclick="closeNlsConnection()" class="w-full py-3 rounded-xl bg-neonBlue/15 border border-neonBlue/50 text-neonBlue font-bold text-xs">Понятно</button>
    </div>
  </div>

  <!-- TOAST NOTIFICATIONS CONTAINER -->
  <div id="toast-container" class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none"></div>

  <div id="onboarding-modal" class="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md hidden items-center justify-center p-4">
    <div class="glass-panel border border-neonBlue/40 rounded-3xl max-w-2xl w-full p-5 md:p-6">
      <div class="onboarding-slide space-y-4" data-slide="0">
        <div class="text-[10px] text-neonBlue font-mono uppercase">Шаг 1</div>
        <h3 class="font-cyber text-2xl text-white">Персонажи раскрывают город</h3>
        <p class="text-sm text-gray-300">Каждый герой ведёт зрителей по локациям, событиям и проектам ТРИЗНЕС — шаг за шагом, без перегруза и без лишнего шума.</p>
      </div>
      <div class="onboarding-slide hidden space-y-4" data-slide="1">
        <div class="text-[10px] text-neonPink font-mono uppercase">Шаг 2</div>
        <h3 class="font-cyber text-2xl text-white">Зрители получают бонусы</h3>
        <p class="text-sm text-gray-300">Смотри эфир, участвуя в жизни города, получай LUBIKOIN и поддерживай героев без лишних настроек и сложных разделов.</p>
      </div>
      <div class="onboarding-slide hidden space-y-4" data-slide="2">
        <div class="text-[10px] text-neonGreen font-mono uppercase">Шаг 3</div>
        <h3 class="font-cyber text-2xl text-white">Игроки открывают локации</h3>
        <p class="text-sm text-gray-300">Выполняй задания, открывай первую зону и получай очки влияния, которые усиливают твой путь в экосистеме.</p>
      </div>
      <div class="mt-6 flex items-center justify-between gap-3">
        <div class="flex gap-2" id="onboarding-dots">
          <span class="w-2.5 h-2.5 rounded-full bg-neonBlue"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-white/20"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-white/20"></span>
        </div>
        <div class="flex gap-2">
          <button type="button" id="onboarding-back" class="hidden px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-bold">Назад</button>
          <button type="button" id="onboarding-next" class="px-4 py-2 rounded-xl bg-gradient-to-r from-neonBlue to-neonPink text-white text-xs font-bold">Далее</button>
        </div>
      </div>
    </div>
  </div>

  <div id="app-registration-modal" class="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md hidden items-center justify-center p-4">
    <form id="app-registration-form" class="glass-panel w-full max-w-md rounded-3xl border border-neonPink/50 p-6 relative">
      <button type="button" id="app-registration-close" class="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/5 text-gray-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
      <div class="text-[10px] text-neonPink font-mono uppercase">Вход в ТРИЗНЕС</div>
      <h2 class="font-cyber text-xl text-white mt-2">Создать профиль</h2>
      <p class="text-xs text-gray-400 mt-2">Имя профиля будет отображаться в игре и эфирах.</p>
      <input id="app-registration-name" required maxlength="40" class="w-full mt-5 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500" placeholder="Даниель">
      <select id="app-registration-role" class="w-full mt-3 bg-gray-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white"><option>Игрок</option><option>Персонаж</option><option>Сообщество</option></select>
      <button type="submit" class="w-full mt-4 rounded-xl bg-neonPink/15 border border-neonPink/50 px-4 py-3 text-xs font-bold text-neonPink">Создать профиль</button>
    </form>
  </div>

  <!-- JAVASCRIPT APP LOGIC -->
  <script>
    const blackCardGate = document.getElementById('black-card-gate');
    const blackCardLinkButton = document.getElementById('black-card-link-button');
    const blackCardDemoButton = document.getElementById('black-card-demo-button');
    const blackCardSkipButton = document.getElementById('black-card-skip-button');
    const blackCardDemoGuestButton = document.getElementById('black-card-demo-guest-button');
    const blackCardLinkStatus = document.getElementById('black-card-link-status');
    const appRegistrationModal = document.getElementById('app-registration-modal');
    document.getElementById('app-light-theme-button').addEventListener('click', () => {
      localStorage.setItem('triznes-theme', 'light');
      window.location.href = 'gemini-code-1788334892042.html';
    });
    document.getElementById('app-cyber-theme-button').addEventListener('click', () => {
      localStorage.setItem('triznes-theme', 'cyber');
      window.location.reload();
    });
    document.getElementById('app-register-button').addEventListener('click', () => {
      appRegistrationModal.classList.remove('hidden');
      appRegistrationModal.classList.add('flex');
    });
    document.getElementById('app-registration-close').addEventListener('click', () => {
      appRegistrationModal.classList.add('hidden');
      appRegistrationModal.classList.remove('flex');
    });
    document.getElementById('app-registration-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const name = document.getElementById('app-registration-name').value.trim();
      if (name.length < 2 || name.length > 40) {
        showToast('Имя профиля должно содержать от 2 до 40 символов', 'error');
        return;
      }
      const role = document.getElementById('app-registration-role').value;
      localStorage.setItem('triznes-account', JSON.stringify({ name, role, lubikoin: userState.viewerLns, nls: userState.triz, xp: userState.xp, nameChangeUsed: false }));
      localStorage.setItem('triznes-nls', String(userState.triz));
      localStorage.setItem('triznes-lubicoin', String(userState.viewerLns));
      document.getElementById('profile-user-name').innerText = name;
      document.getElementById('profile-card-name').innerText = name;
      appRegistrationModal.classList.add('hidden');
      appRegistrationModal.classList.remove('flex');
      showToast(`Профиль ${name} создан`, 'reward');
    });

    function unlockBlackCard() {
      localStorage.setItem('triznes-black-card', 'active');
      localStorage.setItem('triznes-demo-access', '1');
      blackCardGate.classList.add('hidden');
    }

    function skipBlackCardGate() {
      localStorage.setItem('triznes-demo-access', '1');
      blackCardGate.classList.add('hidden');
      showToast('Демо-доступ активирован. Можно смотреть продукт без оплаты.', 'reward');
    }

    if (localStorage.getItem('triznes-black-card') === 'active' || localStorage.getItem('triznes-demo-access') === '1') {
      blackCardGate.classList.add('hidden');
    }

    blackCardLinkButton.addEventListener('click', async () => {
      const cardLink = `${window.location.href.split('?')[0]}?black-card=issue`;
      try {
        await navigator.clipboard.writeText(cardLink);
        blackCardLinkStatus.innerText = 'Ссылка скопирована. Отправьте её участнику для получения чёрной карты.';
      } catch (error) {
        blackCardLinkStatus.innerText = cardLink;
      }
      blackCardLinkStatus.classList.remove('hidden');
    });

    blackCardDemoButton.addEventListener('click', () => {
      const confirmed = window.confirm('Тестовая активация чёрной карты за 2 500 ₽?');
      if (confirmed) unlockBlackCard();
    });

    blackCardSkipButton.addEventListener('click', () => {
      skipBlackCardGate();
    });

    blackCardDemoGuestButton.addEventListener('click', () => {
      skipBlackCardGate();
    });

    if (new URLSearchParams(window.location.search).get('black-card') === 'issue') {
      blackCardLinkStatus.innerText = 'Ссылка на выдачу карты открыта. После оплаты 2 500 ₽ активируйте карту через администратора.';
      blackCardLinkStatus.classList.remove('hidden');
    }

    function readStoredJson(key, fallback) {
      try {
        const value = JSON.parse(localStorage.getItem(key) || 'null');
        return value ?? fallback;
      } catch (error) {
        localStorage.removeItem(key);
        return fallback;
      }
    }

    const storedAccount = readStoredJson('triznes-account', null);
    const savedAccount = storedAccount?.name === 'DOCTOR'
      ? { ...storedAccount, name: 'Даниель', role: 'Создатель игры ТРИЗНЕС' }
      : storedAccount || { name: 'Даниель', role: 'Создатель игры ТРИЗНЕС' };
    if (storedAccount?.name === 'DOCTOR') localStorage.setItem('triznes-account', JSON.stringify(savedAccount));
    document.getElementById('profile-user-name').innerText = savedAccount.name;
    document.getElementById('profile-card-name').innerText = savedAccount.name;

    const modeButtons = [...document.querySelectorAll('.mode-btn')];
    const modePanels = [...document.querySelectorAll('.mode-panel')];

    function setMode(mode) {
      const currentMode = ['viewer', 'character', 'angel', 'community'].includes(mode) ? mode : 'viewer';
      modeButtons.forEach((button) => {
        const isActive = button.dataset.mode === currentMode;
        button.classList.toggle('active', isActive);
        button.classList.toggle('text-neonBlue', isActive);
        button.classList.toggle('border-neonBlue/50', isActive);
        button.classList.toggle('bg-neonBlue/15', isActive);
        button.classList.toggle('text-gray-300', !isActive);
        button.classList.toggle('border-white/10', !isActive);
        button.classList.toggle('bg-white/5', !isActive);
      });
      modePanels.forEach((panel) => {
        const visible = panel.dataset.mode === currentMode;
        panel.classList.toggle('hidden', !visible);
      });
      localStorage.setItem('triznes-mode', currentMode);
    }

    const modePrimaryTabs = {
      viewer: 'map',
      character: 'characters',
      angel: 'staking',
      community: 'communities'
    };

    modeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const mode = button.dataset.mode;
        setMode(mode);
        switchTab(modePrimaryTabs[mode]);
      });
    });

    const savedMode = localStorage.getItem('triznes-mode') || 'viewer';
    setMode(savedMode);

    let onboardingStep = 0;
    const onboardingSlides = [...document.querySelectorAll('.onboarding-slide')];
    const onboardingModal = document.getElementById('onboarding-modal');
    const onboardingNext = document.getElementById('onboarding-next');
    const onboardingBack = document.getElementById('onboarding-back');

    function renderOnboardingDots() {
      const dots = [...document.querySelectorAll('#onboarding-dots span')];
      dots.forEach((dot, index) => {
        dot.className = `w-2.5 h-2.5 rounded-full ${index === onboardingStep ? 'bg-neonBlue' : 'bg-white/20'}`;
      });
    }

    function showOnboarding() {
      if (!localStorage.getItem('triznes-onboarding-shown')) {
        onboardingModal.classList.remove('hidden');
        onboardingModal.classList.add('flex');
        renderOnboardingDots();
      }
    }

    function stepOnboarding(next) {
      const total = onboardingSlides.length;
      onboardingSlides.forEach((slide) => slide.classList.add('hidden'));
      onboardingStep = Math.max(0, Math.min(total - 1, onboardingStep + (next ? 1 : -1)));
      onboardingSlides[onboardingStep].classList.remove('hidden');
      renderOnboardingDots();
      onboardingBack.classList.toggle('hidden', onboardingStep === 0);
      onboardingNext.textContent = onboardingStep === total - 1 ? 'Начать' : 'Далее';
    }

    onboardingNext.addEventListener('click', () => {
      if (onboardingStep < onboardingSlides.length - 1) {
        stepOnboarding(true);
        return;
      }
      localStorage.setItem('triznes-onboarding-shown', '1');
      onboardingModal.classList.add('hidden');
      onboardingModal.classList.remove('flex');
    });

    onboardingBack.addEventListener('click', () => stepOnboarding(false));

    // Global App State
    const savedNls = Number(localStorage.getItem('triznes-nls') || localStorage.getItem('triznes-triz') || 0);
    const savedLubicoin = Number(localStorage.getItem('triznes-lubicoin') || localStorage.getItem('triznes-viewer-lns') || 0);
    let userState = {
      nls: savedNls,
      lubicoin: savedLubicoin,
      triz: savedNls,
      viewerLns: savedLubicoin,
      xp: 0,
      maxXp: 100,
      level: 0,
      passiveRatePerHour: 0,
      activeTab: 'map',
      soundEnabled: true,
      selectedPoolTitle: '',
      selectedPoolApy: 0,
      calcDays: 30,
      memberSince: Number(localStorage.getItem('triznes-member-since') || Date.now())
    };

    localStorage.setItem('triznes-nls', String(userState.nls));
    localStorage.setItem('triznes-lubicoin', String(userState.lubicoin));
    localStorage.setItem('triznes-member-since', String(userState.memberSince));

    if (!localStorage.getItem('triznes-doctor-video-reward')) {
      userState.triz += 500;
      localStorage.setItem('triznes-doctor-video-reward', '1');
    }

    setTimeout(showOnboarding, 250);
    switchTab(modePrimaryTabs[savedMode] || 'map');

    // Web Audio Synthesizer Sound Generator
    function playAudioFx(type) {
      if (!userState.soundEnabled) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'click') {
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.06);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.06);
          osc.start(); osc.stop(ctx.currentTime + 0.06);
        } else if (type === 'reward') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, ctx.currentTime);
          osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
          osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.28);
          osc.start(); osc.stop(ctx.currentTime + 0.28);
        } else if (type === 'spin') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300 + Math.random()*400, ctx.currentTime);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.05);
          osc.start(); osc.stop(ctx.currentTime + 0.05);
        }
      } catch(e) {}
    }

    function toggleSound() {
      userState.soundEnabled = !userState.soundEnabled;
      const icon = document.getElementById('sound-icon');
      if (userState.soundEnabled) {
        icon.className = 'fa-solid fa-volume-high';
        showToast('Звуковые эффекты включены', 'info');
      } else {
        icon.className = 'fa-solid fa-volume-xmark';
        showToast('Звуковые эффекты выключены', 'info');
      }
    }

    // Tab Switching Mechanics
    function switchTab(tabId) {
      playAudioFx('click');
      userState.activeTab = tabId;

      // Hide all contents
      document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('block');
      });

      // Show requested tab
      const target = document.getElementById(`tab-${tabId}`);
      if (target) {
        target.classList.remove('hidden');
        target.classList.add('block');
      }

      // Update Nav Buttons
      document.querySelectorAll('.nav-tab-btn').forEach(btn => {
        btn.classList.remove('active-tab', 'border-neonBlue', 'bg-neonBlue/10', 'text-white');
        btn.classList.add('text-gray-300');
      });

      const activeBtn = document.getElementById(`nav-btn-${tabId}`);
      if (activeBtn) {
        activeBtn.classList.add('active-tab', 'text-white');
      }

      // Special Tab Actions
      if (tabId === 'streams') {
        initStreamCanvas();
      }
      if (tabId === 'realestate') {
        initRealEstateAuction();
      }
      if (tabId === 'map') {
        initSochiMap();
      }
    }

    let sochiMap;
    let maplibreMap;
    let maplibreReady = false;
    let expeditionRoute;
    let expeditionMarkers = [];
    let expeditionStarted = false;
    let dragunovQuestFound = false;
    const sochiExpeditionLocations = [
      { name: 'Квартира у моря', place: 'Центральный район', character: 'DANIEL', coords: [43.5855, 39.7231], color: '#00f3ff', chapter: 'Глава 01 • Первый контакт' },
      { name: 'Апартаменты с видом', place: 'Светлана', character: 'LERA VIBE', coords: [43.6125, 39.7352], color: '#9d4edd', chapter: 'Глава 02 • Голос города' },
      { name: 'Дом с участком', place: 'Хоста', character: 'NIKA SOCHI', coords: [43.5147, 39.8685], color: '#ff007f', chapter: 'Глава 03 • Своя территория' },
      { name: 'Шале у курорта', place: 'Красная Поляна', character: 'ARTEM NORTH', coords: [43.6819, 40.2047], color: '#00ff66', chapter: 'Глава 04 • Высота' }
    ];

    function initSochiMap() {
      const mapElement = document.getElementById('sochi-map');
      if (!mapElement) return;
      if (typeof maplibregl !== 'undefined') {
        if (!maplibreMap) {
          maplibreMap = new maplibregl.Map({
            container: mapElement,
            style: 'https://tiles.openfreemap.org/styles/liberty',
            center: [39.7231, 43.5855],
            zoom: 11,
            pitch: 48,
            bearing: -12,
            antialias: true
          });
          maplibreMap.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
          maplibreMap.on('load', () => {
            maplibreReady = true;
            const buildingLayer = maplibreMap.getStyle().layers.find(layer => layer['source-layer'] === 'building' && layer.type === 'fill');
            if (buildingLayer) {
              maplibreMap.addLayer({
                id: 'triznes-3d-buildings',
                type: 'fill-extrusion',
                source: buildingLayer.source,
                'source-layer': buildingLayer['source-layer'],
                minzoom: 13,
                paint: {
                  'fill-extrusion-color': '#263b57',
                  'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 8],
                  'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
                  'fill-extrusion-opacity': 0.82
                }
              });
            }
            renderMapLibreFog();
          });
        }
        setTimeout(() => maplibreMap.resize(), 50);
        return;
      }
      if (typeof L === 'undefined') return;
      if (!sochiMap) {
        sochiMap = L.map(mapElement, { zoomControl: true, attributionControl: true }).setView([43.5855, 39.7231], 11);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 19 }).addTo(sochiMap);
        expeditionRoute = L.polyline([], { color: '#00ff66', weight: 4, opacity: 0.9, dashArray: '8 10' }).addTo(sochiMap);
        renderExpeditionFog();
      }
      setTimeout(() => sochiMap.invalidateSize(), 50);
    }

    function renderMapLibreFog() {
      if (!maplibreMap || !maplibreReady || maplibreMap.getSource('triznes-fog')) return;
      const features = sochiExpeditionLocations.slice(1).map((location, index) => ({
        type: 'Feature',
        properties: { label: `ЗОНА ${String(index + 2).padStart(2, '0')} • НЕ РАСКРЫТА` },
        geometry: { type: 'Point', coordinates: [location.coords[1], location.coords[0]] }
      }));
      maplibreMap.addSource('triznes-fog', { type: 'geojson', data: { type: 'FeatureCollection', features } });
      maplibreMap.addLayer({
        id: 'triznes-fog-circles',
        type: 'circle',
        source: 'triznes-fog',
        paint: { 'circle-radius': 30, 'circle-color': '#071018', 'circle-opacity': 0.72, 'circle-stroke-color': '#263746', 'circle-stroke-width': 1 }
      });
      maplibreMap.addLayer({
        id: 'triznes-fog-labels',
        type: 'symbol',
        source: 'triznes-fog',
        layout: { 'text-field': ['get', 'label'], 'text-size': 10, 'text-font': ['Open Sans Regular'] },
        paint: { 'text-color': '#718096', 'text-halo-color': '#071018', 'text-halo-width': 1 }
      });
    }

    function renderExpeditionFog() {
      if (!sochiMap) return;
      sochiExpeditionLocations.forEach((location, index) => {
        const fog = L.circle(location.coords, { radius: index === 0 ? 480 : 850, color: '#263746', fillColor: '#071018', fillOpacity: 0.82, weight: 1, dashArray: '4 8' }).addTo(sochiMap);
        fog.bindTooltip(`ЗОНА ${String(index + 1).padStart(2, '0')} • НЕ РАСКРЫТА`, { direction: 'center', className: 'map-fog-label' });
        location.fog = fog;
      });
    }

    function startSochiExpedition() {
      if (expeditionStarted) return;
      if (!propertyStreamLive) {
        showToast('Сначала персонаж должен подключить прямой эфир', 'info');
        switchTab('streams');
        return;
      }
      initSochiMap();
      if (maplibreMap) {
        if (!maplibreReady) {
          showToast('Карта загружается, попробуйте ещё раз через секунду', 'info');
          return;
        }
        expeditionStarted = true;
        const firstLocation = sochiExpeditionLocations[0];
        const point = { type: 'Feature', geometry: { type: 'Point', coordinates: [firstLocation.coords[1], firstLocation.coords[0]] } };
        if (maplibreMap.getLayer('triznes-first-location')) maplibreMap.removeLayer('triznes-first-location');
        if (maplibreMap.getSource('triznes-first-location')) maplibreMap.removeSource('triznes-first-location');
        maplibreMap.addSource('triznes-first-location', { type: 'geojson', data: point });
        maplibreMap.addLayer({ id: 'triznes-first-location', type: 'circle', source: 'triznes-first-location', paint: { 'circle-radius': 10, 'circle-color': firstLocation.color, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2 } });
        if (maplibreMap.getSource('triznes-route')) maplibreMap.removeSource('triznes-route');
        maplibreMap.addSource('triznes-route', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [[firstLocation.coords[1], firstLocation.coords[0]]] } } });
        maplibreMap.addLayer({ id: 'triznes-route', type: 'line', source: 'triznes-route', paint: { 'line-color': '#00ff66', 'line-width': 4, 'line-dasharray': [2, 3] } });
        new maplibregl.Popup({ offset: 14 }).setLngLat([firstLocation.coords[1], firstLocation.coords[0]]).setHTML(`<div class="map-popup-title">${firstLocation.name}</div><div class="map-popup-meta">${firstLocation.place}<br>Проводник: ${firstLocation.character}<br><span style="color:#00ff66">● ЭФИР ЗАПУЩЕН • ГЛАВА ОТКРЫТА</span></div>`).addTo(maplibreMap);
        maplibreMap.flyTo({ center: [firstLocation.coords[1], firstLocation.coords[0]], zoom: 13, pitch: 58, duration: 1200 });
        updateExpeditionUI(firstLocation);
        return;
      }
      expeditionStarted = true;
      const firstLocation = sochiExpeditionLocations[0];
      firstLocation.fog?.remove();
      const marker = L.circleMarker(firstLocation.coords, { radius: 12, color: firstLocation.color, fillColor: firstLocation.color, fillOpacity: 0.95, weight: 4 }).addTo(sochiMap);
      marker.bindPopup(`<div class="map-popup-title">${firstLocation.name}</div><div class="map-popup-meta">${firstLocation.place}<br>Проводник: ${firstLocation.character}<br><span style="color:#00ff66">● ЭФИР ЗАПУЩЕН • ГЛАВА ОТКРЫТА</span></div>`).openPopup();
      marker.on('click', () => switchTab('streams'));
      expeditionMarkers.push(marker);
      expeditionRoute.setLatLngs([firstLocation.coords]);
      document.getElementById('map-reveal-count').innerText = '1 / 4';
      document.getElementById('expedition-status').innerText = 'Глава 01 открыта';
      document.getElementById('expedition-status').classList.remove('text-amber-400');
      document.getElementById('expedition-status').classList.add('text-neonGreen');
      const button = document.getElementById('start-expedition-btn');
      button.innerHTML = '<i class="fa-solid fa-satellite-dish mr-2"></i>Эфир идет • маршрут открыт';
      button.classList.remove('text-neonPink', 'bg-neonPink/20', 'border-neonPink/60');
      button.classList.add('text-neonGreen', 'bg-neonGreen/15', 'border-neonGreen/50');
      document.getElementById('map-discovery-feed').innerHTML = `<div class="glass-card rounded-xl p-3 border border-neonGreen/40"><strong class="text-neonGreen">${firstLocation.chapter}</strong><p class="text-gray-400 mt-1">${firstLocation.place} открыта в эфире DANIEL</p></div><div class="glass-card rounded-xl p-3 border border-white/10 opacity-50"><strong class="text-gray-500">Глава 02 • ???</strong><p class="text-gray-600 mt-1">Откроется следующим походом</p></div><div class="glass-card rounded-xl p-3 border border-white/10 opacity-50"><strong class="text-gray-500">Глава 03 • ???</strong><p class="text-gray-600 mt-1">Скрытая зона города</p></div>`;
      showToast('Экспедиция DANIEL началась: первая зона Сочи раскрыта', 'reward');
      playAudioFx('reward');
    }

    function updateExpeditionUI(firstLocation) {
      document.getElementById('map-reveal-count').innerText = '1 / 4';
      document.getElementById('expedition-status').innerText = 'Глава 01 открыта';
      document.getElementById('expedition-status').classList.remove('text-amber-400');
      document.getElementById('expedition-status').classList.add('text-neonGreen');
      const button = document.getElementById('start-expedition-btn');
      button.innerHTML = '<i class="fa-solid fa-satellite-dish mr-2"></i>Эфир идет • маршрут открыт';
      button.classList.remove('text-neonPink', 'bg-neonPink/20', 'border-neonPink/60');
      button.classList.add('text-neonGreen', 'bg-neonGreen/15', 'border-neonGreen/50');
      document.getElementById('map-discovery-feed').innerHTML = `<div class="glass-card rounded-xl p-3 border border-neonGreen/40"><strong class="text-neonGreen">${firstLocation.chapter}</strong><p class="text-gray-400 mt-1">${firstLocation.place} открыта в эфире DANIEL</p></div><div class="glass-card rounded-xl p-3 border border-white/10 opacity-50"><strong class="text-gray-500">Глава 02 • ???</strong><p class="text-gray-600 mt-1">Откроется следующим походом</p></div><div class="glass-card rounded-xl p-3 border border-white/10 opacity-50"><strong class="text-gray-500">Глава 03 • ???</strong><p class="text-gray-600 mt-1">Скрытая зона города</p></div>`;
      showToast('Поход DANIEL начался: первая зона Сочи раскрыта', 'reward');
      playAudioFx('reward');
    }

    function completeDragunovQuest() {
      if (dragunovQuestFound) return;
      if (!propertyStreamLive) {
        showToast('Для фиксации находки сначала подключите прямой эфир персонажа', 'info');
        switchTab('streams');
        return;
      }
      dragunovQuestFound = true;
      addXP(800);
      const status = document.getElementById('dragunov-quest-status');
      status.innerText = 'Находка зафиксирована в эфире. PINK NOIZE проверяет координаты.';
      status.classList.remove('hidden');
      showToast('Секретный квест отправлен на проверку PINK NOIZE: +800 Резонанса', 'reward');
      playAudioFx('reward');
    }

    const realEstateAuction = [
      { character: 'LERA VIBE', views: 184200, bid: 860, color: 'neonPink' },
      { character: 'MAX RIVIERA', views: 126800, bid: 620, color: 'neonPurple' },
      { character: 'NIKA SOCHI', views: 98600, bid: 440, color: 'neonBlue' },
      { character: 'ARTEM NORTH', views: 74200, bid: 280, color: 'neonGreen' }
    ];
    let propertyStreamLive = false;

    function initRealEstateAuction() {
      const grid = document.querySelector('#tab-realestate > .grid');
      const cards = grid ? [...grid.querySelectorAll(':scope > .glass-card')] : [];
      if (!cards.length || cards[0].dataset.auctionReady) return;
      cards.forEach((card, index) => {
        const item = realEstateAuction[index];
        if (!item) return;
        card.dataset.auctionReady = 'true';
        card.dataset.views = item.views;
        card.dataset.bid = item.bid;
        card.dataset.character = item.character;
        const body = card.querySelector('.p-4');
        const button = body?.querySelector('button');
        if (!body || !button) return;
        const stats = document.createElement('div');
        stats.className = 'auction-card-stats bg-black/20 p-3 rounded-xl border border-white/10 space-y-2';
        stats.innerHTML = `<div class="flex justify-between text-xs font-mono"><span class="text-gray-400"><i class="fa-solid fa-video mr-1"></i>${item.character}</span><strong class="text-${item.color}">${item.views.toLocaleString('ru-RU')} просмотров</strong></div><div class="h-1.5 bg-gray-800 rounded-full overflow-hidden"><div class="h-full bg-${item.color} rounded-full" style="width:${Math.round(item.views / 184200 * 100)}%"></div></div><div class="flex justify-between items-center text-xs"><span class="text-gray-400">Текущая ставка</span><strong class="text-neonGreen font-mono">${item.bid} LNS</strong></div>`;
        body.insertBefore(stats, button);
        button.innerHTML = '<i class="fa-solid fa-gavel mr-2"></i>Сделать ставку';
        button.onclick = () => placeRealEstateBid(item.character, item.bid);
        const streamButton = document.createElement('button');
        streamButton.className = 'property-stream-button w-full py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-bold text-xs transition';
        streamButton.innerHTML = '<i class="fa-solid fa-lock mr-2"></i>Эфир пространства не запущен';
        streamButton.onclick = () => openPropertyStream(item.character);
        body.insertBefore(streamButton, button);
      });
      updateRealEstateAuction();
    }

    function updateRealEstateAuction() {
      const totalViews = realEstateAuction.reduce((sum, item) => sum + item.views, 0);
      const leader = [...realEstateAuction].sort((a, b) => b.views - a.views)[0];
      document.getElementById('auction-total-views').innerText = totalViews.toLocaleString('ru-RU');
      document.getElementById('auction-leader').innerText = leader.character;
      document.getElementById('auction-min-bid').innerText = `${Math.min(...realEstateAuction.map(item => item.bid))} LNS`;
    }

    function sortRealEstateAuction(key) {
      initRealEstateAuction();
      const grid = document.querySelector('#tab-realestate > .grid');
      const cards = [...grid.querySelectorAll('.glass-card')];
      cards.sort((a, b) => Number(b.dataset[key]) - Number(a.dataset[key])).forEach(card => grid.appendChild(card));
      document.querySelectorAll('.auction-sort').forEach(button => button.classList.toggle('active', button.dataset.sort === key));
      showToast(`Рейтинг отсортирован ${key === 'views' ? 'по просмотрам эфиров' : 'по ставке'}`, 'info');
    }

    function placeRealEstateBid(character, currentBid) {
      const nextBid = currentBid + 50;
      showToast(`Ставка ${nextBid} LNS принята за объект ${character}`, 'reward');
      playAudioFx('reward');
    }

    async function startLiveBroadcast() {
      if (propertyStreamLive) return;
      if (!navigator.mediaDevices?.getUserMedia) {
        showToast('Камера доступна при запуске сайта через HTTPS или localhost', 'error');
        return;
      }
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const preview = document.getElementById('live-camera-preview');
        preview.srcObject = mediaStream;
        preview.classList.remove('hidden');
        document.getElementById('stream-canvas-mock')?.classList.add('hidden');
        launchPropertyStream();
        showToast('Камера и микрофон подключены. Эфир готов для WebRTC-комнаты.', 'reward');
      } catch (error) {
        showToast('Без доступа к камере и микрофону эфир не запустится', 'error');
      }
    }

    function launchPropertyStream() {
      propertyStreamLive = true;
      const status = document.getElementById('property-stream-channel-status');
      const badge = document.getElementById('property-stream-live-badge');
      const label = document.getElementById('property-stream-live-label');
      const description = document.getElementById('property-stream-live-description');
      const chatStatus = document.getElementById('property-stream-chat-status');
      if (status) {
        status.innerText = 'ЭФИР ЗАПУЩЕН • 4 289 СМОТРЯТ';
        status.classList.remove('text-neonRed');
        status.classList.add('text-neonGreen');
      }
      if (badge) {
        badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-white"></span> LIVE';
        badge.classList.remove('bg-neonRed');
        badge.classList.add('bg-neonGreen', 'text-darkBg');
      }
      if (label) label.innerText = 'ПРОСТРАНСТВО В ЭФИРЕ';
      if (description) description.innerText = 'Персонажи показывают достижения и прокачивают уровень контента';
      if (chatStatus) {
        chatStatus.innerText = '● Эфир запущен';
        chatStatus.classList.remove('text-amber-400');
        chatStatus.classList.add('text-neonGreen');
      }
      const donateButton = document.getElementById('stream-donate-button');
      if (donateButton) {
        donateButton.disabled = false;
        donateButton.innerHTML = '<i class="fa-solid fa-heart mr-2"></i>Поддержать эфир • 100 LUBIKOIN';
        donateButton.classList.remove('text-gray-500', 'bg-white/5', 'border-white/10', 'cursor-not-allowed');
        donateButton.classList.add('text-neonPink', 'bg-neonPink/10', 'border-neonPink/40');
      }
      document.querySelectorAll('.property-stream-button').forEach(button => {
        button.innerHTML = '<i class="fa-solid fa-play mr-2"></i>Смотреть эфир пространства';
        button.classList.remove('text-gray-400', 'bg-white/5', 'border-white/10');
        button.classList.add('text-neonGreen', 'bg-neonGreen/10', 'border-neonGreen/40');
      });
      showToast('Эфир пространства запущен. Объекты открыты для зрителей.', 'reward');
      playAudioFx('reward');
    }

    function openPropertyStream(character) {
      if (!propertyStreamLive) {
        showToast('Сначала запустите эфир этого пространства в разделе «Прямые эфиры»', 'info');
        return;
      }
      switchTab('streams');
      showToast(`Эфир пространства открыт: ${character}`, 'info');
    }

    // UI State Sync
    function updateUI() {
      const trizBalance = document.getElementById('hud-triz-balance');
      if (trizBalance) {
        trizBalance.innerText = userState.triz.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      const nlsBalance = document.getElementById('hud-nls-balance');
      if (nlsBalance) nlsBalance.innerText = userState.triz.toLocaleString('ru-RU');
      const lubikoinBalance = document.getElementById('hud-lubikoin-balance');
      if (lubikoinBalance) lubikoinBalance.innerText = userState.viewerLns.toLocaleString('ru-RU');
      const memberDuration = document.getElementById('member-duration');
      if (memberDuration) {
        const elapsedHours = Math.max(0, Math.floor((Date.now() - userState.memberSince) / 3600000));
        memberDuration.innerText = `${Math.floor(elapsedHours / 24)} день • ${elapsedHours % 24} ч`;
      }
      const userLevel = document.getElementById('hud-user-level');
      if (userLevel) userLevel.innerText = `Lvl ${userState.level}`;
      
      const xpPct = (userState.xp / userState.maxXp) * 100;
      document.getElementById('hud-xp-bar').style.width = `${xpPct}%`;
      document.getElementById('hud-xp-text').innerText = `${userState.xp.toLocaleString()} / ${userState.maxXp.toLocaleString()} РЕЗОНАНСА`;
      const profileBar = document.getElementById('profile-resonance-bar');
      const profileText = document.getElementById('profile-resonance-text');
      const profileLevel = document.getElementById('profile-content-level');
      if (profileBar) profileBar.style.width = `${xpPct}%`;
      if (profileText) profileText.innerText = `${userState.xp.toLocaleString()} / ${userState.maxXp.toLocaleString()}`;
      if (profileLevel) profileLevel.innerText = Math.max(1, Math.floor(userState.xp / 100) + 1);
      const viewerBalance = document.getElementById('viewer-balance');
      if (viewerBalance) viewerBalance.innerText = `${userState.viewerLns.toLocaleString('ru-RU')} LUBIKOIN`;
      const utilityViewerBalance = document.getElementById('utility-viewer-balance');
      if (utilityViewerBalance) utilityViewerBalance.innerText = `${userState.viewerLns.toLocaleString('ru-RU')} LUBIKOIN`;
      const artifactBalance = document.getElementById('artifact-balance');
      if (artifactBalance) artifactBalance.innerText = `${userState.viewerLns.toLocaleString('ru-RU')} LUBICOIN`;
      const utilityArtifactBalance = document.getElementById('utility-artifact-balance');
      if (utilityArtifactBalance) utilityArtifactBalance.innerText = `${userState.viewerLns.toLocaleString('ru-RU')} LUBICOIN`;
      localStorage.setItem('triznes-nls', String(userState.triz));
      localStorage.setItem('triznes-lubicoin', String(userState.viewerLns));
    }

    setInterval(updateUI, 60000);

    function claimViewerBonus() {
      if (!propertyStreamLive) {
        showToast('Бонус появится после запуска прямого эфира', 'info');
        return;
      }
      const today = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem('triznes-viewer-bonus-date') === today) {
        showToast('Ежедневный бонус уже получен', 'info');
        return;
      }
      userState.viewerLns += 25;
      localStorage.setItem('triznes-viewer-lns', String(userState.viewerLns));
      localStorage.setItem('triznes-viewer-bonus-date', today);
      const button = document.getElementById('stream-utility-modal')?.querySelector('#viewer-watch-bonus') || document.getElementById('viewer-watch-bonus');
      button.disabled = true;
      button.innerHTML = '<i class="fa-solid fa-check mr-2"></i>Бонус получен • возвращайся завтра';
      button.classList.add('opacity-60', 'cursor-not-allowed');
      updateUI();
      showToast('Зрительский бонус начислен: +25 LUBIKOIN', 'reward');
    }

    function buyViewerItem(item, price, recipient) {
      if (userState.viewerLns < price) {
        showToast(`Нужно еще ${price - userState.viewerLns} LUBIKOIN`, 'error');
        return;
      }
      userState.viewerLns -= price;
      localStorage.setItem('triznes-viewer-lns', String(userState.viewerLns));
      updateUI();
      const purchaseStatus = document.querySelector('#stream-utility-modal #utility-purchase-status') || document.getElementById('viewer-purchase-status');
      purchaseStatus.innerText = `Покупка оформлена: ${item}. Поддержка отправлена персонажу ${recipient}.`;
      purchaseStatus.classList.remove('hidden');
      showToast(`${item} приобретен за ${price} LUBIKOIN`, 'reward');
      playAudioFx('reward');
    }

    function buyArtifact(artifact, price, recipient) {
      if (userState.viewerLns < price) {
        showToast(`Для артефакта нужно еще ${price - userState.viewerLns} LUBICOIN`, 'error');
        return;
      }
      userState.viewerLns -= price;
      localStorage.setItem('triznes-viewer-lns', String(userState.viewerLns));
      updateUI();
      const artifactStatus = document.querySelector('#stream-utility-modal #utility-artifact-status') || document.getElementById('artifact-status');
      artifactStatus.innerText = `Артефакт «${artifact}» установлен персонажу ${recipient}. Его следующий контент усилен.`;
      artifactStatus.classList.remove('hidden');
      showToast(`${recipient} получил артефакт «${artifact}»`, 'reward');
      playAudioFx('reward');
    }

    function openStreamUtility(type) {
      const modal = document.getElementById('stream-utility-modal');
      const content = document.getElementById('stream-utility-content');
      const templates = {
        wallet: `<div class="text-[10px] text-neonGreen font-mono">РЕЖИМ ЗРИТЕЛЯ</div><h3 class="font-cyber text-xl text-white mt-1"><i class="fa-solid fa-wallet text-neonGreen mr-2"></i>Кошелек внимания</h3><strong id="utility-viewer-balance" class="block text-2xl text-neonGreen font-cyber mt-4">${userState.viewerLns} LUBIKOIN</strong><p class="text-xs text-gray-400 mt-2">+25 LUBIKOIN за ежедневный просмотр активного эфира.</p><button id="viewer-watch-bonus" onclick="claimViewerBonus()" class="w-full mt-5 py-3 rounded-xl bg-neonGreen/15 border border-neonGreen/50 text-neonGreen text-xs font-bold"><i class="fa-solid fa-gift mr-2"></i>Забрать бонус</button>`,
        shop: `<div class="text-[10px] text-neonPink font-mono">МАГАЗИН ВЛИЯНИЯ</div><h3 class="font-cyber text-xl text-white mt-1"><i class="fa-solid fa-store text-neonPink mr-2"></i>Мерч и оборудование</h3><div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5"><button onclick="buyViewerItem('Футболка PINK NOIZE',120,'PINK NOIZE')" class="p-3 rounded-xl bg-white/5 border border-neonPink/30 text-left"><i class="fa-solid fa-shirt text-neonPink text-xl"></i><strong class="block text-white text-xs mt-2">Футболка</strong><span class="text-[10px] text-neonGreen">120 LUBIKOIN</span></button><button onclick="buyViewerItem('Микрофон для DOCTOR',450,'DOCTOR')" class="p-3 rounded-xl bg-white/5 border border-neonBlue/30 text-left"><i class="fa-solid fa-microphone text-neonBlue text-xl"></i><strong class="block text-white text-xs mt-2">Микрофон</strong><span class="text-[10px] text-neonGreen">450 LUBIKOIN</span></button><button onclick="buyViewerItem('Камера для DANIEL',900,'DANIEL')" class="p-3 rounded-xl bg-white/5 border border-neonGreen/30 text-left"><i class="fa-solid fa-camera text-neonGreen text-xl"></i><strong class="block text-white text-xs mt-2">Камера</strong><span class="text-[10px] text-neonGreen">900 LUBIKOIN</span></button></div><div id="utility-purchase-status" class="text-xs text-neonGreen mt-4"></div>`,
        artifacts: `<div class="text-[10px] text-amber-400 font-mono">КЭШБЭК ПОДДЕРЖКИ</div><h3 class="font-cyber text-xl text-white mt-1"><i class="fa-solid fa-wand-magic-sparkles text-amber-400 mr-2"></i>Артефакты персонажей</h3><strong id="utility-artifact-balance" class="block text-2xl text-amber-400 font-cyber mt-4">${userState.viewerLns} LUBICOIN</strong><p class="text-xs text-gray-400 mt-2">LUBICOIN от поддержки можно потратить на апгрейд героя.</p><div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5"><button onclick="buyArtifact('Кристалл голоса',80,'DOCTOR')" class="p-3 rounded-xl bg-white/5 border border-amber-400/30 text-left"><i class="fa-solid fa-gem text-amber-400 text-xl"></i><strong class="block text-white text-xs mt-2">Кристалл голоса</strong><span class="text-[10px] text-amber-400">80 LUBICOIN</span></button><button onclick="buyArtifact('Оптика маршрута',160,'DANIEL')" class="p-3 rounded-xl bg-white/5 border border-neonBlue/30 text-left"><i class="fa-solid fa-eye text-neonBlue text-xl"></i><strong class="block text-white text-xs mt-2">Оптика маршрута</strong><span class="text-[10px] text-amber-400">160 LUBICOIN</span></button><button onclick="buyArtifact('Модуль сцены',240,'ALIK MASLO')" class="p-3 rounded-xl bg-white/5 border border-neonPink/30 text-left"><i class="fa-solid fa-bolt text-neonPink text-xl"></i><strong class="block text-white text-xs mt-2">Модуль сцены</strong><span class="text-[10px] text-amber-400">240 LUBICOIN</span></button></div><div id="utility-artifact-status" class="text-xs text-amber-300 mt-4"></div>`
      };
      content.innerHTML = templates[type];
      if (type === 'shop') {
        content.insertAdjacentHTML('afterbegin', '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4"><img src="assets/pink-noize-drive.jpg" alt="Логотип PINK NOIZE в Сочи" class="w-full h-40 object-cover rounded-xl border border-neonPink/30"><img src="assets/pink-noize-merch-drive.jpg" alt="Худи PINK NOIZE" class="w-full h-40 object-cover rounded-xl border border-neonPink/30"></div>');
      }
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeStreamUtility() {
      const modal = document.getElementById('stream-utility-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function createAchievement() {
      addXP(25);
      showToast('Достижение отправлено в эфир: +25 РЕЗОНАНСА', 'reward');
      playAudioFx('reward');
    }

    const videoHighlights = [{ title: 'DOCTOR выступает в клубе Сочи', sourceLabel: 'DOCTOR • загружено в ТРИЗНЕС', type: 'local', source: 'assets/doctor-sochi-club.mp4', category: 'character', uploadedAt: Date.now() }];
    const newsItems = [
      { title: 'DANIEL подключил первый эфир', source: 'DANIEL', category: 'character', uploadedAt: Date.now() - 1000 * 60 * 8, icon: 'fa-video', color: 'neonPink' },
      { title: 'Открыта новая история города', source: 'ALIK MASLO', category: 'character', uploadedAt: Date.now() - 1000 * 60 * 34, icon: 'fa-location-dot', color: 'neonBlue' },
      { title: 'PINK NOIZE готовит новую встречу', source: 'PINK NOIZE', category: 'community', uploadedAt: Date.now() - 1000 * 60 * 12, icon: 'fa-users', color: 'neonGreen' },
      { title: 'ДО НЕБЕС принимает участников студии', source: 'ДО НЕБЕС', category: 'community', uploadedAt: Date.now() - 1000 * 60 * 47, icon: 'fa-music', color: 'amber-400' }
    ];

    function formatNewsTime(timestamp) {
      const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
      return minutes < 60 ? `${minutes} мин назад` : `${Math.floor(minutes / 60)} ч назад`;
    }

    function renderNewsFeed() {
      const groups = { character: document.getElementById('character-news-feed'), community: document.getElementById('community-news-feed') };
      if (!groups.character || !groups.community) return;
      const items = [...newsItems, ...videoHighlights.map((video) => ({ title: video.title, source: video.sourceLabel, category: video.category || 'character', uploadedAt: video.uploadedAt || Date.now(), icon: 'fa-film', color: video.category === 'community' ? 'neonGreen' : 'neonBlue' }))].sort((a, b) => b.uploadedAt - a.uploadedAt);
      Object.entries(groups).forEach(([category, container]) => {
        const categoryItems = items.filter((item) => item.category === category);
        container.innerHTML = categoryItems.map((item) => `<article class="glass-card rounded-xl border border-white/10 p-3 flex items-center gap-3"><span class="w-9 h-9 rounded-lg bg-${item.color}/10 text-${item.color} flex items-center justify-center"><i class="fa-solid ${item.icon}"></i></span><div class="min-w-0 flex-1"><strong class="block text-sm text-white truncate">${escapeHtml(item.title)}</strong><span class="text-[10px] text-gray-400 font-mono">${escapeHtml(item.source)} · ${formatNewsTime(item.uploadedAt)}</span></div><span class="text-[9px] text-neonGreen font-mono">LIVE</span></article>`).join('');
      });
    }

    function renderVideoHighlights() {
      const container = document.getElementById('video-highlights');
      const count = document.getElementById('video-highlights-count');
      if (!container || !count) return;
      count.innerText = `${videoHighlights.length} ${videoHighlights.length === 1 ? 'ролик' : 'роликов'}`;
      container.innerHTML = videoHighlights.length ? videoHighlights.map((video, index) => `<button type="button" onclick="playHighlight(${index})" class="glass-card rounded-xl p-4 text-left border border-white/10 hover:border-amber-400 transition"><div class="w-full aspect-video rounded-lg bg-black/50 flex items-center justify-center text-amber-400"><i class="fa-solid fa-circle-play text-3xl"></i></div><strong class="block text-white text-sm mt-3 truncate">${escapeHtml(video.title)}</strong><span class="text-[10px] text-gray-400 font-mono">${escapeHtml(video.sourceLabel)}</span></button>`).join('') : '<div class="md:col-span-3 py-8 text-center text-xs text-gray-500 font-mono"><i class="fa-solid fa-film text-2xl mb-2 block text-gray-600"></i>Лучшие ролики появятся после первой загрузки</div>';
      renderNewsFeed();
    }

    function playHighlight(index) {
      const video = videoHighlights[index];
      if (!video) return;
      if (video.type === 'drive') {
        const frame = document.getElementById('main-triznes-drive');
        frame.src = video.source;
        frame.classList.remove('hidden');
        document.getElementById('main-triznes-video').classList.add('hidden');
      } else {
        const player = document.getElementById('main-triznes-video');
        player.src = video.source;
        player.classList.remove('hidden');
        document.getElementById('main-triznes-drive').classList.add('hidden');
        player.play();
      }
      document.getElementById('main-video-empty').classList.add('hidden');
      showToast(`Открыт ролик: ${video.title}`, 'info');
    }

    function addUploadedVideo(file) {
      if (!file) return;
      videoHighlights.push({ title: file.name.replace(/\.[^/.]+$/, ''), sourceLabel: 'Загружено в ТРИЗНЕС', type: 'local', source: URL.createObjectURL(file), category: 'character', uploadedAt: Date.now() });
      renderVideoHighlights();
      playHighlight(videoHighlights.length - 1);
      showToast('Ролик добавлен в «Лучшие ролики»', 'reward');
    }

    function loadDriveVideo() {
      const rawUrl = document.getElementById('drive-video-url').value.trim();
      const match = rawUrl.match(/drive\.google\.com\/file\/d\/([^/]+)/);
      if (!match) {
        showToast('Нужна ссылка вида drive.google.com/file/d/.../view', 'error');
        return;
      }
      const previewUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
      videoHighlights.push({ title: 'Ролик ТРИЗНЕС из Google Drive', sourceLabel: 'Google Drive • доступ по ссылке', type: 'drive', source: previewUrl, category: 'community', uploadedAt: Date.now() });
      renderVideoHighlights();
      playHighlight(videoHighlights.length - 1);
      document.getElementById('drive-video-url').value = '';
      showToast('Ролик из Google Drive подключен', 'reward');
    }

    const musicTracks = [
      { title: 'PINK NOIZE / Пролог', artist: 'PINK NOIZE', source: '' },
      { title: 'ТРИЗНЕС / Город в эфире', artist: 'ТРИЗНЕС', source: '' },
      { title: 'Сочи после заката', artist: 'Саундтрек экспедиции', source: '' }
    ];
    let activeMusicTrack = -1;

    function renderMusicPlaylist() {
      const playlist = document.getElementById('music-playlist');
      if (!playlist) return;
      playlist.innerHTML = musicTracks.map((track, index) => `<button type="button" onclick="playMusicTrack(${index})" class="w-full flex items-center gap-3 p-4 text-left border-b border-white/10 last:border-b-0 hover:bg-white/5 transition ${index === activeMusicTrack ? 'bg-amber-400/10' : ''}"><span class="w-9 h-9 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center"><i class="fa-solid ${index === activeMusicTrack ? 'fa-pause' : 'fa-play'}"></i></span><span class="flex-1 min-w-0"><strong class="block text-sm text-white truncate">${escapeHtml(track.title)}</strong><span class="text-xs text-gray-400">${escapeHtml(track.artist)}${track.source ? '' : ' • файл еще не добавлен'}</span></span><span class="text-[10px] font-mono ${track.source ? 'text-neonGreen' : 'text-gray-500'}">${track.source ? 'ГОТОВ' : 'ОЖИДАЕТ'}</span></button>`).join('');
    }

    function playMusicTrack(index) {
      const track = musicTracks[index];
      if (!track) return;
      if (!track.source) {
        showToast('Добавьте аудиофайл через кнопку «Добавить свой трек»', 'info');
        return;
      }
      const player = document.getElementById('music-player');
      if (activeMusicTrack === index && !player.paused) {
        player.pause();
        return;
      }
      activeMusicTrack = index;
      player.src = track.source;
      player.play();
      document.getElementById('music-now-playing').innerText = `${track.title} • ${track.artist}`;
      renderMusicPlaylist();
    }

    function addMusicTrack(file) {
      if (!file) return;
      const character = document.getElementById('music-track-character')?.value || 'PINK NOIZE';
      musicTracks.push({ title: file.name.replace(/\.[^/.]+$/, ''), artist: `${character} / PINK NOIZE`, source: URL.createObjectURL(file) });
      activeMusicTrack = musicTracks.length - 1;
      renderMusicPlaylist();
      playMusicTrack(activeMusicTrack);
      showToast('Трек добавлен в бесплатный плейлист', 'reward');
    }

    function submitSerialEpisode() {
      const titleInput = document.getElementById('serial-title');
      const character = document.getElementById('serial-character').value;
      const title = titleInput.value.trim();
      if (!title) {
        showToast('Назовите выпуск сериала перед отправкой', 'error');
        titleInput.focus();
        return;
      }
      addXP(500);
      const status = document.getElementById('serial-status');
      status.innerText = `Выпуск «${title}» персонажа ${character} принят в эфир. +500 РЕЗОНАНСА`;
      status.classList.remove('hidden');
      titleInput.value = '';
      showToast(`Сериал ${character} получил +500 Резонанса`, 'reward');
      playAudioFx('reward');
    }

    function submitCharacterLook() {
      const input = document.getElementById('look-content');
      const character = document.getElementById('look-character').value;
      const status = document.getElementById('look-status');
      const today = new Date().toISOString().slice(0, 10);
      if (!propertyStreamLive) {
        showToast('Сначала запусти прямой эфир, чтобы показать новый образ', 'info');
        switchTab('streams');
        return;
      }
      if (!input.files.length) {
        showToast('Загрузи фото или видео нового образа', 'error');
        return;
      }
      if (localStorage.getItem('triznes-look-date') === today) {
        showToast('Образ уже менялся сегодня. Следующая смена доступна завтра', 'info');
        return;
      }
      localStorage.setItem('triznes-look-date', today);
      addXP(50);
      status.innerText = `${character}: новый образ показан в эфире. Начислено +50 очков влияния.`;
      status.classList.remove('hidden');
      input.value = '';
      showToast(`${character} получил +50 очков влияния за новый образ`, 'reward');
      playAudioFx('reward');
    }

    let activeCharacterProfile = 'DANIEL';
    const characterProfileModal = document.getElementById('character-profile-modal');

    function openCharacterProfile(name) {
      activeCharacterProfile = name;
      document.getElementById('character-profile-name').innerText = name;
      document.getElementById('character-profile-role').innerText = `${name} • профиль героя, эфиры и развитие`;
      characterProfileModal.classList.remove('hidden');
      characterProfileModal.classList.add('flex');
    }

    function closeCharacterProfile() {
      characterProfileModal.classList.add('hidden');
      characterProfileModal.classList.remove('flex');
    }

    function submitProfileEpisode() {
      const titleInput = document.getElementById('profile-serial-title');
      const status = document.getElementById('profile-serial-status');
      const title = titleInput.value.trim();
      if (!title) {
        showToast('Назови выпуск перед публикацией', 'error');
        titleInput.focus();
        return;
      }
      addXP(500);
      status.innerText = `${activeCharacterProfile}: выпуск «${title}» опубликован в эфире. +500 очков влияния.`;
      status.classList.remove('hidden');
      titleInput.value = '';
      showToast(`${activeCharacterProfile} получил +500 очков влияния`, 'reward');
      playAudioFx('reward');
    }

    function submitProfileLook() {
      const input = document.getElementById('profile-look-content');
      const status = document.getElementById('profile-look-status');
      const today = new Date().toISOString().slice(0, 10);
      if (!propertyStreamLive) {
        showToast('Сначала запусти прямой эфир, чтобы показать новый образ', 'info');
        closeCharacterProfile();
        switchTab('streams');
        return;
      }
      if (!input.files.length) {
        showToast('Загрузи фото или видео нового образа', 'error');
        return;
      }
      if (localStorage.getItem('triznes-look-date') === today) {
        showToast('Образ уже менялся сегодня. Следующая смена доступна завтра', 'info');
        return;
      }
      localStorage.setItem('triznes-look-date', today);
      addXP(50);
      status.innerText = `${activeCharacterProfile}: новый образ показан в эфире. +50 очков влияния.`;
      status.classList.remove('hidden');
      input.value = '';
      showToast(`${activeCharacterProfile} получил +50 очков влияния за новый образ`, 'reward');
      playAudioFx('reward');
    }

    function openCommunityProfile(name) {
      document.getElementById('community-profile-name').innerText = name;
      const modal = document.getElementById('community-profile-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeCommunityProfile() {
      const modal = document.getElementById('community-profile-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function submitAngelTask(event) {
      event.preventDefault();
      const task = {
        title: document.getElementById('angel-task-title').value.trim(),
        description: document.getElementById('angel-task-description').value.trim(),
        character: document.getElementById('angel-task-character').value,
        status: 'На проверке PINK NOIZE',
        createdAt: new Date().toISOString()
      };
      const tasks = JSON.parse(localStorage.getItem('triznes-angel-tasks') || '[]');
      tasks.push(task);
      localStorage.setItem('triznes-angel-tasks', JSON.stringify(tasks));
      const status = document.getElementById('angel-task-status');
      status.innerText = `Задание «${task.title}» отправлено команде PINK NOIZE на проверку.`;
      status.classList.remove('hidden');
      event.target.reset();
      showToast('Задание ангела отправлено на проверку', 'reward');
      playAudioFx('reward');
    }

    function addXP(amount) {
      userState.xp += amount;
      userState.maxXp = Math.max(100, (Math.floor(userState.xp / 100) + 1) * 100);
      updateUI();
    }

    function updateLevelFromContent() {
      const previousLevel = userState.level;
      const nextThreshold = Math.pow(2, userState.level) * 100;
      if (userState.triz >= nextThreshold) userState.level += 1;
      if (userState.level > previousLevel) {
        showToast(`🎉 Новый уровень ${userState.level}! Открыты новые возможности.`, 'reward');
        playAudioFx('reward');
      }
      updateUI();
    }

    // Chat System Logic
    const chatData = {
      1: { name: 'DANIEL', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', status: '● В сети | Анализирует задачи ТРИЗ', tag: 'ИИ-Гений' },
      2: { name: 'Клуб Инвесторов ТРИЗНЕС', avatar: '', isGroup: true, status: '● 1,420 участников онлайн' },
      3: { name: 'ALIK MASLO', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', status: '● В сети | Проектирует ассеты' },
      4: { name: 'ТРИЗ-Ассистент ИИ', avatar: '', isBot: true, status: '● Онлайн бот' }
    };
    const chatSyncEndpoint = 'https://script.google.com/macros/s/AKfycbxCqwl36MYJTQ4zile8794sAcvdtB2kbJ0Qj_CFTtlm2A8Lwy0fQouERx-jakATd4Qn/exec';
    let activeChatId = 1;

    function appendSyncedMessage(message) {
      const container = document.getElementById('chat-messages-container');
      if (!container || String(message.chatId) !== String(activeChatId)) return;
      const messageKey = [message.chatId, message.author, message.createdAt, message.text].join('|');
      if ([...container.children].some((child) => child.dataset.syncedMessage === messageKey)) return;
      const bubble = document.createElement('div');
      bubble.dataset.syncedMessage = messageKey;
      bubble.className = message.author === 'Пользователь' ? 'flex items-start gap-3 max-w-[80%] ml-auto flex-row-reverse' : 'flex items-start gap-3 max-w-[80%]';
      bubble.innerHTML = `<div class="w-8 h-8 rounded-full bg-neonBlue/20 flex items-center justify-center text-neonBlue text-xs font-bold">${message.author === 'Пользователь' ? 'Я' : 'T'}</div><div><div class="bg-white/10 border border-white/10 text-gray-100 p-3 rounded-2xl text-sm">${escapeHtml(message.text)}</div><div class="text-[10px] text-gray-400 mt-1 font-mono">${new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></div>`;
      container.appendChild(bubble);
    }

    async function loadSyncedChatMessages() {
      try {
        const response = await fetch(chatSyncEndpoint);
        if (!response.ok) return;
        const payload = await response.json();
        (payload.messages || []).filter((message) => String(message.chatId) === String(activeChatId)).forEach(appendSyncedMessage);
        const container = document.getElementById('chat-messages-container');
        if (container) container.scrollTop = container.scrollHeight;
      } catch (error) {}
    }

    function saveSyncedChatMessage(text) {
      fetch(chatSyncEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ chatId: activeChatId, author: 'Пользователь', text })
      }).catch(() => showToast('Сообщение останется в локальном чате: Google Sheets временно недоступен', 'info'));
    }

    function selectChat(id) {
      playAudioFx('click');
      activeChatId = id;
      document.querySelectorAll('.chat-item').forEach(el => {
        el.classList.remove('active', 'bg-neonBlue/10', 'border-neonBlue');
        el.classList.add('border-transparent');
      });
      const selected = document.getElementById(`chat-item-${id}`);
      if (selected) {
        selected.classList.add('active', 'bg-neonBlue/10', 'border-neonBlue');
      }

      const info = chatData[id];
      if (info) {
        document.getElementById('active-chat-name').innerText = info.name;
        document.getElementById('active-chat-status').innerText = info.status;
        if (info.avatar) {
          document.getElementById('active-chat-avatar').src = info.avatar;
        }
      }
      loadSyncedChatMessages();
    }

    function sendChatMessage() {
      const input = document.getElementById('chat-input-field');
      const text = input.value.trim();
      if (!text) return;

      playAudioFx('click');
      const container = document.getElementById('chat-messages-container');

      // User Message Bubble
      const userBubble = document.createElement('div');
      userBubble.className = "flex items-start gap-3 max-w-[80%] ml-auto flex-row-reverse";
      userBubble.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-neonPurple flex items-center justify-center text-white text-xs font-bold">Я</div>
        <div>
          <div class="bg-gradient-to-r from-neonPurple/80 to-neonBlue/80 border border-neonBlue/40 text-white p-3 rounded-2xl rounded-tr-none text-sm shadow-neon-blue">
            ${escapeHtml(text)}
          </div>
          <div class="text-[10px] text-right text-gray-300 mt-1 font-mono">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} <i class="fa-solid fa-check-double text-neonBlue ml-1"></i></div>
        </div>
      `;
      container.appendChild(userBubble);
      saveSyncedChatMessage(text);
      input.value = '';
      container.scrollTop = container.scrollHeight;

      // Simulate Bot Response after 1.2s
      setTimeout(() => {
        const botBubble = document.createElement('div');
        botBubble.className = "flex items-start gap-3 max-w-[80%]";
        botBubble.innerHTML = `
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" class="w-8 h-8 rounded-full object-cover">
          <div>
            <div class="bg-white/10 border border-white/10 text-gray-100 p-3 rounded-2xl rounded-tl-none text-sm">
              Интересный запрос! С точки зрения ТРИЗ, противоречие заключается в устранении потерь энергии без усложнения структуры. Рекомендую применить принцип объединения пулов!
            </div>
            <div class="text-[10px] text-gray-400 mt-1 font-mono">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
          </div>
        `;
        container.appendChild(botBubble);
        container.scrollTop = container.scrollHeight;
        addXP(25);
        playAudioFx('reward');
      }, 1200);
    }

    function sendQuickPrompt(promptText) {
      document.getElementById('chat-input-field').value = promptText;
      sendChatMessage();
    }

    function handleChatKeyPress(e) {
      if (e.key === 'Enter') sendChatMessage();
    }

    // Geniuses Tab Actions
    function filterGenius(cat) {
      playAudioFx('click');
      document.querySelectorAll('.genius-filter-btn').forEach(btn => {
        btn.classList.remove('bg-neonPurple', 'text-white');
        btn.classList.add('bg-white/5', 'text-gray-300');
      });
      event.target.classList.add('bg-neonPurple', 'text-white');

      const cards = document.querySelectorAll('.genius-card');
      cards.forEach(card => {
        if (cat === 'all' || card.dataset.category.includes(cat)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }

    function submitQuestContent(inputId, lubikoinReward, xpReward, button) {
      const input = document.getElementById(inputId);
      if (!input || !input.files.length) {
        showToast('Загрузите контент перед отправкой', 'error');
        return;
      }
      button.disabled = true;
      button.innerText = 'Проверка контента...';
      setTimeout(() => {
        userState.viewerLns += lubikoinReward;
        localStorage.setItem('triznes-viewer-lns', String(userState.viewerLns));
        addXP(xpReward);
        updateLevelFromContent();
        button.innerText = `Принято: +${lubikoinReward} LUBIKOIN`;
        button.classList.add('opacity-60', 'cursor-not-allowed');
        showToast(`Контент принят: +${lubikoinReward} LUBIKOIN`, 'reward');
      }, 900);
    }

    function makeCharacterDeposit(name) {
      openDepositModal(`Пул персонажа: ${name}`, 18);
    }

    function toggleFavorite(button, name) {
      const isFavorite = button.dataset.favorite === 'true';
      button.dataset.favorite = String(!isFavorite);
      button.innerHTML = isFavorite ? '<i class="fa-regular fa-heart"></i> В любимые' : '<i class="fa-solid fa-heart"></i> В любимых';
      button.classList.toggle('text-neonPink', !isFavorite);
      showToast(isFavorite ? `${name} удалён из любимых` : `${name} добавлен в любимые`, 'info');
    }

    function requestTask(source) {
      showToast(`Запрос отправлен: задание от ${source}`, 'info');
    }

    function renderCommunities() {
      const container = document.getElementById('community-list');
      if (!container) return;
      const communities = JSON.parse(localStorage.getItem('triznes-communities') || '[]');
      container.innerHTML = communities.map((community) => `
        <article class="glass-card p-4 rounded-2xl border border-white/10">
          <div class="flex items-start justify-between gap-3">
            <div><h4 class="font-cyber font-bold text-white">${escapeHtml(community.name)}</h4><p class="text-xs text-gray-400 mt-1">${escapeHtml(community.city)}</p></div>
            <span class="text-[10px] text-neonGreen font-mono">Подключено</span>
          </div>
          ${community.link ? `<a href="${escapeHtml(community.link)}" target="_blank" rel="noopener noreferrer" class="inline-block mt-3 text-xs text-neonBlue">Открыть сообщество <i class="fa-solid fa-arrow-up-right-from-square ml-1"></i></a>` : ''}
        </article>`).join('');
    }

    function addCommunity(event) {
      event.preventDefault();
      const community = {
        name: document.getElementById('community-name').value.trim(),
        city: document.getElementById('community-city').value.trim(),
        link: document.getElementById('community-link').value.trim()
      };
      if (!document.getElementById('community-ip').files.length || !document.getElementById('community-media').files.length) {
        showToast('Загрузите документ ИП и медиаматериалы заведения', 'error');
        return;
      }
      if (community.link && !community.link.startsWith('https://')) {
        showToast('Ссылка должна начинаться с https://', 'error');
        return;
      }
      const communities = JSON.parse(localStorage.getItem('triznes-communities') || '[]');
      communities.push(community);
      localStorage.setItem('triznes-communities', JSON.stringify(communities));
      event.target.reset();
      renderCommunities();
      showToast(`Сообщество «${community.name}» добавлено`, 'reward');
    }

    function hireGenius(name) {
      playAudioFx('reward');
      userState.passiveRatePerHour += 120;
      document.getElementById('sidebar-passive-rate').innerText = userState.passiveRatePerHour.toLocaleString();
      showToast(`🦸‍♂️ ${name} успешно нанят в ваш Пул! (+120 LUBIKOIN/час)`, 'reward');
    }

    // Live Stream Mechanics & Canvas Animation
    function initStreamCanvas() {
      const canvas = document.getElementById('stream-canvas-mock');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let frame = 0;

      function render() {
        if (userState.activeTab !== 'streams') return;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        ctx.fillStyle = '#05060a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Cyber Grid Lines
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)';
        ctx.lineWidth = 1;

        const gridStep = 30;
        for (let x = 0; x < canvas.width; x += gridStep) {
          ctx.beginPath();
          ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }

        // Animated Waves
        ctx.beginPath();
        ctx.strokeStyle = '#ff007f';
        ctx.lineWidth = 3;
        for (let x = 0; x < canvas.width; x += 5) {
          const y = canvas.height/2 + Math.sin((x + frame * 4) * 0.02) * 40;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        frame++;
        requestAnimationFrame(render);
      }
      render();
    }

    function donateToStream() {
      if (userState.viewerLns >= 100) {
        userState.viewerLns -= 80;
        localStorage.setItem('triznes-viewer-lns', String(userState.viewerLns));
        addXP(250);
        updateUI();
        showToast('❤️ Донат 100 LUBICOIN отправлен! 20 LUBICOIN возвращено кэшбэком', 'reward');
        playAudioFx('reward');

        // Append to Stream Chat
        const chat = document.getElementById('stream-chat-messages');
        const donationMsg = document.createElement('div');
        donationMsg.className = "bg-neonPink/20 border border-neonPink p-2 rounded-xl text-neonPink font-bold text-xs animate-bounce";
        donationMsg.innerText = "🔥 DOCTOR задонатил 100 LUBIKOIN!";
        chat.appendChild(donationMsg);
        chat.scrollTop = chat.scrollHeight;
      } else {
        showToast('Недостаточно LUBIKOIN для доната', 'error');
      }
    }

    function sendStreamComment() {
      const input = document.getElementById('stream-chat-input');
      if (!input.value.trim()) return;
      if (!propertyStreamLive) {
        showToast('Комментарии откроются после запуска эфира', 'info');
        return;
      }

      const chat = document.getElementById('stream-chat-messages');
      const msg = document.createElement('div');
      msg.innerHTML = `<span class="text-neonBlue font-bold">DOCTOR:</span> ${escapeHtml(input.value)}`;
      chat.appendChild(msg);
      input.value = '';
      chat.scrollTop = chat.scrollHeight;
      userState.viewerLns += 5;
      localStorage.setItem('triznes-viewer-lns', String(userState.viewerLns));
      updateUI();
      showToast('+5 LUBIKOIN за участие в чате', 'reward');
      playAudioFx('click');
    }

    // DeFi Staking & Calculator
    function openDepositModal(title, apy, suggestedAmount = 1000) {
      userState.selectedPoolTitle = title;
      userState.selectedPoolApy = apy;
      document.getElementById('modal-pool-title').innerText = `Внести вклад в "${title}"`;
      document.getElementById('modal-pool-desc').innerHTML = `Ставка APY: <span class="text-neonBlue font-mono font-bold">${apy}%</span>`;
      document.getElementById('deposit-amount-input').value = suggestedAmount;
      document.getElementById('deposit-modal').classList.remove('hidden');
      playAudioFx('click');
    }

    function closeDepositModal() {
      document.getElementById('deposit-modal').classList.add('hidden');
    }

    function openNlsConnection() {
      document.getElementById('nls-connection-balance').innerText = `${userState.triz.toLocaleString('ru-RU')} NLS`;
      const modal = document.getElementById('nls-connection-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      playAudioFx('click');
    }

    function closeNlsConnection() {
      const modal = document.getElementById('nls-connection-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function confirmDeposit() {
      const val = parseFloat(document.getElementById('deposit-amount-input').value);
      if (val > 0 && userState.triz >= val) {
        userState.triz -= val;
        addXP(300);
        closeDepositModal();
        showToast(`Успешный вклад ${val} NLS в "${userState.selectedPoolTitle}"!`, 'reward');
        playAudioFx('reward');
      } else {
        showToast('Недействительная сумма или недостаточно средств!', 'error');
      }
    }

    function openAngelCharacterPool() {
      const character = document.getElementById('angel-character-pool').value;
      const need = document.getElementById('angel-need-pool').value;
      openDepositModal(`${character} • ${need}`, 0);
    }

    function setCalcDays(days) {
      userState.calcDays = days;
      document.querySelectorAll('.calc-day-btn').forEach(b => {
        b.classList.remove('active', 'bg-neonBlue/20', 'border-neonBlue', 'text-white');
        b.classList.add('bg-white/5', 'text-gray-300');
      });
      event.target.classList.add('active', 'bg-neonBlue/20', 'border-neonBlue', 'text-white');
      updateCalculator();
    }

    function updateCalculator() {
      const amount = parseFloat(document.getElementById('calc-amount-slider').value);
      document.getElementById('calc-amount-label').innerText = `${amount.toLocaleString()} NLS`;

      const dailyRate = 0.36 / 365;
      const dailyProfit = amount * dailyRate;
      const totalProfit = dailyProfit * userState.calcDays;

      document.getElementById('calc-daily-profit').innerText = `+${dailyProfit.toFixed(2)} NLS`;
      document.getElementById('calc-total-profit').innerText = `+${totalProfit.toFixed(2)} NLS`;
      document.getElementById('calc-final-balance').innerText = `${(amount + totalProfit).toLocaleString('en-US', {maximumFractionDigits:2})} NLS`;
    }

    // Real Estate Actions
    function upgradeProperty(name, cost) {
      if (userState.triz >= cost) {
        userState.triz -= cost;
        userState.passiveRatePerHour += 350;
        document.getElementById('sidebar-passive-rate').innerText = userState.passiveRatePerHour.toLocaleString();
        document.getElementById('re-total-hourly').innerText = `+${userState.passiveRatePerHour.toLocaleString()} LUBIKOIN/час`;
        addXP(200);
        showToast(`🏙️ Объект "${name}" улучшен! Доходность повышена.`, 'reward');
        playAudioFx('reward');
      } else {
        showToast('Недостаточно LUBIKOIN для улучшения недвижимости!', 'error');
      }
    }

    function buyProperty(name, cost) {
      if (userState.triz >= cost) {
        userState.triz -= cost;
        userState.passiveRatePerHour += 3500;
        document.getElementById('sidebar-passive-rate').innerText = userState.passiveRatePerHour.toLocaleString();
        document.getElementById('re-total-hourly').innerText = `+${userState.passiveRatePerHour.toLocaleString()} LUBIKOIN/час`;
        addXP(1000);
        showToast(`🎉 ВЫ КУПИЛИ "${name}"! (+3,500 LUBIKOIN/час)`, 'reward');
        playAudioFx('reward');
      } else {
        showToast('Недостаточно средств для покупки объекта!', 'error');
      }
    }

    function claimQuestReward(btn, trizReward, xpReward) {
      userState.triz += trizReward;
      addXP(xpReward);
      btn.disabled = true;
      btn.className = "px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-500 text-xs font-bold cursor-not-allowed";
      btn.innerText = "Получено ✓";
      showToast(`🎁 Награда получена: +${trizReward} LUBIKOIN и +${xpReward} XP!`, 'reward');
      playAudioFx('reward');
    }

    // Wheel of Fortune Canvas & Mechanics
    let isSpinning = false;
    function openSpinModal() {
      document.getElementById('spin-modal').classList.remove('hidden');
      drawWheel(0);
      playAudioFx('click');
    }

    function closeSpinModal() {
      if (isSpinning) return;
      document.getElementById('spin-modal').classList.add('hidden');
    }

    const wheelSectors = [
      { label: '500 NLS', color: '#00f3ff' },
      { label: '50 LUBICOIN', color: '#ff007f' },
      { label: '+1000 XP', color: '#9d4edd' },
      { label: '100 NLS', color: '#00ff66' },
      { label: '250 NLS', color: '#ff0555' },
      { label: '20 LUBICOIN', color: '#ffaa00' }
    ];

    function drawWheel(angle) {
      const canvas = document.getElementById('wheel-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const num = wheelSectors.length;
      const arc = (Math.PI * 2) / num;

      ctx.clearRect(0, 0, 256, 256);

      for (let i = 0; i < num; i++) {
        const sectorAngle = angle + i * arc;
        ctx.beginPath();
        ctx.fillStyle = wheelSectors[i].color;
        ctx.moveTo(128, 128);
        ctx.arc(128, 128, 120, sectorAngle, sectorAngle + arc);
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.save();
        ctx.translate(128, 128);
        ctx.rotate(sectorAngle + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#000";
        ctx.font = "bold 11px Orbitron, sans-serif";
        ctx.fillText(wheelSectors[i].label, 100, 4);
        ctx.restore();
      }
    }

    function spinWheel() {
      if (isSpinning) return;
      isSpinning = true;
      let startAngle = 0;
      const totalRotation = Math.PI * 2 * 5 + Math.random() * Math.PI * 2;
      let currentRotation = 0;
      const duration = 4000;
      const startTime = performance.now();

      function animateSpin(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease Out Cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        currentRotation = easeOut * totalRotation;

        drawWheel(currentRotation);
        if (Math.random() < 0.2) playAudioFx('spin');

        if (progress < 1) {
          requestAnimationFrame(animateSpin);
        } else {
          isSpinning = false;
          userState.triz += 500;
          addXP(250);
          showToast('Вы выиграли 500 NLS и +250 очков влияния!', 'reward');
          playAudioFx('reward');
        }
      }
      requestAnimationFrame(animateSpin);
    }

    // Toast Helper
    function showToast(msg, type = 'info') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      
      let borderClr = 'border-neonBlue text-neonBlue';
      if (type === 'reward') borderClr = 'border-neonGreen text-neonGreen';
      if (type === 'error') borderClr = 'border-neonRed text-neonRed';

      toast.className = `glass-panel border ${borderClr} px-4 py-3 rounded-xl shadow-lg text-xs font-mono font-bold flex items-center gap-2 transform transition-all duration-300 translate-y-5 opacity-0 pointer-events-auto`;
      toast.innerHTML = `<span>${msg}</span>`;

      container.appendChild(toast);

      setTimeout(() => {
        toast.classList.remove('translate-y-5', 'opacity-0');
      }, 10);

      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-5');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    function escapeHtml(str) {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // Passive Staking Earnings Interval (Increments balance live every second)
    setInterval(() => {
      const perSec = userState.passiveRatePerHour / 3600;
      userState.triz += perSec;
      
      const hudBalance = document.getElementById('hud-triz-balance');
      if (hudBalance) {
        hudBalance.innerText = userState.triz.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }

      const stakingEarned = document.getElementById('staking-live-earned');
      if (stakingEarned) {
        stakingEarned.innerText = `${userState.triz.toFixed(2)} NLS`;
      }
    }, 1000);

    // Initial Load Setup
    window.onload = function() {
      const pantheon = document.getElementById('pantheon-catalog');
      const pantheonTarget = document.getElementById('pink-noize-pantheon');
      if (pantheon && pantheonTarget) pantheonTarget.appendChild(pantheon);
      const poolGrid = document.querySelector('#tab-staking > .grid');
      if (poolGrid) {
        const poolCards = [...poolGrid.children];
        const poolOrder = (card) => {
          const title = card.querySelector('h4')?.innerText || '';
          if (title.includes('SKAZKA 1.0')) return 0;
          if (title.includes('ROOF') || title.includes('Вечер на крыше')) return 1;
          return 2;
        };
        poolCards.sort((first, second) => poolOrder(first) - poolOrder(second)).forEach((card) => poolGrid.appendChild(card));
      }
      const roofCommunityCard = document.getElementById('community-roof-card');
      if (roofCommunityCard) roofCommunityCard.remove();
      renderCommunities();
      document.querySelectorAll('#geniuses-grid-container .genius-card').forEach((card) => {
        if (card.querySelector('.character-profile-button')) return;
        const name = card.querySelector('h3')?.innerText.trim();
        if (!name) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'character-profile-button w-full mt-3 py-2 rounded-xl bg-neonBlue/10 border border-neonBlue/40 text-neonBlue text-xs font-bold';
        button.innerHTML = '<i class="fa-solid fa-id-card mr-2"></i>Открыть профиль';
        button.onclick = () => openCharacterProfile(name);
        card.querySelector('.flex.gap-2')?.before(button);
      });
      document.querySelectorAll('#tab-communities article').forEach((card) => {
        if (card.querySelector('.community-profile-button')) return;
        const name = card.querySelector('h4')?.innerText.trim();
        if (!name) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'community-profile-button w-full mt-3 py-2 rounded-xl bg-neonGreen/10 border border-neonGreen/40 text-neonGreen text-xs font-bold';
        button.innerHTML = '<i class="fa-solid fa-layer-group mr-2"></i>Открыть профиль сообщества';
        button.onclick = () => openCommunityProfile(name);
        card.appendChild(button);
      });
      renderMusicPlaylist();
      document.getElementById('music-upload')?.addEventListener('change', (event) => addMusicTrack(event.target.files[0]));
      document.getElementById('main-video-upload')?.addEventListener('change', (event) => addUploadedVideo(event.target.files[0]));
      renderVideoHighlights();
      playHighlight(0);
      updateUI();
      updateCalculator();
      switchTab(modePrimaryTabs[localStorage.getItem('triznes-mode') || 'viewer'] || 'map');
    };
  </script>
</body>
</html>
