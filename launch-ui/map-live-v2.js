/* World map V2 — render actual public Living World places, not static placeholder markers. */
(() => {
  'use strict';
  let tries=0;
  const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));

  function render(state){
    const places=Array.isArray(state?.world?.places)?state.world.places:[];
    const communities=Array.isArray(state?.world?.communities)?state.world.communities:[];
    const map=document.querySelector('.page-world-map .mapwrap');
    if(!map) return;

    map.querySelectorAll('.marker').forEach(node=>node.remove());
    places.forEach((place,index)=>{
      const x=Math.max(7,Math.min(93,Number(place.map_x??.5)*100));
      const y=Math.max(10,Math.min(88,Number(place.map_y??.5)*100));
      const a=document.createElement('a');
      a.className=`marker ${index%3===1?'cyan':index%3===2?'brand':''}`;
      a.style.left=`${x}%`;a.style.top=`${y}%`;
      a.href=`world-map.html?place=${encodeURIComponent(place.slug||'')}`;
      a.innerHTML=`<span class="dotm">${index+1}</span><span class="lab">${esc(place.name||'Объект Сочи')}</span>`;
      map.appendChild(a);
    });

    const filters=[...document.querySelectorAll('.page-world-map .filter button')];
    filters.forEach(btn=>{
      const text=btn.textContent.toLowerCase();
      if(/люди/.test(text)) btn.onclick=()=>location.href='character.html';
      if(/сообщ/.test(text)) btn.onclick=()=>location.href='communities.html';
      if(/места/.test(text)) btn.onclick=()=>location.href='city-objects.html';
      if(/событ|истор/.test(text)) btn.onclick=()=>location.href='boards.html';
      if(/съём/.test(text)) btn.onclick=()=>location.href='neurofarm.html';
    });

    if(!document.querySelector('.tc-map-directory')){
      const seg=document.querySelector('.page-world-map .seg')?.parentElement;
      seg?.insertAdjacentHTML('beforebegin',`<section class="tc-map-directory"><a href="city-objects.html"><b>${places.length}</b><span>ОБЪЕКТОВ СОЧИ<small>партнёры · гостиницы · рестораны · места</small></span><i>→</i></a><a href="communities.html"><b>${communities.length}</b><span>СООБЩЕСТВ<small>люди · идеи · проекты · сцены</small></span><i>→</i></a></section>`);
    }
  }

  function wait(){
    if(window.TRIZNES_LIVING_WORLD?.world){render(window.TRIZNES_LIVING_WORLD);return}
    if(tries++<30)setTimeout(wait,150);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wait,{once:true});else wait();
})();