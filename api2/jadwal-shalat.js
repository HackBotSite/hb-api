import fs from "fs";
import path from "path";
import fetch from "node-fetch";

// Simpan counter request sementara di memory (untuk demo)
// Production: pakai database / Redis / KV store
const usageCounters = {};

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
    if (!clientKey || !apikeys[clientKey]) {
      return { statusCode: 401, body: JSON.stringify({ error: "API key tidak valid" }) };
    }

    const { plan = "basic", quota = 100 } = apikeys[clientKey];

    // Hitung penggunaan quota (demo: in-memory counter)
    const today = new Date().toISOString().split("T")[0];
    const keyUsageId = `${clientKey}-${today}`;
    usageCounters[keyUsageId] = (usageCounters[keyUsageId] || 0) + 1;

    if (quota !== "unlimited" && usageCounters[keyUsageId] > quota) {
      return {
        statusCode: 429,
        body: JSON.stringify({
          error: "Quota exceeded",
          tenant: clientKey,
          plan,
          quota,
          used: usageCounters[keyUsageId]
        })
      };
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
        plan,
        quota,
        used: usageCounters[keyUsageId],
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
