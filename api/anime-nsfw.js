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
  } catch (err) {
    console.error("Serverless error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
