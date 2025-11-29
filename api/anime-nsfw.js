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

  const { allowedIps = [], allowedDomains = [] } = apikeys[clientKey];

  // Validasi IP
  if (allowedIps.length > 0 && !allowedIps.includes(clientIp)) {
    return res.status(403).json({ error: "IP tidak diizinkan untuk API key ini" });
  }

  // Validasi Domain
  if (allowedDomains.length > 0 && !allowedDomains.includes(clientOrigin)) {
    return res.status(403).json({ error: "Domain tidak diizinkan untuk API key ini" });
  }

  const nsfwList = [
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/hentai1.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/hentai2.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/hentai3.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/hentai4.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/hentai5.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/nsfw1.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/nsfw2.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/nsfw3.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/nsfw4.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/nsfw5.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/nsfw6.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/nsfw7.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/nsfw8.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/nsfw9.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/nsfw10.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/nsfw11.jpg" }
  ];

  const randomNSFW = nsfwList[Math.floor(Math.random() * nsfwList.length)];

  res.status(200).json({
    category: "Anime NSFW",
    data: randomNSFW
  });
}
