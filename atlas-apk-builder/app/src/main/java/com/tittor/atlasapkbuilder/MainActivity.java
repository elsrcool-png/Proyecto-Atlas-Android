package com.tittor.atlasapkbuilder;

import android.app.Activity;
import android.os.Bundle;
import android.os.Build;
import android.content.ContentValues;
import android.content.Intent;
import android.content.Context;
import android.net.Uri;
import android.provider.MediaStore;
import android.view.Gravity;
import android.widget.*;
import java.io.*;
import java.net.*;
import java.util.*;
import java.util.zip.*;
import java.util.regex.*;
import org.json.*;

public class MainActivity extends Activity {
    private static final String DEFAULT_OWNER = "elsrcool-png";
    private static final String DEFAULT_REPO = "Proyecto-Atlas-Android";
    private static final String WORKFLOW = "atlas-zip-to-apk.yml";
    private EditText token, repo, version;
    private TextView account, fileLabel, analysis, status;
    private Uri zipUri;
    private Button test, analyze, build;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(28, 28, 28, 24);
        ScrollView scroll = new ScrollView(this);
        scroll.addView(root);

        TextView title = text("ATLAS APK BUILDER 2.0", 25); title.setGravity(Gravity.CENTER);
        root.addView(title);
        root.addView(text("ZIP → análisis → GitHub Actions → APK Release firmada", 14));

        root.addView(text("GitHub", 18));
        token = new EditText(this); token.setHint("Fine-grained token (github_pat_…)"); token.setInputType(0x81); root.addView(token);
        account = text("Cuenta: no conectada", 13); root.addView(account);
        repo = new EditText(this); repo.setText(DEFAULT_OWNER + "/" + DEFAULT_REPO); repo.setHint("owner/repositorio"); root.addView(repo);
        test = new Button(this); test.setText("CONECTAR Y VERIFICAR WORKFLOW"); root.addView(test);

        root.addView(text("Proyecto", 18));
        Button pick = new Button(this); pick.setText("SELECCIONAR ZIP"); root.addView(pick);
        fileLabel = text("Ningún ZIP seleccionado", 13); root.addView(fileLabel);
        analyze = new Button(this); analyze.setText("ANALIZAR ZIP"); analyze.setEnabled(false); root.addView(analyze);
        analysis = text("El análisis detectará package.json, Capacitor, Android y URLs externas como api.giftshut.com.", 12); root.addView(analysis);
        version = new EditText(this); version.setHint("Versión, por ejemplo 4.4.1"); root.addView(version);

        build = new Button(this); build.setText("GENERAR APK RELEASE"); build.setEnabled(false); root.addView(build);
        status = text("Listo.", 14); root.addView(status);
        root.addView(text("La clave de firma Atlas permanece en GitHub Secrets. El token se mantiene solo en memoria.", 11));
        setContentView(scroll);

        test.setOnClickListener(v -> verifyGitHub());
        pick.setOnClickListener(v -> {
            Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT); i.setType("*/*"); i.addCategory(Intent.CATEGORY_OPENABLE); i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION); startActivityForResult(i, 7);
        });
        analyze.setOnClickListener(v -> analyzeAsync());
        build.setOnClickListener(v -> startBuild());
        token.setOnFocusChangeListener((v, has) -> updateBuildEnabled());
    }

    private TextView text(String s, int size) { TextView t = new TextView(this); t.setText(s); t.setTextSize(size); t.setPadding(0, 8, 0, 8); return t; }
    private void updateBuildEnabled() { build.setEnabled(zipUri != null && token.getText().toString().trim().length() > 0); }
    private String[] repoParts() throws Exception { String s=repo.getText().toString().trim(); String[] p=s.split("/",-1); if(p.length!=2||p[0].isEmpty()||p[1].isEmpty()) throw new Exception("Repositorio inválido. Usa owner/repo."); return p; }

    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request,result,data);
        if(request==7 && result==RESULT_OK && data!=null){ zipUri=data.getData(); try{getContentResolver().takePersistableUriPermission(zipUri,Intent.FLAG_GRANT_READ_URI_PERMISSION);}catch(Exception ignored){} fileLabel.setText("ZIP: "+String.valueOf(zipUri)); analyze.setEnabled(true); updateBuildEnabled(); }
    }

    private void verifyGitHub() {
        final String tok=token.getText().toString().trim(); if(tok.isEmpty()){status.setText("Introduce el nuevo token de GitHub.");return;}
        new Thread(() -> { try {
            String[] p=repoParts(); JSONObject user=new JSONObject(api(tok,"GET","https://api.github.com/user",null,null));
            JSONObject r=new JSONObject(api(tok,"GET","https://api.github.com/repos/"+p[0]+"/"+p[1],null,null));
            JSONObject wf=new JSONObject(api(tok,"GET","https://api.github.com/repos/"+p[0]+"/"+p[1]+"/actions/workflows/"+WORKFLOW,null,null));
            ui("✓ GitHub conectado. Cuenta: "+user.optString("login")+"\n✓ Repositorio: "+r.optString("full_name")+"\n✓ Workflow: "+wf.optString("name")+" ("+wf.optString("state")+")");
            runOnUiThread(() -> { account.setText("Cuenta GitHub: "+user.optString("login","desconocida")); test.setText("✓ GITHUB VERIFICADO"); });
        } catch(Exception e){ui("ERROR DE GITHUB: "+e.getMessage());}
        }).start();
    }

    private void analyzeAsync(){ final Uri u=zipUri; new Thread(() -> { try { ZipReport z=analyzeZip(u); ui(z.text); if(z.hosts.contains("api.giftshut.com")) ui(z.text+"\n⚠ Encontrado: api.giftshut.com"); } catch(Exception e){ui("ERROR ANALIZANDO ZIP: "+e.getMessage());} }).start(); }

    private ZipReport analyzeZip(Uri u) throws Exception {
        boolean pkg=false, cap=false, android=false, gradle=false; int files=0; long bytes=0; Set<String> hosts=new LinkedHashSet<>(); List<String> hits=new ArrayList<>();
        Pattern url=Pattern.compile("https?://[A-Za-z0-9._:-]+(?:/[^\\s\\\"'<>]*)?",Pattern.CASE_INSENSITIVE);
        Pattern host=Pattern.compile("(?:https?://)?([A-Za-z0-9.-]+\\.[A-Za-z]{2,})(?::\\d+)?",Pattern.CASE_INSENSITIVE);
        try(InputStream raw=getContentResolver().openInputStream(u); ZipInputStream zin=new ZipInputStream(raw)){
            ZipEntry e; byte[] b=new byte[8192];
            while((e=zin.getNextEntry())!=null){ if(e.isDirectory())continue; files++; String n=e.getName(); bytes+=Math.max(0,e.getSize()); String low=n.toLowerCase(Locale.US);
                if(low.endsWith("package.json"))pkg=true; if(low.contains("capacitor.config"))cap=true; if(low.startsWith("android/")||low.contains("/android/"))android=true; if(low.endsWith("build.gradle")||low.endsWith("build.gradle.kts"))gradle=true;
                if(isText(low)){ ByteArrayOutputStream out=new ByteArrayOutputStream(); int total=0,x; while(total<1048576&&(x=zin.read(b))>0){int take=Math.min(x,1048576-total);out.write(b,0,take);total+=take;if(take<x)break;} String s=new String(out.toByteArray(),"UTF-8");
                    Matcher m=url.matcher(s); while(m.find()&&hits.size()<20){String hit=m.group(); String h=hostOf(hit); if(h!=null){hosts.add(h); if(hit.toLowerCase(Locale.US).contains("giftshut"))hits.add(n+" -> "+hit);}}
                    if(s.toLowerCase(Locale.US).contains("api.giftshut.com") && !hits.contains(n+" -> api.giftshut.com")) hits.add(n+" -> api.giftshut.com");
                }
            }
        }
        StringBuilder sb=new StringBuilder(); sb.append("ANÁLISIS DEL ZIP\n"); sb.append("Archivos: ").append(files).append("\n"); sb.append(pkg?"✓ package.json encontrado\n":"⚠ package.json no encontrado\n"); sb.append(cap?"✓ Capacitor detectado\n":"⚠ Capacitor no detectado\n"); sb.append(android?"✓ Android detectado\n":"• Android se generará remotamente\n"); sb.append(gradle?"✓ Gradle detectado\n":"• Gradle será preparado por Capacitor\n"); sb.append("Hosts detectados: ").append(hosts.isEmpty()?"ninguno":hosts).append("\n"); if(!hits.isEmpty())sb.append("Coincidencias críticas:\n").append(hits); return new ZipReport(sb.toString(),hosts);
    }
    private boolean isText(String n){ return n.endsWith(".js")||n.endsWith(".ts")||n.endsWith(".tsx")||n.endsWith(".jsx")||n.endsWith(".json")||n.endsWith(".html")||n.endsWith(".css")||n.endsWith(".md")||n.endsWith(".txt")||n.endsWith(".env")||n.endsWith(".yml")||n.endsWith(".yaml")||n.endsWith(".xml")||n.endsWith(".gradle")||n.endsWith(".properties"); }
    private String hostOf(String u){ try{String x=u.matches("^[A-Za-z]+://.*")?u:"https://"+u; return new URL(x).getHost();}catch(Exception e){return null;} }
    private static class ZipReport { final String text; final Set<String> hosts; ZipReport(String t,Set<String> h){text=t;hosts=h;} }

    private void startBuild(){ final String tok=token.getText().toString().trim(); final String ver=version.getText().toString().trim(); if(tok.isEmpty()||ver.isEmpty()||zipUri==null){ui("Token, versión y ZIP son obligatorios.");return;} build.setEnabled(false); new Thread(() -> { String tag=null; try{
        String[] p=repoParts(); tag="atlas-builder-"+System.currentTimeMillis(); String asset="atlas-source-"+tag+".zip"; ui("1/6 Verificando cuenta y workflow…");
        JSONObject user=new JSONObject(api(tok,"GET","https://api.github.com/user",null,null)); JSONObject wf=new JSONObject(api(tok,"GET","https://api.github.com/repos/"+p[0]+"/"+p[1]+"/actions/workflows/"+WORKFLOW,null,null));
        if(!"active".equalsIgnoreCase(wf.optString("state")))throw new Exception("El workflow "+WORKFLOW+" no está activo.");
        ui("2/6 Creando transporte temporal…"); JSONObject body=new JSONObject(); body.put("tag_name",tag); body.put("target_commitish","main"); body.put("name","Atlas Builder "+tag); body.put("body","Temporary source transport for Atlas APK Builder 2.0"); body.put("draft",false); body.put("prerelease",true);
        JSONObject rel=new JSONObject(api(tok,"POST","https://api.github.com/repos/"+p[0]+"/"+p[1]+"/releases",body.toString().getBytes("UTF-8"),"application/json"));
        String upload=rel.getString("upload_url").split("\\{")[0]+"?name="+URLEncoder.encode(asset,"UTF-8"); ui("3/6 Subiendo ZIP…"); upload(tok,upload,zipUri);
        JSONObject in=new JSONObject(); in.put("source_release_tag",tag); in.put("source_asset_name",asset); in.put("version_label",safeVersion(ver)); in.put("request_id",tag); JSONObject dispatch=new JSONObject(); dispatch.put("ref","main"); dispatch.put("inputs",in); dispatch.put("return_run_details",true);
        ui("4/6 Iniciando GitHub Actions como "+user.optString("login")+"…"); JSONObject dr=new JSONObject(api(tok,"POST","https://api.github.com/repos/"+p[0]+"/"+p[1]+"/actions/workflows/"+WORKFLOW+"/dispatches",dispatch.toString().getBytes("UTF-8"),"application/json"));
        long runId=dr.optLong("workflow_run_id",0); String runUrl=dr.optString("html_url",""); ui("5/6 Compilando en GitHub…\n"+(runUrl.isEmpty()?"":runUrl));
        String apkUrl=null; for(int n=0;n<270;n++){ Thread.sleep(10000); if(runId>0){JSONObject rr=new JSONObject(api(tok,"GET","https://api.github.com/repos/"+p[0]+"/"+p[1]+"/actions/runs/"+runId,null,null)); String st=rr.optString("status"); if("completed".equals(st)&&!"success".equals(rr.optString("conclusion")))throw new Exception("GitHub Actions terminó: "+rr.optString("conclusion")); if("completed".equals(st)) ui("5/6 Build completado. Esperando APK firmada…");}
            JSONObject rr=new JSONObject(api(tok,"GET","https://api.github.com/repos/"+p[0]+"/"+p[1]+"/releases/tags/"+URLEncoder.encode(tag,"UTF-8"),null,null)); JSONArray as=rr.optJSONArray("assets"); if(as!=null)for(int j=0;j<as.length();j++){JSONObject a=as.getJSONObject(j);if(a.optString("name").endsWith(".apk")){apkUrl=a.optString("browser_download_url");break;}} if(apkUrl!=null)break; }
        if(apkUrl==null)throw new Exception("No se recibió la APK después de 45 minutos."); ui("6/6 Descargando APK Release…"); File out=saveApk(tok,apkUrl,"Atlas-v"+safeVersion(ver)+"-release.apk"); if(out==null)throw new Exception("No se pudo guardar la APK."); if(out.length()<100000)throw new Exception("APK sospechosamente pequeña: "+out.length()+" bytes"); ui("✓ APK LISTA\n"+out.getAbsolutePath()+"\nTamaño: "+out.length()+" bytes");
        try{api(tok,"DELETE","https://api.github.com/repos/"+p[0]+"/"+p[1]+"/releases/"+rel.getLong("id"),null,null);}catch(Exception ignored){}
    }catch(Exception e){ui("ERROR: "+e.getMessage());}finally{runOnUiThread(() -> build.setEnabled(true));} }).start(); }

    private String safeVersion(String s){ return s.replaceAll("[^A-Za-z0-9._-]","_"); }
    private String base(String owner,String name,String path){return "https://api.github.com/repos/"+owner+"/"+name+path;}
    private String base(String path){try{String[]p=repoParts();return base(p[0],p[1],path);}catch(Exception e){return "https://api.github.com/repos/"+DEFAULT_OWNER+"/"+DEFAULT_REPO+path;}}
    private void ui(String s){runOnUiThread(() -> status.setText(s));}

    private String api(String tok,String method,String url,byte[] data,String type)throws Exception{ HttpURLConnection c=(HttpURLConnection)new URL(url).openConnection(); c.setConnectTimeout(20000); c.setReadTimeout(30000); c.setRequestMethod(method); c.setRequestProperty("Authorization","Bearer "+tok); c.setRequestProperty("Accept","application/vnd.github+json"); c.setRequestProperty("X-GitHub-Api-Version","2026-03-10"); if(data!=null){c.setDoOutput(true);c.setRequestProperty("Content-Type",type);c.setFixedLengthStreamingMode(data.length);try(OutputStream o=c.getOutputStream()){o.write(data);}} int code=c.getResponseCode();String b=read(c,code>=400);if(code>=300)throw new Exception("GitHub HTTP "+code+": "+b);return b; }
    private String read(HttpURLConnection c,boolean err)throws Exception{InputStream in=err?c.getErrorStream():c.getInputStream();if(in==null)return "";BufferedReader r=new BufferedReader(new InputStreamReader(in,"UTF-8"));StringBuilder s=new StringBuilder();String x;while((x=r.readLine())!=null)s.append(x);return s.toString();}
    private void upload(String tok,String url,Uri uri)throws Exception{HttpURLConnection c=(HttpURLConnection)new URL(url).openConnection();c.setConnectTimeout(20000);c.setReadTimeout(120000);c.setRequestMethod("POST");c.setDoOutput(true);c.setRequestProperty("Authorization","Bearer "+tok);c.setRequestProperty("Accept","application/vnd.github+json");c.setRequestProperty("Content-Type","application/zip");try(InputStream in=getContentResolver().openInputStream(uri);OutputStream out=c.getOutputStream()){if(in==null)throw new Exception("No se pudo leer el ZIP");byte[]b=new byte[65536];int n;while((n=in.read(b))>0)out.write(b,0,n);}int code=c.getResponseCode();if(code>=300)throw new Exception("Upload HTTP "+code+": "+read(c,true));}
    private File saveApk(String tok,String url,String name)throws Exception{HttpURLConnection c=(HttpURLConnection)new URL(url).openConnection();c.setConnectTimeout(20000);c.setReadTimeout(120000);c.setRequestProperty("Authorization","Bearer "+tok);c.setRequestProperty("Accept","application/octet-stream");int code=c.getResponseCode();if(code>=300)throw new Exception("Descarga HTTP "+code+": "+read(c,true));if(Build.VERSION.SDK_INT>=29){ContentValues v=new ContentValues();v.put(MediaStore.Downloads.DISPLAY_NAME,name);v.put(MediaStore.Downloads.MIME_TYPE,"application/vnd.android.package-archive");v.put(MediaStore.Downloads.IS_PENDING,1);Uri u=getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI,v);if(u==null)throw new Exception("No se pudo crear el archivo en Descargas");try(InputStream in=c.getInputStream();OutputStream out=getContentResolver().openOutputStream(u)){copy(in,out);}ContentValues done=new ContentValues();done.put(MediaStore.Downloads.IS_PENDING,0);getContentResolver().update(u,done,null,null);return new File(getExternalFilesDir(null),name);}else{File d=new File(getExternalFilesDir(null),name);try(InputStream in=c.getInputStream();FileOutputStream out=new FileOutputStream(d)){copy(in,out);}return d;}}
    private void copy(InputStream in,OutputStream out)throws Exception{byte[]b=new byte[65536];int n;long total=0;while((n=in.read(b))>0){out.write(b,0,n);total+=n;}if(total<100000)throw new Exception("Descarga incompleta: "+total+" bytes");}
}
