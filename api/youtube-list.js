// api/youtube-list.js
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

    // --- Ambil query pencarian ---
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const query = urlObj.searchParams.get("query");
    if (!query || !String(query).trim()) {
      return res.status(400).json({ error: "Parameter ?query wajib diisi" });
    }

    // --- API key YouTube Data API ---
    const YOUTUBE_API_KEY = "IzaSyABJ2vP5K61m1xx9V27U4vXp0d3dSkselc"; // ganti dengan API key YouTube Data API v3

    const params = new URLSearchParams({
      key: YOUTUBE_API_KEY,
      part: "snippet",
      type: "video",
      maxResults: "5",
      q: query,
      regionCode: "ID"
    });

    const ytUrl = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
    const resp = await fetch(ytUrl);
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ error: "YouTube API error", details: text });
    }
    const data = await resp.json();

    const list = (data.items || []).map(item => ({
      title: item.snippet?.title,
      channelTitle: item.snippet?.channelTitle,
      publishedAt: item.snippet?.publishedAt,
      videoId: item.id?.videoId,
      url: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
      thumbnails: item.snippet?.thumbnails
    }));

    res.setHeader("Cache-Control", "public, max-age=60");
    return res.status(200).json({
      feature: "Youtube List",
      tenant: clientKey,
      plan,
      quota,
      used: usageCounters[usageId],
      query,
      total: list.length,
      results: list
    });
  } catch (err) {
    console.error("Youtube List error:", err);
    return res.status(500).json({ error: "Internal Server Error", detail: err.message });
  }
}
