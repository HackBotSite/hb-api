import translate from "@vitalets/google-translate-api";
import apikeys from "./apikeys.json";

export default async function handler(req, res) {
  try {
    // Setup CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

    if (req.method === "OPTIONS") return res.status(200).end();

    // Ambil API key dari header
    const clientKey = req.headers["x-api-key"];
    const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim();
    const clientOrigin = req.headers.origin;

    // Validasi API key
    const tenant = apikeys[clientKey];
    if (!tenant) {
      return res.status(401).json({ error: "API key tidak valid" });
    }

    // Validasi IP
    if (tenant.allowedIps && !tenant.allowedIps.includes(clientIp)) {
      return res.status(403).json({ error: "IP tidak diizinkan", ip: clientIp });
    }

    // Validasi domain asal
    if (tenant.allowedDomains && !tenant.allowedDomains.includes(clientOrigin)) {
      return res.status(403).json({ error: "Domain tidak diizinkan", origin: clientOrigin });
    }

    // Ambil parameter query
    const { text, to } = req.query;
    if (!text || !to) {
      return res.status(400).json({ error: "Parameter text dan to wajib diisi" });
    }

    // Translate pakai @vitalets/google-translate-api
    const result = await translate(text, { to });

    // Response sukses
    res.status(200).json({
      feature: "Translate",
      tenant: clientKey,
      input: text,
      targetLang: to,
      result: result.text
    });
  } catch (err) {
    console.error("Translate error:", err);
    res.status(500).json({ error: "Internal Server Error", detail: err.message });
  }
}
