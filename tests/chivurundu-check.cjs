const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{stripTypeScriptTypes}=require('node:module');
const code=stripTypeScriptTypes(fs.readFileSync('supabase/functions/admin-ai-agent/index.ts','utf8').replace(/^import .*;\n/,''));let actor='admin',attempts=0,calls=[];
const environment={SUPABASE_URL:'https://db.test',SUPABASE_ANON_KEY:'anon',SUPABASE_SERVICE_ROLE_KEY:'service',GEMINI_API_KEY:'gemini'};
const ctx=vm.createContext({Request,Response,TextEncoder,AbortSignal,URL,console,Deno:{env:{get:k=>environment[k]},serve:h=>ctx.handler=h},fetch:async(url,init={})=>{
 calls.push({url,init});
 if(url.includes('/auth/v1/user'))return new Response(JSON.stringify(actor==='anonymous'?{}:{id:'user',email:'andrey@example.test'}),{status:actor==='anonymous'?401:200});
 if(url.includes('/rest/v1/profiles?'))return Response.json([{role:actor==='admin'?'admin':'character',first_name:actor==='admin'?'BEZLIKI':'Андрей'}]);
 if(url.includes('/rest/v1/system_admins?'))return Response.json(actor==='admin'?[{user_id:'user'}]:[]);
 if(url.includes('/rest/v1/operator_identities?'))return Response.json([{id:'own-identity'}]);
 if(url.includes('/rest/v1/neurofarm_campaign_access?'))return Response.json(actor==='stranger'?[]:[{enabled:true}]);
 if(url.includes('/rest/v1/triznes_membership_cards?'))return Response.json(actor==='expired'?[]:[{id:'card'}]);
 if(url.includes('/rest/v1/content_jobs?')){if(actor!=='admin')assert(url.includes('requested_by_identity_id=in.(own-identity)'));return Response.json([])}
 if(url.includes('/v1beta/models?'))return Response.json({models:['gemini-2.5-flash','gemini-2.5-flash-lite'].map(x=>({name:'models/'+x,supportedGenerationMethods:['generateContent']}))});
 if(url.includes(':generateContent?')){attempts++;if(attempts===1)return new Response('{}',{status:429});return Response.json({candidates:[{content:{parts:[{text:JSON.stringify({reply:'Вот готовый пост.',draft:{title:'ТЕАТР ТУЗ',body:'Живой театр начинается здесь.',hashtags:['ТУЗ']}})}]}}]})}
 throw new Error('Unexpected URL '+url);
}});
vm.runInContext(code,ctx);
ctx.asksDraft=vm.runInContext('asksDraft',ctx);
async function call(role,action='chivurundu_chat',prompt='Напиши пост о театре'){actor=role;const r=await ctx.handler(new Request('https://fn.test',{method:'POST',headers:{Authorization:'Bearer test'},body:JSON.stringify({action,prompt,messages:[],clip:{title:'Чужой приватный фильм'}})}));return{status:r.status,body:await r.json()}}
(async()=>{
 for(const s of ['Напиши пост','Сделай анонс','Подготовь публикацию','Нужен текст для Telegram','Пост о театре напиши'])assert.equal(ctx.asksDraft(s),true,s);
 assert.equal(ctx.asksDraft('Привет, как ты?'),false);
 const admin=await call('admin');assert.equal(admin.status,200);assert(admin.body.draft);assert.equal(admin.body.publication_executed,false);assert(attempts>=2);
 const member=await call('member');assert.equal(member.status,200);assert.equal(member.body.role,'campaign_author');assert(member.body.draft);
 assert.equal((await call('member','announcement')).status,403);
 assert.equal((await call('expired')).status,403);assert.equal((await call('stranger')).status,403);assert.equal((await call('anonymous')).status,401);
 assert(!calls.some(x=>x.init.method==='PATCH'||x.url.includes('sendMessage')||x.url.includes('publisher')));
 const ai=calls.filter(x=>x.url.includes(':generateContent?'));assert(!ai.some(x=>JSON.parse(x.init.body).systemInstruction.parts[0].text.includes('Чужой приватный фильм')));
 console.log('PASS: Russian draft intents, live assistant JSON, admin and active silver campaign author, expired/unauthorized denial, announcement admin-only, ready-media ownership, untrusted clip excluded, 429 fallback, zero publication or DB mutations.');
})().catch(e=>{console.error(e);process.exitCode=1});
