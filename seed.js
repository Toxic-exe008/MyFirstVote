// seed.js  —  Run ONCE to populate the database:   node seed.js
//
// ⚠️  WARNING: This DELETES all candidates, parties, and notices before inserting.
//     Only run this to reset to factory/default data.
//
// ✅  MongoDB is PERMANENT: stopping/starting "node server.js" NEVER resets data.
//     Only THIS script resets it.
//
// Works with both:
//   Local MongoDB:   just run  node seed.js
//   MongoDB Atlas:   MONGODB_URI=<your-atlas-uri> node seed.js

const mongoose       = require("mongoose");
const Candidate      = require("./models/Candidate");
const Party          = require("./models/Party");
const ElectionNotice = require("./models/ElectionNotice");

// Use Atlas URI if available, otherwise local
const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/myfirstvoteDB";

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected  →  " + MONGO_URI.split("@").pop()))
  .catch(err => { console.error("Connection failed:", err.message); process.exit(1); });

const MYNETA = "https://www.myneta.info/Maharashtra2024/candidate.php?candidate_id=";
const ECI    = "https://affidavitarchive.nic.in/";
const ADR    = "https://adrindia.org";
const MNHOME = "https://www.myneta.info/";

// ── CANDIDATES ───────────────────────────────────────────────────────────────
// IMPORTANT: Assets.total is set EXPLICITLY here as  movable + immovable.
// We also use individual .save() calls (not insertMany) so the pre-save hook
// also fires. Both methods ensure total is never 0.

const candidatesData = [
  {
    name: "Mangesh Kudalkar",   slug: "mangesh-kudalkar",
    party: "Shiv Sena",         constituency: "Kurla",
    education: "12th Pass — HSC, Maharashtra State Board (May 2023)",
    biography: "Mangesh Kudalkar is the sitting MLA from the reserved Kurla (SC) constituency representing Shiv Sena (Eknath Shinde faction). A grassroots politician connected with Kurla East for over two decades, he has been active in local governance and social work alongside his business ventures.",
    mynetaId: "1054",
    assets: {
      movable:   6759181,
      immovable: 68132800,
      total:     6759181 + 68132800   // 74891981
    },
    politicalHistory: [
      { party: "Shiv Sena", position: "Party Worker / Social Worker", fromYear: 2000, toYear: 2014, notes: "Active Shiv Sena ground worker in Kurla for 14 years." },
      { party: "Shiv Sena", position: "MLA — Kurla (SC)", fromYear: 2014, toYear: 2019, notes: "First elected MLA. No criminal cases declared." },
      { party: "Shiv Sena", position: "MLA — Kurla (SC)", fromYear: 2019, toYear: 2024, notes: "Re-elected. Declared 0 criminal cases. Assets ~\u20B94.44 Cr." },
      { party: "Shiv Sena (Eknath Shinde)", position: "MLA — Kurla (SC)", fromYear: 2024, toYear: 0, notes: "Won 2024 Maharashtra Assembly election. Assets ~\u20B97.48 Cr." }
    ],
    criminalCases: [],
    sources: [
      { title: "MyNeta — Mangesh Kudalkar (Maharashtra 2024)", link: MYNETA + "1054" },
      { title: "Election Commission of India — Affidavit Archive", link: ECI },
      { title: "Association for Democratic Reforms (ADR)", link: ADR },
      { title: "MyNeta.info — Open Election Data Platform", link: MNHOME }
    ]
  },
  {
    name: "Tukaram Kate",       slug: "tukaram-kate",
    party: "Shiv Sena",         constituency: "Chembur",
    education: "8th Pass — 9th Fail, Adarsha Vidyamandir, Ghatla, Chembur",
    biography: "Tukaram Ramkrushna Kate is a veteran Shiv Sena politician, agriculturalist and social worker from Chembur. He has contested Maharashtra Assembly elections since 2009 and draws a pension from the Maharashtra Legislature.",
    mynetaId: "870",
    assets: {
      movable:   4203862,
      immovable: 21700262,
      total:     4203862 + 21700262   // 25904124
    },
    politicalHistory: [
      { party: "Shiv Sena", position: "BMC Corporator — Chembur Ward", fromYear: 2007, toYear: 2012, notes: "Elected to Brihanmumbai Municipal Corporation." },
      { party: "Shiv Sena", position: "MLA — Chembur", fromYear: 2009, toYear: 2014, notes: "Won Maharashtra Assembly 2009. Declared 1 criminal case." },
      { party: "Shiv Sena", position: "Contested MLA — Chembur (Not elected)", fromYear: 2014, toYear: 2014, notes: "Contested 2014. Declared 3 criminal cases." },
      { party: "Shiv Sena", position: "Contested MLA — Chembur (Not elected)", fromYear: 2019, toYear: 2019, notes: "Contested 2019. Assets ~\u20B92.72 Cr." },
      { party: "Shiv Sena (Eknath Shinde)", position: "MLA — Chembur", fromYear: 2024, toYear: 0, notes: "Won 2024 Maharashtra Assembly election. Assets ~\u20B92.59 Cr." }
    ],
    criminalCases: [
      {
        description: "FIR No. 241/2009 — Azad Maidan Police Station. Case No. 898/2019, City Civil Sessions Court Mumbai (Addl. Sessions Judge, Court No. 54). Charges: IPC Sec 141 (Unlawful assembly), 142, 143, 146 (Rioting), 147, 149, 353 (Assault on public servant), 342 (Wrongful confinement), 427 (Mischief). Charges framed 04 Mar 2010. Case pending. No appeal filed.",
        status: "Pending",
        source: MYNETA + "870"
      }
    ],
    sources: [
      { title: "MyNeta — Tukaram Kate (Maharashtra 2024)", link: MYNETA + "870" },
      { title: "Election Commission of India — Affidavit Archive", link: ECI },
      { title: "Association for Democratic Reforms (ADR)", link: ADR },
      { title: "MyNeta.info — Open Election Data Platform", link: MNHOME }
    ]
  },
  {
    name: "Murji Patel (Kaka)", slug: "murji-patel-kaka",
    party: "Shiv Sena",         constituency: "Andheri East",
    education: "8th Pass — 9th Std., Y J S Gujarati Night High School, Tardeo, Mumbai (1990)",
    biography: "Murji Patel, known as 'Kaka', is a professional service provider and Shiv Sena MLA from Andheri East. He won the seat in 2019 and retained it in 2024, known for his constituent-first approach.",
    mynetaId: "1911",
    assets: {
      movable:   28476477,
      immovable: 119171066,
      total:     28476477 + 119171066  // 147647543
    },
    politicalHistory: [
      { party: "Shiv Sena", position: "Party Worker / Local Leader", fromYear: 2010, toYear: 2019, notes: "Active Shiv Sena worker and local leader in Andheri East." },
      { party: "Shiv Sena", position: "MLA — Andheri East", fromYear: 2019, toYear: 2024, notes: "First MLA win. 0 criminal cases. Assets ~\u20B96.39 Cr." },
      { party: "Shiv Sena (Eknath Shinde)", position: "MLA — Andheri East", fromYear: 2024, toYear: 0, notes: "Re-elected 2024. 1 pending FIR (forgery). Assets ~\u20B914.76 Cr." }
    ],
    criminalCases: [
      {
        description: "FIR No. 0049/2024 — Shahu Nagar Police Station, Mumbai. Charges: IPC Sec 464 (Making a false document), 465 (Forgery), 471 (Using forged document as genuine). Criminal Writ Petition No. 2085 of 2024 filed in Bombay High Court.",
        status: "Pending",
        source: MYNETA + "1911"
      }
    ],
    sources: [
      { title: "MyNeta — Murji Patel Kaka (Maharashtra 2024)", link: MYNETA + "1911" },
      { title: "Election Commission of India — Affidavit Archive", link: ECI },
      { title: "Association for Democratic Reforms (ADR)", link: ADR },
      { title: "MyNeta.info — Open Election Data Platform", link: MNHOME }
    ]
  },
  {
    name: "Adv. Ashish Shelar", slug: "ashish-shelar",
    party: "BJP",                constituency: "Bandra West",
    education: "LLB — G.A. Advani College (1995); B.Sc — Parle College (1992)",
    biography: "Adv. Ashish Shelar is a four-term BJP MLA from Bandra West. He served as Maharashtra's School Education & Sports Minister under Devendra Fadnavis. A prominent Mumbai BJP leader.",
    mynetaId: "246",
    assets: {
      movable:   188108965,
      immovable: 216776000,
      total:     188108965 + 216776000  // 404884965
    },
    politicalHistory: [
      { party: "BJP", position: "BJP Youth Wing (BJYM) Leader — Mumbai", fromYear: 1995, toYear: 2008, notes: "Rose through BJP ranks in Mumbai." },
      { party: "BJP", position: "MLA — Bandra West (Vandre West)", fromYear: 2009, toYear: 2014, notes: "First MLA win. Assets ~\u20B91.66 Cr." },
      { party: "BJP", position: "MLA & School Education Minister — Maharashtra", fromYear: 2014, toYear: 2019, notes: "Cabinet Minister in Fadnavis govt. Assets ~\u20B95 Cr." },
      { party: "BJP", position: "MLA — Bandra West (Vandre West)", fromYear: 2019, toYear: 2024, notes: "Third win. Assets ~\u20B914.61 Cr." },
      { party: "BJP", position: "MLA — Bandra West (Vandre West)", fromYear: 2024, toYear: 0, notes: "Fourth consecutive win. Assets ~\u20B940.48 Cr." }
    ],
    criminalCases: [
      {
        description: "FIR No. 315/2009 — Khar Police Station. Case No. 902068/2023 in Bandra Court. Charges: IPC Sec 341 (Wrongful restraint), 143, 145, 147 (Rioting), 149, 188. Also under Sec 37(3) and Sec 135 Bombay Police Act. Charges not yet framed. Case pending.",
        status: "Pending",
        source: MYNETA + "246"
      }
    ],
    sources: [
      { title: "MyNeta — Ashish Shelar (Maharashtra 2024)", link: MYNETA + "246" },
      { title: "Election Commission of India — Affidavit Archive", link: ECI },
      { title: "Association for Democratic Reforms (ADR)", link: ADR },
      { title: "MyNeta.info — Open Election Data Platform", link: MNHOME }
    ]
  }
];

// ── PARTIES ──────────────────────────────────────────────────────────────────

const partiesData = [
  {
    name: "Bharatiya Janata Party", slug: "bjp", abbreviation: "BJP",
    type: "National", foundedYear: 1980,
    foundedBy: "Atal Bihari Vajpayee & L.K. Advani",
    ideology: "Hindu nationalism, Social conservatism, Economic liberalism",
    symbol: "Lotus", headquarters: "New Delhi", colour: "#FF6600",
    description: "India's ruling national party and the world's largest political party by membership. Founded in 1980, it has governed India with a majority since 2014 under PM Narendra Modi.",
    electionHistory: [
      { year: 2014, election: "Maharashtra Assembly", seatsWon: 122, totalSeats: 288, notes: "Formed govt with Shiv Sena. Devendra Fadnavis became CM." },
      { year: 2019, election: "Maharashtra Assembly", seatsWon: 105, totalSeats: 288, notes: "Alliance with Shiv Sena broke. MVA govt formed." },
      { year: 2024, election: "Maharashtra Assembly", seatsWon: 132, totalSeats: 288, notes: "Part of Mahayuti (BJP+SS+NCP). Fadnavis became CM again." },
      { year: 2024, election: "Lok Sabha (National)",  seatsWon: 240, totalSeats: 543, notes: "NDA returned to power; BJP won 240 seats nationally." }
    ]
  },
  {
    name: "Shiv Sena (Eknath Shinde)", slug: "shiv-sena-shinde", abbreviation: "SS",
    type: "State", foundedYear: 2022,
    foundedBy: "Eknath Shinde (split from original Shiv Sena)",
    ideology: "Marathi regionalism, Hindu nationalism, Social conservatism",
    symbol: "Bow & Arrow (retained per ECI ruling)", headquarters: "Mumbai", colour: "#FF9900",
    description: "Emerged in June 2022 when CM Eknath Shinde rebelled against Uddhav Thackeray. ECI recognised this faction as the official Shiv Sena in 2023. Part of the ruling Mahayuti alliance.",
    electionHistory: [
      { year: 2022, election: "Maharashtra Govt Formation", seatsWon: 40, totalSeats: 55, notes: "Rebellion led by Shinde; formed govt with BJP. Shinde became CM." },
      { year: 2024, election: "Maharashtra Assembly",       seatsWon: 57, totalSeats: 288, notes: "Part of Mahayuti. Fadnavis (BJP) became CM." },
      { year: 2024, election: "Lok Sabha",                  seatsWon: 7,  totalSeats: 543, notes: "Won 7 seats from Maharashtra as part of NDA." }
    ]
  },
  {
    name: "Indian National Congress", slug: "inc", abbreviation: "INC",
    type: "National", foundedYear: 1885,
    foundedBy: "A.O. Hume, Dadabhai Naoroji, Dinshaw Wacha",
    ideology: "Social democracy, Secularism, Liberalism",
    symbol: "Hand (Palm)", headquarters: "New Delhi", colour: "#138808",
    description: "India's oldest major party, founded in 1885. It led the independence movement and governed India for most of the post-independence era. Part of the MVA opposition in Maharashtra.",
    electionHistory: [
      { year: 2019, election: "Maharashtra Assembly", seatsWon: 44,  totalSeats: 288, notes: "Part of MVA alliance. MVA formed govt." },
      { year: 2024, election: "Maharashtra Assembly", seatsWon: 16,  totalSeats: 288, notes: "Part of MVA opposition. Suffered significant losses." },
      { year: 2024, election: "Lok Sabha",            seatsWon: 99,  totalSeats: 543, notes: "INDIA alliance improved; Congress won 99 seats." }
    ]
  },
  {
    name: "NCP (Sharad Pawar)", slug: "ncp-sp", abbreviation: "NCP-SP",
    type: "State", foundedYear: 2023,
    foundedBy: "Sharad Pawar (split from original NCP)",
    ideology: "Social democracy, Agrarianism, Secularism",
    symbol: "Man blowing turha (retained per ECI)", headquarters: "Pune", colour: "#00BFFF",
    description: "Emerged after the 2023 NCP split when Ajit Pawar led a rival group into the ruling alliance. ECI recognised Sharad Pawar's faction. Part of the MVA opposition.",
    electionHistory: [
      { year: 2024, election: "Maharashtra Assembly", seatsWon: 10, totalSeats: 288, notes: "Part of MVA opposition. Won 10 seats." },
      { year: 2024, election: "Lok Sabha",            seatsWon: 8,  totalSeats: 543, notes: "Part of INDIA alliance. Won 8 seats from Maharashtra." }
    ]
  }
];

// ── ELECTION NOTICE ───────────────────────────────────────────────────────────

const noticeData = {
  title:        "MyFirstVote Mumbai — Upcoming Election Information",
  electionDate: "To Be Announced",
  votingStart:  "7:00 AM",
  votingEnd:    "6:00 PM",
  constituency: "Mumbai Suburban District (Kurla, Chembur, Andheri East, Bandra West)",
  resultDate:   "To Be Announced",
  description:  "Stay informed! Check your voter registration at voters.eci.gov.in | Helpline: 1950 | Use cVIGIL app to report MCC violations",
  isActive:     true
};

// ── SEED ─────────────────────────────────────────────────────────────────────

async function seed() {
  try {
    // Wipe existing data
    await Candidate.deleteMany({});
    await Party.deleteMany({});
    await ElectionNotice.deleteMany({});
    console.log("Cleared existing records.\n");

    // ── Insert candidates one-by-one using .save() ──
    // This ensures the Mongoose pre-save hook fires AND the explicit total values
    // are saved. Both belt-and-suspenders so total is NEVER 0.
    let count = 0;
    for (const data of candidatesData) {
      const c = await new Candidate(data).save();
      count++;
      const cr = (c.assets.total / 1e7).toFixed(2);
      console.log("  [" + count + "] " + c.name.padEnd(28) + " | Total: \u20B9" + cr + " Cr  (" + c.assets.movable + " + " + c.assets.immovable + ")");
    }
    console.log("\n\u2705 Seeded " + count + " candidates.\n");

    // ── Insert parties ──
    const parties = await Party.insertMany(partiesData);
    console.log("\u2705 Seeded " + parties.length + " parties:");
    parties.forEach(function(p) {
      console.log("   " + p.name.padEnd(40) + " [" + p.abbreviation + "] — " + p.type);
    });

    // ── Insert election notice ──
    const notice = await ElectionNotice.create(noticeData);
    console.log("\n\u2705 Seeded election notice: \"" + notice.title + "\"");
    console.log("\n\u2714  All done! Start server with:  node server.js");
    console.log("   Update election notice anytime via Admin Panel \u2192 Notices.");

  } catch (err) {
    console.error("\n\u274C Seed error:", err.message);
    if (err.code === 11000) {
      console.error("   Duplicate key error — drop the database first:");
      console.error("   mongosh myfirstvoteDB --eval \"db.dropDatabase()\"");
      console.error("   Then run seed.js again.");
    }
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
  }
}

seed();
