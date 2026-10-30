(()=>{
  const BASE='https://bbxhhtpmbtgfaxamgksf.supabase.co/rest/v1/rpc/';
  const KEY='sb_publishable_aFTiVGlsJxeeutL_gEZaKA_S9VyKaHS';
  async function rpc(name,body={}){
    const r=await fetch(BASE+name,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'});
    const data=await r.json().catch(()=>null);
    if(!r.ok) throw new Error(name+'_failed');
    return data;
  }
  window.TRIZNES_WORLD={
    version:'3.0.0',
    load:()=>rpc('get_triznes_world'),
    liveNews:(limit=100)=>rpc('get_triznes_live_news',{p_limit:limit}),
    liveGame:(limit=50)=>rpc('get_triznes_game_stories',{p_limit:limit})
  };
})();
