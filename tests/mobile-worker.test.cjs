const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function worker(file,missing){
 const events={},saved=new Map();let activated=false;
 const cache={add:async path=>{if(path===missing)throw Error('404');saved.set(path,new Response('shell'));},put:async(key,value)=>saved.set(key.url||key,value)};
 const self={registration:{scope:'https://example.test/launch-ui/'},clients:{claim:async()=>{}},skipWaiting:async()=>{activated=true},addEventListener:(name,fn)=>events[name]=fn};
 vm.runInNewContext(fs.readFileSync(file,'utf8'),{self,location:{origin:'https://example.test'},URL,Response,Promise,caches:{open:async()=>cache,keys:async()=>[],match:async key=>saved.get(key.url||key)},fetch:async()=>{throw Error('offline')}});
 return {events,saved,get activated(){return activated}};
}
for(const [file,required,optional] of [['app/sw.js','/app/index.html','/app/img/guide-apollon.webp'],['launch-ui/sw.js','./entry.html','./pult/system-status.json']]){
 test(`${file}: missing optional asset does not block installation`,async()=>{const w=worker(file,optional);let done;w.events.install({waitUntil:p=>done=p});await done;assert.equal(w.activated,true);assert.ok(w.saved.has(required));});
 test(`${file}: missing required shell rejects installation`,async()=>{const w=worker(file,required);let done;w.events.install({waitUntil:p=>done=p});await assert.rejects(done);assert.equal(w.activated,false);});
}
test('offline privacy page never receives the application home page',async()=>{
 const w=worker('app/sw.js');w.saved.set('/app/index.html',new Response('private-home'));let response;
 w.events.fetch({request:{url:'https://example.test/app/privacy.html',method:'GET',mode:'navigate',headers:new Headers()},respondWith:p=>response=p});
 const result=await response;assert.equal(result.status,503);assert.ok(!(await result.text()).includes('private-home'));
});
