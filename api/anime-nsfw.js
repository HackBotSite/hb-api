export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const nsfwList = [
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/hentai1.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/hentai2.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/hentai3.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/hentai4.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/hentai5.jpg" }
  ];

  const randomNSFW = nsfwList[Math.floor(Math.random() * nsfwList.length)];

  res.status(200).json({
    category: "Anime NSFW",
    data: randomNSFW
  });
}
