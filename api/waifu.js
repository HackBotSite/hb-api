import apikeys from "./apikey.json" assert { type: "json" };

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
  const waifuList = [
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/waifu1.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/waifu2.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/waifu3.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/waifu4.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/waifu5.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/waifu6.jpg" }
  ];

  const randomWaifu = waifuList[Math.floor(Math.random() * waifuList.length)];

  res.status(200).json({
    category: "Anime Waifu",
    data: randomWaifu
  });
}
