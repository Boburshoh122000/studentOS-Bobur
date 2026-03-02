/**
 * Static list of Uzbekistan universities.
 * Source: stat.edu.uz (manually curated — the site requires JS rendering).
 * Run `npm run seed:universities` to populate the database.
 */
export interface UniversityEntry {
  nameUz: string;
  nameEn: string;
  region: string;
  type: 'state' | 'private' | 'branch';
}

export const UNIVERSITIES: UniversityEntry[] = [
  // ── Toshkent ────────────────────────────────────────────────────────────────
  {
    nameUz: "O'zbekiston Milliy Universiteti",
    nameEn: 'National University of Uzbekistan',
    region: 'Toshkent',
    type: 'state',
  },
  {
    nameUz: 'Toshkent Davlat Texnika Universiteti',
    nameEn: 'Tashkent State Technical University',
    region: 'Toshkent',
    type: 'state',
  },
  {
    nameUz: 'Toshkent Axborot Texnologiyalari Universiteti',
    nameEn: 'Tashkent University of Information Technologies',
    region: 'Toshkent',
    type: 'state',
  },
  {
    nameUz: 'Toshkent Tibbiyot Akademiyasi',
    nameEn: 'Tashkent Medical Academy',
    region: 'Toshkent',
    type: 'state',
  },
  {
    nameUz: 'Toshkent Davlat Iqtisodiyot Universiteti',
    nameEn: 'Tashkent State University of Economics',
    region: 'Toshkent',
    type: 'state',
  },
  {
    nameUz: 'Toshkent Davlat Pedagogika Universiteti',
    nameEn: 'Tashkent State Pedagogical University',
    region: 'Toshkent',
    type: 'state',
  },
  {
    nameUz: "O'zbekiston Davlat Jahon Tillari Universiteti",
    nameEn: 'Uzbekistan State World Languages University',
    region: 'Toshkent',
    type: 'state',
  },
  {
    nameUz: 'Toshkent Davlat Yuridik Universiteti',
    nameEn: 'Tashkent State Law University',
    region: 'Toshkent',
    type: 'state',
  },
  {
    nameUz: "O'zbekiston Davlat Konservatoriyasi",
    nameEn: 'State Conservatory of Uzbekistan',
    region: 'Toshkent',
    type: 'state',
  },
  {
    nameUz: "O'zbekiston Davlat Jismoniy Tarbiya va Sport Universiteti",
    nameEn: 'Uzbekistan State University of Physical Education and Sports',
    region: 'Toshkent',
    type: 'state',
  },
  {
    nameUz: 'Toshkent Davlat Agrar Universiteti',
    nameEn: 'Tashkent State Agrarian University',
    region: 'Toshkent',
    type: 'state',
  },
  {
    nameUz: 'Toshkent Davlat Transport Universiteti',
    nameEn: 'Tashkent State Transport University',
    region: 'Toshkent',
    type: 'state',
  },
  {
    nameUz: "O'zbekiston Davlat San'at va Madaniyat Instituti",
    nameEn: 'Uzbekistan State Institute of Arts and Culture',
    region: 'Toshkent',
    type: 'state',
  },
  {
    nameUz: 'Toshkent Arxitektura-Qurilish Instituti',
    nameEn: 'Tashkent Institute of Architecture and Civil Engineering',
    region: 'Toshkent',
    type: 'state',
  },
  {
    nameUz: 'Toshkent Kimyo-Texnologiya Instituti',
    nameEn: 'Tashkent Chemical-Technological Institute',
    region: 'Toshkent',
    type: 'state',
  },
  {
    nameUz: "O'zbekiston-Finlandiya Pedagogika Instituti",
    nameEn: 'Uzbekistan-Finland Pedagogical Institute',
    region: 'Toshkent',
    type: 'state',
  },
  {
    nameUz: 'Milliy Istiqlol Instituti',
    nameEn: 'National Independence Institute',
    region: 'Toshkent',
    type: 'state',
  },
  {
    nameUz: "O'zbekiston-Malayziya Texnologiyalar Instituti",
    nameEn: 'Uzbekistan-Malaysia Institute of Technology',
    region: 'Toshkent',
    type: 'state',
  },
  {
    nameUz: 'Islom Karimov nomidagi Toshkent Davlat Texnik Universiteti',
    nameEn: 'Tashkent State Technical University named after Islam Karimov',
    region: 'Toshkent',
    type: 'state',
  },
  // Private / International – Toshkent
  {
    nameUz: 'Toshkent xalqaro Vestminster universiteti',
    nameEn: 'Westminster International University in Tashkent',
    region: 'Toshkent',
    type: 'private',
  },
  {
    nameUz: 'Turin Politexnika Universiteti Toshkent',
    nameEn: 'Turin Polytechnic University in Tashkent',
    region: 'Toshkent',
    type: 'branch',
  },
  {
    nameUz: 'INHA Universiteti Toshkentda',
    nameEn: 'INHA University in Tashkent',
    region: 'Toshkent',
    type: 'branch',
  },
  {
    nameUz: 'Management Development Institute of Singapore in Tashkent',
    nameEn: 'Management Development Institute of Singapore in Tashkent',
    region: 'Toshkent',
    type: 'branch',
  },
  {
    nameUz: 'Webster Universiteti Toshkent',
    nameEn: 'Webster University Tashkent',
    region: 'Toshkent',
    type: 'branch',
  },
  {
    nameUz: 'Yeoju Texnik Instituti',
    nameEn: 'Yeoju Technical Institute in Tashkent',
    region: 'Toshkent',
    type: 'branch',
  },
  {
    nameUz: 'Kimyo Xalqaro Universiteti',
    nameEn: 'Kimyo International University',
    region: 'Toshkent',
    type: 'private',
  },
  {
    nameUz: "Yangi O'zbekiston Universiteti",
    nameEn: 'New Uzbekistan University',
    region: 'Toshkent',
    type: 'private',
  },
  {
    nameUz: 'Ajou Universiteti Toshkentda',
    nameEn: 'Ajou University in Tashkent',
    region: 'Toshkent',
    type: 'branch',
  },
  {
    nameUz: 'Universal Universiteti',
    nameEn: 'Universal University',
    region: 'Toshkent',
    type: 'private',
  },
  {
    nameUz: 'PDP Universiteti',
    nameEn: 'PDP University',
    region: 'Toshkent',
    type: 'private',
  },
  {
    nameUz: 'AKFA Universiteti',
    nameEn: 'AKFA University',
    region: 'Toshkent',
    type: 'private',
  },
  {
    nameUz: 'Markaziy Osiyo Universiteti',
    nameEn: 'Central Asian University',
    region: 'Toshkent',
    type: 'private',
  },
  {
    nameUz: 'Toshkent Islom Universiteti',
    nameEn: 'Tashkent Islamic University',
    region: 'Toshkent',
    type: 'state',
  },
  {
    nameUz: 'Iqtisodiyot va Pedagogika Universiteti',
    nameEn: 'University of Economics and Pedagogy',
    region: 'Toshkent',
    type: 'private',
  },
  {
    nameUz: 'Xalqaro Biznes Maktabi',
    nameEn: 'International School of Business',
    region: 'Toshkent',
    type: 'private',
  },
  {
    nameUz: 'Toshkent Tibbiyot Akademiyasi Filiali',
    nameEn: 'Tashkent Medical Academy Branch',
    region: 'Toshkent',
    type: 'branch',
  },

  // ── Samarqand ───────────────────────────────────────────────────────────────
  {
    nameUz: 'Samarqand Davlat Universiteti',
    nameEn: 'Samarkand State University',
    region: 'Samarqand',
    type: 'state',
  },
  {
    nameUz: 'Samarqand Davlat Tibbiyot Universiteti',
    nameEn: 'Samarkand State Medical University',
    region: 'Samarqand',
    type: 'state',
  },
  {
    nameUz: 'Samarqand Davlat Arxitektura-Qurilish Instituti',
    nameEn: 'Samarkand State Architectural-Construction Institute',
    region: 'Samarqand',
    type: 'state',
  },
  {
    nameUz: 'Samarqand Davlat Iqtisodiyot Universiteti',
    nameEn: 'Samarkand State University of Economics',
    region: 'Samarqand',
    type: 'state',
  },
  {
    nameUz: 'Samarqand Veterinariya Tibbiyoti, Chorvachilik va Biotexnologiyalar Universiteti',
    nameEn: 'Samarkand Veterinary Medicine, Animal Husbandry and Biotechnologies University',
    region: 'Samarqand',
    type: 'state',
  },
  {
    nameUz: 'Silk Road Xalqaro Turizm va Madaniy Meros Universiteti',
    nameEn: 'Silk Road International University of Tourism and Cultural Heritage',
    region: 'Samarqand',
    type: 'state',
  },
  {
    nameUz: 'Samarqand Davlat Chet Tillar Instituti',
    nameEn: 'Samarkand State Institute of Foreign Languages',
    region: 'Samarqand',
    type: 'state',
  },

  // ── Buxoro ──────────────────────────────────────────────────────────────────
  {
    nameUz: 'Buxoro Davlat Universiteti',
    nameEn: 'Bukhara State University',
    region: 'Buxoro',
    type: 'state',
  },
  {
    nameUz: 'Buxoro Muhandislik-Texnologiya Instituti',
    nameEn: 'Bukhara Engineering-Technological Institute',
    region: 'Buxoro',
    type: 'state',
  },
  {
    nameUz: 'Buxoro Davlat Tibbiyot Instituti',
    nameEn: 'Bukhara State Medical Institute',
    region: 'Buxoro',
    type: 'state',
  },

  // ── Namangan ────────────────────────────────────────────────────────────────
  {
    nameUz: 'Namangan Davlat Universiteti',
    nameEn: 'Namangan State University',
    region: 'Namangan',
    type: 'state',
  },
  {
    nameUz: 'Namangan Muhandislik-Texnologiya Instituti',
    nameEn: 'Namangan Engineering-Technological Institute',
    region: 'Namangan',
    type: 'state',
  },
  {
    nameUz: 'Namangan Davlat Pedagogika Instituti',
    nameEn: 'Namangan State Pedagogical Institute',
    region: 'Namangan',
    type: 'state',
  },
  {
    nameUz: 'Osiyo Xalqaro Universiteti',
    nameEn: 'Asian International University',
    region: 'Namangan',
    type: 'private',
  },

  // ── Farg'ona ────────────────────────────────────────────────────────────────
  {
    nameUz: "Farg'ona Davlat Universiteti",
    nameEn: 'Fergana State University',
    region: "Farg'ona",
    type: 'state',
  },
  {
    nameUz: "Farg'ona Politexnika Instituti",
    nameEn: 'Fergana Polytechnic Institute',
    region: "Farg'ona",
    type: 'state',
  },
  {
    nameUz: "Farg'ona Davlat Tibbiyot Instituti",
    nameEn: 'Fergana State Medical Institute',
    region: "Farg'ona",
    type: 'state',
  },

  // ── Andijon ─────────────────────────────────────────────────────────────────
  {
    nameUz: 'Andijon Davlat Universiteti',
    nameEn: 'Andijan State University',
    region: 'Andijon',
    type: 'state',
  },
  {
    nameUz: 'Andijon Davlat Tibbiyot Instituti',
    nameEn: 'Andijan State Medical Institute',
    region: 'Andijon',
    type: 'state',
  },
  {
    nameUz: 'Andijon Muhandislik-Iqtisodiyot Instituti',
    nameEn: 'Andijan Engineering-Economics Institute',
    region: 'Andijon',
    type: 'state',
  },

  // ── Qashqadaryo ─────────────────────────────────────────────────────────────
  {
    nameUz: 'Qarshi Davlat Universiteti',
    nameEn: 'Karshi State University',
    region: 'Qashqadaryo',
    type: 'state',
  },
  {
    nameUz: 'Qarshi Muhandislik-Iqtisodiyot Instituti',
    nameEn: 'Karshi Engineering-Economics Institute',
    region: 'Qashqadaryo',
    type: 'state',
  },

  // ── Surxondaryo ─────────────────────────────────────────────────────────────
  {
    nameUz: 'Termiz Davlat Universiteti',
    nameEn: 'Termez State University',
    region: 'Surxondaryo',
    type: 'state',
  },

  // ── Jizzax ──────────────────────────────────────────────────────────────────
  {
    nameUz: 'Jizzax Davlat Pedagogika Universiteti',
    nameEn: 'Jizzakh State Pedagogical University',
    region: 'Jizzax',
    type: 'state',
  },
  {
    nameUz: 'Jizzax Politexnika Instituti',
    nameEn: 'Jizzakh Polytechnic Institute',
    region: 'Jizzax',
    type: 'state',
  },

  // ── Navoiy ──────────────────────────────────────────────────────────────────
  {
    nameUz: 'Navoiy Davlat Konchilik va Texnologiyalar Universiteti',
    nameEn: 'Navoi State Mining and Technology University',
    region: 'Navoiy',
    type: 'state',
  },
  {
    nameUz: 'Navoiy Davlat Pedagogika Instituti',
    nameEn: 'Navoi State Pedagogical Institute',
    region: 'Navoiy',
    type: 'state',
  },

  // ── Xorazm ──────────────────────────────────────────────────────────────────
  {
    nameUz: 'Urganch Davlat Universiteti',
    nameEn: 'Urgench State University',
    region: 'Xorazm',
    type: 'state',
  },
  {
    nameUz: 'Xorazm Mamun Akademiyasi',
    nameEn: 'Khorezm Mamun Academy',
    region: 'Xorazm',
    type: 'state',
  },

  // ── Qoraqalpog'iston ────────────────────────────────────────────────────────
  {
    nameUz: "Qoraqalpog'iston Davlat Universiteti",
    nameEn: 'Karakalpak State University',
    region: "Qoraqalpog'iston",
    type: 'state',
  },
  {
    nameUz: 'Nukus Davlat Pedagogika Instituti',
    nameEn: 'Nukus State Pedagogical Institute',
    region: "Qoraqalpog'iston",
    type: 'state',
  },

  // ── Sirdaryo ────────────────────────────────────────────────────────────────
  {
    nameUz: 'Guliston Davlat Universiteti',
    nameEn: 'Gulistan State University',
    region: 'Sirdaryo',
    type: 'state',
  },

  // ── Toshkent viloyati ───────────────────────────────────────────────────────
  {
    nameUz: 'Toshkent Viloyati Davlat Pedagogika Instituti',
    nameEn: 'Tashkent Regional State Pedagogical Institute',
    region: 'Toshkent viloyati',
    type: 'state',
  },

  // ── International/Other ─────────────────────────────────────────────────────
  {
    nameUz: 'Toshkent Tsukuba Universiteti',
    nameEn: 'University of Tsukuba Tashkent',
    region: 'Toshkent',
    type: 'branch',
  },
  {
    nameUz: 'Seoul National University of Science and Technology in Tashkent',
    nameEn: 'Seoul National University of Science and Technology in Tashkent',
    region: 'Toshkent',
    type: 'branch',
  },
  {
    nameUz: 'Belarusiya Davlat Universiteti Toshkent filiali',
    nameEn: 'Belarusian State University Tashkent Branch',
    region: 'Toshkent',
    type: 'branch',
  },
  {
    nameUz: 'Rossiya Iqtisodiyot Universiteti G.V. Plexanov nomidagi Toshkent filiali',
    nameEn: 'Plekhanov Russian University of Economics Tashkent Branch',
    region: 'Toshkent',
    type: 'branch',
  },
  {
    nameUz: 'Moskva Davlat Universiteti Toshkent filiali',
    nameEn: 'Moscow State University Tashkent Branch',
    region: 'Toshkent',
    type: 'branch',
  },
  {
    nameUz: 'Rossiya Neft va Gaz Milliy Tadqiqot Universiteti Toshkent filiali',
    nameEn: 'Gubkin Russian State University of Oil and Gas Tashkent Branch',
    region: 'Toshkent',
    type: 'branch',
  },
];
