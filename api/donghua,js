export default function handler(req, res) {
  // Tambahkan header CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Data donghua
  const donghuaList = [
    { status: true, result: "https://i.pinimg.com/736x/79/59/0c/79590c58908e5852dc130074e36f0384.jpg" },
    { status: true, result: "https://i.pinimg.com/1200x/e8/79/58/e879582d72e6d8a2e029bf5f8307d1fa.jpg" },
    { status: true, result: "https://i.pinimg.com/736x/a4/c2/16/a4c21667d48df99f83e0ebdf7d65cc9e.jpg" },
    { status: true, result: "https://i.pinimg.com/1200x/30/9d/35/309d356faa2a8f06f6ff9d396ea240d3.jpg" },
    { status: true, result: "https://i.pinimg.com/1200x/02/d8/06/02d8062a24fd17295822fe850b7b8966.jpg" }
  ];

  // Ambil donghua random
  const randomDonghua = donghuaList[Math.floor(Math.random() * donghuaList.length)];

  // Response JSON
  res.status(200).json({
    category: "Donghua Random",
    data: randomDonghua
  });
}
