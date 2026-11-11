/* TRIZNES v2 · Город — реальный 3D-Сочи (OpenStreetMap + OpenFreeMap + MapLibre) · 2026-11-12 */
(() => {
'use strict';
const TZ = window.TZ, $ = id => document.getElementById(id), esc = TZ.esc, icon = TZ.icon;
const STYLE = 'https://tiles.openfreemap.org/styles/liberty';
const HUB = [39.724831, 43.575142];
// координаты точек мира — из базы (triznes_world_places)
const COORDS = {
  'mediahub-primorskaya': [39.724831, 43.575142], 'morport-sochi': [39.718611, 43.580833], 'naberezhnaya-sochi': [39.7275, 43.5758],
  'mamayka': [39.6969, 43.6314], 'krasnaya-polyana': [40.20528, 43.67861], 'akhun': [39.843421, 43.550337], 'dagomys': [39.66863, 43.66974],
};
const CAT_ICON = { media_hub: 'hub', city_scene: 'wave', district: 'city', creative_space: 'palette', nature_scene: 'leaf' };
const FILTERS = [
  ['all', 'Всё', 'spark', null],
  ['triznes', 'TRIZNES', 'bolt', []],
  ['coffee', 'Кофе', 'coffee', ['cafe', 'coffee', 'bakery', 'ice_cream']],
  ['food', 'Еда', 'food', ['restaurant', 'fast_food', 'food_court', 'bar', 'pub', 'beer', 'biergarten']],
  ['shop', 'Магазины', 'bag', ['shop', 'grocery', 'supermarket', 'convenience', 'clothing_store', 'clothes', 'mall', 'gift', 'jewelry', 'shoes', 'books', 'florist']],
  ['sea', 'Море и парки', 'wave', ['beach', 'park', 'garden', 'attraction', 'viewpoint', 'swimming', 'swimming_pool', 'marina', 'harbor', 'ferry_terminal']],
  ['culture', 'Культура', 'mask', ['museum', 'theatre', 'cinema', 'art_gallery', 'arts_centre', 'music', 'library', 'monument', 'castle', 'place_of_worship', 'gallery']],
  ['stay', 'Отели', 'bed', ['lodging', 'hotel', 'hostel', 'guest_house', 'motel']],
];
const POI_LAYERS = ['poi_r1', 'poi_r7', 'poi_r20'];
const THEMES = {
  night: {
    bg: '#0d0820', land: '#100a24', water: '#0b1d44', water2: '#123068', park: '#0f2420', wood: '#0f2a22', sand: '#2a2140',
    road: '#2a1e4c', road2: '#47307c', road3: '#ff3dcb', casing: '#0d0820', rail: '#3a2c66',
    b0: '#1c1440', b1: '#2c1e5e', b2: '#4a2c88', b3: '#8a3fc0', text: '#e4dbf7', halo: '#0d0820', poiText: '#f3eaff',
    light: '#c3b2ff', sky: '#1a0c3a', horizon: '#ff6fcf', fog: '#140a2c', beam: ['#ff3dcb', '#33e6ff', '#ffd36e'],
  },
  dawn: {
    bg: '#f5ede6', land: '#f7f0ea', water: '#8fd6ee', water2: '#62c3e3', park: '#cfe7c7', wood: '#bfe0b8', sand: '#f6e2c4',
    road: '#ffffff', road2: '#ffe0cc', road3: '#ffb38a', casing: '#e8d9e6', rail: '#d4c4dc',
    b0: '#f1e6ef', b1: '#f4d6e3', b2: '#e8c8ff', b3: '#c8d6ff', text: '#3a2a52', halo: '#ffffff', poiText: '#2a1a40',
    light: '#ffe2c2', sky: '#ffd2b8', horizon: '#ffe9f4', fog: '#fff1e6', beam: ['#ff6fcf', '#33c8ff', '#ffb000'],
  },
};
let map = null, ready = false, hero = null, heroEl = null, markers = [], filter = 'all', origFilters = {}, is3d = true, walking = false, running = false;
let pos = (() => { try { const p = JSON.parse(localStorage.getItem('triznes-hero') || 'null'); if (Array.isArray(p) && p.length === 2) return p } catch (e) { } return [HUB[0] + 0.0006, HUB[1] - 0.0004] })();
let heading = 30, joy = { x: 0, y: 0, active: false };
const theme = () => THEMES[document.documentElement.dataset.theme === 'dawn' ? 'dawn' : 'night'];

/* --- гео-утилиты --- */
const R = 6371000, rad = d => d * Math.PI / 180;
function dist(a, b) { const dLat = rad(b[1] - a[1]), dLng = rad(b[0] - a[0]); const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(s)) }
function move(p, meters, bearingDeg) { const b = rad(bearingDeg), dn = meters * Math.cos(b), de = meters * Math.sin(b); return [p[0] + de / (R * Math.cos(rad(p[1]))) * 180 / Math.PI, p[1] + dn / R * 180 / Math.PI] }
function circle(c, m, n = 24) { const ring = []; for (let i = 0; i <= n; i++) ring.push(move(c, m, i * 360 / n)); return ring }
const fmtDist = m => m < 1000 ? Math.round(m / 5) * 5 + ' м' : (m / 1000).toFixed(m < 10000 ? 1 : 0).replace('.', ',') + ' км';
function places() { return (TZ.W.places || []).map(p => ({ ...p, ll: COORDS[p.slug] || (p.latitude && p.longitude ? [p.longitude, p.latitude] : null) })).filter(p => p.ll) }

/* --- инициализация --- */
function init() {
  if (map || !window.maplibregl) { if (!window.maplibregl) fallback(); return }
  try {
    map = new maplibregl.Map({ container: 'map', style: STYLE, center: pos, zoom: 16.6, pitch: 64, bearing: heading, maxPitch: 85, attributionControl: { compact: true }, antialias: false, fadeDuration: 120 });
  } catch (e) { fallback(); return }
  const failT = setTimeout(() => { if (!ready) fallback('Карта не загрузилась — проверь интернет. Пока покажу схему мира.') }, 15000);
  map.on('style.load', () => { clearTimeout(failT); ready = true; restyle(); addWorld(); applyFilter(); update() });
  map.on('styleimagemissing', e => { try { if (!map.hasImage(e.id)) map.addImage(e.id, { width: 1, height: 1, data: new Uint8Array(4) }) } catch (x) { } });
  map.on('error', e => { if (!ready && /style/i.test(String(e && e.error && e.error.message))) fallback() });
  map.on('click', e => {
    const f = map.queryRenderedFeatures(e.point, { layers: POI_LAYERS.filter(l => map.getLayer(l)) })[0];
    if (f) poiSheet(f);
  });
  buildFilters(); bindTools(); bindJoy(); loop();
}
function fallback(msg) {
  const el = $('map'); if (el.querySelector('.map-fallback')) return;
  el.insertAdjacentHTML('beforeend', `<div class="map-fallback"><div class="card stack"><div class="ey cyan">Сочи · NODE 001</div><h3 class="h3">Живая карта города</h3><p class="sm mut">${esc(msg || 'Твоё устройство не поддерживает 3D-карту. Точки мира — ниже, в карточке «Рядом».')}</p></div></div>`);
}

/* --- стиль карты под тему --- */
function setP(id, k, v) { try { if (map.getLayer(id)) map.setPaintProperty(id, k, v) } catch (e) { } }
function restyle() {
  if (!map || !ready) return;
  const T = theme();
  const layers = map.getStyle().layers || [];
  for (const l of layers) {
    const id = l.id, sl = l['source-layer'] || '';
    if (l.type === 'background') setP(id, 'background-color', T.bg);
    else if (l.type === 'raster') setP(id, 'raster-opacity', 0.15);
    else if (l.type === 'fill' && sl === 'water') setP(id, 'fill-color', T.water);
    else if (l.type === 'fill' && (sl === 'park')) { setP(id, 'fill-color', T.park); setP(id, 'fill-opacity', 0.8) }
    else if (l.type === 'fill' && sl === 'landcover') setP(id, 'fill-color', /sand/.test(id) ? T.sand : /wood/.test(id) ? T.wood : T.park);
    else if (l.type === 'fill' && sl === 'landuse') setP(id, 'fill-color', T.land);
    else if (l.type === 'fill' && sl === 'building') { setP(id, 'fill-color', T.b0); setP(id, 'fill-outline-color', T.b1) }
    else if (l.type === 'line' && sl === 'waterway') setP(id, 'line-color', T.water2);
    else if (l.type === 'line' && sl === 'transportation') {
      if (/casing/.test(id)) setP(id, 'line-color', T.casing);
      else if (/rail/.test(id)) setP(id, 'line-color', T.rail);
      else if (/motorway|trunk|primary/.test(id)) setP(id, 'line-color', T.road3);
      else if (/secondary|tertiary/.test(id)) setP(id, 'line-color', T.road2);
      else setP(id, 'line-color', T.road);
    }
    else if (l.type === 'line' && sl === 'park') setP(id, 'line-color', T.park);
    else if (l.type === 'fill-extrusion' && sl === 'building') {
      setP(id, 'fill-extrusion-color', ['interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 0], 0, T.b0, 18, T.b1, 45, T.b2, 110, T.b3]);
      setP(id, 'fill-extrusion-opacity', 0.94);
    }
    else if (l.type === 'symbol') {
      setP(id, 'text-color', /poi/.test(id) ? T.poiText : T.text); setP(id, 'text-halo-color', T.halo); setP(id, 'text-halo-width', 1.4);
      try { const tf = map.getLayoutProperty(id, 'text-field'); if (tf && JSON.stringify(tf).includes('name') && !/shield|housenumber/.test(id)) map.setLayoutProperty(id, 'text-field', ['coalesce', ['get', 'name:ru'], ['get', 'name']]) } catch (e) { }
    }
  }
  try { map.setLight({ anchor: 'map', position: [1.4, 205, 35], color: T.light, intensity: 0.45 }) } catch (e) { }
  try { map.setSky({ 'sky-color': T.sky, 'horizon-color': T.horizon, 'fog-color': T.fog, 'sky-horizon-blend': 0.6, 'horizon-fog-blend': 0.7, 'fog-ground-blend': 0.35, 'atmosphere-blend': 0.6 }) } catch (e) { }
  if (map.getLayer('tz-beams')) { setP('tz-beams', 'fill-extrusion-color', ['match', ['get', 'k'], 'hub', T.beam[2], 'a', T.beam[0], T.beam[1]]) }
  if (map.getLayer('tz-halo')) setP('tz-halo', 'circle-color', T.beam[0]);
}

/* --- точки мира: лучи света и маркеры --- */
function addWorld() {
  const P = places();
  const beams = { type: 'FeatureCollection', features: P.map((p, i) => ({ type: 'Feature', properties: { k: p.category === 'media_hub' ? 'hub' : i % 2 ? 'a' : 'b', h: p.category === 'media_hub' ? 340 : 220 }, geometry: { type: 'Polygon', coordinates: [circle(p.ll, p.category === 'media_hub' ? 11 : 8)] } })) };
  const pts = { type: 'FeatureCollection', features: P.map(p => ({ type: 'Feature', properties: { slug: p.slug }, geometry: { type: 'Point', coordinates: p.ll } })) };
  if (map.getSource('tz-beams')) map.getSource('tz-beams').setData(beams); else {
    map.addSource('tz-beams', { type: 'geojson', data: beams });
    map.addSource('tz-pts', { type: 'geojson', data: pts });
    map.addLayer({ id: 'tz-halo', type: 'circle', source: 'tz-pts', paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 6, 17, 40], 'circle-color': theme().beam[0], 'circle-opacity': 0.18, 'circle-blur': 0.8, 'circle-pitch-alignment': 'map' } });
    map.addLayer({ id: 'tz-beams', type: 'fill-extrusion', source: 'tz-beams', paint: { 'fill-extrusion-color': '#ff3dcb', 'fill-extrusion-height': ['get', 'h'], 'fill-extrusion-base': 0, 'fill-extrusion-opacity': 0.5, 'fill-extrusion-vertical-gradient': true } });
  }
  restyle();
  markers.forEach(m => m.remove()); markers = [];
  P.forEach(p => {
    const el = document.createElement('div');
    el.className = 'place-marker' + (p.category === 'media_hub' ? ' hub' : '');
    el.innerHTML = `<div class="pm">${icon(CAT_ICON[p.category] || 'spark')}</div><span>${esc(p.name)}</span>`;
    el.onclick = ev => { ev.stopPropagation(); placeSheet(p) };
    markers.push(new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(p.ll).addTo(map));
  });
  // персонаж
  heroEl = document.createElement('div'); heroEl.className = 'hero-marker';
  heroEl.innerHTML = '<div class="cone"></div><div class="shadow"></div><div class="ring"><div></div></div>';
  if (hero) hero.remove();
  hero = new maplibregl.Marker({ element: heroEl, pitchAlignment: 'viewport', rotationAlignment: 'viewport' }).setLngLat(pos).addTo(map);
  paintHero(); nearest();
}
function paintHero() {
  if (!heroEl) return;
  const c = TZ.myColors(), av = TZ.myAvatar(), p = TZ.ME && TZ.ME.player;
  ['--c1', '--c2', '--c3'].forEach((k, i) => heroEl.style.setProperty(k, c[i] || c[0]));
  heroEl.querySelector('.ring>div').innerHTML = av ? `<img src="${esc(av)}" alt="">` : esc(((p && (p.alias || p.name)) || 'T').slice(0, 1).toUpperCase());
}
function placeSheet(p) {
  const d = dist(pos, p.ll);
  TZ.sheet(`<div class="row"><span class="chip live"><span class="dot"></span>${esc(p.status || 'REAL')}</span><span class="sp"></span><span class="xs dim">${fmtDist(d)} от тебя</span></div>
    ${p.category === 'media_hub' ? `<img src="./art/03_media_hub.webp" alt="" style="width:100%;border-radius:18px;margin-top:14px;aspect-ratio:16/9;object-fit:cover">` : ''}
    <h3 class="h2" style="margin:14px 0 6px">${esc(p.name)}</h3><p class="mut">${esc(p.description || '')}</p>
    ${p.category === 'media_hub' ? `<p class="sm" style="margin-top:8px">${icon('map')} Приморская, 6/4 · Сочи</p>` : ''}
    <div class="stack" style="margin-top:16px">
      <button class="btn primary block" id="pGo">${icon('walk')}Переместиться сюда</button>
      <a class="btn ghost block" href="https://yandex.ru/maps/?pt=${p.ll[0]},${p.ll[1]}&z=17&l=map" target="_blank" rel="noopener">${icon('map')}Маршрут в Яндекс Картах</a>
      <button class="btn ghost block" data-go="path" data-close>${icon('path')}Задание ступени 7 «ГОРОД»</button>
    </div>`);
  $('pGo').onclick = () => { TZ.closeSheet(); teleport(move(p.ll, 22, 200)) };
}
function poiSheet(f) {
  const pr = f.properties || {}, name = pr['name:ru'] || pr.name || 'Место';
  const ll = f.geometry && f.geometry.coordinates;
  TZ.sheet(`<div class="ey cyan">${esc(kind(pr))}</div><h3 class="h2" style="margin:8px 0 6px">${esc(name)}</h3><p class="sm mut">${ll ? fmtDist(dist(pos, ll)) + ' от тебя · ' : ''}данные OpenStreetMap</p>
    <div class="stack" style="margin-top:16px"><button class="btn primary block" id="pGo">${icon('walk')}Переместиться сюда</button>
    <a class="btn ghost block" href="https://yandex.ru/maps/?text=${encodeURIComponent(name + ' Сочи')}&ll=${ll ? ll[0] + ',' + ll[1] : ''}&z=17" target="_blank" rel="noopener">${icon('map')}Открыть в Яндекс Картах</a></div>`);
  $('pGo').onclick = () => { TZ.closeSheet(); if (ll) teleport(move(ll, 12, 180)) };
}
const KIND = { cafe: 'Кофейня', restaurant: 'Ресторан', fast_food: 'Быстрая еда', bar: 'Бар', pub: 'Паб', shop: 'Магазин', grocery: 'Продукты', clothing_store: 'Одежда', lodging: 'Отель', museum: 'Музей', theatre: 'Театр', cinema: 'Кино', art_gallery: 'Галерея', park: 'Парк', beach: 'Пляж', attraction: 'Достопримечательность', bakery: 'Пекарня', ice_cream: 'Мороженое' };
const kind = pr => KIND[pr.subclass] || KIND[pr.class] || 'Место в городе';

/* --- фильтры --- */
function buildFilters() {
  $('cFilters').innerHTML = FILTERS.map(([k, t, ic]) => `<button class="chip ${k === filter ? 'on' : ''}" data-f="${k}">${icon(ic)}${t}</button>`).join('');
  $('cFilters').querySelectorAll('button').forEach(b => b.onclick = () => { filter = b.dataset.f; $('cFilters').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); applyFilter(); if (filter !== 'all' && filter !== 'triznes') setTimeout(() => nearby(true), 450) });
}
function applyFilter() {
  if (!map || !ready) return;
  const F = FILTERS.find(f => f[0] === filter), cls = F[3];
  POI_LAYERS.forEach(id => {
    if (!map.getLayer(id)) return;
    if (!(id in origFilters)) origFilters[id] = map.getFilter(id) || null;
    const o = origFilters[id];
    if (!cls) { map.setFilter(id, o); map.setLayoutProperty(id, 'visibility', 'visible') }
    else if (!cls.length) map.setLayoutProperty(id, 'visibility', 'none');
    else { map.setLayoutProperty(id, 'visibility', 'visible'); const mine = ['any', ['in', ['get', 'class'], ['literal', cls]], ['in', ['get', 'subclass'], ['literal', cls]]]; map.setFilter(id, o ? ['all', o, mine] : mine) }
  });
  markers.forEach(m => m.getElement().style.display = (filter === 'all' || filter === 'triznes') ? '' : 'none');
}

/* --- рядом со мной --- */
function nearby(auto) {
  if (!map || !ready) return;
  const seen = new Set(), list = [];
  map.queryRenderedFeatures({ layers: POI_LAYERS.filter(l => map.getLayer(l)) }).forEach(f => {
    const pr = f.properties || {}, name = pr['name:ru'] || pr.name; if (!name || seen.has(name)) return; seen.add(name);
    list.push({ f, name, d: dist(pos, f.geometry.coordinates), k: kind(pr) });
  });
  list.sort((a, b) => a.d - b.d);
  const own = places().map(p => ({ p, d: dist(pos, p.ll) })).sort((a, b) => a.d - b.d).slice(0, 3);
  if (auto && !list.length) { TZ.toast('Рядом ничего не нашёл — приблизь карту'); return }
  TZ.sheet(`<div class="ey pink">Рядом с тобой</div><h3 class="h2" style="margin:8px 0 12px">Что вокруг</h3>
    ${filter === 'all' || filter === 'triznes' ? own.map(o => `<button class="track-row" style="margin-bottom:8px" data-pl="${esc(o.p.slug)}"><div class="pb">${icon(CAT_ICON[o.p.category] || 'spark')}</div><div><b class="sm">${esc(o.p.name)}</b><div class="xs mut">TRIZNES · ${fmtDist(o.d)}</div></div></button>`).join('') : ''}
    ${list.slice(0, 12).map((x, i) => `<button class="track-row" style="margin-bottom:8px" data-i="${i}"><div class="pb" style="background:var(--card);color:var(--cyan);border:1px solid var(--line2)">${icon('spark')}</div><div><b class="sm">${esc(x.name)}</b><div class="xs mut">${esc(x.k)} · ${fmtDist(x.d)}</div></div></button>`).join('') || '<div class="empty">Приблизь карту — места подгрузятся.</div>'}
    <p class="xs dim" style="margin-top:8px">Места города — из OpenStreetMap, как их отметили жители.</p>`);
  document.querySelectorAll('#sheetBody [data-i]').forEach(b => b.onclick = () => { const x = list[+b.dataset.i]; TZ.closeSheet(); poiSheet(x.f) });
  document.querySelectorAll('#sheetBody [data-pl]').forEach(b => b.onclick = () => { const p = places().find(q => q.slug === b.dataset.pl); TZ.closeSheet(); placeSheet(p) });
}

/* --- инструменты --- */
function bindTools() {
  $('cSearch').onclick = () => nearby(false);
  $('cOverview').onclick = () => { map && map.flyTo({ center: [39.735, 43.588], zoom: 12.6, pitch: 48, bearing: -18, duration: 1800 }) };
  $('c3d').onclick = () => { is3d = !is3d; $('c3d').classList.toggle('on', is3d); map && map.easeTo({ pitch: is3d ? 64 : 0, duration: 700 }); if (map && map.getLayer('building-3d')) map.setLayoutProperty('building-3d', 'visibility', is3d ? 'visible' : 'none') };
  $('cLocate').onclick = () => {
    if (!navigator.geolocation) { TZ.toast('Геолокация недоступна'); return }
    TZ.toast('Ищу тебя…');
    navigator.geolocation.getCurrentPosition(g => {
      const here = [g.coords.longitude, g.coords.latitude];
      if (dist(here, HUB) > 80000) { TZ.toast('Ты не в Сочи — ставлю тебя у медиахаба'); teleport(move(HUB, 25, 200)); return }
      teleport(here); TZ.toast('Ты здесь ✦');
    }, () => TZ.toast('Нет доступа к геолокации'), { enableHighAccuracy: true, timeout: 10000 });
  };
  $('near').onclick = () => { const n = nearest(); if (n) placeSheet(n.p) };
}
function teleport(ll) { pos = ll; save(); hero && hero.setLngLat(pos); map && map.flyTo({ center: pos, zoom: 17.4, pitch: is3d ? 68 : 0, bearing: heading, duration: 1600 }); nearest() }
function save() { try { localStorage.setItem('triznes-hero', JSON.stringify(pos)) } catch (e) { } }
let lastNear = null;
function nearest() {
  const P = places(); if (!P.length) return null;
  const n = P.map(p => ({ p, d: dist(pos, p.ll) })).sort((a, b) => a.d - b.d)[0];
  $('nearName').textContent = n.p.name;
  const here = n.d < 45;
  $('nearDist').textContent = here ? 'Ты на месте! Открой точку →' : `${fmtDist(n.d)} · ${n.p.category === 'media_hub' ? 'штаб TRIZNES' : 'точка мира'}`;
  $('near').querySelector('.pic').innerHTML = icon(CAT_ICON[n.p.category] || 'spark');
  if (here && lastNear !== n.p.slug) { lastNear = n.p.slug; TZ.toast(`✦ Ты у точки «${n.p.name}»`); navigator.vibrate && navigator.vibrate(40) }
  if (!here) lastNear = null;
  return n;
}

/* --- прогулка: джойстик + камера от третьего лица --- */
function bindJoy() {
  const j = $('joy'), k = $('knob'); let rect, id = null;
  const set = (x, y) => { const r = rect.width / 2 - 28, len = Math.hypot(x, y), s = len > r ? r / len : 1; joy.x = x * s / r; joy.y = y * s / r; k.style.transform = `translate(${x * s}px,${y * s}px)` };
  j.addEventListener('pointerdown', e => { if (e.target.closest('.run')) return; rect = j.getBoundingClientRect(); id = e.pointerId; j.setPointerCapture(id); k.classList.add('free'); joy.active = true; set(e.clientX - rect.left - rect.width / 2, e.clientY - rect.top - rect.height / 2) });
  j.addEventListener('pointermove', e => { if (e.pointerId !== id) return; set(e.clientX - rect.left - rect.width / 2, e.clientY - rect.top - rect.height / 2) });
  const end = e => { if (e.pointerId !== id) return; id = null; joy.active = false; joy.x = joy.y = 0; k.classList.remove('free'); k.style.transform = '' };
  j.addEventListener('pointerup', end); j.addEventListener('pointercancel', end);
  $('run').onclick = e => { e.stopPropagation(); running = !running; $('run').classList.toggle('on', running) };
}
let last = performance.now(), saveT = 0;
function loop(t = performance.now()) {
  const dt = Math.min(0.05, (t - last) / 1000); last = t;
  if (map && ready && joy.active && (Math.abs(joy.x) > 0.08 || Math.abs(joy.y) > 0.08)) {
    walking = true;
    const camB = map.getBearing();
    const ang = Math.atan2(joy.x, -joy.y) * 180 / Math.PI; // 0 = вперёд по экрану
    const want = camB + ang, mag = Math.min(1, Math.hypot(joy.x, joy.y));
    const speed = (running ? 16 : 6) * mag; // м/с: шаг ~6, бег ~16 (игровая скорость)
    pos = move(pos, speed * dt, want); heading = want;
    hero.setLngLat(pos);
    heroEl.querySelector('.cone').style.transform = `rotate(${ang}deg)`;
    // камера мягко догоняет направление движения при движении вперёд
    const turn = (((want - camB) + 540) % 360) - 180;
    map.jumpTo({ center: pos, bearing: camB + (Math.abs(ang) < 100 ? turn * 1.6 * dt : 0) });
    if ((saveT += dt) > 1) { saveT = 0; save(); nearest() }
  } else if (walking) { walking = false; save(); nearest(); heroEl && (heroEl.querySelector('.cone').style.transform = '') }
  requestAnimationFrame(loop);
}

function update() { if (!map || !ready) return; paintHero(); if (!markers.length && places().length) addWorld(); nearest() }
function resize() { map && setTimeout(() => map.resize(), 60) }
window.City = { init, restyle, update, resize };
})();
