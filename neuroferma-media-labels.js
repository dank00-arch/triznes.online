(()=>{
  const MEDIA_API='https://bbxhhtpmbtgfaxamgksf.supabase.co/functions/v1/neurofarm-admin-content';
  const SESSION_KEY='triznes-neuroferma-admin-session';
  const mediaItems=new Map();
  const esc2=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const mediaHeaders=()=>({'Content-Type':'application/json','x-telegram-init-data':window.Telegram?.WebApp?.initData||'','x-admin-session':localStorage.getItem(SESSION_KEY)||''});
  async function mediaCall(action,payload={}){
    const r=await fetch(MEDIA_API,{method:'POST',headers:mediaHeaders(),body:JSON.stringify({action,...payload})});
    const d=await r.json().catch(()=>({}));
    if(!r.ok||!d.ok)throw new Error(d.error||'media_request_failed');
    return d;
  }
  function statusMeta(s){
    if(s==='confirmed')return['✓ ПОДТВЕРЖДЕНО','ok'];
    if(s==='needs_review')return['? НУЖНО УТОЧНИТЬ','warn'];
    return['НЕ ПРОВЕРЕНО',''];
  }
  function preview(x){
    const u=x.playback_url||'';
    if(/^video\//i.test(x.mime_type||'')&&u)return `<video class="admin-media" controls playsinline preload="metadata" src="${esc2(u)}"></video>`;
    if(/^image\//i.test(x.mime_type||'')&&u)return `<img class="admin-media" loading="lazy" src="${esc2(u)}" alt="${esc2(x.effective_title||x.title||'Медиа')}">`;
    if(u)return `<a class="raw-link" target="_blank" rel="noopener" href="${esc2(u)}">Открыть оригинал</a>`;
    return '<div class="muted" style="margin-top:8px">Предпросмотр недоступен, исходник сохранён в архиве.</div>';
  }
  function card(x){
    mediaItems.set(x.id,x);
    const title=x.effective_title||x.display_title||x.title||'Файл';
    const changed=Boolean(x.display_title&&x.display_title!==x.title);
    const [status,statusClass]=statusMeta(x.identity_status);
    const identity=[x.identified_person_name,x.identified_character_name].filter(Boolean).join(' · ');
    return `<div class="collection media-label-card" data-media-card="${x.id}">
      <div class="media-label-head"><div><b class="media-label-title">${esc2(title)}</b>${changed?`<div class="media-original">исходник: ${esc2(x.title||'')}</div>`:''}</div><span class="chip ${statusClass}">${status}</span></div>
      <div class="muted">${esc2(x.captured_at||'')}</div>
      ${identity?`<div class="media-identity">👤 ${esc2(identity)}</div>`:''}
      ${x.identity_notes?`<div class="media-story">${esc2(x.identity_notes)}</div>`:''}
      ${preview(x)}
      <div class="actions media-label-actions"><button type="button" data-media-edit="${x.id}">✏️ Изменить</button>${x.playback_url?`<a class="media-open" target="_blank" rel="noopener" href="${esc2(x.playback_url)}">Оригинал ↗</a>`:''}</div>
      <div id="media-edit-${x.id}" class="media-label-edit hide">
        <label>Название в Нейроферме<input data-field="display_title" value="${esc2(x.display_title||'')}" placeholder="Например: Екатерина Афродита — Райский пляж"></label>
        <label>Человек<input data-field="identified_person_name" value="${esc2(x.identified_person_name||'')}" placeholder="Например: Екатерина"></label>
        <label>Персонаж / образ<input data-field="identified_character_name" value="${esc2(x.identified_character_name||'')}" placeholder="Например: Афродита"></label>
        <label>Описание / история<textarea data-field="identity_notes" placeholder="Кто это, откуда кадр, с кем связан, какая история…">${esc2(x.identity_notes||'')}</textarea></label>
        <label>Статус<select data-field="identity_status"><option value="unreviewed" ${x.identity_status==='unreviewed'?'selected':''}>Не проверено</option><option value="needs_review" ${x.identity_status==='needs_review'?'selected':''}>Нужно уточнить</option><option value="confirmed" ${x.identity_status==='confirmed'?'selected':''}>Подтверждено мной</option></select></label>
        <div class="media-source-lock"><b>Архивный источник не меняется</b><div>${esc2(x.title||'')}</div><div>${esc2(x.source_type||'')} · ${esc2(x.source_ref||'')}</div></div>
        <div class="actions"><button type="button" class="approve" data-media-save="${x.id}">Сохранить и зафиксировать</button><button type="button" data-media-cancel="${x.id}">Отмена</button></div>
      </div>
    </div>`;
  }
  function renderCollection(box,items){
    box.innerHTML=(items||[]).map(card).join('')||'<div class="muted">Пусто.</div>';
  }
  async function openCollection(btn){
    const id=btn.dataset.col,box=document.getElementById('col-'+id);
    if(!box)return;
    box.innerHTML='<div class="muted">Загружаю исходники…</div>';
    try{
      const d=await mediaCall('archive_items',{collection_id:id,limit:100});
      renderCollection(box,d.items||[]);
    }catch(err){box.innerHTML='<div class="muted">Ошибка: '+esc2(err.message)+'</div>'}
  }
  function toggleEdit(id,show){
    const el=document.getElementById('media-edit-'+id);if(!el)return;
    el.classList.toggle('hide',show===undefined?!el.classList.contains('hide'):!show);
  }
  async function saveLabel(btn){
    const id=btn.dataset.mediaSave,wrap=document.getElementById('media-edit-'+id),item=mediaItems.get(id);
    if(!wrap||!item)return;
    const val=k=>wrap.querySelector(`[data-field="${k}"]`)?.value??'';
    btn.disabled=true;btn.textContent='Сохраняю…';
    try{
      const d=await mediaCall('edit_media_label',{media_item_id:id,display_title:val('display_title'),identified_person_name:val('identified_person_name'),identified_character_name:val('identified_character_name'),identity_notes:val('identity_notes'),identity_status:val('identity_status')});
      mediaItems.set(id,d.item);
      const old=document.querySelector(`[data-media-card="${id}"]`);
      if(old){const holder=document.createElement('div');holder.innerHTML=card(d.item);old.replaceWith(holder.firstElementChild)}
    }catch(err){alert('Не удалось сохранить подпись: '+err.message);btn.disabled=false;btn.textContent='Сохранить и зафиксировать'}
  }
  function installStyles(){
    if(document.getElementById('mediaLabelStyles'))return;
    const s=document.createElement('style');s.id='mediaLabelStyles';s.textContent=`
      .media-label-card{position:relative}.media-label-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.media-label-title{font-size:16px}.media-original{margin-top:3px;color:#81778a;font:700 10px ui-monospace,monospace;overflow-wrap:anywhere}.media-identity{margin:7px 0 4px;color:var(--cyan);font-weight:800}.media-story{margin:7px 0;padding:9px 10px;border-left:3px solid var(--pink);background:#09070d;border-radius:8px;white-space:pre-wrap}.media-label-actions{margin-top:9px;align-items:center}.media-open{display:inline-flex;align-items:center;color:var(--cyan);text-decoration:none;padding:9px 4px}.media-label-edit{display:grid;gap:9px;margin-top:11px;padding:12px;border:1px solid rgba(66,236,255,.3);border-radius:14px;background:#09070d}.media-label-edit label{display:grid;gap:5px;color:#dcd5e2;font-size:12px;font-weight:800}.media-label-edit select{width:100%;border:1px solid #3b3045;background:#08070c;color:#fff;border-radius:10px;padding:10px}.media-source-lock{padding:9px;border-radius:10px;background:#100d16;color:#8e8497;font:11px/1.45 ui-monospace,monospace;overflow-wrap:anywhere}.media-source-lock b{display:block;color:#caff39;margin-bottom:4px}@media(max-width:620px){.media-label-head{align-items:flex-start}.media-label-actions button{min-height:44px}.media-label-edit{padding:10px}}
    `;document.head.appendChild(s);
  }
  function capture(e){
    const col=e.target.closest?.('[data-col]');
    if(col){e.preventDefault();e.stopImmediatePropagation();openCollection(col);return}
    const edit=e.target.closest?.('[data-media-edit]');
    if(edit){e.preventDefault();e.stopImmediatePropagation();toggleEdit(edit.dataset.mediaEdit,true);return}
    const cancel=e.target.closest?.('[data-media-cancel]');
    if(cancel){e.preventDefault();e.stopImmediatePropagation();toggleEdit(cancel.dataset.mediaCancel,false);return}
    const save=e.target.closest?.('[data-media-save]');
    if(save){e.preventDefault();e.stopImmediatePropagation();saveLabel(save);return}
  }
  installStyles();
  const grid=document.getElementById('grid');
  if(grid)grid.addEventListener('click',capture,true);
  window.TRIZNES_MEDIA_LABELS={mediaCall,openCollection};
})();
