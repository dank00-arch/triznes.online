
/* SOCHIWOOD CINEMA. Verified editorial library only.
   Pure client-side cinema shell: no auth, no private sources, no publishing endpoints. */
(function(){
"use strict";
const FILMS=[
 {id:"LL-HjXeOR4w",title:"Сочи. Игра началась",subtitle:"Город становится главным героем",desc:"Кинематографичный взгляд на Сочи и истории, из которых рождается TRIZNES. Наш город — пространство для людей, музыки и собственных идей.",date:"2026",format:"Городское кино",line:"SOCHIWOOD / TRIZNES",stamp:"ARCHIVE",group:["premiere","sochi","films"],wide:true},
 {id:"Jq0qKr0U9GU",title:"Одна улыбка",subtitle:"Один человек. Один маленький шаг.",desc:"Короткий эксперимент в Сочи: как простое человеческое действие становится началом собственной истории.",date:"2026",format:"Короткий метр",line:"TRIZNES",stamp:"REAL",group:["premiere","sochi","shorts","people"],wide:false},
 {id:"VG95XatJ7yE",title:"Свет, добро и любовь",subtitle:"Зачем мы создаём TRIZNES",desc:"Авторское киноэссе о свободе выбора, творчестве и нашей общей вселенной.",date:"2026",format:"Киноэссе",line:"TRIZNES / PINK NOIZE",stamp:"ARCHIVE",group:["premiere","films","shorts","pinknoize"],wide:false},
 {id:"ILy7GiNvG6U",title:"Жизнь в игре",subtitle:"DANIEL / APOLLON — личная история",desc:"Линия DANIEL / APOLLON — самостоятельная история персонажа о встречах и выборе собственного пути.",date:"2026",format:"Трейлер персонажа",line:"DANIEL / APOLLON",stamp:"ARCHIVE",group:["daniel","people"],wide:true},
 {id:"pMlQt1HWUTI",title:"Семейный праздник",subtitle:"Медиахаб TRIZNES · место встречи идей",desc:"Авторское киноэссе из архивных фотографий медиахаба (октябрь 2026). Художественный образ будущего праздника — не репортаж о состоявшемся мероприятии.",date:"2026",format:"Архивное киноэссе",line:"TRIZNES / MEDIAHUB",stamp:"ARCHIVE",group:["premiere","mediahub","films","shorts"],wide:true}
];
const APPROVED_NEURO_IDS=new Set(["081e1750-06ef-4dc7-bc1b-c0f4b84d1dc1","5893a181-88d6-41f6-acbb-b64ab312ae59","347c6aff-a787-4233-b1db-a3a584639b80","941717ae-e7d5-4b2c-8964-f625d80362d3"]);
const PUBLIC_NEURO_SOURCE="https://bbxhhtpmbtgfaxamgksf.supabase.co/functions/v1/triznes-media-signed-url?public_watch=1";
let neuroLoadCompleted=false;
async function loadApprovedNeuroMedia(){
  if(neuroLoadCompleted)return;
  const signal=AbortSignal.timeout?AbortSignal.timeout(12000):undefined;
  try{
    const response=await fetch(PUBLIC_NEURO_SOURCE,{cache:"no-store",signal});
    if(!response.ok)throw Error("gateway_"+response.status);
    const data=await response.json();
    if(!Array.isArray(data.items))throw Error("no_public_media");
    let added=0;
    for(const asset of data.items){
      const id=String(asset.id||"");
      if(!APPROVED_NEURO_IDS.has(id)||movieById.has(id))continue;
      const source=String(asset.url||"");
      if(!source.startsWith("https://")||!source.includes(".supabase.co/storage/"))continue;
      if(!String(asset.mime_type||"video/mp4").startsWith("video/"))continue;
      const title=String(asset.title||"Нейрофильм TRIZNES").slice(0,110);
      const film={id,title,subtitle:"Новый мир · авторский нейрофильм",desc:String(asset.description||"Авторский фильм Нейрофермы TRIZNES.").slice(0,350),date:"2026",format:"Нейрофильм",line:"TRIZNES / НЕЙРОФЕРМА",stamp:"AI ASSISTED",group:["neurofarm","sochi","films"],wide:true,poster:"./media/neuro-world.svg",kind:"video",url:source};
      FILMS.push(film);movieById.set(id,film);added++;
    }
    neuroLoadCompleted=true;
    if(added){renderCollections();renderFavorites();if(searchOpen)renderSearch();updateSaved()}
    const message=document.getElementById("neuro-source-state");
    if(message)message.textContent=added?"Нейрофильмы подключены из публичной медиатеки TRIZNES.":"В публичном каталоге пока нет доступного источника для просмотра.";
  }catch(e){const message=document.getElementById("neuro-source-state");if(message)message.textContent="Сервер нейрофильмов временно недоступен. Основной кинотеатр продолжает работать.";}
}
const COLLECTIONS=[
 {id:"premiere",ey:"В ПОДБОРКЕ",title:"Выбор редакции",sub:"Короткие и длинные истории из мира SOCHIWOOD",portrait:false},
 {id:"sochi",ey:"ГОРОД КАК ГЛАВНЫЙ ГЕРОЙ",title:"Сочи в кадре",sub:"Истории, которые происходят здесь",portrait:false},
 {id:"shorts",ey:"СМОТРЕТЬ ЗА МГНОВЕНИЕ",title:"Короткий метр",sub:"Идеи, люди, один точный момент",portrait:true},
 {id:"people",ey:"НАСТОЯЩИЕ ЛИЦА",title:"Герои и их истории",sub:"Каждый выбирает собственную роль",portrait:false},
 {id:"mediahub",ey:"TRIZNES / MEDIAHUB",title:"Медиахаб и события",sub:"Истории наших пространств и будущих встреч",portrait:false},
 {id:"neurofarm",ey:"AI ASSISTED / NEW WORLD",title:"Нейроферма: новый мир",sub:"Авторские нейрофильмы из подтверждённого публичного каталога",portrait:false},
 {id:"daniel",ey:"DANIEL / APOLLON",title:"Личный сериал",sub:"Отдельная линия персонажа — жизнь от первого лица",portrait:false},
 {id:"pinknoize",ey:"PINK NOIZE PRODUCTION",title:"Музыка и киноэссе",sub:"Эстетика, звук и творческая энергия",portrait:false},
 {id:"films",ey:"SOCHIWOOD ORIGINAL",title:"Кино и идеи",sub:"Смысл, музыка и жизнь в одном кадре",portrait:false}
];
const $=id=>document.getElementById(id);
const movieById=new Map(FILMS.map(f=>[f.id,f]));
const storageKey="sochiwood-cinema-favorites-v1";
let saved=new Set();
try{const arr=JSON.parse(localStorage.getItem(storageKey)||"[]");if(Array.isArray(arr))saved=new Set(arr.filter(x=>movieById.has(x)))}catch(_){}
let selectedTab="home",searchOpen=false,searchText="",playback=null,playing=null,ytPending=false,ytFailed=false,lastFocus=null,overlayTimeout=null;
function thumb(id){const f=movieById.get(id);return f?.poster||("https://i.ytimg.com/vi/"+encodeURIComponent(id)+"/hqdefault.jpg")}
function bigThumb(id){const f=movieById.get(id);return f?.poster||("https://i.ytimg.com/vi/"+encodeURIComponent(id)+"/maxresdefault.jpg")}
function formatLabel(f){return f.date+" · "+f.format+" · "+f.line}
function safeLocalSave(){try{localStorage.setItem(storageKey,JSON.stringify([...saved]))}catch(_){}}
function updateSaved(){const h=$("hero-fav"),f=FILMS[0];h.dataset.saved=String(saved.has(f.id));h.textContent=saved.has(f.id)?"✓ В ИЗБРАННОМ":"＋ В ИЗБРАННОЕ";h.setAttribute("aria-label",saved.has(f.id)?"Удалить фильм "+f.title+" из избранного":"Добавить фильм "+f.title+" в избранное");document.querySelectorAll("[data-save-film]").forEach(b=>{const on=saved.has(b.dataset.saveFilm);b.textContent=on?"✓":"＋";b.setAttribute("aria-pressed",String(on));b.setAttribute("aria-label",(on?"Убрать из избранного: ":"Добавить в избранное: ")+(movieById.get(b.dataset.saveFilm)?.title||"фильм"))});}
function toggleSaved(id){if(saved.has(id))saved.delete(id);else saved.add(id);safeLocalSave();updateSaved();renderFavorites();if(selectedTab==="saved")showSavedOnly();if(searchText)renderSearch()}
function createCard(f,portrait){
 const btn=document.createElement("button");btn.type="button";btn.className="movie-card";btn.setAttribute("aria-label","Смотреть: "+f.title);
 const art=document.createElement("span");art.className="movie-art";
 const pic=document.createElement("img");pic.loading="lazy";pic.decoding="async";pic.alt=(f.kind==="video"?"Оригинальная графическая иллюстрация — не кадр фильма ":"Кадр фильма ")+f.title;pic.src=thumb(f.id);
 const badge=document.createElement("span");badge.className="movie-type "+(f.stamp==="REAL"?"real":"neuro");badge.textContent=f.stamp==="REAL"?"РЕАЛЬНАЯ ИСТОРИЯ":f.kind==="video"?"AI ASSISTED":f.format.toUpperCase();
 const play=document.createElement("span");play.className="movie-play";play.setAttribute("aria-hidden","true");play.textContent="▶";
 art.append(pic,badge,play);
 const info=document.createElement("span");info.className="movie-info";
 const title=document.createElement("strong");title.textContent=f.title;
 const meta=document.createElement("small");meta.textContent=f.subtitle;
 info.append(title,meta);btn.append(art,info);
 btn.onclick=()=>openFilm(f.id,btn);
 const tile=document.createElement("div");tile.className="movie-tile";
 const fav=document.createElement("button");fav.className="movie-save";fav.type="button";fav.dataset.saveFilm=f.id;fav.textContent=saved.has(f.id)?"✓":"＋";fav.setAttribute("aria-pressed",String(saved.has(f.id)));fav.setAttribute("aria-label",(saved.has(f.id)?"Убрать из избранного: ":"Добавить в избранное: ")+f.title);
 fav.onclick=()=>toggleSaved(f.id);tile.append(btn,fav);
 return tile;
}
function renderCollections(){
 const target=$("collections");target.textContent="";
 for(const section of COLLECTIONS){
  const records=FILMS.filter(f=>f.group.includes(section.id));if(!records.length)continue;
  const container=document.createElement("section");container.className="shelf";container.id="collection-"+section.id;
  const header=document.createElement("div");header.className="shelf-head";
  const left=document.createElement("div");left.className="shelf-title";
  const ey=document.createElement("span");ey.className="eyebrow";ey.textContent=section.ey;
  const h2=document.createElement("h2");h2.textContent=section.title;
  const p=document.createElement("div");p.className="shelf-sub";p.textContent=section.sub;left.append(ey,h2,p);
  const controls=document.createElement("div");controls.className="shelf-controls";
  const prev=document.createElement("button");prev.type="button";prev.textContent="‹";prev.setAttribute("aria-label","Прокрутить "+section.title+" назад");
  const next=document.createElement("button");next.type="button";next.textContent="›";next.setAttribute("aria-label","Прокрутить "+section.title+" вперёд");
  controls.append(prev,next);header.append(left,controls);
  const rail=document.createElement("div");rail.className="rail"+(section.portrait?" portrait-rail":"");rail.setAttribute("aria-label",section.title);
  records.forEach(f=>rail.append(createCard(f,section.portrait)));
  prev.onclick=()=>rail.scrollBy({left:-rail.clientWidth*.82,behavior:"smooth"});
  next.onclick=()=>rail.scrollBy({left:rail.clientWidth*.82,behavior:"smooth"});
  container.append(header,rail);target.append(container);
 }
}
function renderFavorites(){
 const rail=$("favorites-rail"),shelf=$("favorites-section");
 rail.textContent="";
 const arr=FILMS.filter(f=>saved.has(f.id));
 if(!arr.length){shelf.classList.add("hide");return}
 shelf.classList.remove("hide");arr.forEach(f=>rail.append(createCard(f,false)));
}
function setTab(name){
 selectedTab=name;
 document.querySelectorAll("[data-nav]").forEach(x=>{const isOn=x.dataset.nav===name;x.classList.toggle("selected",isOn);x.setAttribute("aria-current",isOn?"page":"false")});
 const isSaved=name==="saved";
 $("hero").classList.toggle("hide",isSaved);
 $("collections").classList.toggle("hide",isSaved);
 $("spotlight").classList.toggle("hide",isSaved);
 $("favorites-section").classList.toggle("hide",!isSaved && !saved.size);
 $("search-result-wrap").classList.add("hide");
 if(isSaved){showSavedOnly();$("favorites-section").scrollIntoView({behavior:"smooth",block:"start"});return}
 if(name==="home"){window.scrollTo({top:0,behavior:"smooth"});return}
 const target=$("collection-"+name);if(target)target.scrollIntoView({behavior:"smooth",block:"start"});
}
function showSavedOnly(){
 const rail=$("favorites-rail"),shelf=$("favorites-section");rail.textContent="";
 const arr=FILMS.filter(f=>saved.has(f.id));
 shelf.classList.remove("hide");
 if(!arr.length){const p=document.createElement("div");p.className="empty";p.textContent="Пока нет фильмов в избранном. Нажми «В избранное» у понравившейся истории.";rail.append(p);return}
 arr.forEach(f=>rail.append(createCard(f,false)));
}
function setSearch(open){searchOpen=open;$("search-bar").classList.toggle("hide",!open);$("search-trigger").setAttribute("aria-expanded",String(open));if(open){$("search-input").focus();$("search-result-wrap").classList.remove("hide");$("hero").classList.add("hide");$("collections").classList.add("hide");$("spotlight").classList.add("hide");$("favorites-section").classList.add("hide");$("search-result-wrap").scrollIntoView({behavior:"auto",block:"start"});renderSearch();}else{searchText="";$("search-input").value="";setTab(selectedTab)}}
function renderSearch(){
 const root=$("search-grid");root.textContent="";const q=searchText.toLocaleLowerCase("ru").trim();
 const result=FILMS.filter(f=>!q||[f.title,f.subtitle,f.format,f.line,f.desc].join(" ").toLocaleLowerCase("ru").includes(q));
 $("results-count").textContent=result.length+" из "+FILMS.length+" фильмов";
 if(!result.length){const none=document.createElement("p");none.className="empty";none.textContent="Пока нет совпадений. Попробуй другое название или тему.";root.append(none);return}
 result.forEach(f=>root.append(createCard(f,false)));
}
function showDetail(){const to=$("collections");if(to)to.scrollIntoView({behavior:"smooth",block:"start"})}
function initHero(){
 const f=FILMS[0];$("hero-cover").style.backgroundImage="url('"+bigThumb(f.id)+"')";
 const image=new Image();image.onload=()=>{if(image.naturalWidth<800)$("hero-cover").style.backgroundImage="url('"+thumb(f.id)+"')"};
 image.onerror=()=>$("hero-cover").style.backgroundImage="url('"+thumb(f.id)+"')";image.src=bigThumb(f.id);
 $("hero-title").textContent="СОЧИ."; $("hero-title2").textContent="ИГРА НАЧАЛАСЬ";
 $("hero-copy").textContent=f.desc;
 $("hero-play").onclick=()=>openFilm(f.id,$("hero-play"));
 $("hero-detail").onclick=showDetail;
 $("hero-fav").onclick=()=>toggleSaved(f.id);
 updateSaved();
}
function ytLoad(){
 if(window.YT&&window.YT.Player){ytPending=false;startVideo();return}
 if(ytPending)return;
 ytPending=true;const t=document.createElement("script");t.async=true;t.src="https://www.youtube.com/iframe_api";t.onerror=()=>{ytFailed=true;ytPending=false;showFallback()};
 document.head.append(t);
}
window.onYouTubeIframeAPIReady=function(){ytPending=false;if(playing)startVideo()};
function stopCurrentPlayer(){
 try{if(playback&&typeof playback.destroy==="function")playback.destroy();else if(playback&&typeof playback.stopVideo==="function")playback.stopVideo()}catch(_){}
 playback=null;
 const video=$("video-mount").querySelector("video");if(video){video.pause();video.removeAttribute("src");video.load()}
 $("video-mount").textContent="";
}
function showFallback(){
 if(!playing)return;
 stopCurrentPlayer();
 const m=$("video-mount");
 if(playing.kind==="video"){startVideo();return}
 const frame=document.createElement("iframe");frame.title="Просмотр "+playing.title;
 frame.allow="autoplay; encrypted-media; picture-in-picture; fullscreen";frame.allowFullscreen=true;
 frame.referrerPolicy="strict-origin-when-cross-origin";
 frame.src="https://www.youtube-nocookie.com/embed/"+encodeURIComponent(playing.id)+"?autoplay=1&playsinline=1&rel=0";
 m.append(frame);
 $("player-status").textContent="Если встроенный просмотр ограничен, открой видео на YouTube.";
}
function startVideo(){
 if(!playing)return;
 $("player-status").textContent="";
 if(playing.kind==="video"){
   const item=playing;stopCurrentPlayer();
   const v=document.createElement("video");v.controls=true;v.autoplay=true;v.playsInline=true;v.preload="metadata";v.poster=item.poster||"";
   v.src=item.url;v.onended=()=>nextFilm(1);
   v.onerror=()=>$("player-status").textContent="Ссылка на нейрофильм устарела. Обнови страницу для нового разрешённого адреса.";
   $("video-mount").append(v);v.play().catch(()=>{$("player-status").textContent="Нажми Play для просмотра."});return;
 }
 const id=playing.id;
 if(playback&&typeof playback.loadVideoById==="function"){try{playback.loadVideoById(id);return}catch(_){}}
 stopCurrentPlayer();
 const mount=$("video-mount");const root=document.createElement("div");root.id="yt-player";mount.append(root);
 try{
  playback=new window.YT.Player(root,{width:"100%",height:"100%",videoId:id,playerVars:{autoplay:1,playsinline:1,rel:0,controls:1,origin:location.origin},
   events:{onReady:e=>{try{e.target.playVideo()}catch(_){}},onStateChange:e=>{if(e.data===0&&playing)nextFilm(1)},onError:()=>{$("player-status").textContent="YouTube ограничил встроенный просмотр. Используй кнопку YouTube."}}});
 }catch(_){showFallback()}
}
function openFilm(id,source){
 const f=movieById.get(id);if(!f)return;
 if(!playing)lastFocus=source||document.activeElement;
 const switched=playing&&playing.id!==id;playing=f;
 if(switched)stopCurrentPlayer();
 $("player-title").textContent=f.title;
 $("player-line").textContent=f.line+" / "+f.format;
 $("player-detail").textContent=f.desc;
 const external=$("external-youtube");
 external.hidden=!!(f.kind==="video");
 if(f.kind!=="video")external.href="https://www.youtube.com/watch?v="+encodeURIComponent(id);
 $("player-overlay").hidden=false;document.body.style.overflow="hidden";$("close-player").focus();
 if(f.kind==="video")startVideo();
 else if(window.YT&&window.YT.Player)startVideo();else if(ytFailed)showFallback();else ytLoad();
}
function nextFilm(direction){
 if(!playing)return;
 const i=FILMS.findIndex(f=>f.id===playing.id);
 openFilm(FILMS[(i+direction+FILMS.length)%FILMS.length].id);
}
function closeFilm(){
 if(!playing)return;
 stopCurrentPlayer();
 $("player-overlay").hidden=true;document.body.style.overflow="";
 playing=null;
 if(lastFocus&&typeof lastFocus.focus==="function")lastFocus.focus();
}
function setup(){
 renderCollections();initHero();renderFavorites();loadApprovedNeuroMedia();
 $("spotlight-watch").onclick=()=>openFilm("Jq0qKr0U9GU",$("spotlight-watch"));
 document.querySelectorAll("[data-nav]").forEach(b=>b.onclick=()=>{if(searchOpen)setSearch(false);setTab(b.dataset.nav)});
 $("search-trigger").onclick=()=>setSearch(!searchOpen);
 $("close-search").onclick=()=>setSearch(false);
 $("search-input").addEventListener("input",e=>{searchText=e.target.value;renderSearch()});
 $("close-player").onclick=closeFilm;
 $("player-next").onclick=()=>nextFilm(1);
 $("player-prev").onclick=()=>nextFilm(-1);
 window.addEventListener("keydown",e=>{
  if(e.key==="Escape"){if(playing)closeFilm();else if(searchOpen)setSearch(false);return}
  if(e.key==="/"&&!playing&&!searchOpen&&e.target.tagName!=="INPUT"){e.preventDefault();setSearch(true)}
  if(playing&&e.key==="ArrowRight"){e.preventDefault();nextFilm(1)}
  if(playing&&e.key==="ArrowLeft"){e.preventDefault();nextFilm(-1)}
 });
 document.addEventListener("scroll",()=>{$("top").classList.toggle("scrolled",window.scrollY>30)},{passive:true});
 const favPrev=$("favorite-left"),favNext=$("favorite-right"),rail=$("favorites-rail");
 favPrev.onclick=()=>rail.scrollBy({left:-rail.clientWidth*.75,behavior:"smooth"});
 favNext.onclick=()=>rail.scrollBy({left:rail.clientWidth*.75,behavior:"smooth"});
 // Keep browsing functional even if YouTube iframe is not available on a visitor's device.
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup);else setup();
})();
