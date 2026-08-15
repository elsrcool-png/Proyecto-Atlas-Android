package com.tittor.atlas.qa.manager;

import java.io.File;

public final class AtlasVersion {
    public String id = "";
    public String version = "";
    public String label = "";
    public String channel = "";
    public String sourceName = "";
    public String hash = "";
    public String notes = "";
    public long importedAt = 0L;
    public long lastPlayedAt = 0L;
    public long sizeBytes = 0L;
    public boolean favorite = false;
    public boolean valid = true;
    public File rootDir;
    public File siteDir;

    public String displayName() {
        if (label != null && !label.trim().isEmpty()) return label.trim();
        if (version != null && !version.trim().isEmpty()) return version.trim();
        return sourceName == null || sourceName.trim().isEmpty() ? "Atlas" : sourceName.trim();
    }
}
