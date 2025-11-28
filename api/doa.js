export default function handler(req, res) {
  res.status(200).json({
    category: "Doa Harian",
    data: [
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
      }
    ]
  });
}
