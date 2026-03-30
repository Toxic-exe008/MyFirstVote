const mongoose = require("mongoose");

// Generates a human-readable unique report ID.
// Format:  MFV-CAND-KUDALKAR-LP4KZ2  (candidate report)
//          MFV-PARTY-BJP-LP4KZ3       (party page report)
function generateReportId(entitySlug, type) {
  const kind     = (type === "Party") ? "PARTY" : "CAND";
  // Clean slug: keep only alphanumerics, uppercase, max 8 chars
  const slugPart = (entitySlug || "GEN")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
  // Base-36 timestamp suffix (6 chars) for uniqueness
  const ts = Date.now().toString(36).toUpperCase().slice(-6);
  return "MFV-" + kind + "-" + slugPart + "-" + ts;
}

const reportSchema = new mongoose.Schema({
  reportId:      { type: String, unique: true, sparse: true, default: "" },
  pageId:        { type: mongoose.Schema.Types.ObjectId, refPath: "pageType" },
  pageType:      { type: String, enum: ["Candidate","Party"], default: "Candidate" },
  candidateName: { type: String, default: "" },   // human label (candidate OR party name)
  entitySlug:    { type: String, default: "" },   // slug used for ID generation
  message:       { type: String, required: true },
  status:        { type: String, enum: ["pending","reviewed","resolved"], default: "pending" },
  adminReply:    { type: String, default: "" },
  repliedAt:     Date
}, { timestamps: true });

// Auto-generate reportId on first save if not already set
reportSchema.pre("save", function(next) {
  if (!this.reportId) {
    this.reportId = generateReportId(this.entitySlug, this.pageType);
  }
  next();
});

module.exports = mongoose.model("Report", reportSchema);
