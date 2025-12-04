// api/youtube-audio.js
import fs from "fs";
import path from "path";
import fetch from "node-fetch"; // kalau Node 18+, bisa hapus import ini

export default async function handler(req, res) {
  try {
    // --- CORS setup ---
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

    // --- Load apikeys.json ---
    let apikeys = {};
    try {
      const filePath = path.join(process.cwd(), "api", "apikeys.json");
      apikeys = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (e) {
      console.error("Gagal load apikeys.json:", e);
      return res.status(500).json({ error: "Config API key tidak ditemukan" });
    }

    // --- Validasi API key + domain/IP ---
    const clientKey = req.headers["x-api-key"];
    const clientIp = (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "")
      .replace(/^::ffff:/, "")
      .split(",")[0].trim();
    const clientOrigin = req.headers["origin"] || req.headers["referer"] || "";
    const originHost = clientOrigin.replace(/^https?:\/\//, "").replace(/\/$/, "");

    if (!clientKey || !apikeys[clientKey]) {
      return res.status(401).json({ error: "API key tidak valid" });
    }

    const { allowedIps = [], allowedDomains = [] } = apikeys[clientKey];
    if (allowedIps.length > 0 && !allowedIps.includes(clientIp)) {
      return res.status(403).json({ error: "IP tidak diizinkan untuk API key ini", ip: clientIp });
    }
    if (allowedDomains.length > 0 && !allowedDomains.includes(originHost)) {
      return res.status(403).json({ error: "Domain tidak diizinkan untuk API key ini", origin: originHost });
    }

    // --- Ambil parameter link ---
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const link = urlObj.searchParams.get("link");
    if (!link || !String(link).trim()) {
      return res.status(400).json({ error: "Parameter ?link wajib diisi" });
    }

    // --- Ekstrak videoId dari link YouTube ---
    let videoId = "";
    try {
      const parsed = new URL(link);
      if (parsed.hostname.includes("youtu.be")) {
        videoId = parsed.pathname.replace("/", "");
      } else if (parsed.hostname.includes("youtube.com")) {
        videoId = parsed.searchParams.get("v");
      }
    } catch {
      return res.status(400).json({ error: "Link YouTube tidak valid" });
    }
    if (!videoId) return res.status(400).json({ error: "Tidak bisa ekstrak videoId dari link" });

    // --- Ambil metadata dari YouTube Data API ---
    const YOUTUBE_API_KEY = "AIzaSyABJ2vP5K61m1xx9V27U4vXp0d3dSkselc"; // ganti dengan API key YouTube Data API v3
    const params = new URLSearchParams({
      key: YOUTUBE_API_KEY,
      part: "snippet,contentDetails",
      id: videoId
    });

    const ytUrl = `https://www.googleapis.com/youtube/v3/videos?${params.toString()}`;
    const resp = await fetch(ytUrl);
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ error: "YouTube API error", details: text });
    }
    const data = await resp.json();
    const item = (data.items || [])[0];
    if (!item) return res.status(404).json({ error: "Video tidak ditemukan" });

    // --- Susun detail response ---
    const detail = {
      title: item.snippet?.title,
      channelTitle: item.snippet?.channelTitle,
      publishedAt: item.snippet?.publishedAt,
      thumbnails: item.snippet?.thumbnails,
      duration: item.contentDetails?.duration,
      // URL resmi video YouTube (bisa diputar/embed, bukan direct audio download)
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`
    };

    res.setHeader("Cache-Control", "public, max-age=60");
    return res.status(200).json({
      feature: "Youtube Audio",
      tenant: clientKey,
      link,
      videoId,
      result: detail
    });
  } catch (err) {
    console.error("Youtube Audio error:", err);
    return res.status(500).json({ error: "Internal Server Error", detail: err.message });
  }
}
