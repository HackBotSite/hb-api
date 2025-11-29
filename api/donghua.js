import fs from "fs";

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

  // Data donghua
  const donghuaList = [
    { status: true, result: "https://i.pinimg.com/736x/79/59/0c/79590c58908e5852dc130074e36f0384.jpg" },
    { status: true, result: "https://i.pinimg.com/1200x/e8/79/58/e879582d72e6d8a2e029bf5f8307d1fa.jpg" },
    { status: true, result: "https://i.pinimg.com/736x/a4/c2/16/a4c21667d48df99f83e0ebdf7d65cc9e.jpg" },
    { status: true, result: "https://i.pinimg.com/1200x/30/9d/35/309d356faa2a8f06f6ff9d396ea240d3.jpg" },
    { status: true, result: "https://i.pinimg.com/1200x/02/d8/06/02d8062a24fd17295822fe850b7b8966.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/donghua/donghua1.png" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/donghua/donghua2.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/donghua/donghua3.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/donghua/donghua4.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/donghua/donghua5.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/donghua/donghua6.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/donghua/donghua7.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/donghua/donghua8.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/donghua/donghua9.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/donghua/donghua10.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/donghua/donghua11.png" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/donghua/donghua12.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/donghua/donghua13.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/donghua/donghua14.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/donghua/donghua15.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/donghua/donghua16.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/donghua/donghua17.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/donghua/donghua18.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/donghua/donghua19.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/donghua/donghua20.jpg" }
  ];

  // Ambil donghua random
  const randomDonghua = donghuaList[Math.floor(Math.random() * donghuaList.length)];

  // Response JSON
  res.status(200).json({
    category: "Donghua Random",
    data: randomDonghua
  });
}
