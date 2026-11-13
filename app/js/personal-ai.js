// Keys exist only in the password field and HTTPS request; never browser storage.
const endpoint='https://bbxhhtpmbtgfaxamgksf.supabase.co/functions/v1/triznes-personal-ai';
const messages={encryption_not_configured:'Подключение ещё настраивается.',model_not_configured:'Модель ещё не настроена.',provider_key_rejected:'Проверь ключ и доступ к Gemini API.',provider_quota:'Лимит Gemini исчерпан. Проверь квоту своего проекта.',rate_limited:'Подожди минуту перед следующим запросом.',unauthorized:'Войди в профиль заново.',key_required:'Подключи ключ в профиле.'};
export async function requestPersonalAI(action,extra={}) {
  const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','X-Triznes-Session':window.TZ.token||''},body:JSON.stringify({...extra,action})});
  const d=await r.json();
  if(!r.ok || !d.ok) throw new Error(messages[d.error]||'Подключение недоступно. Попробуй позже.');
  return d;
}
export function mountPersonalAI() {
  const anchor=document.getElementById('profileNote');
  if(!anchor || document.getElementById('personalAIButton')) return;
  const button=document.createElement('button');button.id='personalAIButton';button.type='button';button.className='btn ghost block';button.textContent='Моя нейронка · Gemini';anchor.after(button);
  button.onclick=async()=>{
    const tz=window.TZ;
    tz.sheet('<h2>Моя нейронка</h2><p>Личный ключ Gemini, память и квесты TRIZNES. Запросы расходуют квоту твоего Google API-проекта; проверка подключения тоже делает короткий запрос. Твои сообщения и разрешённый контекст передаются Google.</p><p id="personalAIStatus" role="status">Проверяем подключение…</p><form id="personalAIForm"><label for="personalAIKey">Ключ Gemini API</label><input class="field" id="personalAIKey" type="password" autocomplete="off" spellcheck="false" required maxlength="256"><button class="btn dawn" type="submit">Проверить и подключить</button></form><button class="btn ghost" id="personalAIRemove" type="button">Отключить ключ</button><p><a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">Получить ключ в Google AI Studio</a></p>');
    const status=document.getElementById('personalAIStatus'),form=document.getElementById('personalAIForm'),input=document.getElementById('personalAIKey'),remove=document.getElementById('personalAIRemove');
    let busy=false;
    function lock(v){busy=v;form.querySelector('button').disabled=v;remove.disabled=v;}
    form.onsubmit=async e=>{e.preventDefault();if(busy)return;lock(true);let key=input.value.trim();input.value='';try{await requestPersonalAI('connect',{api_key:key});status.textContent='Gemini подключён. Ключ сохранён зашифрованным.';}catch(e){status.textContent=e.message;}finally{key='';lock(false);}};
    remove.onclick=async()=>{if(busy)return;lock(true);try{await requestPersonalAI('disconnect');status.textContent='Ключ отключён. Память сохранена.';}catch(e){status.textContent=e.message;}finally{lock(false);}};
    lock(true);try{const s=await requestPersonalAI('status');status.textContent=s.connected?'Личный Gemini подключён.':'Личный ключ пока не подключён.';if(!s.ready)status.textContent+=' Серверное подключение ещё настраивается.';}catch(e){status.textContent=e.message;}finally{lock(false);}
  };
}
