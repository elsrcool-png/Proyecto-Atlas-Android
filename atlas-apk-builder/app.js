const REPO = "elsrcool-png/Proyecto-Atlas-Android";
const API = "https://api.github.com";
const WORKFLOW = "atlas-zip-to-apk.yml";
let selectedFile = null;
let finalBlob = null;
let finalName = "Atlas-release.apk";
let finalHash = "";

const $ = (id) => document.getElementById(id);
const tokenEl = $("token");
const zipEl = $("zipFile");
const versionEl = $("version");
const buildBtn = $("buildBtn");
const dropzone = $("dropzone");
const progressCard = $("progressCard");
const resultCard = $("resultCard");

function token() { return tokenEl.value.trim(); }
function headers(json=false) {
  const h = { Accept:"application/vnd.github+json", Authorization:`Bearer ${token()}`, "X-GitHub-Api-Version":"2026-03-10" };
  if (json) h["Content-Type"] = "application/json";
  return h;
}
async function api(path, options={}) {
  const r = await fetch(`${API}${path}`, { ...options, headers:{...headers(!!options.body), ...(options.headers||{})} });
  if (!r.ok) {
    let msg = `${r.status} ${r.statusText}`;
    try { const j=await r.json(); if(j.message) msg += `: ${j.message}`; } catch {}
    throw new Error(msg);
  }
  return r;
}
function setMsg(text, ok=false) { const e=$("authMsg"); e.textContent=text; e.className=`msg ${ok?"ok":"err"}`; }
function setStep(name,state){ const li=document.querySelector(`[data-step="${name}"]`); if(!li)return; li.classList.toggle("done",state==="done"); li.classList.toggle("active",state==="active"); li.querySelector("span").textContent=state==="done"?"✓":state==="active"?"…":"○"; }
function setProgress(n,text){ $("progress").style.width=`${Math.max(0,Math.min(100,n))}%`; $("buildState").textContent=text; }
function randomId(){ return `${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(16)}`; }
function safeVersion(v){ return (v||"0.0.0").replace(/[^A-Za-z0-9._-]/g,"_"); }

async function testConnection(){
  if(!token()) return setMsg("Introduce el token de GitHub.");
  try {
    const r=await api(`/repos/${REPO}`); const j=await r.json();
    $("connectionDot").classList.add("ok"); setMsg(`Conectado: ${j.full_name}`,true);
    buildBtn.disabled=!(selectedFile && token());
  } catch(e){ $("connectionDot").classList.remove("ok"); setMsg(e.message); }
}

function chooseFile(file){
  if(!file) return;
  if(!file.name.toLowerCase().endsWith(".zip")) return setMsg("Selecciona un archivo .zip");
  selectedFile=file; $("fileName").textContent=file.name; $("fileMeta").textContent=`${(file.size/1048576).toFixed(1)} MB`;
  const m=file.name.match(/(?:v|_v)(\d+(?:\.\d+){1,3})/i); if(m && !versionEl.value) versionEl.value=m[1];
  buildBtn.disabled=!token();
}
zipEl.addEventListener("change",e=>chooseFile(e.target.files[0]));
dropzone.addEventListener("dragover",e=>{e.preventDefault();dropzone.classList.add("drag")});
dropzone.addEventListener("dragleave",()=>dropzone.classList.remove("drag"));
dropzone.addEventListener("drop",e=>{e.preventDefault();dropzone.classList.remove("drag");chooseFile(e.dataTransfer.files[0])});
$("testBtn").addEventListener("click",testConnection);
tokenEl.addEventListener("input",()=>{buildBtn.disabled=!(selectedFile&&token())});

async function createTempRelease(tag, name){
  const r=await api(`/repos/${REPO}/releases`,{method:"POST",body:JSON.stringify({tag_name:tag,target_commitish:"main",name,body:"Temporary source transport for Atlas APK Builder. Safe to delete after build.",draft:false,prerelease:true})});
  return r.json();
}
async function uploadAsset(release,file){
  const url=`https://uploads.github.com/repos/${REPO}/releases/${release.id}/assets?name=${encodeURIComponent(file.name)}`;
  const r=await fetch(url,{method:"POST",headers:{...headers(),"Content-Type":"application/zip"},body:file});
  if(!r.ok){let msg=`${r.status} ${r.statusText}`;try{const j=await r.json();if(j.message)msg+=`: ${j.message}`}catch{}throw new Error(msg)}
  return r.json();
}
async function dispatch(tag,version,requestId){
  const r=await api(`/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,{method:"POST",body:JSON.stringify({ref:"main",inputs:{source_release_tag:tag,source_asset_name:selectedFile.name,version_label:version,request_id:requestId},return_run_details:true})});
  return r.status===204?null:r.json();
}
async function getRun(id){ const r=await api(`/repos/${REPO}/actions/runs/${id}`); return r.json(); }
async function findRun(requestId,tag){
  for(let i=0;i<30;i++){
    const r=await api(`/repos/${REPO}/actions/workflows/${WORKFLOW}/runs?event=workflow_dispatch&per_page=20`); const j=await r.json();
    const run=j.workflow_runs.find(x=>x.name?.includes(requestId) || x.display_title?.includes(requestId));
    if(run)return run;
    await sleep(2000);
  }
  throw new Error("No se encontró la ejecución de GitHub Actions.");
}
async function listArtifacts(runId){ const r=await api(`/repos/${REPO}/actions/runs/${runId}/artifacts?per_page=100`); return r.json(); }
async function downloadArtifact(id){
  const r=await api(`/repos/${REPO}/actions/artifacts/${id}/zip`);
  return r.blob();
}
async function deleteRelease(id){ try{await api(`/repos/${REPO}/releases/${id}`,{method:"DELETE"})}catch{} }
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}

async function build(){
  if(!selectedFile||!token()) return;
  const version=safeVersion(versionEl.value.trim()||"0.0.0");
  const requestId=randomId();
  const tag=`atlas-builder-${requestId}`;
  let release=null;
  progressCard.classList.remove("hidden"); resultCard.classList.add("hidden"); buildBtn.disabled=true;
  document.querySelectorAll(".steps li").forEach(li=>{li.classList.remove("done","active");li.querySelector("span").textContent="○"});
  try{
    setStep("upload","active");setProgress(5,"Creando transporte temporal…");
    release=await createTempRelease(tag,`Atlas Builder ${requestId}`);
    setProgress(12,"Subiendo ZIP…"); await uploadAsset(release,selectedFile); setStep("upload","done");
    setStep("compile","active");setProgress(18,"Enviando compilación a GitHub Actions…");
    const dispatched=await dispatch(tag,version,requestId);
    let run=dispatched?.workflow_run_id?await getRun(dispatched.workflow_run_id):await findRun(requestId,tag);
    $("runLink").classList.remove("hidden");$("runLink").href=run.html_url;
    const phases=[{p:25,t:"GitHub: instalando dependencias…"},{p:40,t:"GitHub: compilando aplicación web…"},{p:55,t:"GitHub: preparando Android…"},{p:68,t:"GitHub: ejecutando Gradle…"}];
    let phase=0;
    while(true){
      run=await getRun(run.id);
      if(run.status==="completed")break;
      if(phase<phases.length && (Date.now()/1000-run.created_at?0:0)>=0){setProgress(phases[phase].p,phases[phase].t);phase=Math.min(phase+1,phases.length-1)}
      await sleep(5000);
    }
    if(run.conclusion!=="success") throw new Error(`La compilación terminó como ${run.conclusion}. Revisa la ejecución de GitHub.`);
    setStep("compile","done");setStep("android","done");setStep("sign","active");setProgress(82,"Firmando APK con la clave maestra de Atlas…");
    let artifacts=null;
    for(let i=0;i<36;i++){
      artifacts=await listArtifacts(run.id);
      const a=artifacts.artifacts.find(x=>x.name===`Atlas-release-${requestId}` && !x.expired);
      if(a){
        setStep("sign","done");setStep("download","active");setProgress(92,"Descargando APK…");
        const zipBlob=await downloadArtifact(a.id); const zip=await JSZip.loadAsync(zipBlob); const files=Object.keys(zip.files);
        const apkPath=files.find(x=>x.toLowerCase().endsWith(".apk"));
        if(!apkPath) throw new Error("El artifact no contiene una APK.");
        finalBlob=await zip.file(apkPath).async("blob");
        finalName=apkPath.split("/").pop();
        const shaPath=files.find(x=>x.toLowerCase().endsWith(".sha256"));
        if(shaPath) finalHash=await zip.file(shaPath).async("text");
        break;
      }
      await sleep(3000);
    }
    if(!finalBlob) throw new Error("La APK terminó de compilar, pero todavía no apareció el artifact.");
    setStep("download","done");setProgress(100,"APK generada correctamente.");
    $("resultName").textContent=finalName;$("resultHash").textContent=finalHash||"Firma y SHA-256 verificados por GitHub Actions.";resultCard.classList.remove("hidden");
  }catch(e){ setProgress(100,"Build detenido: "+e.message); setMsg(e.message); }
  finally{ if(release) await deleteRelease(release.id); buildBtn.disabled=false; }
}
buildBtn.addEventListener("click",build);
$("downloadBtn").addEventListener("click",()=>{if(!finalBlob)return;const a=document.createElement("a");a.href=URL.createObjectURL(finalBlob);a.download=finalName;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),30000)});
