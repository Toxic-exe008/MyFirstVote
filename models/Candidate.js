const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  slug:         { type: String, unique: true, required: true },
  party:        { type: String, required: true },
  constituency: { type: String, required: true, enum: ["Kurla","Chembur","Andheri East","Bandra West"] },
  state:        { type: String, default: "Maharashtra" },
  city:         { type: String, default: "Mumbai" },
  biography:    String,
  education:    String,
  mynetaId:     { type: String, default: "" },

  assets: {
    movable:   { type: Number, default: 0 },
    immovable: { type: Number, default: 0 },
    total:     { type: Number, default: 0 }
  },

  politicalHistory: [{
    party:    String,
    position: String,
    fromYear: Number,
    toYear:   Number,
    notes:    String
  }],

  criminalCases: [{
    description: String,
    status: {
      type: String,
      enum: ["Alleged","Investigated","Chargesheeted","Convicted","Acquitted","Pending"]
    },
    source: String
  }],

  sources: [{
    title: String,
    link:  { type: String, required: true }
  }]
}, { timestamps: true });

// ── Pre-save: always compute total from movable + immovable ──────────────────
// This fires on every new Candidate().save() call.
// findByIdAndUpdate bypasses this — so server.js calcTotal() handles that case.
candidateSchema.pre("save", async function() {
  if (this.assets) {
    const m = Number(this.assets.movable)   || 0;
    const i = Number(this.assets.immovable) || 0;
    this.assets.movable   = m;
    this.assets.immovable = i;
    this.assets.total     = m + i;
  }
  });

candidateSchema.index({ name: "text", party: "text", constituency: "text" });
module.exports = mongoose.model("Candidate", candidateSchema);

