import fs from "fs";
import path from "path";

export default function handler(req, res) {
  try {
    // CORS setup
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // Load apikeys.json dengan path absolut
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
      return res.status(403).json({ error: "IP tidak diizinkan untuk API key ini" });
    }

    if (allowedDomains.length > 0 && !allowedDomains.includes(originHost)) {
      return res.status(403).json({ error: "Domain tidak diizinkan untuk API key ini" });
    }

    const animeList = [
      { status: true, result: "https://img.freepik.com/free-photo/anime-style-mythical-dragon-creature_23-2151112778.jpg" },
      { status: true, result: "https://cdn.kibrispdr.org/data/872/wallpaper-anime-hd-android-xiaomi-3.jpg" },
      { status: true, result: "https://images.alphacoders.com/605/thumb-1920-605592.png" },
      { status: true, result: "https://www.baltana.com/files/wallpapers-31/Anime-Kaneki-HD-Wallpaper-105687.jpg" },
      { status: true, result: "https://4kwallpapers.com/images/walls/thumbs_3t/18690.jpg" }
    ];

    const randomAnime = animeList[Math.floor(Math.random() * animeList.length)];

    res.status(200).json({
      category: "Anime Random",
      data: randomAnime
    });
  } catch (err) {
    console.error("Serverless error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
