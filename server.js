const express   = require("express");
const mongoose  = require("mongoose");
const cors      = require("cors");
const path      = require("path");

const app = express();

// ═══════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// ═══════════════════════════════════════════════
// DATABASE
// ═══════════════════════════════════════════════
mongoose.connect("mongodb://127.0.0.1:27017/issueTrackerDB")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ═══════════════════════════════════════════════
// MODELS
// ═══════════════════════════════════════════════
const Candidate      = require("./models/Candidate");
const Report         = require("./models/Report");
const Party          = require("./models/Party");
const AuditLog       = require("./models/AuditLog");
const ElectionNotice = require("./models/ElectionNotice");

// ═══════════════════════════════════════════════
// ADMIN AUTH MIDDLEWARE
// ═══════════════════════════════════════════════
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "VoteSmart@Admin2024";

function adminAuth(req, res, next) {
  const key = req.headers["x-admin-key"];
  if (!key || key !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// ═══════════════════════════════════════════════
// AUDIT LOG HELPER
// ═══════════════════════════════════════════════
async function audit(action, entity, entityId, entityName, details) {
  try {
    await AuditLog.create({ action, entity, entityId: String(entityId), entityName, details });
  } catch (e) {
    console.error("Audit log write error:", e.message);
  }
}

// ═══════════════════════════════════════════════
// AUTO-TOTAL HELPER (for findOneAndUpdate which skips pre-save hooks)
// ═══════════════════════════════════════════════
function calcTotal(assets) {
  if (!assets) return assets;
  assets.total = (Number(assets.movable) || 0) + (Number(assets.immovable) || 0);
  return assets;
}

// ═══════════════════════════════════════════════
// ── PUBLIC ROUTES ────────────────────────────────
// ═══════════════════════════════════════════════

// GET ALL CANDIDATES (optional ?constituency= filter)
app.get("/api/candidates", async (req, res) => {
  try {
    const filter = {};
    if (req.query.constituency) filter.constituency = req.query.constituency;
    res.json(await Candidate.find(filter).sort({ name: 1 }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ⚠️  SEARCH must be BEFORE /:slug
app.get("/api/candidates/search/:text", async (req, res) => {
  try {
    const rx = { $regex: req.params.text, $options: "i" };
    const data = await Candidate.find({ $or: [{ name: rx }, { party: rx }, { constituency: rx }] });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET ONE CANDIDATE BY SLUG
app.get("/api/candidates/:slug", async (req, res) => {
  try {
    const data = await Candidate.findOne({ slug: req.params.slug });
    if (!data) return res.status(404).json({ error: "Candidate not found" });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// SUBMIT REPORT (public)
app.post("/api/reports", async (req, res) => {
  try {
    const { pageId, message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    let candidateName = "";
    let partyName     = "";
    if (pageId) {
      const c = await Candidate.findById(pageId).lean();
      if (c) {
        candidateName = c.name;
        partyName     = c.party;
      }
    }

    // Generate unique human-readable ID based on candidate + party
    const count     = await Report.countDocuments();
    const nameSlug  = candidateName
      .toUpperCase()
      .replace(/\s+/g, "-")
      .replace(/[^A-Z0-9-]/g, "")
      .slice(0, 20);
    const partySlug = partyName
      .toUpperCase()
      .replace(/\s+/g, "-")
      .replace(/[^A-Z0-9-]/g, "")
      .slice(0, 10);
    const reportId  = `RPT-${partySlug}-${nameSlug}-${String(count + 1).padStart(4, "0")}`;

    const report = await Report.create({ pageId, message, candidateName, partyName, reportId });
    res.status(201).json({ success: true, reportId, report });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET ALL PARTIES (public)
app.get("/api/parties", async (req, res) => {
  try {
    res.json(await Party.find({ isActive: true }).sort({ name: 1 }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET ONE PARTY BY SLUG (public)
app.get("/api/parties/:slug", async (req, res) => {
  try {
    const p = await Party.findOne({ slug: req.params.slug });
    if (!p) return res.status(404).json({ error: "Party not found" });
    res.json(p);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET ACTIVE ELECTION NOTICE (public)
app.get("/api/election-notice", async (req, res) => {
  try {
    const notice = await ElectionNotice.findOne({ isActive: true }).sort({ createdAt: -1 });
    res.json(notice || null);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════
// ── ADMIN ROUTES  (all require x-admin-key header)
// ═══════════════════════════════════════════════

// ADMIN LOGIN CHECK
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) return res.json({ success: true });
  res.status(401).json({ error: "Invalid password" });
});

// ADMIN STATS DASHBOARD
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

// ── CANDIDATE CRUD ───────────────────────────────

app.post("/api/admin/candidates", adminAuth, async (req, res) => {
  try {
    const body = req.body;
    if (body.assets) body.assets = calcTotal(body.assets);
    const c = await new Candidate(body).save();
    await audit("CREATE", "Candidate", c._id, c.name, `Created candidate "${c.name}" in ${c.constituency}`);
    res.status(201).json(c);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put("/api/admin/candidates/:id", adminAuth, async (req, res) => {
  try {
    const body = req.body;
    if (body.assets) body.assets = calcTotal(body.assets);
    const c = await Candidate.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!c) return res.status(404).json({ error: "Not found" });
    await audit("UPDATE", "Candidate", c._id, c.name, `Updated candidate "${c.name}"`);
    res.json(c);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete("/api/admin/candidates/:id", adminAuth, async (req, res) => {
  try {
    const c = await Candidate.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({ error: "Not found" });
    await audit("DELETE", "Candidate", c._id, c.name, `Deleted candidate "${c.name}"`);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── PARTY CRUD ───────────────────────────────────

app.post("/api/admin/parties", adminAuth, async (req, res) => {
  try {
    const p = await new Party(req.body).save();
    await audit("CREATE", "Party", p._id, p.name, `Created party "${p.name}"`);
    res.status(201).json(p);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put("/api/admin/parties/:id", adminAuth, async (req, res) => {
  try {
    const p = await Party.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ error: "Not found" });
    await audit("UPDATE", "Party", p._id, p.name, `Updated party "${p.name}"`);
    res.json(p);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete("/api/admin/parties/:id", adminAuth, async (req, res) => {
  try {
    const p = await Party.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ error: "Not found" });
    await audit("DELETE", "Party", p._id, p.name, `Deleted party "${p.name}"`);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── REPORTS ADMIN ────────────────────────────────

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
    const update = { status };
    if (adminReply !== undefined) {
      update.adminReply = adminReply;
      update.repliedAt  = new Date();
    }
    const r = await Report.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!r) return res.status(404).json({ error: "Not found" });
    await audit("REPLY", "Report", r._id, r.candidateName || "Report",
      `[${r.reportId}] Status → ${status}${adminReply ? " + reply sent" : ""}`);
    res.json(r);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete("/api/admin/reports/:id", adminAuth, async (req, res) => {
  try {
    const r = await Report.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ error: "Not found" });
    await audit("DELETE", "Report", r._id, "Report",
      `Deleted report ${r.reportId || ""} from ${r.createdAt}`);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── ELECTION NOTICE ADMIN ────────────────────────

app.get("/api/admin/election-notices", adminAuth, async (req, res) => {
  try {
    res.json(await ElectionNotice.find().sort({ createdAt: -1 }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/admin/election-notices", adminAuth, async (req, res) => {
  try {
    // Deactivate all existing before creating new active one
    if (req.body.isActive) await ElectionNotice.updateMany({}, { isActive: false });
    const n = await ElectionNotice.create(req.body);
    await audit("CREATE", "ElectionNotice", n._id, n.title, `Created election notice "${n.title}"`);
    res.status(201).json(n);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put("/api/admin/election-notices/:id", adminAuth, async (req, res) => {
  try {
    if (req.body.isActive) await ElectionNotice.updateMany({ _id: { $ne: req.params.id } }, { isActive: false });
    const n = await ElectionNotice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!n) return res.status(404).json({ error: "Not found" });
    await audit("UPDATE", "ElectionNotice", n._id, n.title, `Updated election notice "${n.title}"`);
    res.json(n);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete("/api/admin/election-notices/:id", adminAuth, async (req, res) => {
  try {
    const n = await ElectionNotice.findByIdAndDelete(req.params.id);
    if (!n) return res.status(404).json({ error: "Not found" });
    await audit("DELETE", "ElectionNotice", n._id, n.title, `Deleted election notice`);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── AUDIT LOGS ───────────────────────────────────

app.get("/api/admin/audit-logs", adminAuth, async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 200);
    res.json(logs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));