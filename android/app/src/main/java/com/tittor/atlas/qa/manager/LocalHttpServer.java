package com.tittor.atlas.qa.manager;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;

public final class LocalHttpServer {
    private ServerSocket server;
    private ExecutorService pool;
    private Thread acceptThread;
    private File root;
    private int port;
    private volatile boolean running;

    public synchronized int start(File siteRoot) throws IOException {
        stop();
        if (siteRoot == null || !new File(siteRoot, "index.html").isFile()) throw new FileNotFoundException("index.html no encontrado");
        root = siteRoot.getCanonicalFile();
        IOException last = null;
        for (int p = 5173; p <= 5183; p++) {
            try {
                ServerSocket s = new ServerSocket();
                s.setReuseAddress(true);
                s.bind(new InetSocketAddress(InetAddress.getByName("127.0.0.1"), p));
                server = s;
                port = p;
                last = null;
                break;
            } catch (IOException e) {
                last = e;
            }
        }
        if (server == null) throw last == null ? new IOException("No hay puerto local disponible") : last;
        running = true;
        pool = Executors.newCachedThreadPool(r -> {
            Thread t = new Thread(r, "AtlasQA-http-worker");
            t.setDaemon(true);
            return t;
        });
        acceptThread = new Thread(this::acceptLoop, "AtlasQA-http");
        acceptThread.setDaemon(true);
        acceptThread.start();
        return port;
    }

    public synchronized void stop() {
        running = false;
        try { if (server != null) server.close(); } catch (Exception ignored) {}
        server = null;
        if (pool != null) pool.shutdownNow();
        pool = null;
        acceptThread = null;
        root = null;
        port = 0;
    }

    public int getPort() { return port; }

    private void acceptLoop() {
        while (running && server != null) {
            try {
                Socket socket = server.accept();
                socket.setSoTimeout(8000);
                ExecutorService p = pool;
                if (p != null) p.submit(() -> handle(socket)); else socket.close();
            } catch (IOException e) {
                if (running) {
                    try { Thread.sleep(80); } catch (InterruptedException ignored) {}
                }
            }
        }
    }

    private void handle(Socket socket) {
        try (Socket s = socket;
             BufferedInputStream in = new BufferedInputStream(s.getInputStream());
             BufferedOutputStream out = new BufferedOutputStream(s.getOutputStream())) {

            String request = readLine(in);
            if (request == null || request.isEmpty()) return;
            String[] parts = request.split(" ");
            if (parts.length < 2) { sendText(out, 400, "Bad Request"); return; }
            String method = parts[0].toUpperCase(Locale.ROOT);
            if (!method.equals("GET") && !method.equals("HEAD")) { sendText(out, 405, "Method Not Allowed"); return; }
            String target = parts[1];
            Map<String,String> headers = new HashMap<>();
            String line;
            while ((line = readLine(in)) != null && !line.isEmpty()) {
                int k = line.indexOf(':');
                if (k > 0) headers.put(line.substring(0, k).trim().toLowerCase(Locale.ROOT), line.substring(k + 1).trim());
            }

            int q = target.indexOf('?');
            if (q >= 0) target = target.substring(0, q);
            int h = target.indexOf('#');
            if (h >= 0) target = target.substring(0, h);
            target = URLDecoder.decode(target, StandardCharsets.UTF_8.name());
            while (target.startsWith("/")) target = target.substring(1);
            if (target.isEmpty()) target = "index.html";

            File requested = new File(root, target).getCanonicalFile();
            if (!isInsideRoot(requested)) { sendText(out, 403, "Forbidden"); return; }
            if (requested.isDirectory()) requested = new File(requested, "index.html").getCanonicalFile();
            if (!requested.isFile()) {
                if (!target.contains(".")) requested = new File(root, "index.html").getCanonicalFile();
            }
            if (!requested.isFile() || !isInsideRoot(requested)) { sendText(out, 404, "Not Found"); return; }

            long length = requested.length();
            long start = 0L, end = length > 0 ? length - 1 : 0L;
            boolean partial = false;
            String range = headers.get("range");
            if (range != null && range.startsWith("bytes=") && length > 0) {
                try {
                    String spec = range.substring(6).split(",")[0].trim();
                    String[] re = spec.split("-", 2);
                    if (!re[0].isEmpty()) start = Long.parseLong(re[0]);
                    if (re.length > 1 && !re[1].isEmpty()) end = Long.parseLong(re[1]);
                    if (start < 0 || end < start || start >= length) { sendRangeError(out, length); return; }
                    end = Math.min(end, length - 1);
                    partial = true;
                } catch (Exception ignored) {}
            }
            long contentLength = length == 0 ? 0 : end - start + 1;
            String status = partial ? "206 Partial Content" : "200 OK";
            StringBuilder head = new StringBuilder();
            head.append("HTTP/1.1 ").append(status).append("\r\n");
            head.append("Content-Type: ").append(mime(requested.getName())).append("\r\n");
            head.append("Content-Length: ").append(contentLength).append("\r\n");
            head.append("Accept-Ranges: bytes\r\n");
            head.append("Cache-Control: no-cache, no-store, must-revalidate\r\n");
            head.append("Pragma: no-cache\r\n");
            head.append("Access-Control-Allow-Origin: *\r\n");
            head.append("X-Content-Type-Options: nosniff\r\n");
            if (partial) head.append("Content-Range: bytes ").append(start).append('-').append(end).append('/').append(length).append("\r\n");
            head.append("Connection: close\r\n\r\n");
            out.write(head.toString().getBytes(StandardCharsets.US_ASCII));
            if (!method.equals("HEAD") && contentLength > 0) {
                try (RandomAccessFile raf = new RandomAccessFile(requested, "r")) {
                    raf.seek(start);
                    byte[] buf = new byte[64 * 1024];
                    long left = contentLength;
                    while (left > 0) {
                        int n = raf.read(buf, 0, (int)Math.min(buf.length, left));
                        if (n < 0) break;
                        out.write(buf, 0, n);
                        left -= n;
                    }
                }
            }
            out.flush();
        } catch (Exception ignored) {}
    }

    private boolean isInsideRoot(File f) throws IOException {
        String rp = root.getCanonicalPath();
        String fp = f.getCanonicalPath();
        return fp.equals(rp) || fp.startsWith(rp + File.separator);
    }

    private static String readLine(InputStream in) throws IOException {
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        int prev = -1, c;
        while ((c = in.read()) >= 0) {
            if (prev == '\r' && c == '\n') break;
            if (prev >= 0) b.write(prev);
            prev = c;
            if (b.size() > 16384) throw new IOException("Cabecera demasiado grande");
        }
        if (c < 0 && prev < 0 && b.size() == 0) return null;
        if (prev >= 0 && prev != '\r') b.write(prev);
        return b.toString(StandardCharsets.ISO_8859_1.name());
    }

    private static void sendText(OutputStream out, int code, String text) throws IOException {
        byte[] body = text.getBytes(StandardCharsets.UTF_8);
        String h = "HTTP/1.1 " + code + " " + text + "\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: " + body.length + "\r\nConnection: close\r\n\r\n";
        out.write(h.getBytes(StandardCharsets.US_ASCII));
        out.write(body);
        out.flush();
    }

    private static void sendRangeError(OutputStream out, long length) throws IOException {
        String h = "HTTP/1.1 416 Range Not Satisfiable\r\nContent-Range: bytes */" + length + "\r\nContent-Length: 0\r\nConnection: close\r\n\r\n";
        out.write(h.getBytes(StandardCharsets.US_ASCII));
        out.flush();
    }

    private static String mime(String name) {
        String n = name.toLowerCase(Locale.ROOT);
        if (n.endsWith(".html") || n.endsWith(".htm")) return "text/html; charset=utf-8";
        if (n.endsWith(".js") || n.endsWith(".mjs")) return "text/javascript; charset=utf-8";
        if (n.endsWith(".css")) return "text/css; charset=utf-8";
        if (n.endsWith(".json") || n.endsWith(".gltf")) return "application/json; charset=utf-8";
        if (n.endsWith(".wasm")) return "application/wasm";
        if (n.endsWith(".png")) return "image/png";
        if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
        if (n.endsWith(".webp")) return "image/webp";
        if (n.endsWith(".gif")) return "image/gif";
        if (n.endsWith(".svg")) return "image/svg+xml";
        if (n.endsWith(".ico")) return "image/x-icon";
        if (n.endsWith(".glb")) return "model/gltf-binary";
        if (n.endsWith(".bin")) return "application/octet-stream";
        if (n.endsWith(".ktx2")) return "image/ktx2";
        if (n.endsWith(".mp3")) return "audio/mpeg";
        if (n.endsWith(".ogg")) return "audio/ogg";
        if (n.endsWith(".wav")) return "audio/wav";
        if (n.endsWith(".mp4")) return "video/mp4";
        if (n.endsWith(".webm")) return "video/webm";
        if (n.endsWith(".woff")) return "font/woff";
        if (n.endsWith(".woff2")) return "font/woff2";
        if (n.endsWith(".ttf")) return "font/ttf";
        if (n.endsWith(".otf")) return "font/otf";
        if (n.endsWith(".xml")) return "application/xml";
        if (n.endsWith(".txt")) return "text/plain; charset=utf-8";
        return "application/octet-stream";
    }
}
