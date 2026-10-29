(()=>{
  const VERSION='3.0.0';
  document.documentElement.dataset.triznesFirmware=VERSION;

  const style=document.createElement('style');
  style.textContent=`
    :root{--fw-sea:#52d8e8;--fw-sky:#bfefff;--fw-sun:#ffd36a;--fw-love:#ff729f;--fw-leaf:#79d98b;--fw-ink:#10252b}
    body{background:linear-gradient(180deg,#dff8ff 0%,#f8fff2 42%,#fff6dd 100%);color:var(--fw-ink)}
    .screen{background:linear-gradient(160deg,#8de6f0,#b9efc4 48%,#ffe5a6)}
    .shade{background:linear-gradient(180deg,rgba(10,55,64,.08),rgba(10,55,64,.02) 38%,rgba(8,38,45,.68) 100%),linear-gradient(90deg,rgba(9,48,58,.18),transparent 65%)}
    .world{background:radial-gradient(circle at 12% 12%,rgba(82,216,232,.28),transparent 34%),radial-gradient(circle at 86% 18%,rgba(255,114,159,.18),transparent 32%),linear-gradient(180deg,#f5fff9,#eafaff 55%,#fff8e7);color:var(--fw-ink)}
    .world .intro,.world .card p,.entry p{color:#46636a}
    .world .card{background:rgba(255,255,255,.68);border-color:rgba(16,37,43,.12);box-shadow:0 18px 55px rgba(40,120,130,.08)}
    .entry{background:linear-gradient(135deg,rgba(82,216,232,.18),rgba(255,211,106,.20),rgba(255,114,159,.12));border-color:rgba(82,216,232,.35)}
    .who-form{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;margin-top:22px;max-width:720px}
    .who-form input{min-height:54px;border:1px solid rgba(255,255,255,.38);border-radius:999px;padding:0 20px;background:rgba(255,255,255,.16);backdrop-filter:blur(16px);color:white;font:700 16px system-ui;outline:none}
    .who-form input::placeholder{color:rgba(255,255,255,.78)}
    .who-form button{min-height:54px;border:0;border-radius:999px;padding:0 22px;background:linear-gradient(110deg,var(--fw-love),var(--fw-sun));color:#17262b;font-weight:950;cursor:pointer}
    .who-later{display:inline-block;margin-top:12px;color:rgba(255,255,255,.82);font-weight:800;font-size:13px}
    .fw-path{margin-top:14px;font:800 10px ui-monospace,monospace;letter-spacing:.1em;color:rgba(255,255,255,.72)}
    @media(max-width:620px){.who-form{grid-template-columns:1fr}.who-form button{width:100%}}
  `;
  document.head.appendChild(style);

  const hero=document.querySelector('.heroCopy');
  if(hero){
    const ey=hero.querySelector('.ey'); if(ey) ey.textContent='TRIZNES · ЖИЗНЬ В ИГРЕ';
    const h=hero.querySelector('h1'); if(h) h.innerHTML='КТО ТЫ?';
    const p=hero.querySelector('p'); if(p) p.textContent='Расскажи о себе так, как чувствуешь сейчас. Ответ — не анкета, а первый живой вход в твой мир.';
    const actions=hero.querySelector('.actions');
    if(actions){
      actions.outerHTML=`<form class="who-form" id="whoForm"><input id="whoAnswer" autocomplete="off" placeholder="Расскажи о себе…" aria-label="Расскажи о себе"><button type="submit">ПРОДОЛЖИТЬ →</button></form><a class="who-later" href="app.html?entry=who&unknown=1">Я ПОКА НЕ ЗНАЮ</a><div class="fw-path">Я → ЛЮБОВЬ → ИГРА → ДРУГИЕ → ТВОРЧЕСТВО → МЫ → ГОРОД → КИНО</div>`;
    }
    const now=hero.querySelector('.now'); if(now) now.style.display='none';
  }

  const form=document.getElementById('whoForm');
  if(form) form.addEventListener('submit',e=>{
    e.preventDefault();
    const answer=(document.getElementById('whoAnswer')?.value||'').trim();
    if(answer) sessionStorage.setItem('triznes:first_answer',answer);
    location.href='app.html?entry=who';
  });

  fetch('./triznes-firmware.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(fw=>{
    if(fw?.version) document.documentElement.dataset.triznesFirmware=fw.version;
  }).catch(()=>{});
})();
