package com.tittor.atlasapkbuilder;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;
import android.view.View;
import android.widget.*;
import java.io.*;
import java.net.*;
import org.json.*;

public class MainActivity extends Activity {
    private static final String OWNER = "elsrcool-png";
    private static final String REPO = "Proyecto-Atlas-Android";
    private static final String WORKFLOW = "atlas-zip-to-apk.yml";
    private EditText token, version;
    private TextView fileLabel, status;
    private Uri zipUri;
    private Button build;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(32, 36, 32, 24);
        TextView title = text("ATLAS APK BUILDER", 26);
        root.addView(title);
        root.addView(text("ZIP → GitHub Actions → APK firmada", 15));
        token = new EditText(this);
        token.setHint("GitHub token");
        token.setInputType(0x81);
        root.addView(token);
        TextView hint = text("Permisos: Contents Read/Write + Actions Read/Write en Proyecto-Atlas-Android.", 12);
        root.addView(hint);
        version = new EditText(this);
        version.setHint("Versión (ej. 4.4.1)");
        root.addView(version);
        Button pick = new Button(this);
        pick.setText("SELECCIONAR ZIP");
        root.addView(pick);
        fileLabel = text("Ningún ZIP seleccionado", 13);
        root.addView(fileLabel);
        build = new Button(this);
        build.setText("GENERAR APK");
        build.setEnabled(false);
        root.addView(build);
        status = text("Listo.", 14);
        root.addView(status);
        setContentView(root);

        pick.setOnClickListener(v -> {
            Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
            i.setType("application/zip");
            i.addCategory(Intent.CATEGORY_OPENABLE);
            startActivityForResult(i, 7);
        });
        build.setOnClickListener(v -> startBuild());
    }

    private TextView text(String s, int size) {
        TextView t = new TextView(this);
        t.setText(s); t.setTextSize(size); t.setPadding(0, 8, 0, 8);
        return t;
    }

    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request == 7 && result == RESULT_OK && data != null) {
            zipUri = data.getData();
            try { getContentResolver().takePersistableUriPermission(zipUri, Intent.FLAG_GRANT_READ_URI_PERMISSION); } catch (Exception ignored) {}
            fileLabel.setText(zipUri.toString());
            build.setEnabled(true);
        }
    }

    private void startBuild() {
        final String tok = token.getText().toString().trim();
        final String ver = version.getText().toString().trim();
        if (tok.isEmpty() || ver.isEmpty() || zipUri == null) { status.setText("Token, versión y ZIP son obligatorios."); return; }
        build.setEnabled(false);
        new Thread(() -> {
            try {
                String tag = "atlas-builder-" + System.currentTimeMillis();
                String asset = "atlas-source-" + tag + ".zip";
                ui("Creando solicitud...");
                String releaseBody = "{\"tag_name\":\"" + tag + "\",\"name\":\"Atlas Builder " + tag + "\",\"draft\":false,\"prerelease\":true}";
                JSONObject rel = new JSONObject(api(tok, "POST", base("/releases"), releaseBody.getBytes("UTF-8"), "application/json"));
                String upload = rel.getString("upload_url").split("\\{")[0] + "?name=" + URLEncoder.encode(asset, "UTF-8");
                ui("Subiendo ZIP...");
                upload(tok, upload, zipUri);
                String dispatch = "{\"ref\":\"main\",\"inputs\":{\"source_release_tag\":\"" + tag + "\",\"source_asset_name\":\"" + asset + "\",\"version_label\":\"" + ver + "\",\"request_id\":\"" + tag + "\"}}";
                ui("Iniciando compilación...");
                api(tok, "POST", base("/actions/workflows/" + WORKFLOW + "/dispatches"), dispatch.getBytes("UTF-8"), "application/json");
                ui("Compilando en GitHub...\nPuedes dejar la aplicación abierta.");
                String apkUrl = null;
                for (int n = 0; n < 90 && apkUrl == null; n++) {
                    Thread.sleep(10000);
                    JSONObject r = new JSONObject(api(tok, "GET", base("/releases/tags/" + tag), null, null));
                    JSONArray assets = r.getJSONArray("assets");
                    for (int j = 0; j < assets.length(); j++) {
                        JSONObject a = assets.getJSONObject(j);
                        if (a.getString("name").endsWith(".apk")) { apkUrl = a.getString("browser_download_url"); break; }
                    }
                    if (apkUrl == null) ui("Compilando... " + ((n + 1) * 10) + " s");
                }
                if (apkUrl == null) throw new Exception("No se recibió la APK después de 15 minutos.");
                ui("Descargando APK...");
                File out = new File(getExternalFilesDir(null), "Atlas-v" + ver + "-release.apk");
                download(tok, apkUrl, out);
                ui("✓ APK LISTA\n" + out.getAbsolutePath());
            } catch (Exception e) {
                ui("ERROR: " + e.getMessage());
            } finally { runOnUiThread(() -> build.setEnabled(true)); }
        }).start();
    }

    private String base(String path) { return "https://api.github.com/repos/" + OWNER + "/" + REPO + path; }
    private void ui(String s) { runOnUiThread(() -> status.setText(s)); }

    private String api(String tok, String method, String url, byte[] data, String type) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setRequestMethod(method); c.setRequestProperty("Authorization", "Bearer " + tok);
        c.setRequestProperty("Accept", "application/vnd.github+json"); c.setRequestProperty("X-GitHub-Api-Version", "2022-11-28");
        if (data != null) { c.setDoOutput(true); c.setRequestProperty("Content-Type", type); try(OutputStream o=c.getOutputStream()){o.write(data);} }
        int code=c.getResponseCode(); String body=read(code>=400?c.getErrorStream():c.getInputStream());
        if(code>=300) throw new Exception("GitHub HTTP " + code + ": " + body);
        return body;
    }

    private void upload(String tok, String url, Uri uri) throws Exception {
        HttpURLConnection c=(HttpURLConnection)new URL(url).openConnection(); c.setRequestMethod("POST"); c.setDoOutput(true);
        c.setRequestProperty("Authorization","Bearer "+tok); c.setRequestProperty("Accept","application/vnd.github+json"); c.setRequestProperty("Content-Type","application/zip");
        try(InputStream in=getContentResolver().openInputStream(uri); OutputStream out=c.getOutputStream()){ byte[] b=new byte[65536]; int n; while((n=in.read(b))>0) out.write(b,0,n); }
        int code=c.getResponseCode(); if(code>=300) throw new Exception("Upload HTTP "+code+": "+read(c.getErrorStream()));
    }

    private void download(String tok,String url,File out)throws Exception{
        HttpURLConnection c=(HttpURLConnection)new URL(url).openConnection(); c.setRequestProperty("Authorization","Bearer "+tok); c.setRequestProperty("Accept","application/octet-stream");
        try(InputStream in=c.getInputStream(); FileOutputStream o=new FileOutputStream(out)){byte[] b=new byte[65536];int n;while((n=in.read(b))>0)o.write(b,0,n);}
    }
    private String read(InputStream in)throws Exception{if(in==null)return "";BufferedReader r=new BufferedReader(new InputStreamReader(in));StringBuilder s=new StringBuilder();String x;while((x=r.readLine())!=null)s.append(x);return s.toString();}
}
