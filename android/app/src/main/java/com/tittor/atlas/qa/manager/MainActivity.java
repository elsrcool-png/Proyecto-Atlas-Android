package com.tittor.atlas.qa.manager;

import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class MainActivity extends BridgeActivity {
    public static final String ACTION_SHOW_MANAGER = "com.tittor.atlas.qa.manager.SHOW_MANAGER";
    private static final String APP_VERSION = "3.2.0";

    private final Map<String, OutputStream> exportStreams = new ConcurrentHashMap<>();
    private final Map<String, Uri> exportUris = new ConcurrentHashMap<>();

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AtlasQaPlugin.class);
        super.onCreate(savedInstanceState);
        try {
            WebView web = getBridge() == null ? null : getBridge().getWebView();
            if (web != null) web.addJavascriptInterface(new StudioBridge(), "AtlasAndroid");
        } catch (Exception ignored) {}
    }

    @Override
    public void onBackPressed() {
        try {
            if (getBridge() != null) {
                WebView web = getBridge().getWebView();
                String url = web == null ? null : web.getUrl();
                if (web != null && url != null && (url.startsWith("http://127.0.0.1:") || url.startsWith("http://localhost:")) && web.canGoBack()) {
                    web.goBack();
                    return;
                }
            }
        } catch (Exception ignored) {}
        super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        for (Map.Entry<String, OutputStream> e : exportStreams.entrySet()) {
            try { e.getValue().close(); } catch (Exception ignored) {}
        }
        exportStreams.clear();
        exportUris.clear();
        super.onDestroy();
    }

    private boolean isStudioPage() {
        try {
            WebView web = getBridge() == null ? null : getBridge().getWebView();
            String url = web == null ? null : web.getUrl();
            return url != null && (url.startsWith("http://127.0.0.1:") || url.startsWith("http://localhost:")) && url.contains("atlas_studio=1");
        } catch (Exception e) {
            return false;
        }
    }

    private final class StudioBridge {
        @JavascriptInterface public String getVersion() { return isStudioPage() ? APP_VERSION : ""; }

        @JavascriptInterface public String beginSave(String filename, String mime) {
            if (!isStudioPage()) return "";
            try {
                String safe = sanitizeFilename(filename);
                String id = UUID.randomUUID().toString();
                Uri uri;
                OutputStream out;
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.MediaColumns.DISPLAY_NAME, safe);
                    values.put(MediaStore.MediaColumns.MIME_TYPE, mime == null || mime.isEmpty() ? "application/octet-stream" : mime);
                    values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/Atlas Character Studio");
                    values.put(MediaStore.MediaColumns.IS_PENDING, 1);
                    uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                    if (uri == null) throw new IOException("MediaStore no creó el archivo");
                    out = getContentResolver().openOutputStream(uri, "w");
                } else {
                    File dir = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "Atlas Character Studio");
                    if (!dir.mkdirs() && !dir.isDirectory()) throw new IOException("No pude crear carpeta de Studio");
                    File file = new File(dir, safe);
                    uri = Uri.fromFile(file);
                    out = new FileOutputStream(file, false);
                }
                if (out == null) throw new IOException("No pude abrir archivo de salida");
                exportUris.put(id, uri);
                exportStreams.put(id, out);
                return id;
            } catch (Exception e) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "Error de exportación: " + e.getMessage(), Toast.LENGTH_LONG).show());
                return "";
            }
        }

        @JavascriptInterface public boolean appendSave(String id, String base64) {
            if (!isStudioPage()) return false;
            OutputStream out = exportStreams.get(id);
            if (out == null) return false;
            try {
                out.write(Base64.decode(base64, Base64.DEFAULT));
                return true;
            } catch (Exception e) {
                return false;
            }
        }

        @JavascriptInterface public boolean finishSave(String id) {
            if (!isStudioPage()) return false;
            OutputStream out = exportStreams.remove(id);
            Uri uri = exportUris.remove(id);
            if (out == null) return false;
            try {
                out.flush();
                out.close();
                if (Build.VERSION.SDK_INT >= 29 && uri != null) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.MediaColumns.IS_PENDING, 0);
                    getContentResolver().update(uri, values, null, null);
                }
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "Guardado en Descargas/Atlas Character Studio", Toast.LENGTH_SHORT).show());
                return true;
            } catch (Exception e) {
                return false;
            }
        }

        @JavascriptInterface public void cancelSave(String id) {
            if (!isStudioPage()) return;
            OutputStream out = exportStreams.remove(id);
            Uri uri = exportUris.remove(id);
            try { if (out != null) out.close(); } catch (Exception ignored) {}
            try { if (uri != null) getContentResolver().delete(uri, null, null); } catch (Exception ignored) {}
        }
    }

    private String sanitizeFilename(String name) {
        String n = name == null || name.trim().isEmpty() ? "atlas-export.bin" : name.trim();
        n = n.replaceAll("[\\\\/:*?\"<>|\\r\\n]", "_");
        if (n.length() > 120) n = n.substring(n.length() - 120);
        return n;
    }
}
