// api/youtube-list.js
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const apikeys = require("./apikeys.json");

export default async function handler(req, res) {
  try {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

    // Validasi API key tenant
    const clientKey = req.headers["x-api-key"];
    const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim();
    const clientOrigin = req.headers.origin || "";

    const tenant = apikeys[clientKey];
    if (!tenant) return res.status(401).json({ error: "API key tidak valid" });

    if (tenant.allowedIps?.length && !tenant.allowedIps.includes(clientIp)) {
      return res.status(403).json({ error: "IP tidak diizinkan", ip: clientIp });
    }

    const originHost = clientOrigin.replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (tenant.allowedDomains?.length && !tenant.allowedDomains.includes(originHost)) {
      return res.status(403).json({ error: "Domain tidak diizinkan", origin: originHost });
    }

    // Ambil query pencarian
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const query = urlObj.searchParams.get("query");
    if (!query || !String(query).trim()) {
      return res.status(400).json({ error: "Parameter ?query wajib diisi" });
    }

    // API key YouTube ditanam langsung
    const YOUTUBE_API_KEY = "AIzaSyABJ2vP5K61m1xx9V27U4vXp0d3dSkselc";

    const params = new URLSearchParams({
      key: YOUTUBE_API_KEY,
      part: "snippet",
      type: "video",
      maxResults: "10",
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

    const list = (data.items || [])
      .filter(item => item.id?.videoId)
      .map(item => {
        const vid = item.id.videoId;
        const sn = item.snippet || {};
        return {
          title: sn.title || "",
          channelTitle: sn.channelTitle || "",
          publishedAt: sn.publishedAt || "",
          videoId: vid,
          url: `https://www.youtube.com/watch?v=${vid}`,
          thumbnails: {
            default: sn.thumbnails?.default?.url || null,
            medium: sn.thumbnails?.medium?.url || null,
            high: sn.thumbnails?.high?.url || null,
          },
        };
      });

    res.setHeader("Cache-Control", "public, max-age=60");
    return res.status(200).json({
      feature: "Youtube List",
      tenant: clientKey,
      query,
      total: list.length,
      results: list,
    });
  } catch (err) {
    console.error("Youtube List error:", err);
    return res.status(500).json({ error: "Internal Server Error", detail: err.message });
  }
}
