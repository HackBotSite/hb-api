import { translate } from "@vitalets/google-translate-api";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const apikeys = require("./apikeys.json");

// Counter request per tenant per hari (demo in-memory)
// Production: simpan di database/Redis/KV store
const usageCounters = {};

export default async function handler(req, res) {
  try {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

    // Validasi API key
    const clientKey = req.headers["x-api-key"];
    const tenant = apikeys[clientKey];
    if (!tenant) return res.status(401).json({ error: "API key tidak valid" });

    const { plan = "basic", quota = 100 } = tenant;

    // Hitung penggunaan quota per hari
    const today = new Date().toISOString().split("T")[0];
    const usageId = `${clientKey}-${today}`;
    usageCounters[usageId] = (usageCounters[usageId] || 0) + 1;

    if (quota !== "unlimited" && usageCounters[usageId] > quota) {
      return res.status(429).json({
        error: "Quota exceeded",
        tenant: clientKey,
        plan,
        quota,
        used: usageCounters[usageId]
      });
    }

    // Ambil query
    const url = new URL(req.url, `http://${req.headers.host}`);
    const text = url.searchParams.get("text");
    const to = url.searchParams.get("to");

    if (!text || !to) {
      return res.status(400).json({ error: "Parameter text dan to wajib diisi" });
    }

    // Translate
    const result = await translate(text, { to });

    return res.status(200).json({
      feature: "Translate",
      tenant: clientKey,
      plan,
      quota,
      used: usageCounters[usageId],
      input: text,
      targetLang: to,
      result: result.text
    });
  } catch (err) {
    console.error("Translate error:", err);
    return res.status(500).json({ error: "Internal Server Error", detail: err.message });
  }
}
