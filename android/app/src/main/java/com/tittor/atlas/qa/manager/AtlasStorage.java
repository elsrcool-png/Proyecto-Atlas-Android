package com.tittor.atlas.qa.manager;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONObject;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

public final class AtlasStorage {
    private AtlasStorage() {}

    public static final String PREFS = "atlas_qa_manager";

    public static File versionsDir(Context c) {
        File f = new File(c.getFilesDir(), "atlas_versions");
        if (!f.exists()) f.mkdirs();
        return f;
    }

    public static File incomingDir(Context c) {
        File f = new File(c.getFilesDir(), "incoming");
        if (!f.exists()) f.mkdirs();
        return f;
    }

    public static List<AtlasVersion> list(Context c) {
        List<AtlasVersion> out = new ArrayList<>();
        File[] dirs = versionsDir(c).listFiles(File::isDirectory);
        if (dirs != null) {
            for (File dir : dirs) {
                if (dir.getName().startsWith(".importing-")) continue;
                AtlasVersion v = readVersion(dir);
                if (v != null) out.add(v);
            }
        }
        out.sort(VersionUtil.newestFirst());
        return out;
    }

    public static AtlasVersion find(Context c, String id) {
        if (id == null || id.isEmpty()) return null;
        File d = new File(versionsDir(c), id);
        return readVersion(d);
    }

    public static AtlasVersion suggested(Context c) {
        List<AtlasVersion> all = list(c);
        return all.isEmpty() ? null : all.get(0);
    }

    public static AtlasVersion readVersion(File dir) {
        try {
            File meta = new File(dir, "meta.json");
            File site = new File(dir, "site");
            if (!meta.isFile() || !new File(site, "index.html").isFile()) return null;
            String text = readText(meta);
            JSONObject j = new JSONObject(text);
            AtlasVersion v = new AtlasVersion();
            v.id = j.optString("id", dir.getName());
            v.version = j.optString("version", "");
            v.label = j.optString("label", "");
            v.channel = j.optString("channel", "");
            v.sourceName = j.optString("sourceName", "");
            v.hash = j.optString("hash", "");
            v.notes = j.optString("notes", "");
            v.importedAt = j.optLong("importedAt", dir.lastModified());
            v.lastPlayedAt = j.optLong("lastPlayedAt", 0L);
            v.sizeBytes = j.optLong("sizeBytes", dirSize(site));
            v.favorite = j.optBoolean("favorite", false);
            v.valid = j.optBoolean("valid", true);
            v.rootDir = dir;
            v.siteDir = site;
            return v;
        } catch (Exception e) {
            return null;
        }
    }

    public static void writeVersion(AtlasVersion v) throws Exception {
        if (v == null || v.rootDir == null) throw new IllegalArgumentException("Versión inválida");
        JSONObject j = new JSONObject();
        j.put("id", v.id);
        j.put("version", v.version == null ? "" : v.version);
        j.put("label", v.label == null ? "" : v.label);
        j.put("channel", v.channel == null ? "" : v.channel);
        j.put("sourceName", v.sourceName == null ? "" : v.sourceName);
        j.put("hash", v.hash == null ? "" : v.hash);
        j.put("notes", v.notes == null ? "" : v.notes);
        j.put("importedAt", v.importedAt);
        j.put("lastPlayedAt", v.lastPlayedAt);
        j.put("sizeBytes", v.sizeBytes);
        j.put("favorite", v.favorite);
        j.put("valid", v.valid);
        writeTextAtomic(new File(v.rootDir, "meta.json"), j.toString(2));
    }

    public static boolean toggleFavorite(Context c, String id) {
        AtlasVersion v = find(c, id);
        if (v == null) return false;
        v.favorite = !v.favorite;
        try { writeVersion(v); return v.favorite; } catch (Exception e) { return v.favorite; }
    }

    public static void markPlayed(Context c, String id) {
        AtlasVersion v = find(c, id);
        if (v == null) return;
        v.lastPlayedAt = System.currentTimeMillis();
        try { writeVersion(v); } catch (Exception ignored) {}
        prefs(c).edit().putString("last_played_id", id).apply();
    }

    public static String lastPlayedId(Context c) {
        return prefs(c).getString("last_played_id", "");
    }

    public static long totalSize(Context c) {
        long n = 0L;
        for (AtlasVersion v : list(c)) n += Math.max(0L, v.sizeBytes);
        return n;
    }

    public static boolean delete(Context c, String id) {
        if (id == null || id.isEmpty()) return false;
        File d = new File(versionsDir(c), id);
        boolean ok = deleteRecursive(d);
        if (id.equals(lastPlayedId(c))) prefs(c).edit().remove("last_played_id").apply();
        return ok;
    }

    public static void cleanupImporting(Context c) {
        File[] dirs = versionsDir(c).listFiles(File::isDirectory);
        if (dirs == null) return;
        long cutoff = System.currentTimeMillis() - 6L * 60L * 60L * 1000L;
        for (File d : dirs) {
            if (d.getName().startsWith(".importing-") && d.lastModified() < cutoff) deleteRecursive(d);
        }
    }

    public static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    public static long dirSize(File f) {
        if (f == null || !f.exists()) return 0L;
        if (f.isFile()) return f.length();
        long n = 0L;
        File[] kids = f.listFiles();
        if (kids != null) for (File k : kids) n += dirSize(k);
        return n;
    }

    public static boolean deleteRecursive(File f) {
        if (f == null || !f.exists()) return true;
        if (f.isDirectory()) {
            File[] kids = f.listFiles();
            if (kids != null) for (File k : kids) deleteRecursive(k);
        }
        return f.delete();
    }

    public static String readText(File f) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (InputStream in = new FileInputStream(f)) {
            byte[] b = new byte[16384];
            int n;
            while ((n = in.read(b)) >= 0) out.write(b, 0, n);
        }
        return out.toString(StandardCharsets.UTF_8.name());
    }

    public static void writeTextAtomic(File f, String text) throws IOException {
        File parent = f.getParentFile();
        if (parent != null) parent.mkdirs();
        File tmp = new File(f.getAbsolutePath() + ".tmp");
        try (OutputStream out = new FileOutputStream(tmp)) {
            out.write(text.getBytes(StandardCharsets.UTF_8));
            out.flush();
        }
        if (f.exists() && !f.delete()) throw new IOException("No se pudo reemplazar " + f.getName());
        if (!tmp.renameTo(f)) throw new IOException("No se pudo activar " + f.getName());
    }
}
