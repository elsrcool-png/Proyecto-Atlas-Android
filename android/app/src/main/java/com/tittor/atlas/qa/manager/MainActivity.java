package com.tittor.atlas.qa.manager;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    public static final String ACTION_SHOW_MANAGER = "com.tittor.atlas.qa.manager.SHOW_MANAGER";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AtlasQaPlugin.class);
        super.onCreate(savedInstanceState);
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
}
