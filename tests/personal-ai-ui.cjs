const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844}});
 let connected=false;
 await page.route('https://triznes.online/**',route=>{
  if(route.request().url().endsWith('/personal-ai.js'))return route.fulfill({contentType:'text/javascript',body:fs.readFileSync(require('path').join(__dirname,'../app/js/personal-ai.js'),'utf8')});
  return route.fulfill({contentType:'text/html',body:`<p id="profileNote"></p><div id="sheet"></div><script>window.TZ={token:'test-session',sheet:html=>document.getElementById('sheet').innerHTML=html}</script><script type="module">import {mountPersonalAI} from '/personal-ai.js';mountPersonalAI();</script>`});
 });
 await page.route('**/functions/v1/triznes-personal-ai',async route=>{
  const b=route.request().postDataJSON();if(b.action==='connect')connected=true;if(b.action==='disconnect')connected=false;
  return route.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({ok:true,connected,ready:true})});
 });
 await page.goto('https://triznes.online/');
 await page.getByRole('button',{name:'Моя нейронка · Gemini'}).click();
 await page.getByRole('status').filter({hasText:'Личный ключ пока не подключён.'}).waitFor();
 await page.getByLabel('Ключ Gemini API').fill('test-key-12345678901234567890');
 await page.getByRole('button',{name:'Проверить и подключить'}).click();
 await page.getByRole('status').filter({hasText:'Ключ сохранён зашифрованным.'}).waitFor();
 if(await page.getByLabel('Ключ Gemini API').inputValue())throw new Error('key field not cleared');
 if(await page.evaluate(()=>localStorage.length))throw new Error('key in storage');
 await page.getByRole('button',{name:'Отключить ключ'}).click();
 await page.getByRole('status').filter({hasText:'Ключ отключён. Память сохранена.'}).waitFor();
 console.log('PASS: mobile profile connect/disconnect; key cleared; browser storage empty');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
