import fs from "fs";
import path from "path";

// Counter request per apikey per hari (demo in-memory)
// Production: simpan di database/Redis/KV store
const usageCounters = {};

export default function handler(req, res) {
  try {
    // CORS setup
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
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

    const { plan = "basic", quota = 100 } = apikeys[clientKey];

    // Hitung penggunaan quota per hari
    const today = new Date().toISOString().split("T")[0];
    const usageId = `${clientKey}-${today}`;
    usageCounters[usageId] = (usageCounters[usageId] || 0) + 1;

    if (quota !== "unlimited" && usageCounters[usageId] > quota) {
      return res.status(429).json({
        error: "Quota exceeded",
        apikey: clientKey,
        plan,
        quota,
        used: usageCounters[usageId]
      });
    }

    // Data niat shalat
    const niatList = {
      subuh: {
        title: "Niat Shalat Subuh",
        arabic: "أُصَلِّي فَرْضَ الصُّبْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلّٰهِ تَعَالَى",
        latin: "Ushallii fardhas-shubhi rak‘ataini mustaqbilal-qiblati adā’an lillāhi ta‘ālā",
        translation: "Aku niat shalat fardhu Subuh dua rakaat menghadap kiblat karena Allah Ta‘ala."
      },
      dzuhur: {
        title: "Niat Shalat Dzuhur",
        arabic: "أُصَلِّي فَرْضَ الظُّهْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلّٰهِ تَعَالَى",
        latin: "Ushallii fardhaz-zhuhri arba‘a raka‘ātin mustaqbilal-qiblati adā’an lillāhi ta‘ālā",
        translation: "Aku niat shalat fardhu Dzuhur empat rakaat menghadap kiblat karena Allah Ta‘ala."
      },
      ashar: {
        title: "Niat Shalat Ashar",
        arabic: "أُصَلِّي فَرْضَ الْعَصْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلّٰهِ تَعَالَى",
        latin: "Ushallii fardhal-‘ashri arba‘a raka‘ātin mustaqbilal-qiblati adā’an lillāhi ta‘ālā",
        translation: "Aku niat shalat fardhu Ashar empat rakaat menghadap kiblat karena Allah Ta‘ala."
      },
      magrib: {
        title: "Niat Shalat Magrib",
        arabic: "أُصَلِّي فَرْضَ الْمَغْرِبِ ثَلَاثَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلّٰهِ تَعَالَى",
        latin: "Ushallii fardhal-maghribi tsalātsa raka‘ātin mustaqbilal-qiblati adā’an lillāhi ta‘ālā",
        translation: "Aku niat shalat fardhu Magrib tiga rakaat menghadap kiblat karena Allah Ta‘ala."
      },
      isya: {
        title: "Niat Shalat Isya",
        arabic: "أُصَلِّي فَرْضَ الْعِشَاءِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلّٰهِ تَعَالَى",
        latin: "Ushallii fardhal-‘ishā’i arba‘a raka‘ātin mustaqbilal-qiblati adā’an lillāhi ta‘ālā",
        translation: "Aku niat shalat fardhu Isya empat rakaat menghadap kiblat karena Allah Ta‘ala."
      },
      duha: {
        title: "Niat Shalat Duha",
        arabic: "أُصَلِّي سُنَّةَ الضُّحَى رَكْعَتَيْنِ لِلّٰهِ تَعَالَى",
        latin: "Ushallii sunnatadh-dhuhaa rak‘ataini lillāhi ta‘ālā",
        translation: "Aku niat shalat sunnah Duha dua rakaat karena Allah Ta‘ala."
      },
      tahajud: {
        title: "Niat Shalat Tahajud",
        arabic: "أُصَلِّي سُنَّةَ التَهَجُّدِ رَكْعَتَيْنِ لِلّٰهِ تَعَالَى",
        latin: "Ushallii sunnatat-tahajjudi rak‘ataini lillāhi ta‘ālā",
        translation: "Aku niat shalat sunnah Tahajud dua rakaat karena Allah Ta‘ala."
      },
      witir: {
        title: "Niat Shalat Witir",
        arabic: "أُصَلِّي سُنَّةَ الْوِتْرِ رَكْعَةً لِلّٰهِ تَعَالَى",
        latin: "Ushallii sunnatal-witri rak‘atan lillāhi ta‘ālā",
        translation: "Aku niat shalat sunnah Witir satu rakaat karena Allah Ta‘ala."
      },
      hajat: {
        title: "Niat Shalat Hajat",
        arabic: "أُصَلِّي سُنَّةَ الْحَاجَةِ رَكْعَتَيْنِ لِلّٰهِ تَعَالَى",
        latin: "Ushallii sunnatal-haajati rak‘ataini lillāhi ta‘ālā",
        translation: "Aku niat shalat sunnah Hajat dua rakaat karena Allah Ta‘ala."
      },
      istikharah: {
        title: "Niat Shalat Istikharah",
        arabic: "أُصَلِّي سُنَّةَ الاِسْتِخَارَةِ رَكْعَتَيْنِ لِلّٰهِ تَعَالَى",
        latin: "Ushallii sunnatal-istikhārah rak‘ataini lillāhi ta‘ālā",
        translation: "Aku niat shalat sunnah Istikharah dua rakaat karena Allah Ta‘ala."
      },
      taubat: {
        title: "Niat Shalat Taubat",
        arabic: "أُصَلِّي سُنَّةَ التَّوْبَةِ رَكْعَتَيْنِ لِلّٰهِ تَعَالَى",
        latin: "Ushallii sunnatat-taubati rak‘ataini lillāhi ta‘ālā",
        translation: "Aku niat shalat sunnah Taubat dua rakaat karena Allah Ta‘ala."
      }
    };

    // Ambil query parameter (support dua format)
    let shalatName = null;

    if (req.query.shalat) {
      // Format ?shalat=isya
      shalatName = req.query.shalat.toLowerCase();
    } else {
      // Format ?isya
      const queryKeys = Object.keys(req.query);
      if (queryKeys.length > 0) {
        shalatName = queryKeys[0].toLowerCase();
      }
    }

    if (!shalatName) {
      return res.status(400).json({
        error: "Query shalat harus diisi (contoh: ?shalat=isya atau ?isya)"
      });
    }

    const result = niatList[shalatName];
    if (!result) {
      return res.status(404).json({ error: `Niat shalat '${shalatName}' tidak ditemukan` });
    }

    return res.status(200).json({
      category: "Niat Shalat",
      apikey: clientKey,
      plan,
      quota,
      used: usageCounters[usageId],
      name: shalatName,
      data: result
    });
  } catch (err) {
    console.error("Serverless error:", err);
    return res.status(500).json({ error: "Internal Server Error", detail: err.message });
  }
}
