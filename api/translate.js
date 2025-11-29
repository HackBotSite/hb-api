import apikeys from "./apikeys.json";

export default function handler(req, res) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

    if (req.method === "OPTIONS") return res.status(200).end();

    const clientKey = req.headers["x-api-key"];
    if (!clientKey || !apikeys[clientKey]) {
      return res.status(401).json({ error: "API key tidak valid" });
    }

    const { text, to } = req.query;
    if (!text || !to) {
      return res.status(400).json({ error: "Parameter text dan to wajib diisi" });
    }

    // sementara dummy response, nanti bisa sambung ke library translate
    res.status(200).json({
      feature: "Translate",
      input: text,
      targetLang: to,
      result: `Hasil terjemahan '${text}' ke bahasa ${to}`
    });
  } catch (err) {
    console.error("Error translate:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
