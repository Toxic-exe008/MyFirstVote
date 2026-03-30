// seed.js  —  Run ONCE to populate the database:  node seed.js
//
// ⚠️  WARNING: This DELETES all existing candidates, parties and notices.
//    Only run this to reset to factory data.
//
// ✅  MongoDB is PERMANENT: stopping/starting "node server.js" NEVER resets data.
//    Only THIS script resets it. Admin panel changes persist across all restarts.

const mongoose       = require("mongoose");
const Candidate      = require("./models/Candidate");
const Party          = require("./models/Party");
const ElectionNotice = require("./models/ElectionNotice");

mongoose.connect("mongodb://127.0.0.1:27017/myfirstvoteDB")
  .then(() => console.log("MongoDB connected  →  myfirstvoteDB"))
  .catch(err => { console.error(err); process.exit(1); });

const MYNETA = "https://www.myneta.info/Maharashtra2024/candidate.php?candidate_id=";
const ECI    = "https://affidavitarchive.nic.in/";
const ADR    = "https://adrindia.org";
const MNHOME = "https://www.myneta.info/";

// ── CANDIDATES ───────────────────────────────────────────────────────────────
// We use individual .save() calls (NOT insertMany) so the pre-save hook fires
// and automatically calculates assets.total = movable + immovable.
// We ALSO set total explicitly below as a safety net.

const candidatesData = [
  {
    name: "Mangesh Kudalkar", slug: "mangesh-kudalkar",
    party: "Shiv Sena", constituency: "Kurla",
    education: "12th Pass — HSC, Maharashtra State Board (May 2023)",
    biography: "Mangesh Kudalkar is the sitting MLA from the reserved Kurla (SC) constituency representing Shiv Sena (Eknath Shinde faction). A grassroots politician connected with Kurla East for over two decades, he has been active in local governance and social work alongside his business ventures.",
    mynetaId: "1054",
    assets: { movable: 6759181, immovable: 68132800, total: 6759181 + 68132800 },
    politicalHistory: [
      { party: "Shiv Sena", position: "Party Worker / Social Worker", fromYear: 2000, toYear: 2014, notes: "Active Shiv Sena ground worker in Kurla for 14 years." },
      { party: "Shiv Sena", position: "MLA — Kurla (SC)", fromYear: 2014, toYear: 2019, notes: "First elected MLA from Kurla (SC). No criminal cases declared." },
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
    name: "Tukaram Kate", slug: "tukaram-kate",
    party: "Shiv Sena", constituency: "Chembur",
    education: "8th Pass — 9th Fail, Adarsha Vidyamandir, Ghatla, Chembur",
    biography: "Tukaram Ramkrushna Kate is a veteran Shiv Sena politician, agriculturalist and social worker from Chembur. He has contested Maharashtra Assembly elections since 2009 and draws a pension from the Maharashtra Legislative Assembly. Known for strong grassroots connect across Chembur.",
    mynetaId: "870",
    assets: { movable: 4203862, immovable: 21700262, total: 4203862 + 21700262 },
    politicalHistory: [
      { party: "Shiv Sena", position: "BMC Corporator — Chembur Ward", fromYear: 2007, toYear: 2012, notes: "Elected to Brihanmumbai Municipal Corporation. Declared 4 criminal cases (BMC 2012 affidavit)." },
      { party: "Shiv Sena", position: "MLA — Chembur", fromYear: 2009, toYear: 2014, notes: "Won Maharashtra Assembly 2009. Declared 1 criminal case." },
      { party: "Shiv Sena", position: "Contested MLA — Chembur (Not elected)", fromYear: 2014, toYear: 2014, notes: "Contested 2014 elections. Declared 3 criminal cases." },
      { party: "Shiv Sena", position: "Contested MLA — Chembur (Not elected)", fromYear: 2019, toYear: 2019, notes: "Contested 2019. Declared 1 criminal case. Assets ~\u20B92.72 Cr." },
      { party: "Shiv Sena (Eknath Shinde)", position: "MLA — Chembur", fromYear: 2024, toYear: 0, notes: "Won 2024 Maharashtra Assembly election. Assets ~\u20B92.59 Cr." }
    ],
    criminalCases: [
      {
        description: "FIR No. 241/2009 — Azad Maidan Police Station. Case No. 898/2019 in City Civil Sessions Court Mumbai (Addl. Sessions Judge, Court No. 54). Charges: IPC Sec 141 (Unlawful assembly), 142, 143, 146 (Rioting), 147, 149, 353 (Assault on public servant), 342 (Wrongful confinement), 427 (Mischief). Also under Sec 51 & 3, 7. Charges framed 04 Mar 2010. No appeal filed. Case pending.",
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
    party: "Shiv Sena", constituency: "Andheri East",
    education: "8th Pass — 9th Std., Y J S Gujarati Night High School, Tardeo, Mumbai (1990)",
    biography: "Murji Patel, known as 'Kaka', is a professional service provider and Shiv Sena MLA from Andheri East. He won the seat in 2019 and retained it in 2024. He is known for his constituent-first approach and strong local presence in Andheri East.",
    mynetaId: "1911",
    assets: { movable: 28476477, immovable: 119171066, total: 28476477 + 119171066 },
    politicalHistory: [
      { party: "Shiv Sena", position: "Party Worker / Local Leader", fromYear: 2010, toYear: 2019, notes: "Active Shiv Sena worker and local leader in Andheri East. Built strong support base." },
      { party: "Shiv Sena", position: "MLA — Andheri East", fromYear: 2019, toYear: 2024, notes: "First elected MLA from Andheri East. Declared 0 criminal cases. Assets ~\u20B96.39 Cr." },
      { party: "Shiv Sena (Eknath Shinde)", position: "MLA — Andheri East", fromYear: 2024, toYear: 0, notes: "Re-elected 2024. 1 pending FIR (forgery, Bombay HC writ filed). Assets ~\u20B914.76 Cr." }
    ],
    criminalCases: [
      {
        description: "FIR No. 0049/2024 — Shahu Nagar Police Station, Mumbai. Charges: IPC Sec 464 (Making a false document), 465 (Forgery), 471 (Using a forged document as genuine). Also under Sec 11(1)(a), 11(1)(b), 11(2). Charges not yet framed. Criminal Writ Petition (S.T) No. 2085 of 2024 filed in Bombay High Court. Appeal: Yes.",
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
    party: "BJP", constituency: "Bandra West",
    education: "LLB — G.A. Advani College (1995); B.Sc — Parle College (1992); HSC — Kirti College (1989)",
    biography: "Adv. Ashish Shelar is a lawyer-politician and four-term BJP MLA from Bandra West (Vandre West). He served as Maharashtra's School Education & Sports Minister under Devendra Fadnavis. A prominent Mumbai BJP leader known for his advocacy work and community engagement in the Bandra constituency.",
    mynetaId: "246",
    assets: { movable: 188108965, immovable: 216776000, total: 188108965 + 216776000 },
    politicalHistory: [
      { party: "BJP", position: "BJP Youth Wing (BJYM) Leader — Mumbai", fromYear: 1995, toYear: 2008, notes: "Rose through BJP's youth wing ranks in Mumbai for over a decade." },
      { party: "BJP", position: "MLA — Bandra West (Vandre West)", fromYear: 2009, toYear: 2014, notes: "First MLA win from Bandra West. Declared 3 criminal cases. Assets ~\u20B91.66 Cr." },
      { party: "BJP", position: "MLA & School Education Minister — Maharashtra", fromYear: 2014, toYear: 2019, notes: "Re-elected. Served as Cabinet Minister in Devendra Fadnavis' government. Assets ~\u20B95 Cr." },
      { party: "BJP", position: "MLA — Bandra West (Vandre West)", fromYear: 2019, toYear: 2024, notes: "Third consecutive win. Declared 3 criminal cases. Assets ~\u20B914.61 Cr." },
      { party: "BJP", position: "MLA — Bandra West (Vandre West)", fromYear: 2024, toYear: 0, notes: "Fourth consecutive win. 1 pending case (Khar PS FIR 315/2009). Assets ~\u20B940.48 Cr." }
    ],
    criminalCases: [
      {
        description: "FIR No. 315/2009 — Khar Police Station. Case No. 902068/2023 in Bandra Court. Charges: IPC Sec 341 (Wrongful restraint), 143 (Unlawful assembly), 145 (Joining unlawful assembly), 147 (Rioting), 149, 188 (Disobedience to public servant). Also under Sec 37(3) & Sec 135 Bombay Police Act. Charges not yet framed. No appeal filed. Case pending.",
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
    description: "India's ruling national party and the world's largest political party by membership. Founded in 1980 from the remnants of the Janata Party, it has governed India with a majority since 2014 under PM Narendra Modi.",
    electionHistory: [
      { year: 2014, election: "Maharashtra Assembly", seatsWon: 122, totalSeats: 288, notes: "Formed govt with Shiv Sena. Devendra Fadnavis became CM." },
      { year: 2019, election: "Maharashtra Assembly", seatsWon: 105, totalSeats: 288, notes: "Alliance with Shiv Sena broke. MVA govt formed instead." },
      { year: 2024, election: "Maharashtra Assembly", seatsWon: 132, totalSeats: 288, notes: "Part of Mahayuti (BJP+SS+NCP). Devendra Fadnavis became CM again." },
      { year: 2024, election: "Lok Sabha (National)", seatsWon: 240, totalSeats: 543, notes: "NDA returned to power; BJP won 240 seats nationally." }
    ]
  },
  {
    name: "Shiv Sena (Eknath Shinde)", slug: "shiv-sena-shinde", abbreviation: "SS",
    type: "State", foundedYear: 2022,
    foundedBy: "Eknath Shinde (split from original Shiv Sena)",
    ideology: "Marathi regionalism, Hindu nationalism, Social conservatism",
    symbol: "Bow & Arrow (retained per ECI ruling)", headquarters: "Mumbai", colour: "#FF9900",
    description: "Emerged in June 2022 when CM Eknath Shinde led a rebellion against Uddhav Thackeray. ECI recognised this faction as the official Shiv Sena in 2023. Part of the ruling Mahayuti alliance with BJP and NCP (Ajit Pawar).",
    electionHistory: [
      { year: 2022, election: "Maharashtra Govt Formation", seatsWon: 40, totalSeats: 55, notes: "Rebellion led by Shinde; formed govt with BJP. Shinde became CM." },
      { year: 2024, election: "Maharashtra Assembly", seatsWon: 57, totalSeats: 288, notes: "Part of Mahayuti. Won 57 seats. Fadnavis (BJP) became CM." },
      { year: 2024, election: "Lok Sabha", seatsWon: 7, totalSeats: 543, notes: "Contested as part of NDA. Won 7 seats from Maharashtra." }
    ]
  },
  {
    name: "Indian National Congress", slug: "inc", abbreviation: "INC",
    type: "National", foundedYear: 1885,
    foundedBy: "A.O. Hume, Dadabhai Naoroji, Dinshaw Wacha",
    ideology: "Social democracy, Secularism, Liberalism",
    symbol: "Hand (Palm)", headquarters: "New Delhi", colour: "#138808",
    description: "India's oldest major party, founded in 1885 and the driving force of the independence movement. In Maharashtra it is part of the Maha Vikas Aghadi (MVA) opposition alliance.",
    electionHistory: [
      { year: 2019, election: "Maharashtra Assembly", seatsWon: 44, totalSeats: 288, notes: "Part of MVA alliance. MVA formed govt." },
      { year: 2024, election: "Maharashtra Assembly", seatsWon: 16, totalSeats: 288, notes: "Part of MVA opposition. Suffered significant losses." },
      { year: 2024, election: "Lok Sabha", seatsWon: 99, totalSeats: 543, notes: "INDIA alliance improved; Congress won 99 seats nationally." }
    ]
  },
  {
    name: "NCP (Sharad Pawar)", slug: "ncp-sp", abbreviation: "NCP-SP",
    type: "State", foundedYear: 2023,
    foundedBy: "Sharad Pawar (split from original NCP)",
    ideology: "Social democracy, Agrarianism, Secularism",
    symbol: "Man blowing turha (retained by Pawar faction per ECI)", headquarters: "Pune", colour: "#00BFFF",
    description: "Emerged after the 2023 NCP split when Ajit Pawar led a rival group into the ruling alliance. ECI recognised Sharad Pawar's faction as a State party. They are part of the MVA opposition.",
    electionHistory: [
      { year: 2024, election: "Maharashtra Assembly", seatsWon: 10, totalSeats: 288, notes: "Part of MVA opposition. Won 10 seats." },
      { year: 2024, election: "Lok Sabha", seatsWon: 8, totalSeats: 543, notes: "Part of INDIA alliance. Won 8 seats from Maharashtra." }
    ]
  }
];

// ── ELECTION NOTICE (shown in homepage marquee) ──────────────────────────────
// Change this data and run seed.js OR update it via the Admin Panel
// (Admin → Election Notices → Edit → change dates → Save)

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
    // Wipe existing records
    await Candidate.deleteMany({});
    await Party.deleteMany({});
    await ElectionNotice.deleteMany({});
    console.log("Cleared existing records.\n");

    // Insert candidates using .save() so pre-save hook fires for asset total
    let count = 0;
    for (const data of candidatesData) {
      const c = await new Candidate(data).save();
      count++;
      console.log(
        "  [" + count + "] " + c.name.padEnd(25) +
        " | Total assets: \u20B9" + (c.assets.total / 1e7).toFixed(2) + " Cr"
      );
    }
    console.log("\nSeeded " + count + " candidates.\n");

    // Insert parties (insertMany is fine here — no asset hook needed)
    const parties = await Party.insertMany(partiesData);
    console.log("Seeded " + parties.length + " parties:");
    parties.forEach(p => console.log("  " + p.name + " [" + p.abbreviation + "]"));

    // Insert election notice
    const notice = await ElectionNotice.create(noticeData);
    console.log("\nSeeded election notice: \"" + notice.title + "\"");
    console.log("\n✅  Seed complete! Start server with:  node server.js");
    console.log("    Then update the election notice anytime via Admin Panel.");

  } catch (err) {
    console.error("\n❌  Seed error:", err.message);
    if (err.code === 11000) {
      console.error("    Duplicate key — try clearing the DB manually:");
      console.error("    mongosh myfirstvoteDB --eval 'db.dropDatabase()'");
    }
  } finally {
    mongoose.disconnect();
  }
}

seed();
