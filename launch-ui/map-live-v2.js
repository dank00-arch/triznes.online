/* TRIZNES MAP V3 — real Sochi + editable Living World overlays.
   Base: MapLibre GL JS + OpenFreeMap. Live user geolocation stays on-device.
   Public world overlays are read from get_triznes_map(); editor writes are RLS-gated to admins. */
(() => {
  'use strict';

  const SUPABASE='https://bbxhhtpmbtgfaxamgksf.supabase.co';
  const KEY='sb_publishable_aFTiVGlsJxeeutL_gEZaKA_S9VyKaHS';
  const MAPLIBRE='6.16.0';
  const SOCHI=[39.7248,43.5855];
  const BOUNDS=[[39.45,43.39],[40.36,43.82]];
  const editMode=new URLSearchParams(location.search).get('edit')==='1';
  let map=null;
  let mapData={places:[],layers:[],features:[]};
  let selected=null;
  let refreshing=false;
  let draft={mode:null,coords:[]};

  const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const currentWorld=()=>document.body.dataset.world==='cyber'?'cyber':'paradise';
  const validCoord=(p)=>Number.isFinite(Number(p?.longitude))&&Number.isFinite(Number(p?.latitude));
  const styleFor=(mode)=>mode==='cyber'?'https://tiles.openfreemap.org/styles/dark':'https://tiles.openfreemap.org/styles/bright';
  const colors=(mode)=>mode==='cyber'?{place:'#35e9ff',halo:'#8058ff',quest:'#ff2ec8',zone:'#28145c',zoneLine:'#8058ff',scene:'#ff2ec8'}:{place:'#00e5a8',halo:'#fff36d',quest:'#00d4ff',zone:'#d8ff66',zoneLine:'#00e5a8',scene:'#ff5e7a'};

  async function rpc(name,body={}){
    const controller=new AbortController(),timer=window.setTimeout(()=>controller.abort(),9000);
    let r;try{r=await fetch(`${SUPABASE}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store',signal:controller.signal})}finally{clearTimeout(timer)}
    if(!r.ok) throw new Error(`${name}_${r.status}`);
    return r.json();
  }

  function loadCss(){
    if(!document.querySelector('link[href*="maplibre-gl.css"]')){
      const l=document.createElement('link');l.rel='stylesheet';l.href=`https://unpkg.com/maplibre-gl@${MAPLIBRE}/dist/maplibre-gl.css`;document.head.appendChild(l);
    }
    if(!document.querySelector('link[href*="map-v3.css"]')){
      const l=document.createElement('link');l.rel='stylesheet';l.href='./map-v3.css?v=20261105-sochi-gamehud-v3';document.head.appendChild(l);
    }
  }

  function placesGeoJSON(){
    return {type:'FeatureCollection',features:mapData.places.filter(validCoord).map(p=>({type:'Feature',id:p.slug,properties:{slug:p.slug,name:p.name,category:p.category||'place',description:p.description||'',reality_status:p.reality_status||'REAL',geo_accuracy:p.metadata?.geo_accuracy||'',address:p.address||''},geometry:{type:'Point',coordinates:[Number(p.longitude),Number(p.latitude)]}}))};
  }

  function overlaysGeoJSON(){
    return {type:'FeatureCollection',features:mapData.features.map(f=>({type:'Feature',id:f.slug,properties:{slug:f.slug,title:f.title,layer_slug:f.layer_slug,reality_status:f.reality_status,origin_type:f.origin_type,...(f.properties||{})},geometry:f.geometry})).filter(f=>f.geometry?.type)};
  }

  function mountSources(){
    if(!map||!map.isStyleLoaded()) return;
    const mode=currentWorld(), c=colors(mode);
    mount3DBuildings(mode);
    mountGameRoads(mode);
    if(!map.getSource('triznes-places')) map.addSource('triznes-places',{type:'geojson',data:placesGeoJSON()}); else map.getSource('triznes-places').setData(placesGeoJSON());
    if(!map.getSource('triznes-world')) map.addSource('triznes-world',{type:'geojson',data:overlaysGeoJSON()}); else map.getSource('triznes-world').setData(overlaysGeoJSON());

    if(!map.getLayer('triznes-zones')) map.addLayer({id:'triznes-zones',type:'fill',source:'triznes-world',filter:['==',['geometry-type'],'Polygon'],paint:{'fill-color':c.zone,'fill-opacity':mode==='cyber'?0.22:0.18,'fill-outline-color':c.zoneLine}});
    if(!map.getLayer('triznes-world-lines')) map.addLayer({id:'triznes-world-lines',type:'line',source:'triznes-world',filter:['==',['geometry-type'],'LineString'],paint:{'line-color':['case',['==',['get','layer_slug'],'quests'],c.quest,c.zoneLine],'line-width':['case',['==',['get','layer_slug'],'quests'],4,2],'line-opacity':0.9,'line-blur':mode==='cyber'?0.7:0.35}});
    if(!map.getLayer('triznes-place-halo')) map.addLayer({id:'triznes-place-halo',type:'circle',source:'triznes-places',paint:{'circle-radius':['interpolate',['linear'],['zoom'],8,8,13,18],'circle-color':c.halo,'circle-opacity':mode==='cyber'?0.16:0.28,'circle-blur':0.75}});
    if(!map.getLayer('triznes-place-hit')) map.addLayer({id:'triznes-place-hit',type:'circle',source:'triznes-places',paint:{'circle-radius':['interpolate',['linear'],['zoom'],8,5,13,10],'circle-color':c.place,'circle-stroke-color':mode==='cyber'?'#041022':'#ffffff','circle-stroke-width':2,'circle-opacity':0.96}});
    if(!map.getLayer('triznes-place-label')) map.addLayer({id:'triznes-place-label',type:'symbol',source:'triznes-places',layout:{'text-field':['get','name'],'text-size':['interpolate',['linear'],['zoom'],9,10,13,13],'text-offset':[0,1.2],'text-anchor':'top','text-allow-overlap':false},paint:{'text-color':mode==='cyber'?'#eafcff':'#073e35','text-halo-color':mode==='cyber'?'#02040c':'#ffffff','text-halo-width':2}});
    if(!map.getLayer('triznes-world-points')) map.addLayer({id:'triznes-world-points',type:'circle',source:'triznes-world',filter:['==',['geometry-type'],'Point'],paint:{'circle-radius':8,'circle-color':['case',['==',['get','layer_slug'],'scenes'],c.scene,c.quest],'circle-stroke-width':2,'circle-stroke-color':mode==='cyber'?'#02040c':'#fff'}});

    map.off('click','triznes-place-hit',onPlaceClick);map.on('click','triznes-place-hit',onPlaceClick);
    map.off('mouseenter','triznes-place-hit',pointerOn);map.on('mouseenter','triznes-place-hit',pointerOn);
    map.off('mouseleave','triznes-place-hit',pointerOff);map.on('mouseleave','triznes-place-hit',pointerOff);
    refreshDraft();
  }

  // Real building footprints from OpenFreeMap / OpenMapTiles, extruded in 3D.
  function mount3DBuildings(mode=currentWorld()){
    if(!map?.getSource('openmaptiles')||map.getLayer('triznes-3d-buildings')) return;
    const firstLabel=map.getStyle()?.layers?.find(layer=>layer.type==='symbol'&&layer.layout?.['text-field'])?.id;
    map.addLayer({id:'triznes-3d-buildings',type:'fill-extrusion',source:'openmaptiles','source-layer':'building',minzoom:12,paint:{
      'fill-extrusion-color':['interpolate',['linear'],['coalesce',['get','render_height'],['get','height'],8],0,mode==='cyber'?'#132b50':'#3c8079',18,mode==='cyber'?'#214f7b':'#62aaa0',55,mode==='cyber'?'#3b4f9b':'#b1d984',120,mode==='cyber'?'#7a55a8':'#f5d987'],
      'fill-extrusion-height':['interpolate',['linear'],['zoom'],12,0,14,['coalesce',['get','render_height'],['get','height'],8]],
      'fill-extrusion-base':['coalesce',['get','render_min_height'],0],
      'fill-extrusion-opacity':mode==='cyber'?0.96:0.84,
      'fill-extrusion-vertical-gradient':true
    }},firstLabel);
    try{map.setLight({anchor:'viewport',color:mode==='cyber'?'#9fdcff':'#fff1ce',intensity:0.48,position:[1.15,210,35]})}catch(_){}
  }

  // Give the real road network a restrained game-map hierarchy without drawing fictional streets.
  function mountGameRoads(mode=currentWorld()){
    if(!map?.getSource('openmaptiles')||map.getLayer('triznes-road-glow')) return;
    const firstLabel=map.getStyle()?.layers?.find(layer=>layer.type==='symbol'&&layer.layout?.['text-field'])?.id;
    const filter=['in',['get','class'],['literal',['motorway','trunk','primary','secondary']]];
    map.addLayer({id:'triznes-road-glow',type:'line',source:'openmaptiles','source-layer':'transportation',minzoom:11,filter,paint:{'line-color':mode==='cyber'?'#20dfff':'#00b98d','line-width':['interpolate',['linear'],['zoom'],11,2,15,8],'line-opacity':mode==='cyber'?0.17:0.13,'line-blur':5}},firstLabel);
    map.addLayer({id:'triznes-road-highlight',type:'line',source:'openmaptiles','source-layer':'transportation',minzoom:11,filter,paint:{'line-color':['match',['get','class'],'motorway',mode==='cyber'?'#ff3dc8':'#ffc857','trunk',mode==='cyber'?'#a66cff':'#ffca66','primary',mode==='cyber'?'#32dfff':'#54c9ad',mode==='cyber'?'#7186b5':'#8ab3a3'],'line-width':['interpolate',['linear'],['zoom'],11,0.6,15,2.2],'line-opacity':mode==='cyber'?0.72:0.68}},firstLabel);
  }

  function pointerOn(){map.getCanvas().style.cursor='pointer'}
  function pointerOff(){map.getCanvas().style.cursor=draft.mode?'crosshair':''}
  function onPlaceClick(e){const slug=e.features?.[0]?.properties?.slug;const p=mapData.places.find(x=>x.slug===slug);if(p) selectPlace(p,true)}

  function selectPlace(place,fly=false){
    selected=place;
    if(fly&&validCoord(place)) map.flyTo({center:[Number(place.longitude),Number(place.latitude)],zoom:15,pitch:currentWorld()==='cyber'?62:56,duration:1100});
    const sheet=document.querySelector('.page-world-map .sheet');
    if(sheet){
      const title=sheet.querySelector('.t-h2');if(title)title.textContent=place.name||'Объект Сочи';
      const eyebrow=sheet.querySelector('.t-eyebrow');if(eyebrow)eyebrow.textContent=`${place.category||'Место'} · ${place.city||'Сочи'}`;
      const status=sheet.querySelector('.statusbar .l');if(status)status.innerHTML=`<span class="pdot"></span>${esc(place.description||'Подтверждённая точка Living World')}`;
      const right=sheet.querySelector('.statusbar .r');if(right)right.textContent=place.metadata?.geo_accuracy==='address_exact'?'ТОЧНЫЙ АДРЕС':'REAL GEO';
      const cta=sheet.querySelector('.btn.primary');if(cta){cta.href='#';cta.innerHTML='⌖ Навигация персонажа →';cta.onclick=(ev)=>{ev.preventDefault();startNavigation(place)};}
    }
    const card=document.querySelector('.tc-map-selected');
    if(card){
      card.classList.add('show');card.innerHTML=`<div class="kind">${esc(place.category||'МЕСТО')} · ${esc(place.reality_status||'REAL')}</div><b>${esc(place.name||'Объект Сочи')}</b><p>${esc(place.description||'')}</p><div class="actions"><button class="primary" type="button" data-map-nav>НАВИГАЦИЯ</button><a href="city-objects.html?place=${encodeURIComponent(place.slug||'')}">КАРТОЧКА</a></div>`;
      card.querySelector('[data-map-nav]')?.addEventListener('click',()=>startNavigation(place));
    }
  }

  function distanceKm(a,b){const R=6371,toRad=x=>x*Math.PI/180;const dLat=toRad(b[1]-a[1]),dLon=toRad(b[0]-a[0]);const s=Math.sin(dLat/2)**2+Math.cos(toRad(a[1]))*Math.cos(toRad(b[1]))*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(s))}

  function startNavigation(place){
    if(!validCoord(place)) return showNav(place,null,'Для этой точки координаты ещё проходят проверку.');
    const destination=[Number(place.longitude),Number(place.latitude)];
    if(!navigator.geolocation){showNav(place,null,'Геолокация браузера недоступна. Открой внешний навигатор.');return}
    navigator.geolocation.getCurrentPosition(pos=>{
      const origin=[pos.coords.longitude,pos.coords.latitude];
      drawCharacterVector(origin,destination);showNav(place,distanceKm(origin,destination),`Точность геолокации ≈ ${Math.round(pos.coords.accuracy)} м. GPS остаётся только на устройстве.`);
    },()=>showNav(place,null,'Доступ к геопозиции не дан. Можно открыть внешний навигатор до выбранной точки.'),{enableHighAccuracy:true,timeout:9000,maximumAge:15000});
  }

  function drawCharacterVector(origin,destination){
    const data={type:'Feature',properties:{kind:'local_character_vector'},geometry:{type:'LineString',coordinates:[origin,destination]}};
    if(map.getSource('character-vector')) map.getSource('character-vector').setData(data); else {map.addSource('character-vector',{type:'geojson',data});map.addLayer({id:'character-vector',type:'line',source:'character-vector',paint:{'line-color':colors(currentWorld()).quest,'line-width':5,'line-dasharray':[1.1,1.3],'line-opacity':0.95}})}
    const b=new window.maplibregl.LngLatBounds();b.extend(origin);b.extend(destination);map.fitBounds(b,{padding:90,maxZoom:14,duration:900});
  }

  function showNav(place,distance,message){
    let box=document.querySelector('.tc-character-nav');
    if(!box){box=document.createElement('section');box.className='tc-character-nav';document.querySelector('.page-world-map .sheet')?.insertAdjacentElement('afterend',box)}
    const lat=Number(place.latitude),lng=Number(place.longitude);const google=`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;const yandex=`yandexnavi://build_route_on_map?lat_to=${lat}&lon_to=${lng}`;
    box.innerHTML=`<div class="head"><span>CHARACTER NAV</span><b>${distance?`${distance.toFixed(distance<10?1:0)} км по вектору`:'точка выбрана'}</b></div><p><b>${esc(place.name)}</b> · ${esc(message)}<br>Линия внутри TRIZNES — игровой вектор, не дорожный маршрут. Дорожную навигацию открываем отдельным сервисом.</p><div class="nav-actions"><a href="${yandex}">ЯНДЕКС НАВИГАТОР</a><a href="${google}" target="_blank" rel="noopener">GOOGLE ROUTE ↗</a></div>`;
    box.scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  function mountChrome(mapwrap){
    mapwrap.insertAdjacentHTML('beforeend',`<div class="tc-map-chrome"><label class="tc-map-search"><span class="search-glyph">⌕</span><input type="search" placeholder="Найти объект TRIZNES…" aria-label="Найти объект"></label><div class="tc-map-provider"><span class="tc-live-dot"></span><span data-map-sync data-state="loading">REAL SOCHI · 3D LIVE</span></div></div><div class="tc-map-mission"><span class="mission-eyebrow"><i></i> WORLD SIMULATION · SOCHI</span><b>ГОРОД — ТВОЯ ИГРОВАЯ КАРТА</b><span class="mission-meta"><strong data-world-count>0</strong> подтверждённых точек <em>·</em> мир обновляется в реальном времени</span></div><div class="tc-map-coords"><span>ЛОКАЦИЯ</span><b data-map-coords>43.5855° N<br>39.7248° E</b><i>SOCHI · BLACK SEA</i></div><div class="tc-map-selected"></div><div class="tc-map-layerbar"><button class="on" data-layer="places">◉ <span>ОБЪЕКТЫ</span></button><button class="on" data-layer="world-zones">⬡ <span>ЗОНЫ МИРА</span></button><button class="on" data-layer="quests">⌁ <span>КВЕСТЫ</span></button><button class="on" data-layer="scenes">✦ <span>СЦЕНЫ</span></button>${editMode?'<button class="on" data-open-editor>РЕДАКТОР</button>':''}</div>`);
    const input=mapwrap.querySelector('.tc-map-search input');
    input?.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();if(q.length<2)return;const p=mapData.places.find(x=>(x.name||'').toLowerCase().includes(q)||(x.category||'').toLowerCase().includes(q));if(p)selectPlace(p,true)});
    mapwrap.querySelectorAll('[data-layer]').forEach(btn=>btn.addEventListener('click',()=>toggleLayer(btn)));
    if(editMode) mountEditor(mapwrap);
  }

  function toggleLayer(btn){
    const key=btn.dataset.layer;const on=!btn.classList.contains('on');btn.classList.toggle('on',on);const vis=on?'visible':'none';
    if(key==='places'){['triznes-place-halo','triznes-place-hit','triznes-place-label'].forEach(id=>map.getLayer(id)&&map.setLayoutProperty(id,'visibility',vis));return}
    const filterBy={quests:'triznes-world-lines','world-zones':'triznes-zones',scenes:'triznes-world-points'};const id=filterBy[key];if(id&&map.getLayer(id))map.setLayoutProperty(id,'visibility',vis);
  }

  function mountEditor(mapwrap){
    const panel=document.createElement('div');panel.className='tc-map-editor';panel.innerHTML=`<h3>РЕДАКТОР МИРА</h3><input data-edit-title placeholder="Название слоя / сцены"><div class="rowx" style="margin-top:6px"><select data-edit-layer><option value="world-zones">Зона мира</option><option value="quests">Квестовый маршрут</option><option value="scenes">Сцена / точка</option></select><select data-edit-visibility><option value="internal">На проверку</option><option value="public">Публично</option></select></div><div class="rowx" style="margin-top:6px"><button data-draw="point">ТОЧКА</button><button data-draw="line">МАРШРУТ</button><button data-draw="polygon">ЗОНА</button><button data-draw-reset>СБРОС</button></div><button data-draw-save style="width:100%;margin-top:6px">СОХРАНИТЬ ЧЕРЕЗ ADMIN RLS</button><div class="status">Клик по карте добавляет вершины. GPS персонажей сюда не записывается.</div>`;mapwrap.appendChild(panel);
    panel.querySelectorAll('[data-draw]').forEach(btn=>btn.addEventListener('click',()=>{draft.mode=btn.dataset.draw;draft.coords=[];panel.querySelectorAll('[data-draw]').forEach(x=>x.classList.toggle('on',x===btn));map.getCanvas().style.cursor='crosshair';refreshDraft()}));
    panel.querySelector('[data-draw-reset]').onclick=()=>{draft={mode:null,coords:[]};panel.querySelectorAll('[data-draw]').forEach(x=>x.classList.remove('on'));map.getCanvas().style.cursor='';refreshDraft()};
    panel.querySelector('[data-draw-save]').onclick=()=>saveDraft(panel);
    map.on('click',e=>{if(!draft.mode)return;draft.coords.push([e.lngLat.lng,e.lngLat.lat]);if(draft.mode==='point')draft.coords=draft.coords.slice(-1);refreshDraft();panel.querySelector('.status').textContent=`${draft.mode.toUpperCase()} · вершин: ${draft.coords.length}`});
  }

  function draftGeo(){
    if(!draft.mode||!draft.coords.length)return {type:'FeatureCollection',features:[]};let geometry=null;
    if(draft.mode==='point')geometry={type:'Point',coordinates:draft.coords[0]};
    if(draft.mode==='line'&&draft.coords.length>=2)geometry={type:'LineString',coordinates:draft.coords};
    if(draft.mode==='polygon'&&draft.coords.length>=3)geometry={type:'Polygon',coordinates:[[...draft.coords,draft.coords[0]]]};
    return {type:'FeatureCollection',features:geometry?[{type:'Feature',properties:{draft:true},geometry}]:[]};
  }
  function refreshDraft(){if(!map||!map.isStyleLoaded())return;const d=draftGeo();if(map.getSource('editor-draft'))map.getSource('editor-draft').setData(d);else {map.addSource('editor-draft',{type:'geojson',data:d});map.addLayer({id:'editor-draft-line',type:'line',source:'editor-draft',paint:{'line-color':colors(currentWorld()).quest,'line-width':4,'line-dasharray':[1,1]}});map.addLayer({id:'editor-draft-fill',type:'fill',source:'editor-draft',paint:{'fill-color':colors(currentWorld()).zone,'fill-opacity':0.2,'fill-outline-color':colors(currentWorld()).zoneLine}});map.addLayer({id:'editor-draft-point',type:'circle',source:'editor-draft',paint:{'circle-radius':8,'circle-color':colors(currentWorld()).scene,'circle-stroke-width':2,'circle-stroke-color':'#fff'}})}}

  function authToken(){try{for(const k of Object.keys(localStorage)){if(/^sb-.*-auth-token$/.test(k)){const x=JSON.parse(localStorage.getItem(k)||'null');const t=x?.access_token||x?.currentSession?.access_token||x?.session?.access_token;if(t)return t}}}catch(_){}return null}
  async function saveDraft(panel){
    const fc=draftGeo();const geometry=fc.features[0]?.geometry;const status=panel.querySelector('.status');if(!geometry){status.textContent='Нужно добавить достаточно точек.';return}
    const token=authToken();if(!token){status.textContent='Нужна авторизация администратора TRIZNES.';return}
    const title=panel.querySelector('[data-edit-title]').value.trim()||'Новый слой мира';const layer=panel.querySelector('[data-edit-layer]').value;const visibility=panel.querySelector('[data-edit-visibility]').value;
    const row={slug:`map-${Date.now()}`,layer_slug:layer,title,geometry,properties:{editor:'launch-ui',world:currentWorld()},reality_status:'ARTISTIC_BRANCH',origin_type:'REAL',visibility,active:true,source_ref:'TRIZNES Launch UI map editor'};
    status.textContent='Сохраняю…';
    const r=await fetch(`${SUPABASE}/rest/v1/triznes_world_map_features`,{method:'POST',headers:{apikey:KEY,Authorization:`Bearer ${token}`,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(row)});
    if(!r.ok){status.textContent=`Не сохранено: доступ администратора или данные требуют проверки (${r.status}).`;return}
    status.textContent=visibility==='public'?'Сохранено в публичный слой.':'Сохранено как внутренний слой на проверку.';draft={mode:null,coords:[]};refreshDraft();if(visibility==='public'){await loadMapData();mountSources()}
  }

  async function loadMapData(){mapData=await rpc('get_triznes_map');mapData.places=Array.isArray(mapData.places)?mapData.places:[];mapData.layers=Array.isArray(mapData.layers)?mapData.layers:[];mapData.features=Array.isArray(mapData.features)?mapData.features:[]}

  async function refreshLiveMap(){
    if(refreshing||document.hidden)return;refreshing=true;
    const badge=document.querySelector('[data-map-sync]');
    try{
      await loadMapData();mountSources();
      const count=document.querySelector('[data-world-count]');if(count)count.textContent=String(mapData.places.length).padStart(2,'0');
      if(selected){const next=mapData.places.find(p=>p.slug===selected.slug);if(next)selected=next}
      if(badge){badge.textContent=`LIVE · ${new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}`;badge.dataset.state='live'}
    }catch(error){
      console.warn('[TRIZNES MAP] live refresh failed',error);
      if(badge){badge.textContent='СВЯЗЬ ВОССТАНАВЛИВАЕТСЯ';badge.dataset.state='stale'}
    }finally{refreshing=false}
  }

  function wireFilters(){document.querySelectorAll('.page-world-map .filter button').forEach(btn=>{const t=btn.textContent.toLowerCase();if(/люди/.test(t))btn.onclick=()=>location.href='character.html';if(/сообщ/.test(t))btn.onclick=()=>location.href='communities.html';if(/места/.test(t))btn.onclick=()=>location.href='city-objects.html';if(/событ|истор/.test(t))btn.onclick=()=>location.href='boards.html';if(/съём/.test(t))btn.onclick=()=>location.href='neurofarm.html'})}

  async function boot(){
    const wrap=document.querySelector('.page-world-map .mapwrap');if(!wrap)return;
    loadCss();
    let dataAvailable=true;
    try{await loadMapData()}catch(error){dataAvailable=false;mapData={places:[],layers:[],features:[]};console.warn('[TRIZNES MAP] initial data unavailable; starting map in reconnect mode',error)}
    let maplibregl;
    try{maplibregl=await import(`https://unpkg.com/maplibre-gl@${MAPLIBRE}/dist/maplibre-gl.mjs`)}catch(error){console.error('[TRIZNES MAP] MapLibre unavailable',error);return}
    wrap.classList.add('tc-real-map');wrap.innerHTML='<div id="triznesRealMap"></div>';mountChrome(wrap);wireFilters();
    window.maplibregl=maplibregl;
    map=new maplibregl.Map({container:'triznesRealMap',style:styleFor(currentWorld()),center:SOCHI,zoom:14.2,pitch:currentWorld()==='cyber'?67:61,bearing:-8,maxBounds:BOUNDS,attributionControl:true,hash:false});
    map.addControl(new maplibregl.NavigationControl({visualizePitch:true}),'top-right');
    map.addControl(new maplibregl.GeolocateControl({positionOptions:{enableHighAccuracy:true},trackUserLocation:true,showUserHeading:true,showAccuracyCircle:true}),'top-right');
    map.addControl(new maplibregl.ScaleControl({maxWidth:100,unit:'metric'}),'bottom-right');
    map.on('style.load',()=>{mountSources();const requested=new URLSearchParams(location.search).get('place');const p=mapData.places.find(x=>x.slug===requested);if(p)selectPlace(p,true)});
    const updateCoords=()=>{const node=document.querySelector('[data-map-coords]');if(!node)return;const c=map.getCenter();node.innerHTML=`${Math.abs(c.lat).toFixed(4)}° ${c.lat<0?'S':'N'}<br>${Math.abs(c.lng).toFixed(4)}° ${c.lng<0?'W':'E'}`};
    map.on('moveend',updateCoords);map.once('load',updateCoords);
    map.on('error',e=>console.warn('[TRIZNES MAP]',e?.error?.message||e));
    window.addEventListener('triznes:world-change',ev=>{const mode=ev.detail?.world==='cyber'?'cyber':'paradise';map.setStyle(styleFor(mode));map.easeTo({pitch:mode==='cyber'?67:61,duration:700});});
    const defaultPlace=mapData.places.find(p=>p.slug==='mediahub-primorskaya'&&validCoord(p))||mapData.places.find(validCoord);if(defaultPlace)selectPlace(defaultPlace,false);
    if(!dataAvailable){const badge=document.querySelector('[data-map-sync]');if(badge){badge.textContent='ОЖИДАЮ ДАННЫЕ · ПОВТОР';badge.dataset.state='stale'}}
    refreshLiveMap();window.setInterval(refreshLiveMap,30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshLiveMap()});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>boot().catch(err=>console.error('[TRIZNES MAP]',err)),{once:true});else boot().catch(err=>console.error('[TRIZNES MAP]',err));
})();
