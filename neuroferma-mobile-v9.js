(()=>{
const tg=window.Telegram?.WebApp;
let installPrompt=null,defaultOpened=false;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e});
async function installApp(){if(installPrompt){installPrompt.prompt();await installPrompt.userChoice.catch(()=>null);installPrompt=null;return}alert('iPhone: Safari → Поделиться → На экран «Домой».')}
function addStyles(){if(document.getElementById('nfMobileV9Styles'))return;const s=document.createElement('style');s.id='nfMobileV9Styles';s.textContent=`
@media(max-width:760px){
  .pn-portal{display:none!important}
  .w{padding-top:max(8px,env(safe-area-inset-top))!important}
  .hero{margin-bottom:8px!important;padding:12px 13px!important}
  .hero h1{font-size:28px!important;margin:4px 0!important}
  .hero .version{display:none!important}
  .nf-channel-strip{margin-top:8px;padding:8px 10px;border:1px solid rgba(66,236,255,.25);border-radius:12px;background:rgba(66,236,255,.06);font-size:11px;line-height:1.35;color:#d8faff}
  .admin-modes{grid-template-columns:1fr 1fr auto!important;gap:7px!important;margin:8px 0!important;position:sticky;top:0;z-index:30;background:linear-gradient(#07040b 82%,transparent);padding:5px 0 8px}
  .admin-mode{min-height:46px!important;padding:9px 11px!important;font-size:13px!important}
  .admin-mode[data-mode="production"],.admin-mode[data-mode="publication"]{font-size:14px!important}
  .nf-more{min-width:54px!important}
  .nf-more-panel{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:8px;border:1px solid var(--line);border-radius:15px;background:#100d16}
  .nf-more-panel.hide{display:none!important}
  .nf-more-panel a,.nf-more-panel button{min-height:44px;text-decoration:none;display:flex;align-items:center;justify-content:center;border-radius:12px}
  .admin-head{margin:8px 0 10px!important}
  .admin-head h2{font-size:22px!important}
  .admin-head .muted{font-size:11px!important}
  .grid{display:block!important}
  .card{min-height:0!important;margin-bottom:9px!important;border-radius:18px!important;scroll-snap-align:none!important}
  .card .in{padding:12px!important}
  .card .title{font-size:17px!important;line-height:1.15!important;margin:7px 0!important}
  .card .copy{max-height:78px!important;font-size:12px!important;line-height:1.35!important}
  .job-actions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:7px!important}
  .job-actions button{min-height:46px!important;padding:9px 8px!important;font-size:12px!important}
  .job-actions .approve,.job-actions .launch{grid-column:span 2}
  .stats{grid-template-columns:repeat(4,1fr)!important;gap:6px!important;margin:7px 0!important;overflow:visible!important}
  .stats .stat{min-width:0!important;padding:8px 5px!important;text-align:center}
  .stats .stat strong{font-size:18px!important}
  .stats .stat span{font-size:7px!important}
  .stats .stat[data-f="all"]{display:none!important}
  .bar{display:none!important}
  .feed-hint{display:none!important}
  .in>.actions{position:static!important;background:none!important;padding-top:8px!important}
  .media{height:auto!important;min-height:0!important;aspect-ratio:16/9!important}
  .nf-task-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:0 0 10px}
  .nf-task-summary div{padding:8px;border:1px solid var(--line);border-radius:12px;background:#100d16;text-align:center}
  .nf-task-summary strong{display:block;font-size:18px}
  .nf-task-summary span{font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}
}
`;document.head.appendChild(s)}
function channelStrip(){const hero=document.querySelector('.hero');if(!hero||document.getElementById('nfChannelStrip'))return;const d=document.createElement('div');d.id='nfChannelStrip';d.className='nf-channel-strip';d.innerHTML='<b>OPUSCLIP</b> · TikTok ✓ · YouTube ✓ &nbsp;·&nbsp; <span style="color:#ffd66b">YouTube TRIZNES: канал ещё не подтверждён</span>';hero.appendChild(d)}
function simplifyNav(){const nav=document.getElementById('adminModes');if(!nav||nav.dataset.mobileV9==='1')return;nav.dataset.mobileV9='1';nav.innerHTML=`
<button class="admin-mode on" data-mode="production">✅ Задачи</button>
<button class="admin-mode" data-mode="publication">🎬 Готовые</button>
<button class="admin-mode nf-more" id="nfMore" type="button">•••</button>
<div class="nf-more-panel hide" id="nfMorePanel">
  <button class="admin-mode" data-mode="archives">🗂 Архив</button>
  <button class="admin-mode" data-mode="chivurundu">🍌 Помощник</button>
  <a class="pn-enter" href="https://bbxhhtpmbtgfaxamgksf.supabase.co/functions/v1/neurofarm-member-web?mode=editor">⚡ PINK NOIZE</a>
  <button type="button" id="nfInstall">📲 На экран</button>
</div>`;
nav.querySelector('#nfMore')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();nav.querySelector('#nfMorePanel')?.classList.toggle('hide')});
nav.querySelector('#nfInstall')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();installApp()});
if(!defaultOpened){defaultOpened=true;setTimeout(()=>nav.querySelector('[data-mode="production"]')?.click(),0)}
}
function relabelPublication(){const map={review:'Проверить',approved:'Готово',active:'Отправка',failed:'Ошибки'};document.querySelectorAll('.stat[data-f]').forEach(x=>{const s=x.querySelector('span');if(s&&map[x.dataset.f])s.textContent=map[x.dataset.f]});}
function enhanceTasks(){const h=document.querySelector('.admin-head h2');if(h&&/Производство/i.test(h.textContent||''))h.textContent='Задачи';const sub=document.querySelector('.admin-head .muted');if(sub&&/Роли специалистов/i.test(sub.textContent||''))sub.textContent='Прими задачу, поправь сценарий или монтаж и отправь дальше.';
const cards=[...document.querySelectorAll('#grid .card')];if(!cards.length)return;cards.forEach(card=>{const actions=card.querySelector('.job-actions');if(!actions)return;const labels={director:'Сценарий',editor:'Монтаж',generate:'✓ Принять задачу',revise:'Правки',package:'Площадки'};actions.querySelectorAll('[data-job]').forEach(b=>{if(labels[b.dataset.job])b.textContent=labels[b.dataset.job]});});
const grid=document.getElementById('grid');if(grid&&!document.getElementById('nfTaskSummary')){const need=cards.filter(c=>/REQUESTED|DRAFT|AWAITING_APPROVAL|REVIEW/i.test(c.querySelector('.chip')?.textContent||'')).length;const ready=cards.filter(c=>/READY|DELIVERED|APPROVED/i.test(c.querySelector('.chip')?.textContent||'')).length;const d=document.createElement('div');d.id='nfTaskSummary';d.className='nf-task-summary';d.innerHTML=`<div><strong>${need}</strong><span>нужно решение</span></div><div><strong>${cards.length}</strong><span>всего задач</span></div><div><strong>${ready}</strong><span>готово</span></div>`;grid.prepend(d)}}
function removeWrongYouTubeHelpers(){document.querySelectorAll('[data-nf-youtube]').forEach(x=>x.remove())}
function enhance(){addStyles();channelStrip();simplifyNav();relabelPublication();enhanceTasks();removeWrongYouTubeHelpers()}
new MutationObserver(()=>requestAnimationFrame(enhance)).observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('DOMContentLoaded',enhance);setTimeout(enhance,80);setTimeout(enhance,600);
tg?.ready();tg?.expand();
})();