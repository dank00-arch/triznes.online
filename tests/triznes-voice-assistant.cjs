const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{stripTypeScriptTypes}=require('node:module'),{webcrypto}=require('node:crypto');
const rootPath=fs.existsSync('root.ts')?'root.ts':require('node:path').resolve(__dirname,'../supabase/functions/telegram-publication-root/index.ts');
const deployedRoot=fs.readFileSync(rootPath,'utf8');
const embeddedVoice=deployedRoot.split('const voiceHandler=(()=>{\n')[1].split('\n})();\n\nDeno.serve(')[0].replace('return async (req:Request)=>{','Deno.serve(async (req:Request)=>{').replace(/};\s*$/,'});');
function context(file){const c=vm.createContext({Request,Response,URL,Blob,FormData,TextEncoder,AbortSignal,crypto:webcrypto,console,btoa,Deno:{env:{get:k=>({TELEGRAM_BOT_TOKEN2:'token',SUPABASE_URL:'https://test',SUPABASE_SERVICE_ROLE_KEY:'key',GEMINI_API_KEY:'gem'}[k]||'')},serve:h=>c.handler=h},EdgeRuntime:{waitUntil:p=>c.pending=p},fetch:async(url,init)=>{c.forwarded.push({url,body:JSON.parse(init.body)});return new Response(JSON.stringify({ok:true,action:'script_saved'}))}});c.forwarded=[];vm.runInContext(stripTypeScriptTypes((file==='voice.ts'?embeddedVoice:deployedRoot).replace(/^import .*;\n/,'').replace('const voiceHandler=','let voiceHandler=')),c);return c}
async function post(c,body,secret='token'){return (await c.handler(new Request('https://test',{method:'POST',headers:{'x-telegram-bot-api-secret-token':await c.sha(secret)},body:JSON.stringify(body)}))).json()}
const uid='7511311716',id='11111111-1111-4111-8111-111111111111';
const msg={message_id:7,from:{id:Number(uid)},chat:{id:Number(uid),type:'private'},voice:{file_id:'voice',file_unique_id:'unique',duration:25,file_size:80}};
(async()=>{
 const c=context('voice.ts'),rows=[],sent=[];let allow=true;
 c.dbMock=async(path,method,body)=>{if(path.includes('on_conflict')){if(rows.length)return[];rows.push({...body,id,status:'queued',attempts:0});return[rows[0]]}if(path.startsWith('triznes_voice_requests?')){const row=rows[0];if(!row)return[];if(path.includes('telegram_user_id=eq.')&&!path.includes('telegram_user_id=eq.'+row.telegram_user_id))return[];const st=path.match(/status=eq\.([a-z]+)/)?.[1];if(st&&st!==row.status)return[];if(path.includes('updated_at=lt.'))return[];if(method==='PATCH'){Object.assign(row,body);return[row]}return[row]}if(path.startsWith('operator_protocols?'))return[{slug:'hero-path',response_guidance:'Сохраняй авторство'}];throw Error(path)};
 c.tgMock=async(token,method,body)=>{sent.push({method,body});return{}};c.access=async()=>allow?{tier:'silver'}:null;c.stt=async()=>({transcript:'Собери ролик о театре из новых кадров',intent:'scenario',summary:'Новый ролик',uncertain:false,philosophy_note:''});
 vm.runInContext('db=dbMock;tg=tgMock;entitlement=access;transcribe=stt;download=async()=>new Blob(["audio"],{type:"audio/ogg"});',c);
 // Exercise full durable worker without Telegram or provider calls.
 rows.push({id,telegram_user_id:uid,chat_id:uid,source_storage_path:'voice/source',mime_type:'audio/ogg',source_update:{message:msg},status:'queued',attempts:0,created_at:new Date().toISOString()});
 const result=await c.work(id);assert.equal(result.status,'review');assert.equal(rows[0].transcript,'Собери ролик о театре из новых кадров');assert.equal(c.forwarded.length,0);assert(sent.some(x=>x.body.reply_markup?.inline_keyboard?.flat().some(b=>b.callback_data==='voice:ok:'+id)));
 const cb=(user=uid)=>({callback_query:{id:'cb',from:{id:Number(user)},message:{chat:{id:Number(uid),type:'private'}},data:'voice:ok:'+id}});
 await post(c,cb('123456'));assert.equal(c.forwarded.length,0);assert.equal(rows[0].status,'review');
 await post(c,cb());assert.equal(rows[0].status,'dispatched');assert.equal(c.forwarded.length,1);assert.equal(c.forwarded[0].body.message.voice,undefined);assert.equal(c.forwarded[0].body.message.text,'Сценарий: '+rows[0].transcript);assert.equal(c.forwarded[0].body.message.voice_context.original_transcript,rows[0].transcript);
 await post(c,cb());assert.equal(c.forwarded.length,1);
 rows[0].status='review';rows[0].analysis.uncertain=true;await post(c,cb());assert.equal(c.forwarded.length,1);rows[0].analysis.uncertain=false;allow=false;await post(c,cb());assert.equal(c.forwarded.length,1);
 allow=true;const duplicate=await post(c,{message:msg});assert.equal(duplicate.duplicate,true);
 const denied=await post(c,{message:msg},'wrong');assert.equal(denied.error,'unauthorized');
 const root=context('root.ts');root.sha=root.sha256;const readiness=await root.handler(new Request('https://test/functions/v1/telegram-publication-root/voice'));assert.equal((await readiness.json()).voice_input,true);root.voiceMock=async(req)=>{root.forwarded.push({url:req.url,body:await req.json()});return new Response('{"ok":true}')};root.restMock=async(path)=>path.includes('podcast_intake_mode_v1')?[]:[];vm.runInContext('rest=restMock;voiceHandler=voiceMock',root);
 await post(root,{message:msg});assert(root.forwarded.at(-1).url.endsWith('/telegram-publication-root/voice'));
 await post(root,{message:{...msg,caption:'сделай подкаст'}});assert(root.forwarded.at(-1).url.endsWith('/triznes-podcast-readiness'));
 root.restMock=async()=>[{setting_value:new Date().toISOString()}];vm.runInContext('rest=restMock',root);await post(root,{message:msg});assert(root.forwarded.at(-1).url.endsWith('/triznes-podcast-readiness'));
 await post(root,{callback_query:{data:'tuz:days'}});assert(root.forwarded.at(-1).url.endsWith('/sochiwood-director'));
 await post(root,{callback_query:{data:'voice:ok:'+id}});assert(root.forwarded.at(-1).url.endsWith('/telegram-publication-root/voice'));
 console.log('PASS: worker to review, original transcript, no dispatch before confirmation, owner-only callback, exactly-once dispatch, uncertainty/access blocks, webhook auth, duplicate intake, ordinary voice/podcast/mode/director callback routing');
})().catch(e=>{console.error(e);process.exitCode=1});
