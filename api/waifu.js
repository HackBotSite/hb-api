export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const waifuList = [
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/waifu1.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/waifu2.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/waifu3.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/waifu4.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/waifu5.jpg" },
    { status: true, result: "https://ik.imagekit.io/wamr3naeq/random%20anime/waifu6.jpg" }
  ];

  const randomWaifu = waifuList[Math.floor(Math.random() * waifuList.length)];

  res.status(200).json({
    category: "Anime Waifu",
    data: randomWaifu
  });
}
