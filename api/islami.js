export default function handler(req, res) {
  res.status(200).json({
    category: "Islami",
    endpoints: [
      { name: "Doa Harian", url: "/api/islami/doa" },
      { name: "Jadwal Sholat", url: "/api/islami/sholat" },
      { name: "Al-Quran", url: "/api/islami/quran" }
    ]
  });
}
