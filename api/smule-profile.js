// api/smule-profile.js
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

    // --- Ambil parameter handle ---
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const handle = urlObj.searchParams.get("handle");
    if (!handle || !String(handle).trim()) {
      return res.status(400).json({ error: "Parameter ?handle wajib diisi" });
    }

    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept": "application/json"
    };

    // --- Ambil data profil ---
    const profileRes = await fetch(`https://www.smule.com/api/profile?handle=${handle}`, { headers });
    if (!profileRes.ok) {
      const text = await profileRes.text();
      return res.status(profileRes.status).json({ error: "Smule API error (profile)", details: text });
    }
    const profileData = await profileRes.json();
    if (!profileData.handle) {
      return res.status(404).json({ error: "Akun Smule tidak ditemukan" });
    }

    // --- Ambil 3 rekaman terbaru ---
    const perfRes = await fetch(`https://www.smule.com/${handle}/performances/json?offset=0`, { headers });
    if (!perfRes.ok) {
      const text = await perfRes.text();
      return res.status(perfRes.status).json({ error: "Smule API error (performances)", details: text });
    }
    const perfData = await perfRes.json();
    const performances = (perfData.list || []).slice(0, 3);

    // --- Bangun response gabungan profil + recordings ---
    const detail = {
      avatar: profileData.pic_url || "",
      username: profileData.handle || "-",
      fullname: `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim(),
      location: profileData.location || "-",
      followers: profileData.followers || 0,
      following: profileData.followees || 0,
      recording_count: profileData.num_performances || 0,
      bio: profileData.blurb || "",
      recordings: performances.map(p => ({
        title: p.title,
        key: p.key,
        type: p.type,
        created_at: p.created_at,
        cover_url: p.cover_url,
        web_url: p.web_url
      }))
    };

    res.setHeader("Cache-Control", "public, max-age=60");
    return res.status(200).json({
      feature: "Smule Profile",
      tenant: clientKey,
      handle,
      result: detail
    });
  } catch (err) {
    console.error("Smule Profile error:", err);
    return res.status(500).json({ error: "Internal Server Error", detail: err.message });
  }
}
