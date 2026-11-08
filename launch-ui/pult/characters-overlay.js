(function(){
  'use strict';
  var LIVE='https://bbxhhtpmbtgfaxamgksf.supabase.co/functions/v1/creatomate-render-inspect?pult=1';
  var FALLBACK='./characters.json';
  var REFRESH_MS=60000;
  var css=`
  .character-first{order:-10;gap:12px}
  .character-first .cf-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-end;flex-wrap:wrap}
  .character-first .cf-head h2{color:var(--fg);font-size:13px;letter-spacing:.18em}
  .character-first .cf-kicker{font:700 10px var(--display);letter-spacing:.22em;color:var(--c1)}
  .character-track{display:flex;gap:11px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding:2px 2px 8px;-webkit-overflow-scrolling:touch}
  .character-track::-webkit-scrollbar{display:none}
  .character-card{scroll-snap-align:start;flex:0 0 min(88vw,350px);border:1px solid var(--line);border-radius:20px;background:linear-gradient(160deg,color-mix(in srgb,var(--panel) 95%,#000),color-mix(in srgb,var(--panel) 82%,var(--c1)));padding:16px;display:flex;flex-direction:column;gap:12px;box-shadow:0 18px 50px rgba(0,0,0,.22)}
  .character-card.featured{border-color:color-mix(in srgb,var(--c1) 60%,var(--line));box-shadow:0 0 0 1px color-mix(in srgb,var(--c1) 14%,transparent),0 24px 70px color-mix(in srgb,var(--c1) 14%,transparent)}
  .character-card .cc-top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
  .character-card .cc-name{font:900 23px/1 var(--display);letter-spacing:.02em}
  .character-card .cc-tag{margin-top:7px;color:var(--muted);font:700 12px/1.35 var(--ui)}
  .cc-state{flex:none;border:1px solid var(--line);border-radius:999px;padding:5px 9px;font:700 9px var(--display);letter-spacing:.12em;color:var(--c2)}
  .cc-state.wait{color:var(--c3)}
  .cc-meters{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
  .cc-meter{border:1px solid var(--line);background:rgba(255,255,255,.025);border-radius:12px;padding:9px;min-width:0}
  .cc-meter span{display:block;font:700 8px var(--display);letter-spacing:.12em;color:var(--muted);margin-bottom:4px}
  .cc-meter b{font:900 14px var(--ui);word-break:break-word}
  .cc-facts{display:grid;gap:7px}
  .cc-fact{display:grid;grid-template-columns:92px 1fr;gap:8px;padding:8px 0;border-top:1px solid color-mix(in srgb,var(--line) 65%,transparent);font-size:12px;line-height:1.35}
  .cc-fact:first-child{border-top:0}
  .cc-fact .k{font:700 9px var(--display);letter-spacing:.1em;color:var(--muted)}
  .cc-fact .v.ok{color:var(--c4)} .cc-fact .v.warn{color:var(--c3)} .cc-fact .v.none{color:var(--muted)}
  .cc-blocker{padding:10px 11px;border-radius:12px;border:1px solid color-mix(in srgb,var(--c3) 38%,var(--line));background:color-mix(in srgb,var(--c3) 7%,var(--panel));font-size:12px;line-height:1.4}
  .cc-blocker b{display:block;font:700 9px var(--display);letter-spacing:.16em;color:var(--c3);margin-bottom:4px}
  .cc-next{padding:12px;border-radius:12px;background:linear-gradient(120deg,var(--c1),color-mix(in srgb,var(--c1) 58%,var(--c2)));color:#09050e;font:800 13px/1.4 var(--ui)}
  .cc-next b{display:block;font:800 9px var(--display);letter-spacing:.16em;opacity:.72;margin-bottom:4px}
  .cc-proof{border-top:1px solid var(--line);padding-top:9px}
  .cc-proof summary{cursor:pointer;color:var(--muted);font:700 9px var(--display);letter-spacing:.14em}
  .cc-proof ul{padding-left:18px;margin:8px 0 0;color:var(--muted);font:11px/1.45 var(--mono)}
  .cc-note{font:11px/1.45 var(--mono);color:var(--muted)}
  .cc-live{display:inline-flex;gap:6px;align-items:center}.cc-live i{width:7px;height:7px;border-radius:50%;background:var(--c4);box-shadow:0 0 10px var(--c4)}.cc-live.fallback i{background:var(--c3);box-shadow:none}
  @media(max-width:420px){.character-card{flex-basis:92vw}.cc-meters{grid-template-columns:repeat(3,minmax(0,1fr))}.cc-meter{padding:8px 6px}.cc-fact{grid-template-columns:82px 1fr}}
  `;
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
  function state(v){
    var map={ACTIVE:['активна','ok'],DELIVERED:['доставлено','ok'],READY:['готово','ok'],OPENED:['открыто','ok'],ACKNOWLEDGED:['подтверждено','ok'],CONFIRMED:['подтверждено','ok'],UNCONFIRMED:['просмотр не подтверждён','warn'],UNKNOWN:['нет данных','none'],OWNER_ARCHIVE_READY:['архив готов','ok'],CANONICAL_FIXED:['контакт связан','ok'],EXPIRED:['срок завершён','warn'],REVIEW_REQUIRED:['нужна сверка','warn'],NEEDS_CONFIRMATION:['нужно подтверждение','warn'],QUEUED:['в очереди','warn'],FAILED:['ошибка','warn'],REVOKED:['снято','none']};
    return map[v]||[String(v||'—'),'none'];
  }
  function fact(k,v){var s=state(v);return '<div class="cc-fact"><span class="k">'+esc(k)+'</span><span class="v '+s[1]+'">'+esc(s[0])+'</span></div>'}
  function renderCard(c,featured){
    var p=c.presentation||{}, card=c.card||{}, media=c.media||{}, contact=c.contact||{};
    return '<article class="character-card'+(featured?' featured':'')+'">'+
      '<div class="cc-top"><div><div class="cc-kicker">'+(featured?'ГЛАВНЫЙ ФОКУС СЕЙЧАС':'ПЕРСОНАЖ')+'</div><div class="cc-name">'+esc(c.label||c.key)+'</div><div class="cc-tag">'+esc(c.tagline||'')+'</div></div><span class="cc-state '+(c.status==='WAITING'?'wait':'')+'">'+esc(c.status==='WAITING'?'ЖДЁМ':'В ИГРЕ')+'</span></div>'+
      '<div class="cc-meters"><div class="cc-meter"><span>LEVEL</span><b>'+esc(c.level==null?'—':c.level)+'</b></div><div class="cc-meter"><span>XP</span><b>'+esc(c.xp==null?'—':c.xp)+'</b></div><div class="cc-meter"><span>LUBICOIN</span><b>'+esc(c.lubicoin==null?'—':c.lubicoin)+'</b></div></div>'+
      '<div class="cc-facts">'+fact('КАРТА',card.state)+fact('ПРЕЗЕНТАЦИЯ',p.state)+fact('ПРОСМОТР',p.view_state)+fact('МЕДИА',media.state)+fact('КОНТАКТ',contact.state)+'</div>'+
      (p.note?'<div class="cc-note">'+esc(p.note)+'</div>':'')+
      (card.note?'<div class="cc-note">'+esc(card.note)+'</div>':'')+
      '<div class="cc-blocker"><b>БЛОКЕР / РЕШЕНИЕ</b>'+esc(c.blocker||'Подтверждённого блокера нет')+'</div>'+
      '<div class="cc-next"><b>ОДИН СЛЕДУЮЩИЙ ШАГ</b>'+esc(c.next_step||'Продолжить реальный игровой путь')+'</div>'+
      '<details class="cc-proof"><summary>ЧЕМ ПОДТВЕРЖДЕНО</summary><ul>'+((c.proof||[]).map(function(x){return '<li>'+esc(x)+'</li>'}).join('')||'<li>нет данных</li>')+'</ul></details>'+
    '</article>';
  }
  function ensureSection(){
    var app=document.getElementById('app');if(!app)return null;
    if(!document.getElementById('character-first-style')){var style=document.createElement('style');style.id='character-first-style';style.textContent=css;document.head.appendChild(style)}
    var sec=document.getElementById('character-first');
    if(!sec){sec=document.createElement('section');sec.id='character-first';sec.className='sec character-first';sec.setAttribute('aria-labelledby','h-characters');var header=app.querySelector('header.bar');if(header)header.insertAdjacentElement('afterend',sec);else app.prepend(sec)}
    return sec;
  }
  function paint(data,mode){
    var sec=ensureSection();if(!sec)return;
    var chars=(data&&data.characters)||[];
    var stamp=data&&data.updated_at_utc?new Date(data.updated_at_utc).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}):'—';
    sec.innerHTML='<div class="cf-head"><div><div class="cf-kicker">ПЕРСОНАЖИ — ЖИВОЙ КОНТУР</div><h2 id="h-characters">КТО СЕЙЧАС ДВИЖЕТСЯ</h2></div><span class="mono cc-live '+(mode==='fallback'?'fallback':'')+'"><i></i>'+(mode==='fallback'?'fallback':'live Supabase')+' · '+esc(stamp)+'</span></div><div class="character-track">'+
      (chars.length?chars.map(function(c){return renderCard(c,String(c.key).toUpperCase()===String(data.featured||'').toUpperCase())}).join(''):'<div class="tile"><span class="v none">Нет данных о персонажах</span></div>')+
      '</div><div class="cc-note">Пульт наблюдает состояние автоматически. Операционный источник задач остаётся ClickUp.</div>';
  }
  async function load(){
    try{var r=await fetch(LIVE,{cache:'no-store'});if(!r.ok)throw new Error('live_'+r.status);var d=await r.json();if(!d||d.ok===false||!Array.isArray(d.characters))throw new Error('live_bad');paint(d,'live');return true}catch(e){
      try{var f=await fetch(FALLBACK,{cache:'no-store'});if(!f.ok)throw 0;paint(await f.json(),'fallback')}catch(_){paint({featured:'',characters:[]},'fallback')}return false
    }
  }
  load();
  setInterval(function(){if(!document.hidden)load()},REFRESH_MS);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)load()});
})();
