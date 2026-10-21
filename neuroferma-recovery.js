(()=>{
  const h=new URLSearchParams(location.hash.replace(/^#/,''));
  const accessToken=h.get('access_token')||'';
  const type=h.get('type')||'';
  const error=h.get('error_description')||h.get('error')||'';
  if(type!=='recovery'&&!accessToken&&!error)return;

  const AUTH='https://bbxhhtpmbtgfaxamgksf.supabase.co/auth/v1';
  const KEY='sb_publishable_aFTiVGlsJxeeutL_gEZaKA_S9VyKaHS';
  document.documentElement.innerHTML=`<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#09040f"><title>TRIZNES · Новый пароль</title><style>:root{color-scheme:dark;--bg:#07040b;--panel:#100d16;--line:#32263d;--muted:#a69dad;--cyan:#42ecff;--pink:#ff35c8;--green:#72ffad;--red:#ff7895}*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;padding:18px;background:radial-gradient(circle at 13% 0,rgba(255,53,200,.18),transparent 30%),radial-gradient(circle at 90% 5%,rgba(66,236,255,.14),transparent 28%),var(--bg);color:#f8f7fb;font:15px/1.45 system-ui,-apple-system,sans-serif}.card{width:min(520px,100%);border:1px solid var(--line);background:rgba(16,13,22,.97);border-radius:24px;padding:22px}.ey{font:900 10px ui-monospace,monospace;letter-spacing:.18em;color:var(--cyan)}h1{font-size:34px;line-height:1;margin:8px 0 10px;letter-spacing:-.04em}.muted{color:var(--muted)}label{display:block;margin:14px 0 6px;font-weight:800}input{width:100%;border:1px solid #3b3045;background:#08070c;color:#fff;border-radius:12px;padding:13px;font:inherit}button,a{width:100%;min-height:50px;border:0;border-radius:13px;margin-top:12px;padding:0 16px;background:linear-gradient(110deg,var(--pink),var(--cyan));color:#05070a;font-weight:1000;font:inherit;display:flex;align-items:center;justify-content:center;text-decoration:none;cursor:pointer}.status{margin-top:14px;padding:12px;border-radius:12px;background:#09070d;border:1px solid #30273a}.ok{border-color:rgba(114,255,173,.45);color:var(--green)}.bad{border-color:rgba(255,120,149,.45);color:var(--red)}.hide{display:none!important}.small{font-size:12px;margin-top:10px}</style></head><body><main class="card"><div class="ey">TRIZNES / NEUROFERMA</div><h1>Новый пароль</h1><p class="muted" id="recoveryIntro">Ссылка восстановления подтверждается…</p><form id="recoveryForm" class="hide"><label>Новый пароль</label><input id="recoveryP1" type="password" autocomplete="new-password" minlength="10" required placeholder="Минимум 10 символов"><label>Повтори пароль</label><input id="recoveryP2" type="password" autocomplete="new-password" minlength="10" required placeholder="Повтори новый пароль"><button id="recoverySave" type="submit">Сохранить новый пароль</button></form><div id="recoveryStatus" class="status hide"></div><a id="recoveryOpen" class="hide" href="./neuroferma-admin.html">Открыть Нейроферму</a><p class="muted small">Пароль передаётся напрямую в Supabase Auth и не сохраняется TRIZNES.</p></main></body>`;

  const intro=document.getElementById('recoveryIntro'),form=document.getElementById('recoveryForm'),status=document.getElementById('recoveryStatus'),open=document.getElementById('recoveryOpen'),save=document.getElementById('recoverySave');
  const show=(m,ok=false)=>{status.textContent=m;status.className='status '+(ok?'ok':'bad')};
  if(error){intro.textContent='Ссылка восстановления не сработала.';show(decodeURIComponent(error));return}
  if(!accessToken){intro.textContent='В ссылке нет активной recovery-сессии.';show('Нужна свежая ссылка восстановления пароля.');return}
  intro.textContent='Ссылка подтверждена. Задай новый пароль.';form.classList.remove('hide');
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const p1=document.getElementById('recoveryP1').value,p2=document.getElementById('recoveryP2').value;
    if(p1.length<10){show('Минимум 10 символов.');return}
    if(p1!==p2){show('Пароли не совпадают.');return}
    save.disabled=true;save.textContent='Сохраняю…';status.classList.add('hide');
    try{
      const r=await fetch(AUTH+'/user',{method:'PUT',headers:{'Content-Type':'application/json','apikey':KEY,'Authorization':'Bearer '+accessToken},body:JSON.stringify({password:p1})});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(d.msg||d.message||d.error_description||d.error||'Не удалось обновить пароль');
      form.classList.add('hide');intro.textContent='Готово.';show('Пароль успешно обновлён.',true);open.classList.remove('hide');history.replaceState(null,'',location.pathname);
    }catch(e){show(String(e.message||e));save.disabled=false;save.textContent='Сохранить новый пароль'}
  });
})();