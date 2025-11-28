export default function handler(req, res) {
  // Ambil API key dari header
  const apiKey = req.headers['x-api-key'];

  // Validasi API key
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: API key invalid"
    });
  }

  // Kalau valid → kirim data
  res.status(200).json({
    category: "Islami",
    endpoints: [
      { name: "Doa Harian", url: "/api/doa" },
      { name: "Jadwal Sholat", url: "/api/sholat" },
      { name: "Al-Quran", url: "/api/quran" }
    ]
  });
}
