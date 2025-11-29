import fs from "fs";cc

const apikeys = JSON.parse(
  fs.readFileSync(new URL("./apikey.json", import.meta.url))
);

export default function handler(req, res) {
  // Tambahkan header CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Ambil API key & info client
  const clientKey = req.headers["x-api-key"];
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const clientOrigin = req.headers["origin"] || req.headers["referer"];

  // Validasi API key
  if (!clientKey || !apikeys[clientKey]) {
    return res.status(401).json({ error: "API key tidak valid" });
  }

  // Ambil aturan dari apikey.json
  const { allowedIps = [], allowedDomains = [] } = apikeys[clientKey];

  // Validasi IP
  if (allowedIps.length > 0 && !allowedIps.includes(clientIp)) {
    return res.status(403).json({ error: "IP tidak diizinkan untuk API key ini" });
  }

  // Validasi Domain
  if (allowedDomains.length > 0 && !allowedDomains.includes(clientOrigin)) {
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
}
