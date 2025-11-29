import apikeys from "./apikey.json" with { type: "json" };

export default function handler(req, res) {
  try {
    // Tambahkan header CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

    // Handle preflight request
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // Ambil API key & info client
    const clientKey = req.headers["x-api-key"];
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const clientOrigin = req.headers["origin"] || req.headers["referer"];

    // Validasi API key
    if (!clientKey || !apikeys[clientKey]) {
      return res.status(401).json({ error: "API key tidak valid" });
    }

    // Ambil aturan dari apikey.json
    const { allowedIps = [], allowedDomains = [] } = apikeys[clientKey];

    // Validasi IP
    if (allowedIps.length > 0 && !allowedIps.includes(clientIp)) {
      return res.status(403).json({ error: "IP tidak diizinkan untuk API key ini" });
    }

    // Validasi Domain
    if (allowedDomains.length > 0 && !allowedDomains.includes(clientOrigin)) {
      return res.status(403).json({ error: "Domain tidak diizinkan untuk API key ini" });
    }

    // Data doa
    const doaList = [
      {
        title: "Doa Sebelum Makan",
        arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ",
        latin: "Allahumma barik lana fima razaqtana waqina ‘adzaban-nar",
        translation: "Ya Allah, berkahilah rezeki yang Engkau berikan kepada kami dan lindungilah kami dari siksa api neraka."
      },
      {
        title: "Doa Sesudah Makan",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
        latin: "Alhamdulillahil ladzi ath’amana wa saqana wa ja‘alana muslimin",
        translation: "Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami sebagai orang muslim."
      },
      {
        title: "Doa Sebelum Tidur",
        arabic: "بِاسْمِكَ اللَّهُمَّ أَحْيَا وَأَمُوتُ",
        latin: "Bismikallohumma ahya wa amuut",
        translation: "Dengan nama-Mu ya Allah aku hidup dan dengan nama-Mu aku mati."
      },
      {
        title: "Doa Bangun Tidur",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        latin: "Alhamdulillahil ladzi ahyana ba’da ma amatana wa ilaihin-nusyur",
        translation: "Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami, dan kepada-Nya kami kembali."
      },
      {
        title: "Doa Masuk Kamar Mandi",
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
        latin: "Allahumma inni a’udzu bika minal khubutsi wal khoba’its",
        translation: "Ya Allah, aku berlindung kepada-Mu dari godaan setan laki-laki dan perempuan."
      },
      {
        title: "Doa Keluar Kamar Mandi",
        arabic: "غُفْرَانَكَ",
        latin: "Ghufranaka",
        translation: "Aku memohon ampunan-Mu, ya Allah."
      },
      {
        title: "Doa Masuk Rumah",
        arabic: "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا",
        latin: "Bismillahi walajna wa bismillahi kharajna wa ‘ala Allahi rabbina tawakkalna",
        translation: "Dengan nama Allah kami masuk, dengan nama Allah kami keluar, dan kepada Allah Tuhan kami kami bertawakal."
      },
      {
        title: "Doa Keluar Rumah",
        arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        latin: "Bismillahi tawakkaltu ‘alallahi wa laa hawla wa laa quwwata illa billah",
        translation: "Dengan nama Allah, aku bertawakal kepada Allah, tiada daya dan kekuatan kecuali dengan pertolongan Allah."
      },
      {
        title: "Doa Bepergian",
        arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
        latin: "Subhanalladzi sakhkhara lana hadza wa ma kunna lahu muqrinin wa inna ila rabbina lamunqalibun",
        translation: "Maha Suci Allah yang telah menundukkan semua ini bagi kami padahal kami sebelumnya tidak mampu menguasainya, dan sesungguhnya kami akan kembali kepada Tuhan kami."
      },
      {
        title: "Doa Memakai Pakaian Baru",
        arabic: "اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا صُنِعَ لَهُ وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ",
        latin: "Allahumma laka alhamdu anta kasautaniihi as’aluka min khairihi wa khairi ma shuni’a lahu wa a’udzu bika min sharrihi wa sharri ma shuni’a lahu",
        translation: "Ya Allah, segala puji bagi-Mu yang telah memberi aku pakaian ini. Aku memohon kebaikan darinya dan dari tujuan dibuatnya, serta aku berlindung kepada-Mu dari keburukan darinya dan dari tujuan dibuatnya."
      },
      {
        title: "Doa Masuk Pasar",
        arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ حَيٌّ لَا يَمُوتُ، بِيَدِهِ الْخَيْرُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        latin: "La ilaha illallahu wahdahu la sharika lahu, lahul mulku walahul hamdu, yuhyi wa yumitu, wahuwa hayyun la yamutu, biyadihil khair, wahuwa ‘ala kulli shay’in qadir",
        translation: "Tiada Tuhan selain Allah, tiada sekutu bagi-Nya. Milik-Nya kerajaan dan segala puji. Dia menghidupkan dan mematikan, Dia Maha Hidup dan tidak mati. Di tangan-Nya segala kebaikan, dan Dia Maha Kuasa atas segala sesuatu."
      },
      {
        title: "Doa Ketika Hujan Turun",
        arabic: "اللَّهُمَّ صَيِّبًا نَافِعًا",
        latin: "Allahumma shayyiban naafi’an",
        translation: "Ya Allah, jadikanlah hujan ini sebagai hujan yang bermanfaat."
      },
      {
        title: "Doa Ketika Mendengar Petir",
        arabic: "سُبْحَانَ الَّذِي يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلَائِكَةُ مِنْ خِيفَتِهِ",
        latin: "Subhanalladzi yusabbihur ra’du bihamdihi wal malaaikatu min khifatihi",
        translation: "Maha Suci Allah, yang petir bertasbih dengan memuji-Nya, dan para malaikat pun karena takut kepada-Nya."
      },
      {
        title: "Doa Ketika Bercermin",
        arabic: "اللَّهُمَّ كَمَا حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي",
        latin: "Allahumma kama hassanta khalqi fahassin khuluqi",
        translation: "Ya Allah, sebagaimana Engkau telah memperindah ciptaanku, maka perindahlah akhlakku."
      },
      {
        title: "Doa Ketika Marah",
        arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
        latin: "A’udzu billahi minasy-syaythanir-rajim",
        translation: "Aku berlindung kepada Allah dari godaan setan yang terkutuk."
      }
    ];

    // Ambil doa random
    const randomDoa = doaList[Math.floor(Math.random() * doaList.length)];

    res.status(200).json({
      category: "Doa Harian",
      data: randomDoa
    });
  } catch (err) {
    console.error("Serverless error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
