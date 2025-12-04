// api/jadwal-shalat.js
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    // CORS setup
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

    // Load apikeys.json
    let apikeys = {};
    try {
      const filePath = path.join(process.cwd(), "api", "apikeys.json");
      apikeys = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (e) {
      return res.status(500).json({ error: "Config API key tidak ditemukan" });
    }

    // Validasi API key
    const clientKey = req.headers["x-api-key"];
    if (!clientKey || !apikeys[clientKey]) {
      return res.status(401).json({ error: "API key tidak valid" });
    }

    // Ambil parameter city
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const city = urlObj.searchParams.get("city") || "jakarta";

    // Ambil tanggal & hari otomatis
    const now = new Date();
    const hariList = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
    const hari = hariList[now.getDay()];
    const tanggal = now.toISOString().split("T")[0]; // YYYY-MM-DD

    // Fetch jadwal shalat dari Aladhan API (contoh)
    const apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Indonesia&method=20`;
    const resp = await fetch(apiUrl);
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ error: "Jadwal Shalat API error", details: text });
    }
    const data = await resp.json();

    const timings = data.data.timings;

    const detail = {
      subuh: timings.Fajr,
      duha: timings.Sunrise, // biasanya dihitung dari syuruq + 15 menit
      dzuhur: timings.Dhuhr,
      ashar: timings.Asr,
      maghrib: timings.Maghrib,
      isya: timings.Isha
    };

    res.setHeader("Cache-Control", "public, max-age=60");
    return res.status(200).json({
      feature: "Jadwal Shalat",
      tenant: clientKey,
      city,
      hari,
      tanggal,
      result: detail
    });
  } catch (err) {
    console.error("Jadwal Shalat error:", err);
    return res.status(500).json({ error: "Internal Server Error", detail: err.message });
  }
}
