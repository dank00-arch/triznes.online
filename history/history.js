'use strict';
const statusNode = document.querySelector('#status');
const timeline = document.querySelector('#timeline');
const more = document.querySelector('#more');
const search = document.querySelector('#search');
const year = document.querySelector('#year');
const kind = document.querySelector('#kind');
let all = [], filtered = [], shown = 0;
const dateFormat = new Intl.DateTimeFormat('ru-RU', {dateStyle:'long', timeZone:'Europe/Moscow'});
const yearFormat = new Intl.DateTimeFormat('en-US', {year:'numeric', timeZone:'Europe/Moscow'});
function validDate(post) { const d = new Date(post.date || 'invalid'); return Number.isFinite(d.getTime()) ? d : null; }
function postYear(post) { const d = validDate(post); return d ? yearFormat.format(d) : ''; }
function node(tag, className, text) { const n=document.createElement(tag); if(className)n.className=className;if(text !== undefined)n.textContent=text;return n; }
function appendPost(post) {
  const article=node('article','moment');
  const date=validDate(post), time=node('time','',date ? dateFormat.format(date) : 'Дата не установлена');
  if(date)time.dateTime=date.toISOString();article.append(time);
  if(post.text)article.append(node('p','post-text',post.text));
  const gallery=node('div','media');
  for(const media of post.media || []) {
    // Importer-generated content-addressed paths only; no arbitrary external URLs.
    if(!/^media\/[a-f0-9]{64}\.[a-z0-9]{1,10}$/.test(media.src || ''))continue;
    const url='history/'+media.src; let element;
    if(media.kind==='image'){element=node('img');element.src=url;element.alt=post.text ? post.text.slice(0,160) : 'Фото из личного архива';element.loading='lazy';}
    else if(media.kind==='video' || media.kind==='audio'){element=node(media.kind);element.src=url;element.controls=true;element.preload='none';if(media.kind==='video')element.playsInline=true;}
    else{element=node('a','attachment',media.original_filename || 'Открыть файл');element.href=url;element.download=media.original_filename || '';}
    gallery.append(element);
  }
  if(gallery.childElementCount)article.append(gallery);
  if(post.missing_media)article.append(node('p','missing','Часть медиа этого момента пока недоступна.'));
  if(/^https:\/\/t\.me\/bezlikiforall\/[1-9][0-9]*$/.test(post.source_url || '')) {
    const link=node('a','source','Исходная публикация ↗');link.href=post.source_url;link.target='_blank';link.rel='noopener noreferrer';article.append(link);
  }
  timeline.append(article);
}
function renderMore(){const batch=filtered.slice(shown,shown+30);batch.forEach(appendPost);shown+=batch.length;more.hidden=shown>=filtered.length;}
function filter(){const q=search.value.trim().toLocaleLowerCase('ru');filtered=all.filter(p=>(!q||String(p.text||'').toLocaleLowerCase('ru').includes(q))&&(!year.value||postYear(p)===year.value)&&(!kind.value||(kind.value==='text' ? !(p.media||[]).length : (p.media||[]).some(m=>m.kind===kind.value))));timeline.replaceChildren();shown=0;statusNode.textContent=filtered.length ? `Моментов: ${filtered.length}. От ранних публикаций к новым.` : 'По этому запросу моменты не найдены.';renderMore();}
[search,year,kind].forEach(el=>el.addEventListener(el===search?'input':'change',filter));more.addEventListener('click',renderMore);
fetch('history/posts.json').then(r=>{if(!r.ok)throw new Error('history_unavailable');return r.json();}).then(data=>{
  if(data.schema_version!==1||data.source?.handle!=='@bezlikiforall'||!Array.isArray(data.posts))throw new Error('invalid_history');
  all=data.posts.slice().sort((a,b)=>{const ad=validDate(a),bd=validDate(b);return (ad?ad.getTime():Infinity)-(bd?bd.getTime():Infinity)||a.id-b.id;});
  if(!all.length){statusNode.textContent='Медиаистория ещё не опубликована. Пока её можно посмотреть в BEZLIKI FOR ALL.';return;}
  [...new Set(all.map(postYear).filter(Boolean))].sort().forEach(y=>{const o=node('option','',y);o.value=y;year.append(o);});document.querySelector('.toolbar').hidden=false;filter();
}).catch(()=>{statusNode.replaceChildren(node('span','','История сейчас недоступна. '));const a=node('a','','Открыть BEZLIKI FOR ALL ↗');a.href='https://t.me/bezlikiforall';a.target='_blank';a.rel='noopener noreferrer';statusNode.append(a);});
