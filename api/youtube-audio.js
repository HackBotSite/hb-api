// api/youtube-audio.js
import fs from "fs";
import path from "path";
import ytdl from "ytdl-core";

export default async function handler(req, res) {
  try {
    // CORS setup
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // Load apikeys.json
    let apikeys = {};
    try {
      const filePath = path.join(process.cwd(), "api", "apikeys.json");
      apikeys = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (e) {
      console.error("Gagal load apikeys.json:", e);
      return res.status(500).json({ error: "Config API key tidak ditemukan" });
    }

    // Validasi API key
    const clientKey = req.headers["x-api-key"];
    if (!clientKey || !apikeys[clientKey]) {
      return res.status(401).json({ error: "API key tidak valid" });
    }

    // Ambil parameter link
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const link = urlObj.searchParams.get("link");
    if (!link || !String(link).trim()) {
      return res.status(400).json({ error: "Parameter ?link wajib diisi" });
    }

    // Ekstrak videoId dari link YouTube
    let videoId = "";
    try {
      const parsed = new URL(link);
      if (parsed.hostname.includes("youtu.be")) {
        videoId = parsed.pathname.replace("/", "");
      } else if (parsed.hostname.includes("youtube.com")) {
        videoId = parsed.searchParams.get("v");
      }
    } catch (e) {
      return res.status(400).json({ error: "Link YouTube tidak valid" });
    }

    if (!videoId) {
      return res.status(400).json({ error: "Tidak bisa ekstrak videoId dari link" });
    }

    // Ambil info video
    const info = await ytdl.getInfo(videoId);

    // Filter hanya format audio
    const audioFormats = ytdl.filterFormats(info.formats, "audioonly");

    const result = {
      title: info.videoDetails.title,
      channelTitle: info.videoDetails.author.name,
      lengthSeconds: info.videoDetails.lengthSeconds,
      thumbnails: info.videoDetails.thumbnails,
      audio: audioFormats.map(f => ({
        mimeType: f.mimeType,
        bitrate: f.bitrate,
        audioQuality: f.audioQuality,
        url: f.url
      }))
    };

    res.setHeader("Cache-Control", "public, max-age=60");
    return res.status(200).json({
      feature: "Youtube Audio",
      tenant: clientKey,
      link,
      videoId,
      result
    });
  } catch (err) {
    console.error("Youtube Audio error:", err);
    return res.status(500).json({ error: "Internal Server Error", detail: err.message });
  }
}
