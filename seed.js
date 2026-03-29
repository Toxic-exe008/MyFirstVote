// seed.js — node seed.js
// Seeds candidates (with real MyNeta data), parties, and a sample election notice

const mongoose       = require("mongoose");
const Candidate      = require("./models/Candidate");
const Party          = require("./models/Party");
const ElectionNotice = require("./models/ElectionNotice");

mongoose.connect("mongodb://127.0.0.1:27017/issueTrackerDB")
  .then(() => console.log("MongoDB Connected — seeding..."))
  .catch(err => { console.error(err); process.exit(1); });

const MYNETA  = "https://www.myneta.info/Maharashtra2024/candidate.php?candidate_id=";
const ECI     = "https://affidavitarchive.nic.in/";
const ADR     = "https://adrindia.org";
const MYNETA_HOME = "https://www.myneta.info/";

// ─────────────────────────────────────────────────────────────
// CANDIDATES
// ─────────────────────────────────────────────────────────────
const candidates = [
  {
    name: "Mangesh Kudalkar", slug: "mangesh-kudalkar",
    party: "Shiv Sena", constituency: "Kurla",
    education: "12th Pass — HSC, Maharashtra State Board (May 2023)",
    biography: "Mangesh Kudalkar is the sitting MLA from the reserved Kurla (SC) constituency representing Shiv Sena (Eknath Shinde faction). He is a grassroots politician deeply connected with the local community in Kurla East, having been active in local governance and social work for over two decades. He runs a business parallel to his political career.",
    mynetaId: "1054",
    assets: { movable: 6759181, immovable: 68132800 },
    politicalHistory: [
      { party: "Shiv Sena", position: "Local Social Worker / Party Worker", fromYear: 2000, toYear: 2014, notes: "Active party ground worker in Kurla area" },
      { party: "Shiv Sena", position: "MLA — Kurla (SC)", fromYear: 2014, toYear: 2019, notes: "First elected as MLA from Kurla (SC)" },
      { party: "Shiv Sena", position: "MLA — Kurla (SC)", fromYear: 2019, toYear: 2024, notes: "Re-elected. Declared 0 criminal cases, assets ~₹4.4 Cr" },
      { party: "Shiv Sena (Eknath Shinde)", position: "MLA — Kurla (SC)", fromYear: 2024, toYear: 0, notes: "Won 2024 Maharashtra Assembly election. Assets ~₹7.48 Cr" }
    ],
    criminalCases: [],
    sources: [
      { title: "MyNeta — Mangesh Kudalkar (Maharashtra 2024)", link: `${MYNETA}1054` },
      { title: "Election Commission of India — Affidavit Archive", link: ECI },
      { title: "Association for Democratic Reforms (ADR)", link: ADR },
      { title: "MyNeta.info — Open Election Data Platform", link: MYNETA_HOME }
    ]
  },
  {
    name: "Tukaram Kate", slug: "tukaram-kate",
    party: "Shiv Sena", constituency: "Chembur",
    education: "8th Pass — 9th Fail, Adarsha Vidyamandir, Ghatla, Chembur",
    biography: "Tukaram Ramkrushna Kate is a veteran Shiv Sena politician and social worker from Chembur who has contested Maharashtra Assembly elections since 2009. He is also an agriculturalist and draws pension from the Maharashtra Legislative Assembly. Known for his grassroots connect in Chembur, he has represented the constituency across multiple tenures.",
    mynetaId: "870",
    assets: { movable: 4203862, immovable: 21700262 },
    politicalHistory: [
      { party: "Shiv Sena", position: "BMC Corporator — Chembur Ward", fromYear: 2007, toYear: 2012, notes: "Elected to Brihanmumbai Municipal Corporation. Declared 4 criminal cases in 2012 BMC affidavit." },
      { party: "Shiv Sena", position: "MLA — Chembur", fromYear: 2009, toYear: 2014, notes: "Won Maharashtra Assembly election 2009. Declared 1 criminal case." },
      { party: "Shiv Sena", position: "Contested MLA — Chembur (Lost)", fromYear: 2014, toYear: 2014, notes: "Contested but did not win in 2014. Declared 3 criminal cases." },
      { party: "Shiv Sena", position: "Contested MLA — Chembur (Lost)", fromYear: 2019, toYear: 2019, notes: "Contested 2019 elections. Declared 1 criminal case, assets ~₹2.72 Cr." },
      { party: "Shiv Sena (Eknath Shinde)", position: "MLA — Chembur", fromYear: 2024, toYear: 0, notes: "Won 2024 Maharashtra Assembly election. Assets ~₹2.59 Cr." }
    ],
    criminalCases: [
      {
        description: "FIR No. 241/2009 — Azad Maidan Police Station. Case No. 898/2019, City Civil Sessions Court Mumbai (Addl. Sessions Judge, Court No. 54). Charges: IPC Sec 141 (Unlawful assembly), 142, 143, 146 (Rioting), 147, 149, 353 (Assault on public servant), 342 (Wrongful confinement), 427 (Mischief causing damage). Also under Section 51 & 3, 7 of other Acts. Charges framed 04 Mar 2010. Case pending. No appeal filed.",
        status: "Pending",
        source: `${MYNETA}870`
      }
    ],
    sources: [
      { title: "MyNeta — Tukaram Kate (Maharashtra 2024)", link: `${MYNETA}870` },
      { title: "Election Commission of India — Affidavit Archive", link: ECI },
      { title: "Association for Democratic Reforms (ADR)", link: ADR },
      { title: "MyNeta.info — Open Election Data Platform", link: MYNETA_HOME }
    ]
  },
  {
    name: "Murji Patel (Kaka)", slug: "murji-patel-kaka",
    party: "Shiv Sena", constituency: "Andheri East",
    education: "8th Pass — 9th Std., Y J S Gujarati Night High School, Tardeo, Mumbai (1990)",
    biography: "Murji Patel, affectionately called 'Kaka' by his supporters, is a professional service provider and Shiv Sena MLA from Andheri East. He won the seat in 2019 and retained it in 2024. He is deeply involved in local community development and is known for his accessibility to constituents.",
    mynetaId: "1911",
    assets: { movable: 28476477, immovable: 119171066 },
    politicalHistory: [
      { party: "Shiv Sena", position: "Party Worker / Local Leader", fromYear: 2010, toYear: 2019, notes: "Active Shiv Sena worker in Andheri East; built local support base" },
      { party: "Shiv Sena", position: "MLA — Andheri East", fromYear: 2019, toYear: 2024, notes: "First elected as MLA from Andheri East in 2019. Declared 0 criminal cases, assets ~₹6.39 Cr." },
      { party: "Shiv Sena (Eknath Shinde)", position: "MLA — Andheri East", fromYear: 2024, toYear: 0, notes: "Re-elected in 2024. 1 pending FIR (forgery charges, Bombay HC writ filed). Assets ~₹14.76 Cr." }
    ],
    criminalCases: [
      {
        description: "FIR No. 0049/2024 — Shahu Nagar Police Station, Mumbai. Charges: IPC Sec 464 (Making a false document), 465 (Punishment for forgery), 471 (Using a forged document as genuine). Also under Sections 11(1)(a), 11(1)(b), 11(2). Charges not yet framed. Criminal Writ Petition (S.T) No. 2085 of 2024 filed in the Hon'ble Bombay High Court. Appeal: Yes.",
        status: "Pending",
        source: `${MYNETA}1911`
      }
    ],
    sources: [
      { title: "MyNeta — Murji Patel Kaka (Maharashtra 2024)", link: `${MYNETA}1911` },
      { title: "Election Commission of India — Affidavit Archive", link: ECI },
      { title: "Association for Democratic Reforms (ADR)", link: ADR },
      { title: "MyNeta.info — Open Election Data Platform", link: MYNETA_HOME }
    ]
  },
  {
    name: "Adv. Ashish Shelar", slug: "ashish-shelar",
    party: "BJP", constituency: "Bandra West",
    education: "Graduate Professional — LLB (G.A. Advani College, 1995), B.Sc (Parle College, 1992), HSC (Kirti College, 1989), SSC (DGT High School, 1987)",
    biography: "Adv. Ashish Shelar is a prominent BJP leader in Mumbai and a four-term MLA from Bandra West (Vandre West). An advocate by profession, he has served as Maharashtra's School Education & Sports Minister and is a recognised face in Mumbai's political landscape. He is also associated with Guruprasad Sports, reflecting his involvement in youth development.",
    mynetaId: "246",
    assets: { movable: 188108965, immovable: 216776000 },
    politicalHistory: [
      { party: "BJP", position: "BJP Youth Wing Leader — Mumbai", fromYear: 1995, toYear: 2008, notes: "Active in BJP's youth wing (BJYM) and rose through the party ranks in Mumbai" },
      { party: "BJP", position: "MLA — Bandra West (Vandre West)", fromYear: 2009, toYear: 2014, notes: "First elected MLA from Bandra West. Declared 3 criminal cases, assets ~₹1.66 Cr." },
      { party: "BJP", position: "MLA — Bandra West (Vandre West)", fromYear: 2014, toYear: 2019, notes: "Re-elected. Assets ~₹5 Cr. Declared 2 criminal cases." },
      { party: "BJP", position: "School Education & Sports Minister — Maharashtra", fromYear: 2014, toYear: 2019, notes: "Served as Cabinet Minister in the Devendra Fadnavis-led BJP government" },
      { party: "BJP", position: "MLA — Bandra West (Vandre West)", fromYear: 2019, toYear: 2024, notes: "Third consecutive win. Assets ~₹14.61 Cr. Declared 3 criminal cases." },
      { party: "BJP", position: "MLA — Bandra West (Vandre West)", fromYear: 2024, toYear: 0, notes: "Fourth consecutive win. Assets ~₹40.48 Cr. 1 pending case (Khar PS FIR 315/2009)." }
    ],
    criminalCases: [
      {
        description: "FIR No. 315/2009 — Khar Police Station. Case No. 902068/2023 in Bandra Court. Charges: IPC Sec 341 (Wrongful restraint), 143 (Unlawful assembly), 145 (Joining unlawful assembly), 147 (Rioting), 149, 188 (Disobedience to public servant's order). Also under Section 37(3) and Section 135 Bombay Police Act. Charges not yet framed. No appeal filed. Case pending.",
        status: "Pending",
        source: `${MYNETA}246`
      }
    ],
    sources: [
      { title: "MyNeta — Ashish Shelar (Maharashtra 2024)", link: `${MYNETA}246` },
      { title: "Election Commission of India — Affidavit Archive", link: ECI },
      { title: "Association for Democratic Reforms (ADR)", link: ADR },
      { title: "MyNeta.info — Open Election Data Platform", link: MYNETA_HOME }
    ]
  }
];

// ─────────────────────────────────────────────────────────────
// PARTIES
// ─────────────────────────────────────────────────────────────
const parties = [
  {
    name: "Bharatiya Janata Party", slug: "bjp",
    abbreviation: "BJP", type: "National",
    foundedYear: 1980, foundedBy: "Atal Bihari Vajpayee & L.K. Advani",
    ideology: "Hindu nationalism, Social conservatism, Economic liberalism",
    symbol: "Lotus", headquarters: "New Delhi",
    colour: "#FF6600",
    description: "The Bharatiya Janata Party is India's ruling national political party and the world's largest political party by membership. Founded in 1980 from the remnants of the Janata Party, it has governed India with a majority since 2014 under Prime Minister Narendra Modi.",
    electionHistory: [
      { year: 2014, election: "Maharashtra Assembly", seatsWon: 122, totalSeats: 288, notes: "Formed govt with Shiv Sena. Devendra Fadnavis became CM." },
      { year: 2019, election: "Maharashtra Assembly", seatsWon: 105, totalSeats: 288, notes: "Alliance with Shiv Sena broke. Fadnavis briefly CM, then MVA govt formed." },
      { year: 2024, election: "Maharashtra Assembly", seatsWon: 132, totalSeats: 288, notes: "Part of Mahayuti alliance (BJP + Shiv Sena + NCP). Devendra Fadnavis became CM again." },
      { year: 2024, election: "Lok Sabha", seatsWon: 240, totalSeats: 543, notes: "NDA returned to power; BJP won 240 seats nationally." }
    ]
  },
  {
    name: "Shiv Sena (Eknath Shinde)", slug: "shiv-sena-shinde",
    abbreviation: "SS(ES)", type: "State",
    foundedYear: 2022, foundedBy: "Eknath Shinde (split from original Shiv Sena)",
    ideology: "Marathi regionalism, Hindu nationalism, Social conservatism",
    symbol: "Bow & Arrow (retained by Shinde faction per ECI ruling)",
    headquarters: "Mumbai, Maharashtra",
    colour: "#FF9900",
    description: "The Shiv Sena (Eknath Shinde faction) emerged in June 2022 when Chief Minister Eknath Shinde led a rebellion against Uddhav Thackeray and broke away with a majority of Shiv Sena MLAs. The Election Commission of India recognised this faction as the real Shiv Sena and awarded them the party's name and bow-and-arrow symbol in 2023. They are part of the ruling Mahayuti alliance in Maharashtra with BJP and NCP (Ajit Pawar faction).",
    electionHistory: [
      { year: 2022, election: "Maharashtra Government Formation", seatsWon: 40, totalSeats: 55, notes: "Rebellion led by Eknath Shinde; formed govt with BJP support. Shinde became CM." },
      { year: 2024, election: "Maharashtra Assembly", seatsWon: 57, totalSeats: 288, notes: "Part of Mahayuti alliance. Won 57 seats. Devendra Fadnavis (BJP) became CM." },
      { year: 2024, election: "Lok Sabha", seatsWon: 7, totalSeats: 543, notes: "Contested as part of NDA. Won 7 seats from Maharashtra." }
    ]
  },
  {
    name: "Indian National Congress", slug: "inc",
    abbreviation: "INC", type: "National",
    foundedYear: 1885, foundedBy: "A.O. Hume, Dadabhai Naoroji, Dinshaw Wacha",
    ideology: "Social democracy, Secularism, Liberalism",
    symbol: "Hand (Palm)", headquarters: "New Delhi",
    colour: "#138808",
    description: "The Indian National Congress is one of India's oldest and most prominent political parties, founded in 1885. It led the independence movement against British rule and governed India for most of the post-independence era. In Maharashtra it is part of the Maha Vikas Aghadi (MVA) alliance.",
    electionHistory: [
      { year: 2019, election: "Maharashtra Assembly", seatsWon: 44, totalSeats: 288, notes: "Part of MVA alliance with NCP and Shiv Sena (Uddhav). MVA formed govt." },
      { year: 2024, election: "Maharashtra Assembly", seatsWon: 16, totalSeats: 288, notes: "Part of MVA opposition alliance. Suffered significant losses." },
      { year: 2024, election: "Lok Sabha", seatsWon: 99, totalSeats: 543, notes: "INDIA alliance improved performance nationally; Congress won 99 seats." }
    ]
  },
  {
    name: "Nationalist Congress Party (Sharad Pawar)", slug: "ncp-sp",
    abbreviation: "NCP(SP)", type: "State",
    foundedYear: 2023, foundedBy: "Sharad Pawar (split from original NCP)",
    ideology: "Social democracy, Agrarianism, Secularism",
    symbol: "Man blowing turha (retained by Pawar faction per ECI)",
    headquarters: "Pune, Maharashtra",
    colour: "#00BFFF",
    description: "The NCP (Sharad Pawar) faction emerged after the 2023 split of the Nationalist Congress Party, when Deputy CM Ajit Pawar led a rival group into the ruling alliance. The Election Commission recognised Sharad Pawar's faction as a registered State party. They are part of the MVA opposition.",
    electionHistory: [
      { year: 2024, election: "Maharashtra Assembly", seatsWon: 10, totalSeats: 288, notes: "Part of MVA opposition. Won 10 seats as NCP(SP)." },
      { year: 2024, election: "Lok Sabha", seatsWon: 8, totalSeats: 543, notes: "Part of INDIA alliance. Won 8 seats from Maharashtra." }
    ]
  }
];

// ─────────────────────────────────────────────────────────────
// ELECTION NOTICE
// ─────────────────────────────────────────────────────────────
const electionNotice = {
  title:        "Maharashtra Vidhan Sabha General Election 2024",
  electionDate: "20 November 2024",
  votingStart:  "7:00 AM",
  votingEnd:    "6:00 PM",
  constituency: "Mumbai Suburban District",
  resultDate:   "23 November 2024",
  description:  "All registered voters in Kurla, Chembur, Andheri East and Bandra West constituencies are requested to exercise their franchise. Carry your Voter ID / Aadhaar / any ECI-approved photo ID to the polling booth.",
  isActive:     true
};

// ─────────────────────────────────────────────────────────────
// SEED
// ─────────────────────────────────────────────────────────────
async function seed() {
  try {
    await Promise.all([
      require("./models/Candidate").deleteMany({}),
      require("./models/Party").deleteMany({}),
      require("./models/ElectionNotice").deleteMany({})
    ]);
    console.log("Cleared existing data.");

    const ins = await Candidate.insertMany(candidates);
    console.log(`✅ Seeded ${ins.length} candidates:`);
    ins.forEach(c => console.log(`   • ${c.name} (${c.constituency}) — total assets: ₹${(c.assets.total/1e7).toFixed(2)} Cr`));

    const insP = await Party.insertMany(parties);
    console.log(`✅ Seeded ${insP.length} parties:`);
    insP.forEach(p => console.log(`   • ${p.name} [${p.abbreviation}] — ${p.type}`));

    await require("./models/ElectionNotice").create(electionNotice);
    console.log(`✅ Seeded election notice: ${electionNotice.title}`);

  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    mongoose.disconnect();
    console.log("Done.");
  }
}

seed();