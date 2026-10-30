/* SOCHIWOOD is the cinema. Legacy /watch.html is only a compatibility redirect. */
(() => {
  'use strict';
  if (!document.body.classList.contains('page-sochiwood')) return;

  function normalizeCopy(){
    const title = document.querySelector('.page-sochiwood h1');
    const copy = title?.parentElement?.querySelector('p');
    if (copy) copy.textContent = 'Кино живёт прямо внутри нового контура TRIZNES: герой, место, хроника, производство и просмотр связаны в одной системе.';
    document.querySelectorAll('.tc-viewer-boundary').forEach(node => node.remove());
    document.querySelectorAll('.page-sochiwood a[href="/watch.html"], .page-sochiwood a[href="watch.html"]').forEach(link => {
      link.href = '#';
      link.onclick = (event) => {
        event.preventDefault();
        const cinema = document.querySelector('.tc-live-cinema');
        cinema?.scrollIntoView({behavior:'smooth',block:'start'});
        cinema?.querySelector('video')?.play().catch(()=>{});
      };
    });
  }

  document.addEventListener('click', (event) => {
    const card = event.target.closest('.page-sochiwood .film-card, .page-sochiwood article.card');
    if (!card) return;
    const cinema = document.querySelector('.tc-live-cinema');
    if (!cinema) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    cinema.scrollIntoView({behavior:'smooth',block:'start'});
  }, true);

  const observer = new MutationObserver(normalizeCopy);
  observer.observe(document.body,{childList:true,subtree:true});
  normalizeCopy();
  setTimeout(normalizeCopy,500);
  setTimeout(normalizeCopy,1500);
})();