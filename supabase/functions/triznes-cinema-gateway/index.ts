// TRIZNES Cinema 24/7 | additive proposal, not deployed.
// Backend for private operator uploads and founder-approved public playback.
// Requires additive SQL in docs/sql/TRIZNES_CINEMA_247_SCHEMA_PROPOSAL.sql.
// Important: validate the migration from legacy triznes-platform-access to CORE sessions before activation.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.76.1";

const URL = Deno.env.get("SUPABASE_URL") || "";
const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const BUCKET = "triznes-media";
const MAX_BYTES = 100 * 1024 * 1024;
const ALLOWED_ORIGINS = ["https://triznes.online","https://www.triznes.online"];
const db = createClient(URL, KEY, {auth:{persistSession:false,autoRefreshToken:false}});

function headers(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowed = ALLOWED_ORIGINS.includes(origin);
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin",
    ...(allowed ? {"Access-Control-Allow-Origin": origin} : {}),
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type,x-triznes-session",
  };
}
function json(req: Request, body: unknown, code=200) {
  return new Response(JSON.stringify(body),{status:code,headers:headers(req)});
}
function simple(v:unknown,n=500) {
  return String(v??"").trim().replace(/[\u0000-\u001f\u007f]/g," ").slice(0,n);
}
function validUuid(v: unknown) {
  return typeof v==="string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}
async function sha256(v:string) {
  const a=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v));
  return [...new Uint8Array(a)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
async function context(req:Request) {
  // Opaque session token is issued by the authenticated platform gateway.
  // Never trust client-provided player_id, card status, role or card code.
  const raw=req.headers.get("x-triznes-session")||"";
  if(raw.length<20||raw.length>1024) return null;
  const hash=await sha256(raw);
  const {data:session,error:sErr}=await db.from("triznes_platform_sessions")
    .select("player_id,expires_at,revoked_at")
    .eq("token_hash",hash).is("revoked_at",null).gt("expires_at",new Date().toISOString())
    .maybeSingle();
  if(sErr||!session?.player_id) return null;
  const {data:player,error:pErr}=await db.from("platform_players")
    .select("id,identity_id,registration_status").eq("id",session.player_id).maybeSingle();
  if(pErr||!player||!validUuid(player.identity_id)) return null;
  const {data:cards}=await db.from("triznes_membership_cards")
    .select("id").eq("identity_id",player.identity_id).eq("tier","black").eq("status","active")
    .gt("expires_at",new Date().toISOString()).limit(1);
  const {data:admins}=await db.from("system_admins")
    .select("role").eq("user_id",player.identity_id).eq("active",true).in("role",["system_admin","content_admin"]).limit(1);
  return {playerId:player.id,identityId:player.identity_id,black:!!cards?.length,admin:!!admins?.length};
}
async function playlist(req:Request) {
  // Seed is a confirmed published community film; not a real camera stream.
  const films:any[]=[{
    id:"sochi-archive-01",kind:"youtube",youtube_id:"LL-HjXeOR4w",
    title:"СОЧИ. ИГРА НАЧАЛАСЬ | TRIZNES × PINK NOIZE",
    source:"youtube",status:"ARCHIVE",live:false
  }];
  // Only an approved + published founder-reviewed submission can appear here.
  const {data, error}=await db.from("triznes_cinema_submissions")
    .select("id,title,storage_bucket,storage_path,reviewed_at,status")
    .eq("status","published").order("reviewed_at",{ascending:false}).limit(40);
  if(!error) for(const row of data||[]) {
    if(row.storage_bucket!==BUCKET||!row.storage_path?.startsWith("cinema-intake/"))continue;
    const {data:signed,error:signErr}=await db.storage.from(BUCKET).createSignedUrl(row.storage_path,3600);
    if(signErr||!signed?.signedUrl)continue;
    films.push({id:row.id,title:row.title,kind:"mp4",url:signed.signedUrl,status:"ARCHIVE",live:false,source:"approved_video"});
  }
  return json(req,{ok:true,live:false,live_source:null,label:"АРХИВНЫЙ ЦИКЛ · НЕ LIVE",items:films});
}
async function requireSignedUpload(file:any, user:any) {
  const size=Number(file.size_bytes);
  const mime=simple(file.mime_type,80);
  const title=simple(file.title,130);
  if(!Number.isSafeInteger(size)||size<1||size>MAX_BYTES)throw Error("invalid_file_size");
  if(!["video/mp4","video/quicktime","video/webm"].includes(mime))throw Error("invalid_mime");
  if(title.length<3)throw Error("title_required");
  if(file.rights_declared!==true||file.consents_declared!==true)throw Error("declarations_required");
  const ext=mime==="video/mp4"?"mp4":mime==="video/quicktime"?"mov":"webm";
  const path="cinema-intake/"+user.playerId+"/"+crypto.randomUUID()+"."+ext;
  const {data:signed,error:signErr}=await db.storage.from(BUCKET).createSignedUploadUrl(path,{upsert:false});
  if(signErr||!signed?.signedUrl)throw Error("upload_ticket_unavailable");
  const {data:row,error:insertErr}=await db.from("triznes_cinema_submissions").insert({
    player_id:user.playerId,identity_id:user.identityId,title,
    description:simple(file.description,1500),
    original_filename:simple(file.filename,220),
    mime_type:mime,size_bytes:size,storage_bucket:BUCKET,storage_path:path,
    rights_declared:true,consents_declared:true,status:"uploading"
  }).select("id").single();
  if(insertErr||!row)throw Error("intake_unavailable");
  return {ok:true,submission_id:row.id,upload_url:signed.signedUrl,
    black_card_active:user.black,privacy:"private",publish_status:"NOT_APPROVED"};
}
async function finalize(id:unknown,user:any) {
  if(!validUuid(id))throw Error("invalid_submission");
  const {data:row,error}=await db.from("triznes_cinema_submissions")
    .select("id,storage_path,original_filename,status,player_id")
    .eq("id",id).eq("player_id",user.playerId).eq("status","uploading").maybeSingle();
  if(error||!row)throw Error("submission_not_found");
  const parts=String(row.storage_path).split("/");
  const dirname=parts.slice(0,-1).join("/");
  const filename=parts.at(-1);
  // Direct Storage listing is performed server-side; object existence is not assumed.
  const {data:entries,error:listErr}=await db.storage.from(BUCKET).list(dirname,{limit:100,search:filename});
  if(listErr||!entries?.some(v=>v.name===filename))throw Error("upload_not_complete");
  const {error:upd}=await db.from("triznes_cinema_submissions")
    .update({status:"submitted",updated_at:new Date().toISOString()})
    .eq("id",row.id).eq("status","uploading");
  if(upd)throw Error("submission_finalize_failed");
  return {ok:true,black_card_active:user.black,status:"submitted",is_public:false};
}
async function queue(user:any) {
  if(!user.admin)throw Error("review_not_authorized");
  const {data,error}=await db.from("triznes_cinema_submissions")
    .select("id,title,created_at,status,storage_bucket,storage_path")
    .in("status",["submitted","published"]).order("created_at",{ascending:false}).limit(50);
  if(error)throw Error("review_queue_unavailable");
  const items:any[]=[];
  for(const v of data||[]) {
    const {data:link}=await db.storage.from(BUCKET).createSignedUrl(v.storage_path,600);
    items.push({id:v.id,title:v.title,created_at:v.created_at,status:v.status,review_url:link?.signedUrl||null});
  }
  return {ok:true,items};
}
async function review(body:any,user:any) {
  if(!user.admin)throw Error("review_not_authorized");
  const id=body.submission_id,decision=String(body.decision||"");
  if(!validUuid(id)||!["approve","reject"].includes(decision))throw Error("invalid_review");
  const note=simple(body.note,900);
  const rightsRef=simple(body.rights_evidence_ref,250);
  const consentsRef=simple(body.consent_evidence_ref,250);
  if(note.length<20)throw Error("documented_review_required");
  if(decision==="approve"&&(rightsRef.length<12||consentsRef.length<12))throw Error("independent_rights_and_consent_evidence_required");
  const {data:row,error:rowErr}=await db.from("triznes_cinema_submissions")
    .select("id,identity_id,status,rights_declared,consents_declared")
    .eq("id",id).eq("status","submitted").maybeSingle();
  if(rowErr||!row)throw Error("submission_not_reviewable");
  if(decision==="approve") {
    if(!row.rights_declared||!row.consents_declared)throw Error("declarations_missing");
    const {data:card}=await db.from("triznes_membership_cards")
      .select("id").eq("identity_id",row.identity_id).eq("tier","black")
      .eq("status","active").gt("expires_at",new Date().toISOString()).limit(1);
    if(!card?.length)throw Error("active_black_card_required");
  }
  // Approval is explicit and human-owned; this is the only transition into public cinema.
  const status=decision==="approve"?"published":"rejected";
  const {data:updated,error:updErr}=await db.from("triznes_cinema_submissions").update({
    status,reviewer_player_id:user.playerId,review_note:note,
    rights_evidence_ref:rightsRef,consent_evidence_ref:consentsRef,
    reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()
  }).eq("id",id).eq("status","submitted").select("id").maybeSingle();
  if(updErr||!updated)throw Error("review_concurrent_change");
  await db.from("triznes_cinema_review_events").insert({
    submission_id:id,reviewer_player_id:user.playerId,
    decision,decision_note:note,rights_evidence_ref:rightsRef,consent_evidence_ref:consentsRef
  });
  return {ok:true,status,public:status==="published"};
}
Deno.serve(async(req)=>{
  if(req.method==="OPTIONS")return new Response("ok",{status:200,headers:headers(req)});
  if(!URL||!KEY)return json(req,{ok:false,error:"service_not_configured"},503);
  if(req.method==="GET"){
    if(new URL(req.url).searchParams.get("action")==="playlist")return playlist(req);
    return json(req,{ok:false,error:"route_not_found"},404);
  }
  if(req.method!=="POST")return json(req,{ok:false,error:"method_not_allowed"},405);
  const origin=req.headers.get("origin")||"";
  if(origin&&!ALLOWED_ORIGINS.includes(origin))return json(req,{ok:false,error:"origin_denied"},403);
  const body=await req.json().catch(()=>({}));
  const action=String(body?.action||"");
  const user=await context(req);
  if(!user)return json(req,{ok:false,error:"session_unverified_in_core"},401);
  try {
    if(action==="me")return json(req,{ok:true,can_upload:true,black_card_active:user.black,can_review:user.admin});
    if(action==="start_upload")return json(req,await requireSignedUpload(body,user));
    if(action==="finalize_upload")return json(req,await finalize(body.submission_id,user));
    if(action==="review_queue")return json(req,await queue(user));
    if(action==="review")return json(req,await review(body,user));
    return json(req,{ok:false,error:"unknown_action"},400);
  }catch(e){return json(req,{ok:false,error:e instanceof Error?e.message:"request_failed"},400);}
});
