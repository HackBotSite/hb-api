export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const animeList = [
    { status: true, result: "https://img.freepik.com/free-photo/anime-style-mythical-dragon-creature_23-2151112778.jpg" },
    { status: true, result: "https://cdn.kibrispdr.org/data/872/wallpaper-anime-hd-android-xiaomi-3.jpg" },
    { status: true, result: "https://images.alphacoders.com/605/thumb-1920-605592.png" },
    { status: true, result: "https://www.baltana.com/files/wallpapers-31/Anime-Kaneki-HD-Wallpaper-105687.jpg" },
    { status: true, result: "https://4kwallpapers.com/images/walls/thumbs_3t/18690.jpg" }
  ];

  const randomAnime = animeList[Math.floor(Math.random() * animeList.length)];

  res.status(200).json({
    category: "Anime Random",
    data: randomAnime
  });
}
