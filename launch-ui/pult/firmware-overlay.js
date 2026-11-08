/* TRIZNES firmware overlay v3 — read-only meaning layer for Pult. */
(function(){
  'use strict';
  function esc(s){return String(s==null?'':s).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]})}
  function load(){return fetch('../core/firmware-v3.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('firmware '+r.status);return r.json()})}
  function render(F){
    if(!F||!F.kernel)return;
    document.documentElement.dataset.firmware=F.version||'3';
    var footer=document.querySelector('.foot');
    if(!footer)return;
    var sec=document.createElement('section');
    sec.className='sec firmware';
    sec.setAttribute('aria-labelledby','h-core');
    var loop=((F.loops||{}).character||[]);
    var principles=((F.kernel||{}).principles||[]).slice(0,5);
    sec.innerHTML=
      '<h2 id="h-core">ЯДРО · ПРОШИВКА '+esc(F.version)+'</h2>'+
      '<div class="result"><span class="lab">ЗАЧЕМ</span><span>'+esc(F.kernel.mission)+'</span></div>'+
      '<div class="next"><span class="lab">АКСИОМА</span><span>'+esc(F.kernel.axiom)+'</span></div>'+
      '<div class="canon" aria-label="Живой цикл">'+loop.map(function(x){return '<span>'+esc(x)+'</span>'}).join('')+'</div>'+
      '<div class="agents">'+principles.map(function(x){return '<span class="agent">'+esc(x)+'</span>'}).join('')+'</div>'+
      '<p class="mono">'+esc(F.kernel.cinema)+' · '+esc(F.kernel.city_goal)+'</p>';
    footer.parentNode.insertBefore(sec,footer);
  }
  load().then(render).catch(function(err){
    console.warn('TRIZNES firmware unavailable',err);
  });
})();
