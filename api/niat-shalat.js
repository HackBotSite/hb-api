import apikeys from "./apikeys.json";

export default function handler(req, res) {
  try {
    // Header CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // Ambil API key & info client
    const clientKey = req.headers["x-api-key"];
    const clientIp = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";
    const clientOrigin = req.headers["origin"] || req.headers["referer"] || "";

    // Validasi API key
    if (!clientKey || !apikeys[clientKey]) {
      return res.status(401).json({ error: "API key tidak valid" });
    }

    const { allowedIps = [], allowedDomains = [] } = apikeys[clientKey];

    if (allowedIps.length > 0 && !allowedIps.includes(clientIp)) {
      return res.status(403).json({ error: "IP tidak diizinkan untuk API key ini" });
    }

    if (allowedDomains.length > 0 && !allowedDomains.includes(clientOrigin)) {
      return res.status(403).json({ error: "Domain tidak diizinkan untuk API key ini" });
    }

    // Data niat shalat
    const niatShalat = {
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

    // Ambil query (misalnya ?dzuhur)
    const queryKeys = Object.keys(req.query);
    if (queryKeys.length === 0) {
      return res.status(400).json({ error: "Query shalat harus diisi (dzuhur, ashar, magrib, isya, subuh)" });
    }

    const shalatName = queryKeys[0];
    const result = niatShalat[shalatName];

    if (!result) {
      return res.status(404).json({ error: `Niat shalat '${shalatName}' tidak ditemukan` });
    }

    res.status(200).json({
      category: "Niat Shalat",
      name: shalatName,
      data: result
    });
  } catch (err) {
    console.error("Serverless error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
