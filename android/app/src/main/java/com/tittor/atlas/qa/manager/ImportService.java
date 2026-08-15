package com.tittor.atlas.qa.manager;

import android.app.*;
import android.content.*;
import android.database.Cursor;
import android.net.Uri;
import android.os.*;
import android.provider.OpenableColumns;

import org.json.JSONObject;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.zip.*;

public class ImportService extends Service {
    public static final String ACTION_IMPORT = "com.tittor.atlas.qa.manager.IMPORT";
    public static final String ACTION_DONE = "com.tittor.atlas.qa.manager.IMPORT_DONE";
    public static final String EXTRA_URIS = "uris";
    private static final String CHANNEL = "atlas_qa_import";
    private static final int FOREGROUND_ID = 31001;
    private static final int DONE_ID = 31002;
    private PowerManager.WakeLock wakeLock;

    @Override public void onCreate() {
        super.onCreate();
        createChannel();
    }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null || !ACTION_IMPORT.equals(intent.getAction())) {
            stopSelf(startId);
            return START_NOT_STICKY;
        }
        ArrayList<String> uris = intent.getStringArrayListExtra(EXTRA_URIS);
        if (uris == null || uris.isEmpty()) {
            stopSelf(startId);
            return START_NOT_STICKY;
        }
        startForeground(FOREGROUND_ID, notification("Importando builds", "Preparando…", 0, true, false));
        acquireWakeLock();
        setState("working", "Preparando importación…", 0, "");
        new Thread(() -> runImport(uris, startId), "AtlasQA-import").start();
        return START_NOT_STICKY;
    }

    private void runImport(ArrayList<String> uriStrings, int startId) {
        int ok = 0, duplicates = 0, errors = 0;
        List<String> names = new ArrayList<>();
        try {
            AtlasStorage.cleanupImporting(this);
            for (int i = 0; i < uriStrings.size(); i++) {
                Uri uri = Uri.parse(uriStrings.get(i));
                String name = displayName(uri);
                int baseProgress = (int)((i * 100.0) / uriStrings.size());
                int topProgress = (int)(((i + 1) * 100.0) / uriStrings.size());
                update("Leyendo " + name, baseProgress);
                try {
                    ImportResult r = importOne(uri, name, baseProgress, topProgress);
                    if (r.duplicate) duplicates++; else { ok++; names.add(r.label); }
                } catch (Exception e) {
                    errors++;
                    appendLog("ERROR " + name + ": " + e.getClass().getSimpleName() + ": " + e.getMessage());
                }
            }
            StringBuilder msg = new StringBuilder();
            if (ok > 0) msg.append(ok).append(ok == 1 ? " versión lista" : " versiones listas");
            if (duplicates > 0) {
                if (msg.length() > 0) msg.append(" · ");
                msg.append(duplicates).append(duplicates == 1 ? " duplicada" : " duplicadas");
            }
            if (errors > 0) {
                if (msg.length() > 0) msg.append(" · ");
                msg.append(errors).append(errors == 1 ? " error" : " errores");
            }
            if (msg.length() == 0) msg.append("No se importaron builds");
            String finalState = errors > 0 && ok == 0 && duplicates == 0 ? "error" : "ready";
            setState(finalState, msg.toString(), 100, errors > 0 ? "Revisa el registro de importación." : "");
            notifyDone(msg.toString(), names);
            sendBroadcast(new Intent(ACTION_DONE).setPackage(getPackageName()));
        } finally {
            releaseWakeLock();
            stopForeground(STOP_FOREGROUND_REMOVE);
            stopSelf(startId);
        }
    }

    private ImportResult importOne(Uri uri, String sourceName, int baseProgress, int topProgress) throws Exception {
        File incoming = File.createTempFile("atlas-", ".zip", AtlasStorage.incomingDir(this));
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        long copied = 0L;
        try (InputStream in = getContentResolver().openInputStream(uri);
             OutputStream out = new BufferedOutputStream(new FileOutputStream(incoming))) {
            if (in == null) throw new FileNotFoundException("No se pudo abrir " + sourceName);
            byte[] buf = new byte[64 * 1024];
            int n;
            while ((n = in.read(buf)) >= 0) {
                out.write(buf, 0, n);
                md.update(buf, 0, n);
                copied += n;
                if (copied > 6L * 1024L * 1024L * 1024L) throw new IOException("ZIP demasiado grande");
            }
        }
        String hash = hex(md.digest());
        String id = hash.substring(0, 20);
        AtlasVersion existing = AtlasStorage.find(this, id);
        if (existing != null) {
            incoming.delete();
            appendLog("DUPLICADA " + sourceName + " -> " + existing.displayName());
            return new ImportResult(existing.displayName(), true);
        }

        File staging = new File(AtlasStorage.versionsDir(this), ".importing-" + id);
        AtlasStorage.deleteRecursive(staging);
        staging.mkdirs();
        File siteOut = new File(staging, "site");
        siteOut.mkdirs();

        JSONObject manifest = null;
        String sitePrefix;
        try (ZipFile zip = new ZipFile(incoming)) {
            sitePrefix = findSitePrefix(zip);
            if (sitePrefix == null) throw new IOException("El ZIP no contiene dist/index.html ni index.html compilado");
            manifest = findManifest(zip);
            extractSite(zip, sitePrefix, siteOut, sourceName, baseProgress, topProgress);
        }
        File index = new File(siteOut, "index.html");
        if (!index.isFile()) throw new IOException("La build no contiene index.html válido");

        AtlasVersion v = new AtlasVersion();
        v.id = id;
        v.hash = hash;
        v.sourceName = sourceName;
        v.importedAt = System.currentTimeMillis();
        v.lastPlayedAt = 0L;
        v.favorite = false;
        v.valid = true;
        v.rootDir = staging;
        v.siteDir = siteOut;
        if (manifest != null) {
            v.version = firstNonEmpty(manifest.optString("atlasVersion", ""), manifest.optString("version", ""));
            v.label = firstNonEmpty(manifest.optString("label", ""), manifest.optString("name", ""));
            v.channel = manifest.optString("channel", "");
            v.notes = manifest.optString("notes", "");
        }
        if (v.version.isEmpty()) v.version = VersionUtil.inferLabel(sourceName);
        if (v.label.isEmpty()) v.label = VersionUtil.inferLabel(firstNonEmpty(v.version, sourceName));
        v.sizeBytes = AtlasStorage.dirSize(siteOut);
        AtlasStorage.writeVersion(v);

        File finalDir = new File(AtlasStorage.versionsDir(this), id);
        if (finalDir.exists()) AtlasStorage.deleteRecursive(finalDir);
        if (!staging.renameTo(finalDir)) {
            copyDir(staging, finalDir);
            AtlasStorage.deleteRecursive(staging);
        }
        AtlasVersion finalVersion = AtlasStorage.readVersion(finalDir);
        if (finalVersion == null) throw new IOException("No se pudo activar la versión importada");
        incoming.delete();
        appendLog("OK " + sourceName + " -> " + finalVersion.displayName() + " (" + finalVersion.sizeBytes + " bytes)");
        return new ImportResult(finalVersion.displayName(), false);
    }

    private String findSitePrefix(ZipFile zip) {
        String bestDist = null;
        String bestRoot = null;
        Enumeration<? extends ZipEntry> en = zip.entries();
        while (en.hasMoreElements()) {
            ZipEntry e = en.nextElement();
            if (e.isDirectory()) continue;
            String n = normalize(e.getName());
            if (n.equals("dist/index.html") || n.endsWith("/dist/index.html")) {
                String prefix = n.substring(0, n.length() - "index.html".length());
                if (bestDist == null || prefix.split("/").length < bestDist.split("/").length) bestDist = prefix;
            } else if (n.equals("index.html") || n.endsWith("/index.html")) {
                String prefix = n.substring(0, n.length() - "index.html".length());
                if (bestRoot == null || prefix.split("/").length < bestRoot.split("/").length) bestRoot = prefix;
            }
        }
        return bestDist != null ? bestDist : bestRoot;
    }

    private JSONObject findManifest(ZipFile zip) {
        ZipEntry candidate = null;
        int bestDepth = Integer.MAX_VALUE;
        boolean bestIsQa = false;
        Enumeration<? extends ZipEntry> en = zip.entries();
        while (en.hasMoreElements()) {
            ZipEntry e = en.nextElement();
            if (e.isDirectory()) continue;
            String n = normalize(e.getName()).toLowerCase(Locale.ROOT);
            boolean isQa = n.endsWith("atlas-qa-manifest.json");
            boolean isGeneric = n.endsWith("manifest.json");
            if (isQa || isGeneric) {
                int depth = n.split("/").length;
                if (candidate == null || (isQa && !bestIsQa) || (isQa == bestIsQa && depth < bestDepth)) {
                    candidate = e; bestDepth = depth; bestIsQa = isQa;
                }
            }
        }
        if (candidate == null) return null;
        try (InputStream in = zip.getInputStream(candidate)) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] b = new byte[8192];
            int n;
            while ((n = in.read(b)) >= 0) {
                out.write(b, 0, n);
                if (out.size() > 2 * 1024 * 1024) return null;
            }
            return new JSONObject(out.toString(StandardCharsets.UTF_8.name()));
        } catch (Exception e) {
            return null;
        }
    }

    private void extractSite(ZipFile zip, String prefix, File outRoot, String sourceName, int baseProgress, int topProgress) throws Exception {
        long total = 0L;
        int count = 0;
        Enumeration<? extends ZipEntry> countEn = zip.entries();
        while (countEn.hasMoreElements()) {
            ZipEntry e = countEn.nextElement();
            String n = normalize(e.getName());
            if (!e.isDirectory() && n.startsWith(prefix)) {
                long sz = e.getSize();
                if (sz > 0) total += sz;
                count++;
                if (count > 80000) throw new IOException("Demasiados archivos en el ZIP");
                if (total > 6L * 1024L * 1024L * 1024L) throw new IOException("Contenido descomprimido demasiado grande");
            }
        }
        long done = 0L;
        Enumeration<? extends ZipEntry> en = zip.entries();
        byte[] buf = new byte[64 * 1024];
        while (en.hasMoreElements()) {
            ZipEntry e = en.nextElement();
            String n = normalize(e.getName());
            if (!n.startsWith(prefix)) continue;
            String rel = n.substring(prefix.length());
            if (rel.isEmpty()) continue;
            if (rel.startsWith("/") || rel.contains("../") || rel.equals("..")) throw new IOException("Ruta insegura dentro del ZIP");
            File dest = new File(outRoot, rel).getCanonicalFile();
            String rp = outRoot.getCanonicalPath();
            String dp = dest.getCanonicalPath();
            if (!(dp.equals(rp) || dp.startsWith(rp + File.separator))) throw new IOException("Ruta fuera de la build");
            if (e.isDirectory()) {
                dest.mkdirs();
                continue;
            }
            File parent = dest.getParentFile();
            if (parent != null) parent.mkdirs();
            long fileDone = 0L;
            try (InputStream in = new BufferedInputStream(zip.getInputStream(e));
                 OutputStream out = new BufferedOutputStream(new FileOutputStream(dest))) {
                int r;
                while ((r = in.read(buf)) >= 0) {
                    out.write(buf, 0, r);
                    fileDone += r;
                    done += r;
                    if (fileDone > 1024L * 1024L * 1024L) throw new IOException("Archivo individual demasiado grande");
                    if (total > 0) {
                        int local = (int)Math.min(100, (done * 100L) / total);
                        int progress = baseProgress + (int)((topProgress - baseProgress) * (local / 100.0));
                        update("Extrayendo " + sourceName + " · " + rel, progress);
                    }
                }
            }
            if (e.getTime() > 0) dest.setLastModified(e.getTime());
        }
    }

    private static String normalize(String name) {
        String n = name == null ? "" : name.replace('\\', '/');
        while (n.startsWith("./")) n = n.substring(2);
        while (n.startsWith("/")) n = n.substring(1);
        return n;
    }

    private void update(String message, int progress) {
        progress = Math.max(0, Math.min(100, progress));
        setState("working", message, progress, "");
        NotificationManager nm = (NotificationManager)getSystemService(NOTIFICATION_SERVICE);
        nm.notify(FOREGROUND_ID, notification("Importando builds", message, progress, progress < 1, false));
    }

    private void setState(String state, String message, int progress, String error) {
        AtlasStorage.prefs(this).edit()
                .putString("import_state", state)
                .putString("import_message", message == null ? "" : message)
                .putInt("import_progress", progress)
                .putString("import_error", error == null ? "" : error)
                .putLong("import_updated_at", System.currentTimeMillis())
                .apply();
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel ch = new NotificationChannel(CHANNEL, "Atlas QA · Builds", NotificationManager.IMPORTANCE_DEFAULT);
            ch.setDescription("Importación y preparación de versiones de Atlas");
            ((NotificationManager)getSystemService(NOTIFICATION_SERVICE)).createNotificationChannel(ch);
        }
    }

    private Notification notification(String title, String text, int progress, boolean indeterminate, boolean autoCancel) {
        Intent open = new Intent(this, MainActivity.class).setAction(MainActivity.ACTION_SHOW_MANAGER);
        PendingIntent pi = PendingIntent.getActivity(this, 100, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder b = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O ? new Notification.Builder(this, CHANNEL) : new Notification.Builder(this);
        b.setSmallIcon(android.R.drawable.stat_sys_download)
                .setContentTitle(title)
                .setContentText(text)
                .setContentIntent(pi)
                .setOngoing(!autoCancel)
                .setAutoCancel(autoCancel)
                .setOnlyAlertOnce(!autoCancel);
        if (!autoCancel) b.setProgress(100, progress, indeterminate);
        return b.build();
    }

    private void notifyDone(String msg, List<String> names) {
        NotificationManager nm = (NotificationManager)getSystemService(NOTIFICATION_SERVICE);
        String title = "Atlas QA · Listo";
        String text = names.isEmpty() ? msg : (names.size() == 1 ? names.get(0) + " lista para probar" : names.size() + " versiones listas para probar");
        nm.notify(DONE_ID, notification(title, text, 100, false, true));
    }

    private String displayName(Uri uri) {
        try (Cursor c = getContentResolver().query(uri, new String[]{OpenableColumns.DISPLAY_NAME}, null, null, null)) {
            if (c != null && c.moveToFirst()) {
                int i = c.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                if (i >= 0) {
                    String s = c.getString(i);
                    if (s != null && !s.trim().isEmpty()) return s;
                }
            }
        } catch (Exception ignored) {}
        String last = uri.getLastPathSegment();
        return last == null ? "Atlas_QA.zip" : last;
    }

    private void acquireWakeLock() {
        try {
            PowerManager pm = (PowerManager)getSystemService(POWER_SERVICE);
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "AtlasQA:Import");
            wakeLock.acquire(30L * 60L * 1000L);
        } catch (Exception ignored) {}
    }

    private void releaseWakeLock() {
        try { if (wakeLock != null && wakeLock.isHeld()) wakeLock.release(); } catch (Exception ignored) {}
        wakeLock = null;
    }

    private void appendLog(String s) {
        try {
            File f = new File(getFilesDir(), "import.log");
            try (FileWriter w = new FileWriter(f, true)) {
                w.write(new Date() + " " + s + "\n");
            }
        } catch (Exception ignored) {}
    }

    private static String firstNonEmpty(String... values) {
        for (String s : values) if (s != null && !s.trim().isEmpty()) return s.trim();
        return "";
    }

    private static String hex(byte[] b) {
        StringBuilder s = new StringBuilder();
        for (byte x : b) s.append(String.format(Locale.ROOT, "%02x", x));
        return s.toString();
    }

    private static void copyDir(File src, File dst) throws IOException {
        if (src.isDirectory()) {
            dst.mkdirs();
            File[] kids = src.listFiles();
            if (kids != null) for (File k : kids) copyDir(k, new File(dst, k.getName()));
        } else {
            File p = dst.getParentFile();
            if (p != null) p.mkdirs();
            try (InputStream in = new FileInputStream(src); OutputStream out = new FileOutputStream(dst)) {
                byte[] b = new byte[64 * 1024]; int n; while ((n = in.read(b)) >= 0) out.write(b, 0, n);
            }
        }
    }

    @Override public android.os.IBinder onBind(Intent intent) { return null; }

    private static final class ImportResult {
        final String label;
        final boolean duplicate;
        ImportResult(String label, boolean duplicate) { this.label = label; this.duplicate = duplicate; }
    }
}
