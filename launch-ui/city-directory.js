/* TRIZNES city directories — public Living World data only. */
(() => {
  'use strict';
  const BASE='https://bbxhhtpmbtgfaxamgksf.supabase.co/rest/v1/rpc/';
  const KEY='sb_publishable_aFTiVGlsJxeeutL_gEZaKA_S9VyKaHS';
  const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const arr=(v)=>Array.isArray(v)?v:[];
  const page=(location.pathname.split('/').pop()||'').replace('.html','');

  async function world(){
    const r=await fetch(BASE+'get_triznes_world',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:'{}',cache:'no-store'});
    const data=await r.json().catch(()=>null); if(!r.ok) throw new Error('world_failed'); return data||{};
  }

  function normKind(place){
    const raw=String(place.category||place.type||'place').toLowerCase();
    if(/hotel|гост|villa|отел/.test(raw)) return 'hotel';
    if(/restaurant|cafe|coffee|bar|food|ресторан|каф|кофе/.test(raw)) return 'restaurant';
    if(/studio|media|hub|театр|theatre|venue|площад/.test(raw)) return 'venue';
    if(/service|shop|store|сервис|магаз/.test(raw)) return 'service';
    if(/landmark|park|street|station|port|гора|мор|парк|улиц/.test(raw)) return 'landmark';
    return 'place';
  }
  const kindLabel={hotel:'ГОСТИНИЦА',restaurant:'РЕСТОРАН / КАФЕ',venue:'ПЛОЩАДКА',service:'СЕРВИС',landmark:'МЕСТО',place:'ОБЪЕКТ'};
  function isPartner(p){const m=p.metadata||{};return m.partner===true||m.is_partner===true||/partner|active/i.test(String(m.partner_status||''));}

  function renderPlaces(data){
    const all=arr(data.places);
    const grid=document.getElementById('objectsGrid');
    const count=document.getElementById('objectsCount');
    if(count) count.textContent=`${all.length} подтверждённых точек в Living World`;
    let filter='all';
    const draw=()=>{
      const list=filter==='all'?all:all.filter(p=>normKind(p)===filter);
      grid.innerHTML=list.length?list.map(p=>{
        const kind=normKind(p), partner=isPartner(p);
        const slug=esc(p.slug||'');
        const desc=esc(p.description||'Реальная точка города в контуре TRIZNES.');
        const addr=p.address?`<div class="foot"><span>${esc(p.address)}</span><span>→</span></div>`:`<div class="foot"><span>${esc(p.city||'Сочи')}</span><span>→</span></div>`;
        return `<a class="tc-object-card" href="world-map.html?place=${encodeURIComponent(p.slug||'')}"><div class="top"><span class="kind">${partner?'ПАРТНЁР · ':''}${kindLabel[kind]}</span><span class="reality">${esc(p.reality_status||'REAL')}</span></div><h3>${esc(p.name||'Объект Сочи')}</h3><p>${desc}</p>${addr}</a>`;
      }).join(''):'<div class="tc-empty">В этой категории пока нет подтверждённых публичных объектов.</div>';
    };
    document.querySelectorAll('[data-object-filter]').forEach(btn=>btn.addEventListener('click',()=>{
      filter=btn.dataset.objectFilter; document.querySelectorAll('[data-object-filter]').forEach(x=>x.classList.toggle('on',x===btn)); draw();
    }));
    draw();
  }

  function renderCommunities(data){
    const list=arr(data.communities), profiles=arr(data.profiles);
    const grid=document.getElementById('communitiesGrid');
    const count=document.getElementById('communitiesCount');
    if(count) count.textContent=`${list.length} миров в публичном контуре`;
    grid.innerHTML=list.length?list.map(c=>{
      const slug=c.slug||c.id||'';
      const members=profiles.filter(p=>(p.community_slug||p.community)===slug).length;
      return `<a class="tc-community-card" href="community.html?community=${encodeURIComponent(slug)}"><div class="top"><span class="kind">СООБЩЕСТВО · МИР</span><span class="reality">${members} героев</span></div><h3>${esc(c.name||c.title||'Сообщество')}</h3><p>${esc(c.description||c.idea||'Самостоятельный мир внутри TRIZNES.')}</p><div class="foot"><span>${esc(c.dream||'Открыть мир')}</span><span>→</span></div></a>`;
    }).join(''):'<div class="tc-empty">Публичные сообщества пока не открыты.</div>';
  }

  async function boot(){
    try{
      const data=await world();
      if(page==='city-objects') renderPlaces(data);
      if(page==='communities') renderCommunities(data);
    }catch(e){
      const target=document.getElementById(page==='city-objects'?'objectsGrid':'communitiesGrid');
      if(target) target.innerHTML='<div class="tc-empty">Living World временно не ответил. Интерфейс сохранён, данные появятся после восстановления связи.</div>';
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();