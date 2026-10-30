/* TRIZNES — strong ideas carried from legacy public surfaces into Launch UI.
   No legacy data model is imported. Only interaction/narrative patterns are reused. */
(() => {
  'use strict';
  const page = (location.pathname.split('/').pop() || 'home.html').replace('.html','');
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const style = document.createElement('style');
  style.textContent = `
    .tc-legacy-strength{margin:18px 0;border:1px solid rgb(255 255 255 / .10);border-radius:22px;padding:18px;background:linear-gradient(145deg,rgb(52 231 255 / .055),rgb(255 43 214 / .035));}
    .tc-legacy-strength .tc-k{font:800 10px/1.2 ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;color:var(--cyan,#34e7ff)}
    .tc-legacy-strength h2{margin:7px 0 8px;font-size:clamp(24px,5vw,38px);letter-spacing:-.04em}
    .tc-legacy-strength p{margin:0;color:var(--n-700,#b9b3c2);line-height:1.55}
    .tc-world-lenses{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}.tc-world-lens{padding:14px;border:1px solid rgb(255 255 255 / .09);border-radius:16px;background:rgb(255 255 255 / .025)}
    .tc-world-lens b{display:block;margin-bottom:4px}.tc-world-lens small{color:var(--n-600,#9f98aa);line-height:1.45}.tc-world-lens.paradise b{color:#79ffd0}.tc-world-lens.cyber b{color:#ff62c6}
    .tc-cycle{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:14px}.tc-cycle span{padding:10px;border-radius:14px;border:1px solid rgb(255 255 255 / .08);font-size:11px;font-weight:800;text-align:center}.tc-cycle i{display:block;font-style:normal;color:var(--cyan,#34e7ff);font:800 9px ui-monospace,monospace;margin-bottom:4px}
    .tc-live-cinema{margin:12px 0 18px}.tc-live-cinema video{width:100%;max-height:68vh;display:block;border-radius:18px;background:#000;object-fit:cover}.tc-live-list{display:flex;gap:8px;overflow:auto;padding:10px 0 2px}.tc-live-item{min-width:180px;text-align:left;padding:11px;border-radius:14px;border:1px solid rgb(255 255 255 / .10);background:rgb(255 255 255 / .03);color:inherit}.tc-live-item.on{border-color:rgb(52 231 255 / .55);box-shadow:0 0 24px rgb(52 231 255 / .08)}.tc-live-item b{display:block;font-size:12px}.tc-live-item small{display:block;margin-top:4px;color:var(--n-600,#9f98aa)}
    .tc-signal-rule{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:12px}.tc-signal-rule span{font:800 10px ui-monospace,monospace;padding:6px 8px;border-radius:999px;border:1px solid rgb(255 255 255 / .1)}
    @media(max-width:720px){.tc-cycle{grid-template-columns:1fr}.tc-world-lenses{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  function insertBefore(selector, html){
    const target = document.querySelector(selector);
    if (target && !document.querySelector('.tc-legacy-strength')) target.insertAdjacentHTML('beforebegin', html);
  }

  function homeIdeas(){
    const pulse = document.querySelector('.page-home .pulse')?.closest('.section');
    if (!pulse) return;
    pulse.insertAdjacentHTML('beforebegin', `
      <section class="section tc-legacy-strength">
        <div class="tc-k">ONE CITY · TWO LENSES</div>
        <h2>Один реальный Сочи. Две игровые оптики.</h2>
        <p>РАЙ и CYBER не конкурируют с фактом. Это два способа увидеть и развивать одну реальность: через изобилие, любовь и творчество — или через контраст, задачу и игровой интерфейс.</p>
        <div class="tc-world-lenses"><div class="tc-world-lens paradise"><b>РАЙ</b><small>Что уже можно усилить светом, связью, красотой и человеческим действием.</small></div><div class="tc-world-lens cyber"><b>CYBER</b><small>Что можно превратить в понятную задачу, маршрут, квест и измеримый следующий шаг.</small></div></div>
        <div class="tc-signal-rule"><span>ЛЮДИ — ГЛАВНЫЕ СПЕЦЭФФЕКТЫ</span><span>СИГНАЛ → ДЕЙСТВИЕ</span><span>ДЕЙСТВИЕ → СЦЕНА</span></div>
      </section>`);
  }

  function mapIdeas(){
    const seg = document.querySelector('.page-world-map .seg');
    if (!seg || document.querySelector('.tc-map-note')) return;
    seg.insertAdjacentHTML('afterend','<div class="tc-map-note muted t-caption" style="text-align:center;margin-top:8px">РАЙ / CYBER — художественные линзы поверх одной подтверждённой карты. REAL-места остаются неизменными.</div>');
  }

  function boardsIdeas(){
    const first = document.querySelector('.page-boards .section');
    if (!first || document.querySelector('.tc-signal-action')) return;
    first.insertAdjacentHTML('afterend',`<section class="section tc-legacy-strength tc-signal-action"><div class="tc-k">LIVE RADAR → NEXT ACTION</div><h2>Новость ценна, когда из неё рождается сцена.</h2><p>Сигнал из города не становится заданием автоматически. Сначала проверяем факт и связь с человеком, затем предлагаем безопасный игровой шаг.</p><div class="tc-signal-rule"><span>ФАКТ</span><span>СВЯЗЬ</span><span>ГИПОТЕЗА</span><span>КВЕСТ</span><span>ПОДТВЕРЖДЕНИЕ ГЕРОЯ</span></div></section>`);
  }

  async function cinemaIdeas(){
    const root = document.querySelector('.page-sochiwood .screen');
    if (!root || document.querySelector('.tc-live-cinema')) return;
    const heroSection = root.querySelector('section');
    const cycle = `<section class="section tc-legacy-strength"><div class="tc-k">LIFE CINEMA LOOP</div><h2>Смотри. Входи. Проживай. Возвращай историю в кино.</h2><p>Кинотеатр — не отдельный старый сайт, а один из режимов нового мира.</p><div class="tc-cycle"><span><i>01</i>СМОТРИ</span><span><i>02</i>ВОЙДИ</span><span><i>03</i>СТАНЬ ПЕРСОНАЖЕМ</span><span><i>04</i>ПРОЖИВИ СЦЕНУ</span><span><i>05</i>ПРЕМЬЕРА</span></div></section>`;
    const firstSection = root.querySelector('.section');
    firstSection?.insertAdjacentHTML('beforebegin', cycle);

    const endpoint = 'https://bbxhhtpmbtgfaxamgksf.supabase.co/functions/v1/triznes-media-signed-url?public_watch=1';
    try {
      const response = await fetch(endpoint,{cache:'no-store'});
      const data = await response.json();
      if (!response.ok || !data?.ok) return;
      const items = (data.items || []).filter(x => x.url);
      if (!items.length) return;
      const cinema = document.createElement('section');
      cinema.className = 'section tc-live-cinema';
      cinema.innerHTML = `<div class="t-eyebrow">SOCHIWOOD · READY / PUBLIC</div><h2 class="t-h2" style="margin-top:6px">Сейчас в кино</h2><video controls playsinline preload="metadata"></video><div class="tc-live-list"></div>`;
      if (heroSection) heroSection.insertAdjacentElement('afterend',cinema); else root.prepend(cinema);
      const video = cinema.querySelector('video');
      const list = cinema.querySelector('.tc-live-list');
      const play = (index) => {
        const item = items[index]; if (!item) return;
        video.src = item.url; video.poster = item.poster_url || '';
        video.play().catch(()=>{});
        [...list.children].forEach((el,i)=>el.classList.toggle('on',i===index));
      };
      list.innerHTML = items.map((item,index)=>`<button class="tc-live-item" data-i="${index}"><b>${esc(item.title || item.series_title || 'TRIZNES')}</b><small>${esc((item.content_class || item.content_type || 'КИНО').toUpperCase())}</small></button>`).join('');
      list.addEventListener('click',(event)=>{const btn=event.target.closest('[data-i]'); if(btn) play(Number(btn.dataset.i));});
      play(0);
      document.querySelectorAll('.page-sochiwood a').forEach(link=>{
        if (/смотреть|трейлер|весь зал/i.test(link.textContent)) {
          link.href = '#';
          link.onclick = (event)=>{event.preventDefault();cinema.scrollIntoView({behavior:'smooth',block:'start'});video.play().catch(()=>{});};
        }
      });
    } catch (_) {}
  }

  function boot(){
    if (page === 'home') homeIdeas();
    if (page === 'world-map') mapIdeas();
    if (page === 'boards') boardsIdeas();
    if (page === 'sochiwood') cinemaIdeas();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();