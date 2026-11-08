(function(){
  'use strict';
  var LIVE='https://bbxhhtpmbtgfaxamgksf.supabase.co/functions/v1/creatomate-render-inspect?pult=1';
  var QUEUE='./content-queue.json';
  var REFRESH_MS=60000;
  var css=`
  .living-runtime{order:-9;gap:10px}
  .lr-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-end;flex-wrap:wrap}
  .lr-kicker{font:700 10px var(--display);letter-spacing:.22em;color:var(--c4)}
  .lr-head h2{color:var(--fg);font-size:13px;letter-spacing:.18em}
  .lr-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
  .lr-card{min-height:112px;padding:13px;border-radius:16px;border:1px solid var(--line);background:linear-gradient(155deg,color-mix(in srgb,var(--panel) 96%,#000),color-mix(in srgb,var(--panel) 88%,var(--c4)));display:flex;flex-direction:column;gap:7px}
  .lr-card.primary{grid-column:1/-1;background:linear-gradient(125deg,color-mix(in srgb,var(--c4) 16%,var(--panel)),color-mix(in srgb,var(--c2) 10%,var(--panel)))}
  .lr-card .k{font:700 9px var(--display);letter-spacing:.16em;color:var(--muted)}
  .lr-card .v{font:900 17px/1.25 var(--display)}
  .lr-card .s{font:12px/1.45 var(--ui);color:var(--muted)}
  .lr-card .move{font:800 14px/1.42 var(--ui);color:var(--fg)}
  .lr-flow{display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;padding:2px 0 4px}
  .lr-flow::-webkit-scrollbar{display:none}
  .lr-flow span{flex:none;padding:5px 8px;border:1px solid var(--line);border-radius:999px;font:700 9px var(--display);letter-spacing:.06em;color:var(--muted)}
  .lr-flow span.on{color:#07110d;background:var(--c4);border-color:var(--c4)}
  .lr-live{display:inline-flex;align-items:center;gap:6px}.lr-live i{width:7px;height:7px;border-radius:50%;background:var(--c4);box-shadow:0 0 10px var(--c4)}.lr-live.stale i{background:var(--c3);box-shadow:none}
  @media(max-width:420px){.lr-grid{grid-template-columns:1fr}.lr-card.primary{grid-column:auto}}
  `;
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
  function ensure(){var app=document.getElementById('app');if(!app)return null;if(!document.getElementById('living-runtime-style')){var st=document.createElement('style');st.id='living-runtime-style';st.textContent=css;document.head.appendChild(st)}var sec=document.getElementById('living-runtime');if(!sec){sec=document.createElement('section');sec.id='living-runtime';sec.className='sec living-runtime';var chars=document.getElementById('character-first');if(chars)chars.insertAdjacentElement('afterend',sec);else{var h=app.querySelector('header.bar');if(h)h.insertAdjacentElement('afterend',sec);else app.prepend(sec)}}return sec}
  function readyCount(q){var p=(q&&q.pipeline)||[];var x=p.find(function(i){return i.key==='ready'});return Number(x&&x.count||0)}
  function gateState(q){var g=(q&&q.gates)||[];if(!g.length)return {ok:0,wait:0};return g.reduce(function(a,x){String(x.state).toLowerCase()==='ok'?a.ok++:a.wait++;return a},{ok:0,wait:0})}
  function sceneFrom(c){var n=String(c&&c.next_step||'').toLowerCase();if(/снять|кадр|съём/.test(n))return ['ЖДЁТ РЕАЛЬНУЮ СЦЕНУ','Квест открыт; съёмка не считается начатой, пока нет подтверждённого материала.'];if(/открыть|просмотр/.test(n))return ['СЦЕНА СНЯТА · НУЖЕН ХОД','Следующий шаг сейчас не камера, а подтверждённое действие персонажа.'];return ['В ИГРЕ','Пульт показывает только подтверждённый следующий шаг, без выдумывания происходящего.']}
  function paint(live,q,mode){var sec=ensure();if(!sec)return;var chars=(live&&live.characters)||[];var key=String(live&&live.featured||'').toUpperCase();var c=chars.find(function(x){return String(x.key||'').toUpperCase()===key})||chars[0]||null;var scene=sceneFrom(c),g=gateState(q),ready=readyCount(q);var flow=['ПЕРСОНАЖ','КВЕСТ','СЦЕНА','ЗАГРУЗКА','НЕЙРОФЕРМА','PINK NOIZE','QC + ПРАВА','SOCHIWOOD','НОВЫЙ КВЕСТ'];var active=/снять|кадр|съём/.test(String(c&&c.next_step||'').toLowerCase())?2:1;var stamp=live&&live.updated_at_utc?new Date(live.updated_at_utc).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}):'—';sec.innerHTML='<div class="lr-head"><div><div class="lr-kicker">ЖИВАЯ ИГРА · RUNTIME</div><h2>ЧТО ПРОИСХОДИТ ПРЯМО СЕЙЧАС</h2></div><span class="mono lr-live '+(mode==='live'?'':'stale')+'"><i></i>'+esc(mode==='live'?'Supabase live':'fallback')+' · '+esc(stamp)+'</span></div><div class="lr-grid"><div class="lr-card primary"><span class="k">ГЛАВНЫЙ ПЕРСОНАЖ / ХОД</span><span class="v">'+esc(c?c.label||c.key:'Нет подтверждённого персонажа')+'</span><span class="move">'+esc(c&&c.next_step||'Ждём подтверждённый следующий ход')+'</span></div><div class="lr-card"><span class="k">РЕАЛЬНАЯ СЦЕНА</span><span class="v">'+esc(scene[0])+'</span><span class="s">'+esc(scene[1])+'</span></div><div class="lr-card"><span class="k">КИНО / READY GATE</span><span class="v">'+esc(ready)+' READY</span><span class="s">Ворота: '+esc(g.ok)+' пройдено · '+esc(g.wait)+' ждут. RAW и внутренний render не считаются опубликованным READY.</span></div></div><div class="lr-flow">'+flow.map(function(x,i){return '<span class="'+(i===active?'on':'')+'">'+esc(x)+'</span>'}).join('')+'</div><div class="mono">Пульт наблюдает и маршрутизирует. Он не публикует сам и не обходит согласия, QC или права.</div>'}
  async function load(){var live=null,q=null,mode='fallback';try{var r=await fetch(LIVE,{cache:'no-store'});if(r.ok){live=await r.json();if(live&&live.ok!==false&&Array.isArray(live.characters))mode='live'}}catch(e){}try{var rq=await fetch(QUEUE,{cache:'no-store'});if(rq.ok)q=await rq.json()}catch(e){}if(!live){try{var rf=await fetch('./characters.json',{cache:'no-store'});if(rf.ok)live=await rf.json()}catch(e){}}paint(live||{},q||{},mode)}
  load();setInterval(function(){if(!document.hidden)load()},REFRESH_MS);document.addEventListener('visibilitychange',function(){if(!document.hidden)load()});
})();
