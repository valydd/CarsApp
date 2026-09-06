// Mock Fleet Data with realistic Romanian vehicles & scenarios
export const initialVehicles = [
  {
    id: "veh-1",
    plate: "B 101 CAR",
    makeModel: "Dacia Duster 1.5 dCi 4x4",
    year: 2021,
    vin: "UU1HSDJ8265412981",
    currentKm: 124500,
    fuelType: "diesel",
    driver: "Ion Popescu",
    itpExpiry: "2026-09-08", // Expiră în 7 zile! (URGENT)
    rcaExpiry: "2026-10-15",
    rovinietaExpiry: "2027-01-20",
    cascoExpiry: "2026-12-01",
    lastServiceKm: 110000,
    nextServiceKm: 125000, // 500 km rămași!
    nextServiceDate: "2026-09-25",
    oilType: "5W-30 Dacia/Renault RN0720",
    oilBrand: "Elf Full-Tech FE 5W30",
    tires: { type: "summer", size: "215/65 R16", dot: "1222", brand: "Michelin Primacy 4" },
    color: "from-blue-600 to-indigo-700"
  },
  {
    id: "veh-2",
    plate: "B 204 FLT",
    makeModel: "Skoda Octavia 2.0 TDI Combi",
    year: 2022,
    vin: "TMBJJ7NX8NY084512",
    currentKm: 98200,
    fuelType: "diesel",
    driver: "Andrei Dumitrescu",
    itpExpiry: "2026-08-28", // Expirat de 4 zile! (CRITIC)
    rcaExpiry: "2026-11-10",
    rovinietaExpiry: "2026-12-31",
    cascoExpiry: "2026-11-10",
    lastServiceKm: 83000,
    nextServiceKm: 98000, // Depășit cu 200 km! (CRITIC)
    nextServiceDate: "2026-09-05",
    oilType: "0W-20 VW 508.00/509.00 LongLife IV",
    oilBrand: "Castrol Edge 0W20",
    tires: { type: "allseason", size: "225/45 R17", dot: "4023", brand: "Goodyear Vector 4Seasons" },
    color: "from-emerald-600 to-teal-800"
  },
  {
    id: "veh-3",
    plate: "CJ 10 SRV",
    makeModel: "Ford Transit Custom 2.0 EcoBlue",
    year: 2020,
    vin: "WF0YXXTTGYLK89123",
    currentKm: 178400,
    fuelType: "diesel",
    driver: "Mihai Radu",
    itpExpiry: "2027-02-14",
    rcaExpiry: "2026-09-04", // Expiră în 3 zile! (URGENT)
    rovinietaExpiry: "2026-10-01",
    cascoExpiry: "2026-11-30",
    lastServiceKm: 165000,
    nextServiceKm: 180000, // 1600 km
    nextServiceDate: "2026-11-15",
    oilType: "5W-30 Ford WSS-M2C913-D",
    oilBrand: "Motul 8100 Eco-nergy 5W30",
    tires: { type: "summer", size: "215/65 R16C", dot: "0823", brand: "Continental VanContact" },
    color: "from-amber-600 to-orange-700"
  },
  {
    id: "veh-4",
    plate: "TM 44 LOG",
    makeModel: "Dacia Logan 1.0 TCe ECO-G (GPL)",
    year: 2023,
    vin: "UU1DJF00871239845",
    currentKm: 42100,
    fuelType: "gpl",
    driver: "Alexandru Vasile",
    itpExpiry: "2027-04-19",
    rcaExpiry: "2027-03-20",
    rovinietaExpiry: "2027-03-15",
    cascoExpiry: "2027-03-20",
    lastServiceKm: 30000,
    nextServiceKm: 45000, // 2900 km
    nextServiceDate: "2026-12-10",
    oilType: "5W-40 RN0700/0710",
    oilBrand: "Dacia Oil Plus 5W40",
    tires: { type: "summer", size: "185/65 R15", dot: "1123", brand: "Continental EcoContact" },
    color: "from-cyan-600 to-blue-800"
  },
  {
    id: "veh-5",
    plate: "B 777 FLT",
    makeModel: "Toyota Hilux 2.8 D-4D Invincible",
    year: 2022,
    vin: "AHTBA3CD200874123",
    currentKm: 85300,
    fuelType: "diesel",
    driver: "Constantin Stan",
    itpExpiry: "2027-05-10",
    rcaExpiry: "2027-01-15",
    rovinietaExpiry: "2026-11-20",
    cascoExpiry: "2027-01-15",
    lastServiceKm: 75000,
    nextServiceKm: 90000,
    nextServiceDate: "2027-01-10",
    oilType: "0W-20 Toyota C2",
    oilBrand: "Toyota Genuine Motor Oil 0W20",
    tires: { type: "allseason", size: "265/60 R18", dot: "3022", brand: "BFGoodrich All-Terrain" },
    color: "from-rose-600 to-red-800"
  },
  {
    id: "veh-6",
    plate: "IF 22 MST",
    makeModel: "Renault Master 2.3 dCi Furgon",
    year: 2021,
    vin: "VF1MA000368945123",
    currentKm: 215400,
    fuelType: "diesel",
    driver: "Vasile Gheorghe",
    itpExpiry: "2026-11-18",
    rcaExpiry: "2026-12-05",
    rovinietaExpiry: "2026-09-12", // Expiră în 11 zile
    cascoExpiry: "2026-12-05",
    lastServiceKm: 200000,
    nextServiceKm: 220000,
    nextServiceDate: "2026-10-30",
    oilType: "5W-30 RN0720 C4",
    oilBrand: "Elf Solaris DPF 5W30",
    tires: { type: "winter", size: "225/65 R16C", dot: "3822", brand: "Michelin Agilis Alpin" },
    color: "from-purple-600 to-violet-800"
  },
  {
    id: "veh-7",
    plate: "B 550 COR",
    makeModel: "Toyota Corolla 1.8 Hybrid",
    year: 2023,
    vin: "SB1ZE3BE70E102948",
    currentKm: 38400,
    fuelType: "hybrid",
    driver: "Elena Marinescu",
    itpExpiry: "2027-06-25",
    rcaExpiry: "2027-05-10",
    rovinietaExpiry: "2027-05-01",
    cascoExpiry: "2027-05-10",
    lastServiceKm: 30000,
    nextServiceKm: 45000,
    nextServiceDate: "2027-02-15",
    oilType: "0W-16 Hybrid Synthetic",
    oilBrand: "Toyota 0W16 Advanced",
    tires: { type: "summer", size: "205/55 R16", dot: "0523", brand: "Dunlop Sport BluResponse" },
    color: "from-emerald-700 to-green-900"
  },
  {
    id: "veh-8",
    plate: "BV 88 BOX",
    makeModel: "Peugeot Boxer 2.2 BlueHDi",
    year: 2020,
    vin: "VF3Y3CPFA12984512",
    currentKm: 192000,
    fuelType: "diesel",
    driver: "Cristian Oprea",
    itpExpiry: "2026-10-30",
    rcaExpiry: "2026-10-18",
    rovinietaExpiry: "2026-11-01",
    cascoExpiry: "2026-10-18",
    lastServiceKm: 180000,
    nextServiceKm: 195000, // 3000 km
    nextServiceDate: "2026-10-05",
    oilType: "0W-30 PSA B71 2312",
    oilBrand: "Total Quartz Ineo First 0W30",
    tires: { type: "winter", size: "215/70 R15C", dot: "4221", brand: "Hankook Winter i*cept" },
    color: "from-stone-600 to-zinc-800"
  },
  {
    id: "veh-9",
    plate: "B 310 MEG",
    makeModel: "Renault Megane 1.5 Blue dCi",
    year: 2022,
    vin: "VF1RFB00468201948",
    currentKm: 76500,
    fuelType: "diesel",
    driver: "Gabriel Enache",
    itpExpiry: "2027-01-14",
    rcaExpiry: "2027-01-10",
    rovinietaExpiry: "2026-12-15",
    cascoExpiry: "2027-01-10",
    lastServiceKm: 60000,
    nextServiceKm: 80000, // 3500 km
    nextServiceDate: "2026-11-20",
    oilType: "5W-30 RN17",
    oilBrand: "Castrol GTX RN17 5W30",
    tires: { type: "summer", size: "205/55 R16", dot: "1422", brand: "Michelin Primacy 4" },
    color: "from-sky-600 to-indigo-800"
  },
  {
    id: "veh-10",
    plate: "IS 09 VWC",
    makeModel: "VW Caddy Maxi 2.0 TDI",
    year: 2021,
    vin: "WV2ZZZ2KZMX094812",
    currentKm: 143200,
    fuelType: "diesel",
    driver: "Dan Diaconu",
    itpExpiry: "2026-12-05",
    rcaExpiry: "2026-11-25",
    rovinietaExpiry: "2026-11-10",
    cascoExpiry: "2026-11-25",
    lastServiceKm: 130000,
    nextServiceKm: 145000, // 1800 km
    nextServiceDate: "2026-10-15",
    oilType: "5W-30 VW 507.00",
    oilBrand: "Mobil 1 ESP 5W30",
    tires: { type: "allseason", size: "205/60 R16", dot: "2223", brand: "Bridgestone Weather Control" },
    color: "from-blue-700 to-slate-900"
  },
  {
    id: "veh-11",
    plate: "B 602 PAS",
    makeModel: "VW Passat 2.0 TDI DSG",
    year: 2022,
    vin: "WVWZZZ3CZNE045129",
    currentKm: 89000,
    fuelType: "diesel",
    driver: "Marius Ionescu",
    itpExpiry: "2027-03-12",
    rcaExpiry: "2027-02-18",
    rovinietaExpiry: "2027-02-10",
    cascoExpiry: "2027-02-18",
    lastServiceKm: 75000,
    nextServiceKm: 90000, // 1000 km rămași
    nextServiceDate: "2026-09-30",
    oilType: "0W-30 VW 504.00/507.00",
    oilBrand: "Shell Helix Ultra ECT 0W30",
    tires: { type: "summer", size: "215/55 R17", dot: "1923", brand: "Pirelli Cinturato P7" },
    color: "from-indigo-600 to-purple-900"
  },
  {
    id: "veh-12",
    plate: "CJ 77 FOR",
    makeModel: "Ford Focus 1.0 EcoBoost mHEV",
    year: 2023,
    vin: "WF0PXXGCHPLA98124",
    currentKm: 31200,
    fuelType: "petrol",
    driver: "Sorin Neagu",
    itpExpiry: "2027-08-10",
    rcaExpiry: "2027-07-20",
    rovinietaExpiry: "2027-07-15",
    cascoExpiry: "2027-07-20",
    lastServiceKm: 20000,
    nextServiceKm: 35000,
    nextServiceDate: "2027-03-01",
    oilType: "5W-20 Castrol Magnatec E",
    oilBrand: "Castrol Magnatec Stop-Start 5W20 E",
    tires: { type: "summer", size: "205/60 R16", dot: "0923", brand: "Michelin Primacy 4" },
    color: "from-teal-600 to-cyan-900"
  }
];

export const initialRecords = [
  // 1. Reparație majoră Duster (veh-1) -> Impact mare în clasament
  {
    id: "rec-101",
    vehicleId: "veh-1",
    category: "repair",
    date: "2026-08-15",
    km: 123800,
    amount: 3850,
    currency: "RON",
    title: "Înlocuire Kit Ambreiaj + Volantă Masă Dublă",
    details: {
      workshop: "Auto Cobălcescu SRL",
      partsCost: 2600,
      laborCost: 1250,
      parts: ["Kit ambreiaj Luk", "Volantă masă dublă Sachs", "Rulment presiune"],
      warrantyMonths: 24
    },
    notes: "Zgomot la relanti și trepidație la plecarea de pe loc."
  },
  // 2. Revizie + Schimb Ulei Skoda (veh-2)
  {
    id: "rec-102",
    vehicleId: "veh-2",
    category: "service",
    date: "2026-04-10",
    km: 83000,
    amount: 1450,
    currency: "RON",
    title: "Revizie Periodică + Ulei Castrol 0W20",
    details: {
      workshop: "Porsche Inter Auto București",
      oilType: "0W-20 VW 508.00 LongLife IV",
      oilBrand: "Castrol Edge Professional 0W-20",
      oilLiters: 4.8,
      filters: ["oil", "air", "fuel", "cabin"],
      nextServiceKm: 98000
    },
    notes: "Schimbat complet filtre OE Skoda + resetare interval service."
  },
  // 3. Reparație Ford Transit (veh-3)
  {
    id: "rec-103",
    vehicleId: "veh-3",
    category: "repair",
    date: "2026-07-22",
    km: 174200,
    amount: 4600,
    currency: "RON",
    title: "Înlocuire Alternator + Curea Transmisie + Plăcuțe Frână Spate",
    details: {
      workshop: "Service Bardi Cluj",
      partsCost: 3400,
      laborCost: 1200,
      parts: ["Alternator Valeo 180A", "Kit curea canelată Gates", "Set plăcuțe TRW spate"],
      warrantyMonths: 12
    },
    notes: "Martor baterie aprins în mers."
  },
  // 4. Asigurare RCA + CASCO Toyota Hilux (veh-5)
  {
    id: "rec-104",
    vehicleId: "veh-5",
    category: "insurance",
    date: "2026-01-15",
    km: 68000,
    amount: 5200,
    currency: "RON",
    title: "Poliță CASCO + RCA Anuală",
    details: {
      company: "Generali România",
      policyType: "RCA + CASCO Gold",
      expiresAt: "2027-01-15"
    },
    notes: "Plată integrală."
  },
  // 5. Anvelope noi Renault Master (veh-6)
  {
    id: "rec-105",
    vehicleId: "veh-6",
    category: "tires",
    date: "2026-03-10",
    km: 198000,
    amount: 2900,
    currency: "RON",
    title: "Set 4 Anvelope Iarnă Michelin Agilis 225/65 R16C",
    details: {
      season: "winter",
      size: "225/65 R16C",
      dot: "3822",
      quantity: 4
    },
    notes: "Montaj și echilibrare incluse."
  },
  // 6. Amendă Rovinietă Ford Transit (veh-3)
  {
    id: "rec-106",
    vehicleId: "veh-3",
    category: "fine",
    date: "2026-06-12",
    km: 170500,
    amount: 250,
    currency: "RON",
    title: "Proces Verbal CNAIR - Lipsă Rovinietă Pod Fetești",
    details: {
      ticketNumber: "PV-CNAIR-98124",
      deadline50: "2026-06-27",
      isPaid: true
    },
    notes: "Achitată în termen de 15 zile (50% redus = 125 lei achitat)."
  },
  // 7. ITP Renault Master (veh-6)
  {
    id: "rec-107",
    vehicleId: "veh-6",
    category: "itp",
    date: "2025-11-18",
    km: 182000,
    amount: 200,
    currency: "RON",
    title: "Inspecție Tehnică Periodică (ITP)",
    details: {
      station: "Stație ITP Ilfov Sud",
      expiresAt: "2026-11-18"
    },
    notes: "Trecut fără deficiențe majore."
  },
  // 8. Reparație Dacia Logan (veh-4)
  {
    id: "rec-108",
    vehicleId: "veh-4",
    category: "repair",
    date: "2026-05-18",
    km: 36000,
    amount: 850,
    currency: "RON",
    title: "Schimb Bielete Antiruliu + Pivot Dreapta Față",
    details: {
      workshop: "Dacoserv Timișoara",
      partsCost: 450,
      laborCost: 400,
      parts: ["Bielete Lemforder", "Pivot original"]
    },
    notes: "Bătaie la trecerea peste denivelări."
  },
  // 9. Alimentări Dacia Duster (veh-1) pentru calcul consum
  {
    id: "rec-109",
    vehicleId: "veh-1",
    category: "fuel",
    date: "2026-08-10",
    km: 123750,
    amount: 395,
    currency: "RON",
    title: "Alimentare Motorină Standard",
    details: {
      liters: 52.0,
      pricePerLiter: 7.60,
      fullTank: true,
      fuelType: "diesel"
    },
    notes: "OMV Chitila"
  },
  {
    id: "rec-110",
    vehicleId: "veh-1",
    category: "fuel",
    date: "2026-08-25",
    km: 124500,
    amount: 380,
    currency: "RON",
    title: "Alimentare Motorină Standard",
    details: {
      liters: 50.0,
      pricePerLiter: 7.60,
      fullTank: true,
      fuelType: "diesel"
    },
    // 750 km parcurși cu 50 L => Consum = (50 / 750) * 100 = 6.67 L/100km!
    notes: "Petrom Pipera"
  },
  // 10. Alimentări Skoda Octavia (veh-2)
  {
    id: "rec-111",
    vehicleId: "veh-2",
    category: "fuel",
    date: "2026-08-14",
    km: 97350,
    amount: 365,
    currency: "RON",
    title: "Alimentare Motorină Extra",
    details: {
      liters: 45.0,
      pricePerLiter: 8.11,
      fullTank: true,
      fuelType: "diesel"
    },
    notes: "MOL Otopeni"
  },
  {
    id: "rec-112",
    vehicleId: "veh-2",
    category: "fuel",
    date: "2026-08-28",
    km: 98200,
    amount: 350,
    currency: "RON",
    title: "Alimentare Motorină Extra",
    details: {
      liters: 43.5,
      pricePerLiter: 8.05,
      fullTank: true,
      fuelType: "diesel"
    },
    // 850 km parcurși cu 43.5 L => Consum = (43.5 / 850) * 100 = 5.12 L/100km!
    notes: "Rompetrol Băneasa"
  },
  // 11. Reparație VW Passat (veh-11)
  {
    id: "rec-113",
    vehicleId: "veh-11",
    category: "repair",
    date: "2026-06-05",
    km: 84000,
    amount: 2800,
    currency: "RON",
    title: "Înlocuire Discuri + Plăcuțe Frână Față & Spate Brembo",
    details: {
      workshop: "AutoSoft Militari",
      partsCost: 2050,
      laborCost: 750,
      parts: ["Discuri perforate Brembo Xtra", "Plăcuțe Brembo ceramice"],
      warrantyMonths: 12
    },
    notes: "Uzură avansată la verificarea tehnică de vară."
  }
];
