package com.tittor.atlas.qa.manager;

import java.text.Normalizer;
import java.util.Comparator;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class VersionUtil {
    private VersionUtil() {}

    private static final Pattern SEMVER = Pattern.compile("(?i)(?:^|[^0-9])v?(\\d+)[._-](\\d+)(?:[._-](\\d+))?");
    private static final Pattern ALPHA = Pattern.compile("(?i)alpha[._ -]?(\\d+)");
    private static final Pattern BETA = Pattern.compile("(?i)beta[._ -]?(\\d+)");
    private static final Pattern RC = Pattern.compile("(?i)(?:rc|release[._ -]?candidate)[._ -]?(\\d+)");

    public static String inferLabel(String raw) {
        if (raw == null) return "Atlas";
        String name = raw.replaceAll("(?i)\\.zip$", "");
        Matcher s = SEMVER.matcher(name);
        String base = "";
        if (s.find()) {
            base = "v" + s.group(1) + "." + s.group(2) + "." + (s.group(3) == null ? "0" : s.group(3));
        }
        Matcher a = ALPHA.matcher(name);
        Matcher b = BETA.matcher(name);
        Matcher r = RC.matcher(name);
        String stage = "";
        if (r.find()) stage = "RC" + r.group(1);
        else if (b.find()) stage = "Beta" + b.group(1);
        else if (a.find()) stage = "Alpha" + a.group(1);
        if (!base.isEmpty() && !stage.isEmpty()) return base + " " + stage;
        if (!base.isEmpty()) return base;
        if (!stage.isEmpty()) return stage;

        String cleaned = name.replace('_', ' ').replace('-', ' ').replaceAll("(?i)proyecto\\s*atlas", "Atlas").replaceAll("\\s+", " ").trim();
        if (cleaned.length() > 56) cleaned = cleaned.substring(0, 56).trim();
        return cleaned.isEmpty() ? "Atlas" : cleaned;
    }

    private static int[] semantic(String raw) {
        int[] out = new int[]{-1, -1, -1};
        if (raw == null) return out;
        Matcher m = SEMVER.matcher(raw);
        if (m.find()) {
            out[0] = parse(m.group(1));
            out[1] = parse(m.group(2));
            out[2] = m.group(3) == null ? 0 : parse(m.group(3));
        }
        return out;
    }

    private static int[] stage(String raw) {
        if (raw == null) return new int[]{0, 0};
        Matcher m = RC.matcher(raw);
        if (m.find()) return new int[]{3, parse(m.group(1))};
        m = BETA.matcher(raw);
        if (m.find()) return new int[]{2, parse(m.group(1))};
        m = ALPHA.matcher(raw);
        if (m.find()) return new int[]{1, parse(m.group(1))};
        return new int[]{4, 0}; // estable gana a prerelease con el mismo semver
    }

    private static int parse(String s) {
        try { return Integer.parseInt(s); } catch (Exception e) { return 0; }
    }

    public static Comparator<AtlasVersion> newestFirst() {
        return (a, b) -> compare(b, a);
    }

    public static int compare(AtlasVersion a, AtlasVersion b) {
        String ar = a == null ? "" : (a.version + " " + a.label + " " + a.sourceName);
        String br = b == null ? "" : (b.version + " " + b.label + " " + b.sourceName);
        int[] av = semantic(ar), bv = semantic(br);
        for (int i = 0; i < 3; i++) {
            if (av[i] != bv[i]) return Integer.compare(av[i], bv[i]);
        }
        int[] as = stage(ar), bs = stage(br);
        if (as[0] != bs[0]) return Integer.compare(as[0], bs[0]);
        if (as[1] != bs[1]) return Integer.compare(as[1], bs[1]);
        long ai = a == null ? 0 : a.importedAt;
        long bi = b == null ? 0 : b.importedAt;
        return Long.compare(ai, bi);
    }

    public static String safeFileToken(String value) {
        if (value == null) return "atlas";
        String s = Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}+", "");
        s = s.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9._-]+", "-").replaceAll("-+", "-");
        s = s.replaceAll("^[.-]+|[.-]+$", "");
        return s.isEmpty() ? "atlas" : s;
    }
}
