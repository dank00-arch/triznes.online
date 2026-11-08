/* КАРТА МИРА: один экран со всеми контурами проекта.
   Читает world-map.json (обезличенный снимок) и system-status.json (живая проверка).
   Только показывает: решения оператора становятся строкой для ассистента, сам Пульт ничего не запускает. */
(function(){
  'use strict';
  var KEY='pult-map-dec';
  var STATES={
    stop:{t:'СТОП',c:'#ff6b7a'},
    wait:{t:'ЖДЁМ',c:'var(--c3)'},
    watch:{t:'НА ПРОВЕРКЕ',c:'var(--c2)'},
    live:{t:'В ИГРЕ',c:'var(--c4)'}
  };
  var RANK={stop:0,wait:1,watch:2,live:3};
  var css=[
    '#app>header.bar{order:-30}',
    '.wm{order:-20;gap:12px}',
    '.wm-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-end;flex-wrap:wrap}',
    '.wm-kicker{font:700 10px var(--display);letter-spacing:.22em;color:var(--c2)}',
    '.wm-head h2{color:var(--fg);font-size:13px;letter-spacing:.18em}',
    '.wm-stale{color:var(--c3)}',
    '.wm-pulse{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}',
    '.wm-p{padding:10px 8px;border-radius:12px;background:var(--panel);border:1px solid var(--line);display:flex;flex-direction:column;gap:2px;min-width:0}',
    '.wm-p b{font:900 24px var(--display);font-variant-numeric:tabular-nums;color:var(--tone)}',
    '.wm-p span{font:700 8px var(--display);letter-spacing:.06em;color:var(--muted);overflow-wrap:anywhere}',
    '.wm-top{padding:14px;border-radius:14px;border:1px solid var(--tone);background:color-mix(in srgb,var(--tone) 10%,var(--panel));display:flex;flex-direction:column;gap:6px}',
    '.wm-top .k{font:700 10px var(--display);letter-spacing:.2em;color:var(--tone)}',
    '.wm-top p{margin:0;font:800 15px/1.4 var(--ui)}',
    '.wm-top .n{font:600 13px/1.45 var(--ui);color:var(--muted)}',
    '.wm-list{display:flex;flex-direction:column;gap:8px}',
    '.wm-c{border-radius:14px;background:var(--panel);border:1px solid var(--line);border-left:3px solid var(--tone);min-width:0}',
    '.wm-c summary{list-style:none;cursor:pointer;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;align-items:center;padding:12px 14px;min-height:44px}',
    '.wm-c summary::-webkit-details-marker{display:none}',
    '.wm-c summary:focus-visible{outline:2px solid var(--c2);outline-offset:2px}',
    '.wm-l{font:800 12px var(--display);letter-spacing:.1em;overflow-wrap:anywhere}',
    '.wm-s{display:inline-flex;align-items:center;gap:6px;font:700 9px var(--display);letter-spacing:.1em;color:var(--tone);white-space:nowrap}',
    '.wm-s i{width:8px;height:8px;border-radius:50%;background:currentColor}',
    '.wm-c[data-s="stop"] .wm-s i{animation:pulse 1.8s ease-in-out infinite}',
    '.wm-t{grid-column:1/-1;font:600 13px/1.4 var(--ui);color:var(--muted)}',
    '.wm-b{padding:0 14px 14px;display:flex;flex-direction:column;gap:10px;font:14px/1.5 var(--ui)}',
    '.wm-b p{margin:0}',
    '.wm-nums{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}',
    '.wm-n{padding:8px 10px;border-radius:10px;border:1px solid var(--line);min-width:0}',
    '.wm-n b{display:block;font:900 16px var(--display);overflow-wrap:anywhere}',
    '.wm-n span{font:600 11px/1.3 var(--ui);color:var(--muted)}',
    '.wm-lab{display:block;font:700 9px var(--display);letter-spacing:.18em;color:var(--muted);margin-bottom:2px}',
    '.wm-next{padding:10px 12px;border-radius:10px;background:color-mix(in srgb,var(--c1) 14%,var(--panel));font-weight:800}',
    '.wm-pr{font:12px/1.4 var(--mono);color:var(--muted);overflow-wrap:anywhere}',
    '.wm-d{padding:12px 14px;border-radius:14px;background:var(--panel);border:1px solid var(--line);display:flex;flex-direction:column;gap:8px}',
    '.wm-d b{font:800 14px var(--ui)}',
    '.wm-d span{font:13px/1.45 var(--ui);color:var(--muted)}',
    '.wm-acts{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '.wm-acts button,.wm-copy{min-height:48px;border-radius:12px;border:1px solid var(--line);background:transparent;color:var(--fg);font:800 12px var(--display);letter-spacing:.08em;cursor:pointer}',
    '.wm-acts button[data-d="yes"]{background:var(--c4);color:#06130e;border-color:var(--c4)}',
    '.wm-acts button[aria-pressed="true"]{outline:2px solid var(--c2);outline-offset:1px}',
    '.wm-out{font:13px/1.45 var(--mono);color:var(--muted);padding:10px 12px;border-radius:12px;border:1px solid var(--line);overflow-wrap:anywhere}',
    '.wm-copy{width:100%;background:var(--c1);color:#0b0610;border-color:var(--c1)}',
    '.wm-copy[hidden]{display:none}'
  ].join('');
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
  function get(u){return fetch(u,{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json()}).catch(function(){return null})}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
  function save(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}}
  function msk(iso){try{return new Date(iso).toLocaleString('ru-RU',{timeZone:'Europe/Moscow',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})+' МСК'}catch(e){return ''}}
  function tone(s){return (STATES[s]||STATES.watch).c}

  /* Живая проверка важнее снимка: контур не покажет «В ИГРЕ», если адрес не отвечает. */
  function merge(M,Y){
    var sys={};(Y&&Y.systems||[]).forEach(function(x){sys[x.id]=x});
    return (M.contours||[]).map(function(c){
      var out=Object.assign({},c),s=c.live&&sys[c.live];
      if(s){
        if(s.state!=='ok'&&out.state!=='stop'){out.state='stop';out.fact='Живая проверка: адрес не отвечает. '+out.fact}
        else if(s.state==='ok'&&c.id==='entry'){out.state='watch';out.fact='Живая проверка: сайт снова отвечает. Снимок ниже устарел, контур надо перепроверить.'}
      }
      return out;
    });
  }
  function contour(c){
    var st=STATES[c.state]||STATES.watch;
    return '<details class="wm-c" data-s="'+esc(c.state)+'" style="--tone:'+st.c+'"'+'><summary><span class="wm-l">'+esc(c.label)+'</span><span class="wm-s"><i></i>'+esc(st.t)+'</span><span class="wm-t">'+esc(c.fact)+'</span></summary><div class="wm-b">'
      +'<div class="wm-nums">'+(c.numbers||[]).map(function(n){return '<div class="wm-n"><b>'+esc(n[1])+'</b><span>'+esc(n[0])+'</span></div>'}).join('')+'</div>'
      +(c.blocker?'<p><span class="wm-lab">ЧТО ДЕРЖИТ</span>'+esc(c.blocker)+'</p>':'')
      +'<p class="wm-next"><span class="wm-lab">ОДИН СЛЕДУЮЩИЙ ШАГ</span>'+esc(c.next)+'</p>'
      +'<p><span class="wm-lab">ВЕДЁТ</span>'+esc(c.lead)+'</p>'
      +'<p class="wm-pr"><span class="wm-lab">ЧЕМ ПОДТВЕРЖДЕНО</span>'+esc(c.proof)+'</p></div></details>';
  }
  function decisionsLine(M,D){
    return (M.decisions||[]).filter(function(d){return D[d.id]==='yes'}).map(function(d){return d.id+': '+d.line});
  }
  function paintOut(sec,M,D){
    var L=decisionsLine(M,D),out=sec.querySelector('#wmOut'),btn=sec.querySelector('#wmCopy');
    out.textContent=L.length?'Да от оператора — '+L.join('; ')+'.':'Отметь решения: здесь появится строка для ассистента. Сам Пульт ничего не запускает.';
    btn.hidden=!L.length;btn.textContent='СКОПИРОВАТЬ СТРОКУ';
    Array.prototype.forEach.call(sec.querySelectorAll('.wm-d'),function(el){Array.prototype.forEach.call(el.querySelectorAll('button'),function(b){b.setAttribute('aria-pressed',String(D[el.dataset.id]===b.dataset.d))})});
  }
  function paint(M,Y){
    var app=document.getElementById('app');if(!app||!M)return;
    if(!document.getElementById('wm-style')){var st=document.createElement('style');st.id='wm-style';st.textContent=css;document.head.appendChild(st)}
    var sec=document.getElementById('world-map');
    if(!sec){sec=document.createElement('section');sec.id='world-map';sec.className='sec wm';sec.setAttribute('aria-labelledby','wm-h');app.querySelector('header.bar').insertAdjacentElement('afterend',sec)}
    var list=merge(M,Y).sort(function(a,b){return RANK[a.state]-RANK[b.state]});
    var count={stop:0,wait:0,watch:0,live:0};list.forEach(function(c){count[c.state]++});
    var first=list[0];
    var age=(Date.now()-new Date(M.snapshot_utc).getTime())/3600000;
    var stale=age>(M.fresh_hours||24);
    sec.innerHTML='<div class="wm-head"><div><div class="wm-kicker">ВЕСЬ ПРОЕКТ · ЖИЗНЬ В ИГРЕ</div><h2 id="wm-h">КАРТА МИРА</h2></div><span class="mono'+(stale?' wm-stale':'')+'">'+(stale?'снимок устарел · ':'снимок · ')+esc(msk(M.snapshot_utc))+'</span></div>'
      +'<div class="wm-pulse">'+['stop','wait','watch','live'].map(function(k){return '<div class="wm-p" style="--tone:'+tone(k)+'"><b>'+count[k]+'</b><span>'+esc(STATES[k].t)+'</span></div>'}).join('')+'</div>'
      +(first?'<div class="wm-top" style="--tone:'+tone(first.state)+'"><span class="k">ГЛАВНОЕ СЕЙЧАС · '+esc(first.label)+'</span><p>'+esc(first.next)+'</p><span class="n">'+esc(first.fact)+'</span></div>':'')
      +'<div class="wm-list">'+list.map(contour).join('')+'</div>'
      +'<details class="wm-c" id="wmDecBox" style="--tone:var(--c1)"><summary><span class="wm-l">РЕШЕНИЯ ОПЕРАТОРА</span><span class="wm-s"><i></i>'+(M.decisions||[]).length+'</span><span class="wm-t">Что ждёт твоего да. Отметки остаются только на этом устройстве.</span></summary><div class="wm-b">'
      +'<div class="wm-list" id="wmDec">'+(M.decisions||[]).map(function(d){return '<div class="wm-d" data-id="'+esc(d.id)+'"><b>'+esc(d.title)+'</b><span>'+esc(d.why)+'</span><div class="wm-acts"><button type="button" data-d="yes" aria-pressed="false">ДА</button><button type="button" data-d="later" aria-pressed="false">ПОЗЖЕ</button></div></div>'}).join('')+'</div>'
      +'<div class="wm-out" id="wmOut" aria-live="polite"></div><button type="button" class="wm-copy" id="wmCopy" hidden>СКОПИРОВАТЬ СТРОКУ</button></div></details>'
      +'<p class="mono">Живая проверка адресов важнее снимка. Задачи остаются в ClickUp.</p>';
    var D=read();paintOut(sec,M,D);
    sec.querySelector('#wmDec').onclick=function(e){var b=e.target.closest('button');if(!b)return;var id=b.closest('.wm-d').dataset.id;D=read();D[id]=b.dataset.d;save(D);paintOut(sec,M,D)};
    sec.querySelector('#wmCopy').onclick=function(){var btn=this,t=sec.querySelector('#wmOut').textContent;var done=function(){btn.textContent='СКОПИРОВАНО'};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(done,function(){btn.textContent='ВЫДЕЛИ СТРОКУ ВРУЧНУЮ'});else btn.textContent='ВЫДЕЛИ СТРОКУ ВРУЧНУЮ'};
  }
  Promise.all([get('./world-map.json'),get('./system-status.json')]).then(function(r){paint(r[0],r[1])});
})();
