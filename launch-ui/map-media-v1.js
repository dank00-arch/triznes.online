/* Bind verified place media from Living World metadata into the real map sheet. */
(() => {
  'use strict';
  const BASE='https://bbxhhtpmbtgfaxamgksf.supabase.co/rest/v1/rpc/';
  const KEY='sb_publishable_aFTiVGlsJxeeutL_gEZaKA_S9VyKaHS';
  let places=[];
  let last='';
  const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  async function load(){
    const r=await fetch(BASE+'get_triznes_map',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:'{}',cache:'no-store'});
    if(!r.ok)return;const d=await r.json();places=Array.isArray(d?.places)?d.places:[];sync();
  }

  function sync(){
    const sheet=document.querySelector('.page-world-map .sheet');const title=sheet?.querySelector('.t-h2');if(!sheet||!title)return;
    const name=title.textContent.trim();if(!name||name===last)return;last=name;
    const place=places.find(p=>(p.name||'').trim()===name);if(!place)return;
    const meta=place.metadata||{};const cover=typeof meta.cover_url==='string'&&meta.cover_url.startsWith('/')?meta.cover_url:'';
    const gallery=Array.isArray(meta.gallery_urls)?meta.gallery_urls.filter(x=>typeof x==='string'&&x.startsWith('/')):[];
    const media=sheet.querySelector('.media');
    if(media&&cover){media.innerHTML=`<img src="${esc(cover)}" alt="${esc(place.name)}"><span class="tc-media-origin"><i></i>${esc(String(meta.media_provenance||'ARCHIVE/REAL').toUpperCase())}</span>`;}
    sheet.querySelector('.tc-place-gallery')?.remove();
    if(gallery.length){sheet.insertAdjacentHTML('beforeend',`<div class="tc-place-gallery" aria-label="Архивные фотографии объекта">${gallery.map((url,i)=>`<img src="${esc(url)}" loading="lazy" alt="${esc(place.name)} · архив ${i+1}">`).join('')}</div>`);}
  }

  function boot(){
    load().catch(()=>{});
    const sheet=document.querySelector('.page-world-map .sheet');if(!sheet)return;
    new MutationObserver(sync).observe(sheet,{subtree:true,childList:true,characterData:true});
    setInterval(sync,1000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();