import fs from "fs";
import path from "path";

// Counter request per tenant per hari (demo in-memory)
// Production: simpan di database/Redis/KV store
const usageCounters = {};

export default function handler(req, res) {
  try {
    // CORS setup
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // Load apikeys.json
    let apikeys = {};
    try {
      const filePath = path.join(process.cwd(), "api", "apikeys.json");
      apikeys = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (e) {
      console.error("Gagal load apikeys.json:", e);
      return res.status(500).json({ error: "Config API key tidak ditemukan" });
    }

    // Validasi API key
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

    // Data Anime (contoh statis)
    const animeList = [
      { status: true, result: "https://img.freepik.com/free-photo/anime-style-mythical-dragon-creature_23-2151112778.jpg" },
      { status: true, result: "https://cdn.kibrispdr.org/data/872/wallpaper-anime-hd-android-xiaomi-3.jpg" },
      { status: true, result: "https://images.alphacoders.com/605/thumb-1920-605592.png" },
      { status: true, result: "https://www.baltana.com/files/wallpapers-31/Anime-Kaneki-HD-Wallpaper-105687.jpg" },
      { status: true, result: "https://4kwallpapers.com/images/walls/thumbs_3t/18690.jpg" }
    ];

    const randomAnime = animeList[Math.floor(Math.random() * animeList.length)];

    return res.status(200).json({
      category: "Anime Random",
      tenant: clientKey,
      plan,
      quota,
      used: usageCounters[usageId],
      data: randomAnime
    });
  } catch (err) {
    console.error("Serverless error:", err);
    return res.status(500).json({ error: "Internal Server Error", detail: err.message });
  }
}
