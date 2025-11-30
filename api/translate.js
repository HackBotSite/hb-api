import translate from "@vitalets/google-translate-api";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const apikeys = require("./apikeys.json");

export default async function handler(req, res) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

    if (req.method === "OPTIONS") return res.status(200).end();

    const clientKey = req.headers["x-api-key"];
    const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim();
    const clientOrigin = req.headers.origin || "";

    const tenant = apikeys[clientKey];
    if (!tenant) return res.status(401).json({ error: "API key tidak valid" });

    if (tenant.allowedIps && !tenant.allowedIps.includes(clientIp)) {
      return res.status(403).json({ error: "IP tidak diizinkan", ip: clientIp });
    }

    if (tenant.allowedDomains && !tenant.allowedDomains.includes(clientOrigin)) {
      return res.status(403).json({ error: "Domain tidak diizinkan", origin: clientOrigin });
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const text = url.searchParams.get("text");
    const to = url.searchParams.get("to");

    if (!text || !to) {
      return res.status(400).json({ error: "Parameter text dan to wajib diisi" });
    }

    const result = await translate(text, { to });

    res.status(200).json({
      feature: "Translate",
      tenant: clientKey,
      input: text,
      targetLang: to,
      result: result.text
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", detail: err.message });
  }
}
