const express   = require("express");
const mongoose  = require("mongoose");
const cors      = require("cors");
const path      = require("path");

const app = express();

// ═══════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════
app.use(express.json());

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin:               "*",
  methods:              ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders:       ["Content-Type","x-admin-key"],
  credentials:          false,
  preflightContinue:    false,
  optionsSuccessStatus: 204
}));

// ── STATIC FILES ─────────────────────────────────────────────────────────────
// Serve HTML/CSS/JS from the repo root (same folder as server.js).
// GitHub Pages also serves from the repo root — both stay in sync.
app.use(express.static(path.join(__dirname)));

// ═══════════════════════════════════════════════
// DATABASE
// ─────────────────────────────────────────────
// LOCAL:  mongodb://127.0.0.1:27017/myfirstvoteDB
// RENDER: MONGODB_URI environment variable  →  MongoDB Atlas
//
// Set MONGODB_URI in Render's Environment settings:
//   mongodb+srv://TOXIC:TOXIC%401120@cluster0.fjg4ntg.mongodb.net/myfirstvoteDB?retryWrites=true&w=majority&appName=Cluster0
// ═══════════════════════════════════════════════
const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/myfirstvoteDB";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅  MongoDB connected  →  " + MONGO_URI.split("@").pop()))
  .catch(err => {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1);
  });

// ═══════════════════════════════════════════════
// MODELS
// ═══════════════════════════════════════════════
const Candidate      = require("./models/Candidate");
const Report         = require("./models/Report");
const Party          = require("./models/Party");
const AuditLog       = require("./models/AuditLog");
const ElectionNotice = require("./models/ElectionNotice");

// ═══════════════════════════════════════════════
// ADMIN AUTH
// ═══════════════════════════════════════════════
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "MyFirstVote@Admin2026";

function adminAuth(req, res, next) {
  const key = req.headers["x-admin-key"];
  if (!key || key !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized — wrong or missing admin key" });
  }
  next();
}

// ═══════════════════════════════════════════════
// AUDIT LOG HELPER
// ═══════════════════════════════════════════════
async function audit(action, entity, entityId, entityName, details) {
  try {
    await AuditLog.create({
      action,
      entity,
      entityId:   String(entityId  || ""),
      entityName: String(entityName || ""),
      details:    String(details    || "")
    });
  } catch (e) {
    console.error("Audit write error:", e.message);
  }
}

// ═══════════════════════════════════════════════
// ASSET TOTAL HELPER
// ═══════════════════════════════════════════════
function calcTotal(assets) {
  if (!assets) return { movable: 0, immovable: 0, total: 0 };
  const m = Number(assets.movable)   || 0;
  const i = Number(assets.immovable) || 0;
  return { movable: m, immovable: i, total: m + i };
}

// ═══════════════════════════════════════════════
// docs ROUTES
// ═══════════════════════════════════════════════

app.get("/api/candidates", async (req, res) => {
  try {
    const filter = {};
    if (req.query.constituency) filter.constituency = req.query.constituency;
    res.json(await Candidate.find(filter).sort({ name: 1 }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ⚠️  MUST be before /:slug
app.get("/api/candidates/search/:text", async (req, res) => {
  try {
    const rx   = { $regex: req.params.text, $options: "i" };
    const data = await Candidate.find({
      $or: [{ name: rx }, { party: rx }, { constituency: rx }]
    });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/candidates/:slug", async (req, res) => {
  try {
    const c = await Candidate.findOne({ slug: req.params.slug });
    if (!c) return res.status(404).json({ error: "Candidate not found" });
    res.json(c);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/reports", async (req, res) => {
  try {
    const { pageId, pageType, message, entitySlug } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }
    let candidateName = "";
    let resolvedSlug  = entitySlug || "";
    if (pageId) {
      if (pageType === "Party") {
        const p = await Party.findById(pageId).lean();
        if (p) { candidateName = p.name; resolvedSlug = p.slug || p.abbreviation || ""; }
      } else {
        const c = await Candidate.findById(pageId).lean();
        if (c) { candidateName = c.name; resolvedSlug = c.slug; }
      }
    }
    const report = await new Report({
      pageId:        pageId || null,
      pageType:      pageType || "Candidate",
      message:       message.trim(),
      candidateName: candidateName,
      entitySlug:    resolvedSlug
    }).save();
    res.status(201).json({ success: true, reportId: report.reportId, report });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/parties", async (req, res) => {
  try {
    res.json(await Party.find({ isActive: true }).sort({ name: 1 }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/parties/:slug", async (req, res) => {
  try {
    const p = await Party.findOne({ slug: req.params.slug });
    if (!p) return res.status(404).json({ error: "Party not found" });
    res.json(p);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/election-notice", async (req, res) => {
  try {
    const notice = await ElectionNotice
      .findOne({ isActive: true })
      .sort({ updatedAt: -1 });
    res.json(notice || null);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════

app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) return res.json({ success: true });
  res.status(401).json({ error: "Invalid password" });
});

app.get("/api/admin/stats", adminAuth, async (req, res) => {
  try {
    const [candidates, parties, reports, pendingReports, logs] = await Promise.all([
      Candidate.countDocuments(),
      Party.countDocuments({ isActive: true }),
      Report.countDocuments(),
      Report.countDocuments({ status: "pending" }),
      AuditLog.countDocuments()
    ]);
    res.json({ candidates, parties, reports, pendingReports, logs });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── CANDIDATE CRUD ───────────────────────────────────────────────────────────

app.post("/api/admin/candidates", adminAuth, async (req, res) => {
  try {
    const body  = Object.assign({}, req.body);
    body.assets = calcTotal(body.assets);
    const c     = await new Candidate(body).save();
    await audit("CREATE", "Candidate", c._id, c.name, "Created in " + c.constituency);
    res.status(201).json(c);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put("/api/admin/candidates/:id", adminAuth, async (req, res) => {
  try {
    const body  = Object.assign({}, req.body);
    body.assets = calcTotal(body.assets);
    const c = await Candidate.findByIdAndUpdate(
      req.params.id, { $set: body }, { new: true, runValidators: true }
    );
    if (!c) return res.status(404).json({ error: "Candidate not found" });
    await audit("UPDATE", "Candidate", c._id, c.name, "Updated candidate record");
    res.json(c);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete("/api/admin/candidates/:id", adminAuth, async (req, res) => {
  try {
    const c = await Candidate.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({ error: "Candidate not found" });
    await audit("DELETE", "Candidate", c._id, c.name, "Deleted candidate");
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── PARTY CRUD ───────────────────────────────────────────────────────────────

app.post("/api/admin/parties", adminAuth, async (req, res) => {
  try {
    const p = await new Party(req.body).save();
    await audit("CREATE", "Party", p._id, p.name, "Created [" + p.abbreviation + "]");
    res.status(201).json(p);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put("/api/admin/parties/:id", adminAuth, async (req, res) => {
  try {
    const p = await Party.findByIdAndUpdate(
      req.params.id, { $set: req.body }, { new: true, runValidators: true }
    );
    if (!p) return res.status(404).json({ error: "Party not found" });
    await audit("UPDATE", "Party", p._id, p.name, "Updated party");
    res.json(p);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete("/api/admin/parties/:id", adminAuth, async (req, res) => {
  try {
    const p = await Party.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ error: "Party not found" });
    await audit("DELETE", "Party", p._id, p.name, "Deleted party");
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── REPORTS ADMIN ────────────────────────────────────────────────────────────

app.get("/api/admin/reports", adminAuth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    res.json(await Report.find(filter).sort({ createdAt: -1 }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/admin/reports/:id", adminAuth, async (req, res) => {
  try {
    const { status, adminReply } = req.body;
    const update = {};
    if (status) update.status = status;
    if (adminReply !== undefined && adminReply !== null) {
      update.adminReply = adminReply;
      update.repliedAt  = new Date();
    }
    const r = await Report.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!r) return res.status(404).json({ error: "Report not found" });
    await audit("REPLY", "Report", r._id, r.reportId || "Report",
      "Status: " + status + (adminReply ? " + reply added" : ""));
    res.json(r);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete("/api/admin/reports/:id", adminAuth, async (req, res) => {
  try {
    const r = await Report.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ error: "Report not found" });
    await audit("DELETE", "Report", r._id, r.reportId || "Report", "Deleted report");
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── ELECTION NOTICES ADMIN ───────────────────────────────────────────────────

app.get("/api/admin/election-notices", adminAuth, async (req, res) => {
  try {
    res.json(await ElectionNotice.find().sort({ createdAt: -1 }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/admin/election-notices", adminAuth, async (req, res) => {
  try {
    if (req.body.isActive) {
      await ElectionNotice.updateMany({}, { $set: { isActive: false } });
    }
    const n = await ElectionNotice.create(req.body);
    await audit("CREATE", "ElectionNotice", n._id, n.title, "Created election notice");
    res.status(201).json(n);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put("/api/admin/election-notices/:id", adminAuth, async (req, res) => {
  try {
    if (req.body.isActive) {
      await ElectionNotice.updateMany(
        { _id: { $ne: req.params.id } }, { $set: { isActive: false } }
      );
    }
    const n = await ElectionNotice.findByIdAndUpdate(
      req.params.id, { $set: req.body }, { new: true }
    );
    if (!n) return res.status(404).json({ error: "Notice not found" });
    await audit("UPDATE", "ElectionNotice", n._id, n.title,
      "Updated — date: " + n.electionDate);
    res.json(n);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete("/api/admin/election-notices/:id", adminAuth, async (req, res) => {
  try {
    const n = await ElectionNotice.findByIdAndDelete(req.params.id);
    if (!n) return res.status(404).json({ error: "Notice not found" });
    await audit("DELETE", "ElectionNotice", n._id, n.title, "Deleted notice");
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── AUDIT LOGS ───────────────────────────────────────────────────────────────

app.get("/api/admin/audit-logs", adminAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 200, 500);
    res.json(await AuditLog.find().sort({ createdAt: -1 }).limit(limit));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("─────────────────────────────────────────");
  console.log("  MyFirstVote  →  http://localhost:" + PORT);
  console.log("  Admin Panel  →  http://localhost:" + PORT + "/admin.html");
  console.log("  Admin Pass   →  " + ADMIN_PASSWORD);
  console.log("  DB URI       →  " + (MONGO_URI.includes("@")
    ? "Atlas: " + MONGO_URI.split("@").pop()
    : "Local: myfirstvoteDB"));
  console.log("─────────────────────────────────────────");
});
