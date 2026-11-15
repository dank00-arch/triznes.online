const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
function browser(kind,initial={}){
 const elements=new Map(),storage=new Map(Object.entries(initial));
 const element=id=>{if(!elements.has(id))elements.set(id,{id,hidden:id==='app',style:{},value:'',textContent:'',className:'',classList:{add(){},remove(){},toggle(){}},listeners:{},addEventListener(n,fn){this.listeners[n]=fn},focus(){},querySelectorAll(){return []},appendChild(){}});return elements.get(id)};
 const context=vm.createContext({console,URLSearchParams,URL,Request,Response,AbortSignal,setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},location:{hash:'',search:'',pathname:'/register.html',protocol:'http:',replace(url){this.replaced=url}},history:{replaceState(){}},navigator:{userAgent:'test'},matchMedia:()=>({matches:true}),addEventListener(){},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},fetch:async()=>{throw new Error('Unexpected live request')},document:{readyState:'loading',documentElement:{dataset:{}},getElementById:element,querySelector:element,querySelectorAll:s=>s==='#lPin input'?[0,1,2,3].map(i=>element('pin'+i)):[],addEventListener(){},createElement:()=>element('new')}});
 context.window=context;
 let source;if(kind==='register')source=fs.readFileSync(__dirname+'/../register.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];else{source=fs.readFileSync(__dirname+'/../app/js/app.js','utf8');const end=source.lastIndexOf('})();');source=source.slice(0,end)+'window.accessTest={start,clearPersonalCache,syncPersonalOwner};'+source.slice(end)}
 vm.runInContext(source,context);return{c:context,e:element,storage};
}
test('secure-login error code reaches the form switch',async()=>{
 const {c,e}=browser('register');c.fetch=async()=>Response.json({ok:false,error:'secure_login_required'},{status:403});e('name').value='Admin';e('pin').value='1234';await e('loginForm').listeners.submit({preventDefault(){}});assert.equal(e('secureCard').style.display,'block');assert.match(e('secureStatus').textContent,/2FA/);
});
test('a failed status request does not replace the current session',async()=>{
 const {c,storage}=browser('register');storage.set('triznes-platform-session','existing');c.fetch=async()=>Response.json({ok:false,error:'platform_access_failed'},{status:503});await assert.rejects(vm.runInContext("finishSession('unverified')",c));assert.equal(storage.get('triznes-platform-session'),'existing');
});
test('changing accounts clears personal caches from the previous user',()=>{
 const {c,storage}=browser('register');storage.set('triznes-platform-session','old');for(const k of ['triznes-app-me','triznes-chat-guide','triznes-chat-apollon'])storage.set(k,'private');vm.runInContext("saveSession('new')",c);for(const k of ['triznes-app-me','triznes-chat-guide','triznes-chat-apollon'])assert.equal(storage.has(k),false);
});
test('invite parser tolerates malformed percent encoding',()=>{const {c}=browser('register');c.location.hash='#invite=%broken';assert.doesNotThrow(()=>vm.runInContext('getInviteToken()',c))});
test('expired app sessions keep the cabinet hidden and clear cached personal data',async()=>{
 const {c,e,storage}=browser('app',{'triznes-platform-session':'expired','triznes-app-me':'private'});c.fetch=async()=>Response.json({ok:false,error:'session_invalid'},{status:401});await c.accessTest.start();assert.equal(e('app').hidden,true);assert.equal(storage.has('triznes-platform-session'),false);assert.equal(storage.has('triznes-app-me'),false);assert.match(e('lStatus').textContent,/Сессия закончилась/);
});
test('network failure keeps the app closed and preserves the session for retry',async()=>{
 const {c,e,storage}=browser('app',{'triznes-platform-session':'valid'});c.fetch=async()=>{throw new Error('offline')};await c.accessTest.start();assert.equal(e('app').hidden,true);assert.equal(storage.get('triznes-platform-session'),'valid');assert.equal(e('lBtn').disabled,false);
});
test('app sends privileged sessions to the secure login page',async()=>{
 const {c,e}=browser('app',{'triznes-platform-session':'old-pin-session'});c.fetch=async()=>Response.json({ok:false,error:'secure_session_required'},{status:403});await c.accessTest.start();assert.equal(e('app').hidden,true);assert.equal(c.location.replaced,'/register.html');
});

test('verified profile changes invalidate legacy chat history',()=>{const {c,storage}=browser('app');storage.set('triznes-personal-cache-player','old-player');storage.set('triznes-chat-apollon','private');c.accessTest.syncPersonalOwner('new-player');assert.equal(storage.has('triznes-chat-apollon'),false);assert.equal(storage.get('triznes-personal-cache-player'),'new-player')});
test('the same verified player keeps their conversation cache',()=>{const {c,storage}=browser('app');storage.set('triznes-personal-cache-player','same-player');storage.set('triznes-chat-apollon','private');c.accessTest.syncPersonalOwner('same-player');assert.equal(storage.get('triznes-chat-apollon'),'private')});
