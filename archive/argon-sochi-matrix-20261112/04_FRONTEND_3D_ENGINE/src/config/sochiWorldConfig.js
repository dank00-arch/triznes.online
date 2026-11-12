/**
 * КОНФИГУРАЦИЯ ПРОСТРАНСТВА СОЧИ И ДВУХ МИРОВ (REAL SOCHI vs CYBER TRIZNES)
 * Содержит гео-привязку реальных координат Сочи к 3D-сцене Three.js,
 * палитры слоев, 13 уровней эволюции и стартовые узлы экосистемы.
 */

export const SOCHI_CENTER = {
  lat: 43.5815,
  lng: 39.7228,
  scaleFactor: 3200 // Коэффициент перевода градусов GPS в метры 3D-сцены
};

/**
 * Перевод реальных GPS-координат Сочи (широта/долгота/высота) в 3D-вектор сцены (x, y, z)
 */
export function gpsToSochi3D(lat, lng, elevationMeters = 0) {
  const x = (lng - SOCHI_CENTER.lng) * SOCHI_CENTER.scaleFactor;
  const z = -(lat - SOCHI_CENTER.lat) * SOCHI_CENTER.scaleFactor;
  const y = elevationMeters * 0.12;
  return { x, y, z };
}

export const WORLD_THEMES = {
  real: {
    id: 'real',
    title: 'REAL SOCHI // SOCHIWOOD',
    subtitle: 'Физический слой: живые съемки, улицы, хабы и комьюнити',
    bgHex: 0x0f1e2e,
    fogHex: 0x162b40,
    gridPrimary: 0x38bdf8,
    gridSecondary: 0x1e3a5f,
    wireframeBuildings: false,
    accentColor: '#FF0055'
  },
  cyber: {
    id: 'cyber',
    title: 'CYBER MATRIX // ЯДРО ТРИЗНЕС',
    subtitle: 'Цифровой слой: 13 уровней, Нейроферма, силовые поля и маяки',
    bgHex: 0x04060e,
    fogHex: 0x070b19,
    gridPrimary: 0x00ffcc,
    gridSecondary: 0x111a2e,
    wireframeBuildings: true,
    accentColor: '#00FFCC'
  },
  hybrid: {
    id: 'hybrid',
    title: 'QUANTUM HYBRID // ДВА МИРА СИНХРОННО',
    subtitle: 'Полное слияние реального Сочи и кибер-матрицы Триснаса и Аполлона',
    bgHex: 0x080c1a,
    fogHex: 0x0e152b,
    gridPrimary: 0xbf00ff,
    gridSecondary: 0x1c2541,
    wireframeBuildings: false,
    accentColor: '#BF00FF'
  }
};

export const INITIAL_SOCHI_NODES = [
  {
    id: 'triznes_primorskaya',
    name: 'TRIZNES MEDIAHUB — ПРИМОРСКАЯ',
    realTitle: 'Медиахаб ТРИЗНЕС на Приморской',
    cyberTitle: 'ЦИТАДЕЛЬ ЯДРА // NEXUS-01',
    category: 'core_hub',
    lat: 43.5738,
    lng: 39.7295,
    elevation_m: 25,
    tier: 13,
    colorHex: '#00FFCC',
    guardian: 'Ассистент Триснас',
    tags: ['TRIZNES', 'Нейроферма', 'Ядро'],
    description: 'Центральный штаб управления экосистемой, продакшном и 13 уровнями игры.'
  },
  {
    id: 'sochiwood_morport',
    name: 'SOCHIWOOD GATE — МОРПОРТ',
    realTitle: 'Морской Порт Сочи / Площадка SOCHIWOOD',
    cyberTitle: 'ПОРТАЛ АПОЛЛОНА // СИНЕМА-ДОК',
    category: 'cinematic_hub',
    lat: 43.5806,
    lng: 39.7188,
    elevation_m: 5,
    tier: 12,
    colorHex: '#FF0055',
    guardian: 'Ассистент Аполлон',
    tags: ['SOCHIWOOD', 'PINK NOIZE', 'Аполлон'],
    description: 'Шоу-кластер у марины Сочи: клипы, музыкальные релизы и морские перформансы.'
  },
  {
    id: 'navaginskaya_artery',
    name: 'НАВАГИНСКАЯ АВЕНЮ',
    realTitle: 'Пешеходная улица Навагинская',
    cyberTitle: 'НЕОНОВЫЙ КОРИДОР КВЕСТОВ',
    category: 'quest_corridor',
    lat: 43.5855,
    lng: 39.7231,
    elevation_m: 12,
    tier: 10,
    colorHex: '#00E5FF',
    guardian: 'Ассистент Триснас',
    tags: ['Навагинская', 'Стрит-квесты', '2GIS-Хаб'],
    description: 'Главная артерия встреч персонажей, живых сделок и городских челленджей.'
  },
  {
    id: 'xpro_navaginskaya',
    name: 'XPRO REPAIR LAB',
    realTitle: 'Сервисный центр XPRO Сочи',
    cyberTitle: 'ЛАБОРАТОРИЯ КИБЕР-ИМПЛАНТОВ',
    category: 'tech_repair',
    lat: 43.5868,
    lng: 39.7242,
    elevation_m: 14,
    tier: 8,
    colorHex: '#3399FF',
    guardian: 'Мастер XPRO',
    tags: ['XPRO', 'Экспресс-ремонт', 'Коллаб'],
    description: 'Сверхбыстрый ремонт девайсов и техно-апгрейд экипировки резидентов.'
  },
  {
    id: 'teatr_tuz_stage',
    name: 'ТЕАТР ТУЗ × COLLIDER',
    realTitle: 'Режиссерская сцена ТЕАТР ТУЗ',
    cyberTitle: 'КОЛЛАЙДЕР ПЕРСОНАЖЕЙ (CINEMA FLOW)',
    category: 'theatrical_node',
    lat: 43.5772,
    lng: 39.7260,
    elevation_m: 30,
    tier: 11,
    colorHex: '#B800FF',
    guardian: 'Ассистент Аполлон',
    tags: ['ТЕАТР ТУЗ', 'COLLIDER', 'Cinema Flow'],
    description: 'Театрально-режиссерский портал разработки визуальных канонов и сцен.'
  },
  {
    id: 'shkola_remonta_polygon',
    name: 'ШКОЛА РЕМОНТА × PINK NOIZE',
    realTitle: 'Съемочный полигон Школы ремонта',
    cyberTitle: 'КУЗНИЦА РЕАЛЬНОСТИ // КРАФТ-СЕКТОР',
    category: 'craft_arena',
    lat: 43.5920,
    lng: 39.7310,
    elevation_m: 40,
    tier: 9,
    colorHex: '#FFAA00',
    guardian: 'Ассистент Аполлон',
    tags: ['Школа ремонта', 'PINK NOIZE', 'OpusClip'],
    description: 'Полигон вертикального реалити-шоу о креативной трансформации объектов.'
  },
  {
    id: 'krasnaya_polyana_peak',
    name: 'КРАСНАЯ ПОЛЯНА — ОЛИМП',
    realTitle: 'Горный кластер Красная Поляна',
    cyberTitle: 'ВЫСОТНЫЙ ШПИЛЬ ОЛИМПА',
    category: 'high_altitude_outpost',
    lat: 43.6840,
    lng: 40.2030,
    elevation_m: 450,
    tier: 11,
    colorHex: '#00FF88',
    guardian: 'Ассистент Триснас',
    tags: ['Красная Поляна', 'Горы', 'Ретранслятор'],
    description: 'Высотный горный бастион экосистемы, связанный энергетическим мостом с побережьем.'
  }
];
