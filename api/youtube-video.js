// api/youtube-video.js
import fs from "fs";
import path from "path";
import fetch from "node-fetch"; // kalau Node 18+, bisa hapus import ini

// Counter request per tenant per hari (demo in-memory)
// Production: simpan di database/Redis/KV store
const usageCounters = {};

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

    // --- Validasi API key ---
    const clientKey = req.headers["x-api-key"];
    if (!clientKey || !apikeys[clientKey]) {
      return res.status(401).json({ error: "API key tidak valid" });
    }

    const { plan = "basic", quota = 100 } = apikeys[clientKey];

    // Hitung penggunaan quota per hari
    const today = new Date().toISOString().split("T")[0];
    const usageId = `${clientKey}-${today}`;
    usageCounters[usageId] = (usageCounters[usageId] || 0) + 1;

    if (quota !== "unlimited" && usageCounters[usageId] > quota) {
      return res.status(429).json({
        error: "Quota exceeded",
        tenant: clientKey,
        plan,
        quota,
        used: usageCounters[usageId]
      });
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
    } catch (e) {
      return res.status(400).json({ error: "Link YouTube tidak valid" });
    }

    if (!videoId) {
      return res.status(400).json({ error: "Tidak bisa ekstrak videoId dari link" });
    }

    // --- API key YouTube Data API ---
    const YOUTUBE_API_KEY = "IzaSyABJ2vP5K61m1xx9V27U4vXp0d3dSkselc"; // ganti dengan API key YouTube Data API v3

    const params = new URLSearchParams({
      key: YOUTUBE_API_KEY,
      part: "snippet,contentDetails,statistics",
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
    if (!item) {
      return res.status(404).json({ error: "Video tidak ditemukan" });
    }

    const detail = {
      title: item.snippet?.title,
      description: item.snippet?.description,
      channelTitle: item.snippet?.channelTitle,
      publishedAt: item.snippet?.publishedAt,
      thumbnails: item.snippet?.thumbnails,
      duration: item.contentDetails?.duration,
      viewCount: item.statistics?.viewCount,
      likeCount: item.statistics?.likeCount,
      commentCount: item.statistics?.commentCount,
      url: `https://www.youtube.com/watch?v=${videoId}`
    };

    res.setHeader("Cache-Control", "public, max-age=60");
    return res.status(200).json({
      feature: "Youtube Video",
      tenant: clientKey,
      plan,
      quota,
      used: usageCounters[usageId],
      link,
      videoId,
      result: detail
    });
  } catch (err) {
    console.error("Youtube Video error:", err);
    return res.status(500).json({ error: "Internal Server Error", detail: err.message });
  }
}
