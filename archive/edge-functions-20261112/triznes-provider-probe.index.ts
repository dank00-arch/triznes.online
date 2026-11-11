// Архив 2026-11-12: код слота triznes-provider-probe до замены на TRIZNES app gateway (v25, verify_jwt=true).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json; charset=utf-8"}});
Deno.serve((req:Request)=>req.method==="GET"?json({ok:true,service:"TRIZNES provider probe",locked:true}):json({ok:false,error:"method_not_allowed"},405));
