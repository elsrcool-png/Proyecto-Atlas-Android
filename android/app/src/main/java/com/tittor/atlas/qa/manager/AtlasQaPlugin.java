package com.tittor.atlas.qa.manager;

import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.PluginMethod;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@CapacitorPlugin(name = "AtlasQa")
public class AtlasQaPlugin extends Plugin {
    private final LocalHttpServer server = new LocalHttpServer();

    @PluginMethod
    public void listVersions(PluginCall call) {
        List<AtlasVersion> versions = AtlasStorage.list(getContext());
        String lastId = AtlasStorage.lastPlayedId(getContext());
        JSArray arr = new JSArray();
        for (int i = 0; i < versions.size(); i++) {
            AtlasVersion v = versions.get(i);
            JSObject o = versionObject(v);
            o.put("suggested", i == 0);
            o.put("lastPlayed", v.id.equals(lastId));
            arr.put(o);
        }
        JSObject out = new JSObject();
        out.put("versions", arr);
        out.put("totalSize", AtlasStorage.totalSize(getContext()));
        out.put("lastPlayedId", lastId);
        call.resolve(out);
    }

    @PluginMethod
    public void toggleFavorite(PluginCall call) {
        String id = call.getString("id", "");
        AtlasVersion v = AtlasStorage.find(getContext(), id);
        if (v == null) { call.reject("Versión no encontrada"); return; }
        boolean value = AtlasStorage.toggleFavorite(getContext(), id);
        JSObject out = new JSObject();
        out.put("favorite", value);
        call.resolve(out);
    }

    @PluginMethod
    public void deleteVersions(PluginCall call) {
        JSArray ids = call.getArray("ids");
        if (ids == null) { call.reject("Faltan versiones"); return; }
        int deleted = 0;
        try {
            for (Object raw : ids.toList()) {
                if (raw == null) continue;
                String id = String.valueOf(raw);
                if (AtlasStorage.delete(getContext(), id)) deleted++;
            }
            JSObject out = new JSObject();
            out.put("deleted", deleted);
            call.resolve(out);
        } catch (Exception e) {
            call.reject("No pude borrar las versiones", e);
        }
    }

    @PluginMethod
    public void launchVersion(PluginCall call) {
        String id = call.getString("id", "");
        AtlasVersion v = AtlasStorage.find(getContext(), id);
        if (v == null || v.siteDir == null || !new File(v.siteDir, "index.html").isFile()) {
            call.reject("La build no es válida");
            return;
        }
        try {
            int port = server.start(v.siteDir);
            AtlasStorage.markPlayed(getContext(), id);
            JSObject out = new JSObject();
            out.put("url", "http://127.0.0.1:" + port + "/?atlas_qa=3.1.0&v=" + Uri.encode(v.displayName()));
            out.put("version", versionObject(v));
            call.resolve(out);
        } catch (Exception e) {
            call.reject("No pude iniciar Atlas: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void getImportStatus(PluginCall call) {
        JSObject out = new JSObject();
        out.put("state", AtlasStorage.prefs(getContext()).getString("import_state", ""));
        out.put("message", AtlasStorage.prefs(getContext()).getString("import_message", ""));
        out.put("progress", AtlasStorage.prefs(getContext()).getInt("import_progress", 0));
        out.put("error", AtlasStorage.prefs(getContext()).getString("import_error", ""));
        out.put("updatedAt", AtlasStorage.prefs(getContext()).getLong("import_updated_at", 0L));
        call.resolve(out);
    }

    @PluginMethod
    public void pickImport(PluginCall call) {
        Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        i.addCategory(Intent.CATEGORY_OPENABLE);
        i.setType("*/*");
        i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
        i.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"application/zip", "application/x-zip-compressed", "application/octet-stream"});
        startActivityForResult(call, i, "pickImportResult");
    }

    @ActivityCallback
    private void pickImportResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null) {
            call.resolve(new JSObject().put("count", 0));
            return;
        }
        Intent data = result.getData();
        ArrayList<String> uris = new ArrayList<>();
        ClipData clip = data.getClipData();
        if (clip != null) {
            for (int n = 0; n < clip.getItemCount(); n++) {
                Uri u = clip.getItemAt(n).getUri();
                if (u != null) uris.add(u.toString());
            }
        } else if (data.getData() != null) {
            uris.add(data.getData().toString());
        }
        if (uris.isEmpty()) {
            call.resolve(new JSObject().put("count", 0));
            return;
        }
        int flags = data.getFlags() & (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        for (String s : uris) {
            try { getContext().getContentResolver().takePersistableUriPermission(Uri.parse(s), flags & Intent.FLAG_GRANT_READ_URI_PERMISSION); } catch (Exception ignored) {}
        }
        Intent service = new Intent(getContext(), ImportService.class)
                .setAction(ImportService.ACTION_IMPORT)
                .putStringArrayListExtra(ImportService.EXTRA_URIS, uris);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) getContext().startForegroundService(service); else getContext().startService(service);
        JSObject out = new JSObject();
        out.put("count", uris.size());
        call.resolve(out);
    }

    @PluginMethod
    public void stopServer(PluginCall call) {
        server.stop();
        call.resolve();
    }

    @Override
    protected void handleOnDestroy() {
        server.stop();
        super.handleOnDestroy();
    }

    private JSObject versionObject(AtlasVersion v) {
        JSObject o = new JSObject();
        o.put("id", v.id);
        o.put("version", v.version == null ? "" : v.version);
        o.put("label", v.label == null ? "" : v.label);
        o.put("displayName", v.displayName());
        o.put("channel", v.channel == null ? "" : v.channel);
        o.put("sourceName", v.sourceName == null ? "" : v.sourceName);
        o.put("notes", v.notes == null ? "" : v.notes);
        o.put("hash", v.hash == null ? "" : v.hash);
        o.put("importedAt", v.importedAt);
        o.put("lastPlayedAt", v.lastPlayedAt);
        o.put("sizeBytes", v.sizeBytes);
        o.put("favorite", v.favorite);
        o.put("valid", v.valid);
        return o;
    }
}
