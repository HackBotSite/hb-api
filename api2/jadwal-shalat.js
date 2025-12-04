import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export async function handler(event, context) {
  try {
    // Load apikeys.json dari folder api
    let apikeys = {};
    try {
      const filePath = path.join(process.cwd(), "api", "apikeys.json");
      apikeys = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (e) {
      console.error("Gagal load apikeys.json:", e);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Config API key tidak ditemukan" })
      };
    }

    // Validasi API key
    const clientKey = event.headers["x-api-key"];
    const clientIp = (event.headers["x-forwarded-for"] || "").split(",")[0].trim();
    const clientOrigin = event.headers["origin"] || event.headers["referer"] || "";
    const originHost = clientOrigin.replace(/^https?:\/\//, "").replace(/\/$/, "");

    if (!clientKey || !apikeys[clientKey]) {
      return { statusCode: 401, body: JSON.stringify({ error: "API key tidak valid" }) };
    }

    const { allowedIps = [], allowedDomains = [] } = apikeys[clientKey];

    if (allowedIps.length > 0 && !allowedIps.includes(clientIp)) {
      return { statusCode: 403, body: JSON.stringify({ error: "IP tidak diizinkan untuk API key ini" }) };
    }

    if (allowedDomains.length > 0 && !allowedDomains.includes(originHost)) {
      return { statusCode: 403, body: JSON.stringify({ error: "Domain tidak diizinkan untuk API key ini" }) };
    }

    // Ambil parameter city (default jakarta)
    const params = new URLSearchParams(event.queryStringParameters);
    const city = params.get("city") || "jakarta";

    // Ambil tanggal & hari otomatis
    const now = new Date();
    const hariList = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
    const hari = hariList[now.getDay()];
    const tanggal = now.toISOString().split("T")[0];

    // Fetch jadwal shalat dari Aladhan API
    const apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Indonesia&method=20`;
    const resp = await fetch(apiUrl);
    if (!resp.ok) {
      const text = await resp.text();
      return {
        statusCode: resp.status,
        body: JSON.stringify({ error: "Jadwal Shalat API error", details: text })
      };
    }
    const data = await resp.json();

    const timings = data.data.timings;
    const detail = {
      subuh: timings.Fajr,
      duha: timings.Sunrise,
      dzuhur: timings.Dhuhr,
      ashar: timings.Asr,
      maghrib: timings.Maghrib,
      isya: timings.Isha
    };

    return {
      statusCode: 200,
      headers: { "Cache-Control": "public, max-age=60" },
      body: JSON.stringify({
        feature: "Jadwal Shalat",
        tenant: clientKey,
        city,
        hari,
        tanggal,
        result: detail
      })
    };
  } catch (err) {
    console.error("Jadwal Shalat error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error", detail: err.message }) };
  }
}
