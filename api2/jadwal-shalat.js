// netlify/functions/jadwal-shalat.js
import fetch from "node-fetch";

export async function handler(event, context) {
  try {
    const apiKey = event.headers["x-api-key"];
    if (!apiKey) {
      return { statusCode: 401, body: JSON.stringify({ error: "API key tidak valid" }) };
    }

    const city = "jakarta"; // fixed
    const now = new Date();
    const hariList = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
    const hari = hariList[now.getDay()];
    const tanggal = now.toISOString().split("T")[0];

    const apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Indonesia&method=20`;
    const resp = await fetch(apiUrl);
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
        tenant: apiKey,
        city,
        hari,
        tanggal,
        result: detail
      })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error", detail: err.message }) };
  }
}
