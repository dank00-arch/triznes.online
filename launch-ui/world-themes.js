/* TRIZNES WORLD THEMES controller
   Persists a single visual lens across Launch UI without changing facts/data. */
(() => {
  'use strict';
  const KEY = 'triznes-world-lens-v2';
  const MODES = new Set(['paradise','cyber']);
  const body = document.body;
  const page = (location.pathname.split('/').pop() || 'home.html').replace('.html','');

  function requestedMode(){
    const q = new URLSearchParams(location.search).get('world');
    if (MODES.has(q)) return q;
    try {
      const saved = localStorage.getItem(KEY);
      if (MODES.has(saved)) return saved;
    } catch (_) {}
    return 'paradise';
  }

  function syncButtons(mode){
    document.querySelectorAll('[data-world-choice]').forEach((btn) => {
      const on = btn.dataset.worldChoice === mode;
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    const seg = document.querySelector('.page-world-map .seg');
    if (seg) {
      [...seg.querySelectorAll('button')].forEach((btn) => {
        const text = btn.textContent.toLowerCase();
        const target = /рай/.test(text) ? 'paradise' : /cyber/.test(text) ? 'cyber' : '';
        if (target) {
          const on = target === mode;
          btn.classList.toggle('on', on);
          btn.setAttribute('aria-selected', String(on));
          btn.dataset.worldChoice = target;
        }
      });
    }
  }

  function recolorMap(mode){
    const map = document.querySelector('.page-world-map .mapwrap');
    if (!map) return;
    const gl1 = map.querySelector('#gl1');
    const gl2 = map.querySelector('#gl2');
    if (gl1) {
      const stops = gl1.querySelectorAll('stop');
      if (mode === 'paradise') {
        stops[0]?.setAttribute('stop-color','#78e1bd');
        stops[1]?.setAttribute('stop-color','#e8c879');
      } else {
        stops[0]?.setAttribute('stop-color','#2877ff');
        stops[1]?.setAttribute('stop-color','#ff2ec8');
      }
    }
    if (gl2) {
      const stops = gl2.querySelectorAll('stop');
      if (mode === 'paradise') {
        stops[0]?.setAttribute('stop-color','#b4d88d');
        stops[1]?.setAttribute('stop-color','#78e1bd');
      } else {
        stops[0]?.setAttribute('stop-color','#8058ff');
        stops[1]?.setAttribute('stop-color','#35e9ff');
      }
    }
  }

  function apply(mode, persist=true){
    if (!MODES.has(mode)) mode = 'paradise';
    body.dataset.world = mode;
    document.documentElement.dataset.world = mode;
    if (persist) {
      try { localStorage.setItem(KEY, mode); } catch (_) {}
    }
    syncButtons(mode);
    recolorMap(mode);
    window.dispatchEvent(new CustomEvent('triznes:world-change',{detail:{world:mode}}));
  }

  function switchMarkup(extra=''){
    return `<div class="tc-world-switch-wrap ${extra}"><div class="tc-world-switch-label">Оптика мира</div><div class="tc-world-switch" role="group" aria-label="Оптика мира"><button type="button" data-world-choice="paradise">РАЙ</button><button type="button" data-world-choice="cyber">CYBER</button></div></div>`;
  }

  function mountGlobalSwitch(){
    if (document.querySelector('.tc-world-switch-wrap')) return;
    const rail = document.querySelector('.tc-rail');
    if (rail && matchMedia('(min-width:900px)').matches) {
      const state = rail.querySelector('.tc-rail-state');
      state?.insertAdjacentHTML('afterend', switchMarkup());
      return;
    }
    document.body.insertAdjacentHTML('beforeend', switchMarkup('tc-world-switch-floating'));
  }

  function bind(){
    document.addEventListener('click',(event) => {
      const btn = event.target.closest('[data-world-choice]');
      if (!btn) return;
      event.preventDefault();
      apply(btn.dataset.worldChoice,true);
    });

    const seg = document.querySelector('.page-world-map .seg');
    if (seg) {
      [...seg.querySelectorAll('button')].forEach((btn) => {
        const text = btn.textContent.toLowerCase();
        if (/рай/.test(text)) btn.dataset.worldChoice = 'paradise';
        if (/cyber/.test(text)) btn.dataset.worldChoice = 'cyber';
      });
    }
  }

  function boot(){
    mountGlobalSwitch();
    bind();
    apply(requestedMode(),false);

    if (page === 'world-map') {
      const note = document.querySelector('.tc-map-note');
      if (note) note.textContent = 'REAL-карта одна. РАЙ и CYBER меняют только художественную оптику и игровой интерфейс, не факты и координаты.';
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
