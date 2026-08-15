package com.tittor.atlas.qa.manager;

import android.Manifest;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.*;
import android.view.*;
import android.webkit.*;
import android.widget.*;

import java.io.*;
import java.text.DateFormat;
import java.util.*;

public class MainActivity extends Activity {
    public static final String ACTION_SHOW_MANAGER = "com.tittor.atlas.qa.manager.SHOW_MANAGER";
    private static final int REQ_IMPORT = 7001;
    private static final int REQ_NOTIFICATIONS = 7002;

    private final LocalHttpServer server = new LocalHttpServer();
    private final Set<String> selected = new LinkedHashSet<>();
    private LinearLayout root;
    private ScrollView scroll;
    private WebView webView;
    private boolean inGame = false;
    private String activeVersionId = "";
    private BroadcastReceiver importReceiver;

    private final int bg = Color.rgb(7, 17, 12);
    private final int card = Color.rgb(13, 28, 20);
    private final int border = Color.rgb(31, 61, 43);
    private final int text = Color.rgb(238, 247, 240);
    private final int muted = Color.rgb(155, 176, 164);
    private final int accent = Color.rgb(125, 211, 166);
    private final int danger = Color.rgb(233, 126, 116);

    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.BLACK);
        getWindow().setNavigationBarColor(bg);
        AtlasStorage.cleanupImporting(this);
        requestNotificationsIfNeeded();
        registerImportReceiver();
        handleIncoming(getIntent());
        showManager();
    }

    @Override protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIncoming(intent);
        if (ACTION_SHOW_MANAGER.equals(intent.getAction())) showManager();
    }

    @Override protected void onResume() {
        super.onResume();
        if (!inGame && root != null) renderManager();
    }

    @Override protected void onDestroy() {
        try { if (importReceiver != null) unregisterReceiver(importReceiver); } catch (Exception ignored) {}
        if (webView != null) {
            try { webView.destroy(); } catch (Exception ignored) {}
        }
        server.stop();
        super.onDestroy();
    }

    @Override public void onBackPressed() {
        if (inGame) {
            showManager();
            return;
        }
        super.onBackPressed();
    }

    private void showManager() {
        inGame = false;
        activeVersionId = "";
        server.stop();
        if (webView != null) {
            try { webView.stopLoading(); webView.loadUrl("about:blank"); webView.destroy(); } catch (Exception ignored) {}
            webView = null;
        }
        scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(bg);
        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(16), dp(22), dp(16), dp(36));
        scroll.addView(root, new ScrollView.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        setContentView(scroll);
        renderManager();
    }

    private void renderManager() {
        if (root == null) return;
        root.removeAllViews();
        List<AtlasVersion> versions = AtlasStorage.list(this);
        AtlasVersion suggested = versions.isEmpty() ? null : versions.get(0);
        String lastId = AtlasStorage.lastPlayedId(this);

        TextView mark = tv("ATLAS", 12, muted, Typeface.BOLD);
        mark.setLetterSpacing(0.34f);
        mark.setGravity(Gravity.CENTER_HORIZONTAL);
        root.addView(mark);
        TextView title = tv("Atlas QA", 34, text, Typeface.BOLD);
        title.setGravity(Gravity.CENTER_HORIZONTAL);
        root.addView(title);
        TextView sub = tv("Gestor autónomo de builds", 14, muted, Typeface.NORMAL);
        sub.setGravity(Gravity.CENTER_HORIZONTAL);
        sub.setPadding(0, 0, 0, dp(18));
        root.addView(sub);

        addImportStatus();

        if (suggested != null) {
            LinearLayout c = cardBox();
            c.addView(eyebrow("VERSIÓN SUGERIDA"));
            TextView n = tv(suggested.displayName(), 23, text, Typeface.BOLD);
            n.setPadding(0, dp(4), 0, dp(4));
            c.addView(n);
            c.addView(tv(metaLine(suggested), 13, muted, Typeface.NORMAL));
            LinearLayout row = hrow();
            Button open = button("▶ EJECUTAR", true);
            open.setOnClickListener(v -> launchVersion(suggested.id));
            Button star = button(suggested.favorite ? "★ FAVORITA" : "☆ FIJAR", false);
            star.setOnClickListener(v -> { AtlasStorage.toggleFavorite(this, suggested.id); renderManager(); });
            row.addView(open, weighted());
            row.addView(star, weighted());
            c.addView(row);
            root.addView(c);
        } else {
            LinearLayout c = cardBox();
            c.addView(eyebrow("SIN BUILDS"));
            TextView n = tv("Importa tu primera versión QA", 21, text, Typeface.BOLD);
            n.setPadding(0, dp(6), 0, dp(6));
            c.addView(n);
            c.addView(tv("Atlas QA guarda cada versión dentro de la app. No necesita Termux para ejecutarlas.", 13, muted, Typeface.NORMAL));
            root.addView(c);
        }

        LinearLayout actions = hrow();
        Button imp = button("＋ IMPORTAR", true);
        imp.setOnClickListener(v -> openImportPicker());
        Button refresh = button("↻ ACTUALIZAR", false);
        refresh.setOnClickListener(v -> renderManager());
        actions.addView(imp, weighted());
        actions.addView(refresh, weighted());
        root.addView(actions);

        LinearLayout summary = cardBox();
        summary.addView(eyebrow("BIBLIOTECA"));
        summary.addView(tv(versions.size() + (versions.size() == 1 ? " versión instalada" : " versiones instaladas") + " · " + human(AtlasStorage.totalSize(this)), 14, text, Typeface.BOLD));
        summary.addView(tv("Marca varias versiones para borrarlas juntas. Las favoritas se distinguen con ★.", 12, muted, Typeface.NORMAL));
        root.addView(summary);

        if (!versions.isEmpty()) {
            LinearLayout batch = hrow();
            Button selectAll = button("SELECCIONAR TODO", false);
            selectAll.setOnClickListener(v -> { selected.clear(); for (AtlasVersion x : versions) selected.add(x.id); renderManager(); });
            Button clear = button("LIMPIAR", false);
            clear.setOnClickListener(v -> { selected.clear(); renderManager(); });
            batch.addView(selectAll, weighted());
            batch.addView(clear, weighted());
            root.addView(batch);

            LinearLayout delRow = hrow();
            Button delete = button(selected.isEmpty() ? "BORRAR SELECCIONADAS" : "BORRAR " + selected.size(), false);
            delete.setEnabled(!selected.isEmpty());
            delete.setTextColor(selected.isEmpty() ? muted : danger);
            delete.setOnClickListener(v -> confirmDelete(new ArrayList<>(selected)));
            Button keepSuggested = button("BORRAR OTRAS", false);
            keepSuggested.setEnabled(suggested != null && versions.size() > 1);
            keepSuggested.setOnClickListener(v -> {
                ArrayList<String> ids = new ArrayList<>();
                for (AtlasVersion x : versions) if (!x.id.equals(suggested.id) && !x.favorite) ids.add(x.id);
                if (ids.isEmpty()) toast("No hay versiones prescindibles"); else confirmDelete(ids);
            });
            delRow.addView(delete, weighted());
            delRow.addView(keepSuggested, weighted());
            root.addView(delRow);
        }

        for (AtlasVersion v : versions) {
            LinearLayout c = cardBox();
            LinearLayout head = hrowTight();
            CheckBox cb = new CheckBox(this);
            cb.setButtonTintList(android.content.res.ColorStateList.valueOf(accent));
            cb.setChecked(selected.contains(v.id));
            cb.setOnCheckedChangeListener((buttonView, isChecked) -> {
                if (isChecked) selected.add(v.id); else selected.remove(v.id);
                if (root != null) root.post(this::renderManager);
            });
            head.addView(cb, new LinearLayout.LayoutParams(dp(48), dp(48)));
            LinearLayout txt = new LinearLayout(this);
            txt.setOrientation(LinearLayout.VERTICAL);
            TextView name = tv((v.favorite ? "★ " : "") + v.displayName(), 18, text, Typeface.BOLD);
            txt.addView(name);
            String badges = "";
            if (suggested != null && suggested.id.equals(v.id)) badges += "SUGERIDA";
            if (v.id.equals(lastId)) badges += (badges.isEmpty() ? "" : " · ") + "ÚLTIMA EJECUTADA";
            if (!badges.isEmpty()) txt.addView(tv(badges, 11, accent, Typeface.BOLD));
            txt.addView(tv(metaLine(v), 12, muted, Typeface.NORMAL));
            head.addView(txt, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
            c.addView(head);

            if (v.notes != null && !v.notes.trim().isEmpty()) {
                TextView notes = tv(v.notes.trim(), 12, muted, Typeface.NORMAL);
                notes.setPadding(dp(4), dp(4), dp(4), 0);
                c.addView(notes);
            }

            LinearLayout row = hrow();
            Button run = button("EJECUTAR", true);
            run.setOnClickListener(x -> launchVersion(v.id));
            Button fav = button(v.favorite ? "★" : "☆", false);
            fav.setOnClickListener(x -> { AtlasStorage.toggleFavorite(this, v.id); renderManager(); });
            Button oneDelete = button("BORRAR", false);
            oneDelete.setTextColor(danger);
            oneDelete.setOnClickListener(x -> confirmDelete(Collections.singletonList(v.id)));
            row.addView(run, weighted());
            row.addView(fav, new LinearLayout.LayoutParams(dp(58), dp(46)));
            row.addView(oneDelete, weighted());
            c.addView(row);
            root.addView(c);
        }

        TextView foot = tv("Atlas QA Manager v3.0.0 · servidor local 127.0.0.1 · sin Termux en ejecución", 11, muted, Typeface.NORMAL);
        foot.setGravity(Gravity.CENTER_HORIZONTAL);
        foot.setPadding(0, dp(18), 0, 0);
        root.addView(foot);
    }

    private void addImportStatus() {
        String state = AtlasStorage.prefs(this).getString("import_state", "");
        if (state == null || state.isEmpty()) return;
        String message = AtlasStorage.prefs(this).getString("import_message", "");
        int progress = AtlasStorage.prefs(this).getInt("import_progress", 0);
        long updated = AtlasStorage.prefs(this).getLong("import_updated_at", 0L);
        if (!"working".equals(state) && System.currentTimeMillis() - updated > 2L * 60L * 1000L) return;
        LinearLayout c = cardBox();
        c.addView(eyebrow("IMPORTACIÓN"));
        c.addView(tv(message == null || message.isEmpty() ? "Preparando…" : message, 14, text, Typeface.BOLD));
        if ("working".equals(state)) {
            ProgressBar p = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
            p.setMax(100); p.setProgress(progress);
            p.setProgressTintList(android.content.res.ColorStateList.valueOf(accent));
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(8));
            lp.setMargins(0, dp(10), 0, 0); c.addView(p, lp);
            c.addView(tv("Puedes dejar Atlas QA en segundo plano. Android te avisará cuando termine.", 12, muted, Typeface.NORMAL));
        }
        root.addView(c);
    }

    private void openImportPicker() {
        Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        i.addCategory(Intent.CATEGORY_OPENABLE);
        i.setType("*/*");
        i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
        i.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"application/zip", "application/x-zip-compressed", "application/octet-stream"});
        startActivityForResult(i, REQ_IMPORT);
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != REQ_IMPORT || resultCode != RESULT_OK || data == null) return;
        ArrayList<Uri> uris = new ArrayList<>();
        if (data.getClipData() != null) {
            for (int i = 0; i < data.getClipData().getItemCount(); i++) uris.add(data.getClipData().getItemAt(i).getUri());
        } else if (data.getData() != null) uris.add(data.getData());
        startImport(uris);
    }

    private void handleIncoming(Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();
        ArrayList<Uri> uris = new ArrayList<>();
        if (Intent.ACTION_VIEW.equals(action) && intent.getData() != null) uris.add(intent.getData());
        if (Intent.ACTION_SEND.equals(action)) {
            Uri u = Build.VERSION.SDK_INT >= 33 ? intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri.class) : intent.getParcelableExtra(Intent.EXTRA_STREAM);
            if (u != null) uris.add(u);
        }
        if (Intent.ACTION_SEND_MULTIPLE.equals(action)) {
            ArrayList<Uri> list = Build.VERSION.SDK_INT >= 33 ? intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM, Uri.class) : intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM);
            if (list != null) uris.addAll(list);
        }
        if (!uris.isEmpty()) startImport(uris);
    }

    private void startImport(List<Uri> uris) {
        if (uris == null || uris.isEmpty()) return;
        ArrayList<String> strings = new ArrayList<>();
        for (Uri u : uris) {
            try { getContentResolver().takePersistableUriPermission(u, Intent.FLAG_GRANT_READ_URI_PERMISSION); } catch (Exception ignored) {}
            strings.add(u.toString());
        }
        Intent s = new Intent(this, ImportService.class).setAction(ImportService.ACTION_IMPORT).putStringArrayListExtra(ImportService.EXTRA_URIS, strings);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) startForegroundService(s); else startService(s);
        toast(strings.size() == 1 ? "Importación iniciada" : strings.size() + " importaciones iniciadas");
        renderManager();
    }

    private void confirmDelete(List<String> ids) {
        if (ids == null || ids.isEmpty()) return;
        new AlertDialog.Builder(this)
                .setTitle(ids.size() == 1 ? "¿Borrar esta versión?" : "¿Borrar " + ids.size() + " versiones?")
                .setMessage("Se eliminarán sus archivos locales. Los ZIP originales no se modifican.")
                .setNegativeButton("Cancelar", null)
                .setPositiveButton("Borrar", (d, w) -> {
                    for (String id : ids) {
                        if (id.equals(activeVersionId)) server.stop();
                        AtlasStorage.delete(this, id);
                        selected.remove(id);
                    }
                    renderManager();
                }).show();
    }

    private void launchVersion(String id) {
        AtlasVersion v = AtlasStorage.find(this, id);
        if (v == null || v.siteDir == null || !new File(v.siteDir, "index.html").isFile()) {
            toast("La build ya no es válida"); renderManager(); return;
        }
        try {
            int port = server.start(v.siteDir);
            activeVersionId = id;
            AtlasStorage.markPlayed(this, id);
            openGameWebView(port, v);
        } catch (Exception e) {
            toast("No pude iniciar Atlas: " + e.getMessage());
        }
    }

    private void openGameWebView(int port, AtlasVersion v) {
        inGame = true;
        webView = new WebView(this);
        webView.setBackgroundColor(Color.BLACK);
        webView.setKeepScreenOn(true);
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        s.setUserAgentString(s.getUserAgentString() + " AtlasQA/3.0.0");
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onConsoleMessage(ConsoleMessage m) {
                appendWebLog(v.displayName() + " | " + m.messageLevel() + " | " + m.sourceId() + ":" + m.lineNumber() + " | " + m.message());
                return false;
            }
        });
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                return blockIfExternal(req.getUrl());
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return blockIfExternal(Uri.parse(url));
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) appendWebLog(v.displayName() + " | MAIN_FRAME_ERROR | " + error);
            }
        });
        setContentView(webView);
        webView.loadUrl("http://127.0.0.1:" + port + "/?atlas_qa=3.0.0&v=" + Uri.encode(v.displayName()));
    }

    private boolean blockIfExternal(Uri uri) {
        if (uri == null) return true;
        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);
        if (scheme.equals("about") || scheme.equals("data") || scheme.equals("blob")) return false;
        String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase(Locale.ROOT);
        if ((scheme.equals("http") || scheme.equals("https")) && (host.equals("127.0.0.1") || host.equals("localhost"))) return false;
        toast("Atlas QA bloqueó navegación externa");
        return true;
    }

    private void appendWebLog(String line) {
        try (FileWriter w = new FileWriter(new File(getFilesDir(), "webview.log"), true)) {
            w.write(new Date() + " " + line + "\n");
        } catch (Exception ignored) {}
    }

    private void requestNotificationsIfNeeded() {
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ_NOTIFICATIONS);
        }
    }

    private void registerImportReceiver() {
        importReceiver = new BroadcastReceiver() {
            @Override public void onReceive(Context context, Intent intent) {
                if (!inGame) renderManager();
            }
        };
        IntentFilter f = new IntentFilter(ImportService.ACTION_DONE);
        if (Build.VERSION.SDK_INT >= 33) registerReceiver(importReceiver, f, Context.RECEIVER_NOT_EXPORTED);
        else registerReceiver(importReceiver, f);
    }

    private LinearLayout cardBox() {
        LinearLayout l = new LinearLayout(this);
        l.setOrientation(LinearLayout.VERTICAL);
        l.setPadding(dp(16), dp(16), dp(16), dp(16));
        GradientDrawable g = new GradientDrawable();
        g.setColor(card); g.setCornerRadius(dp(18)); g.setStroke(dp(1), border);
        l.setBackground(g);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        lp.setMargins(0, dp(7), 0, dp(7));
        l.setLayoutParams(lp);
        return l;
    }

    private LinearLayout hrow() {
        LinearLayout l = new LinearLayout(this); l.setOrientation(LinearLayout.HORIZONTAL); l.setGravity(Gravity.CENTER_VERTICAL);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        lp.setMargins(0, dp(8), 0, dp(4)); l.setLayoutParams(lp); return l;
    }
    private LinearLayout hrowTight() { LinearLayout l = new LinearLayout(this); l.setOrientation(LinearLayout.HORIZONTAL); l.setGravity(Gravity.CENTER_VERTICAL); return l; }
    private LinearLayout.LayoutParams weighted() { LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, dp(46), 1f); p.setMargins(dp(4), 0, dp(4), 0); return p; }

    private TextView eyebrow(String s) { TextView t = tv(s, 11, accent, Typeface.BOLD); t.setLetterSpacing(0.12f); return t; }
    private TextView tv(String s, int sp, int color, int style) { TextView t = new TextView(this); t.setText(s); t.setTextSize(sp); t.setTextColor(color); t.setTypeface(Typeface.DEFAULT, style); t.setLineSpacing(0, 1.08f); return t; }

    private Button button(String label, boolean primary) {
        Button b = new Button(this);
        b.setText(label); b.setTextSize(12); b.setTypeface(Typeface.DEFAULT, Typeface.BOLD); b.setAllCaps(false);
        GradientDrawable g = new GradientDrawable(); g.setCornerRadius(dp(12)); g.setColor(primary ? Color.rgb(204, 235, 216) : Color.rgb(24, 49, 36));
        b.setBackground(g); b.setTextColor(primary ? bg : text); b.setPadding(dp(8), 0, dp(8), 0);
        return b;
    }

    private String metaLine(AtlasVersion v) {
        String date = v.importedAt > 0 ? DateFormat.getDateTimeInstance(DateFormat.SHORT, DateFormat.SHORT).format(new Date(v.importedAt)) : "";
        String src = v.sourceName == null ? "" : v.sourceName;
        if (src.length() > 42) src = src.substring(0, 39) + "…";
        return human(v.sizeBytes) + (date.isEmpty() ? "" : " · " + date) + (src.isEmpty() ? "" : "\n" + src);
    }

    private String human(long n) {
        if (n >= 1024L * 1024L * 1024L) return String.format(Locale.ROOT, "%.2f GB", n / 1073741824.0);
        if (n >= 1024L * 1024L) return String.format(Locale.ROOT, "%.1f MB", n / 1048576.0);
        if (n >= 1024L) return String.format(Locale.ROOT, "%.0f KB", n / 1024.0);
        return n + " B";
    }

    private int dp(int x) { return Math.round(x * getResources().getDisplayMetrics().density); }
    private void toast(String s) { Toast.makeText(this, s, Toast.LENGTH_SHORT).show(); }
}
