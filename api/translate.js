import apikeys from "./apikeys.json";
import translate from "@vitalets/google-translate-api";

export default async function handler(req, res) {
  try {
    // Header CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

    if (req.method === "OPTIONS") return res.status(200).end();

    // Validasi API key
    const clientKey = req.headers["x-api-key"];
    if (!clientKey || !apikeys[clientKey]) {
      return res.status(401).json({ error: "API key tidak valid" });
    }

    // Ambil query
    const { text, to } = req.query;
    if (!text || !to) {
      return res.status(400).json({ error: "Parameter text dan to wajib diisi" });
    }

    // Translate pakai library
    const result = await translate(text, { to });

    res.status(200).json({
      feature: "Translate",
      input: text,
      targetLang: to,
      result: result.text
    });
  } catch (err) {
    console.error("Translate error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
