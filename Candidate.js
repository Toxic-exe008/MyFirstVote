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
    total:     { type: Number, default: 0 }   // auto-calculated by pre-save hook
  },

  // Career timeline — each entry is one role/tenure
  politicalHistory: [{
    party:    String,
    position: String,    // e.g. "MLA", "Education Minister", "BMC Corporator"
    fromYear: Number,
    toYear:   Number,    // leave null / 0 for "present"
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

// ── Auto-calculate total assets on every save ─────────────────────────────────
candidateSchema.pre("save", function (next) {
  this.assets.total = (this.assets.movable || 0) + (this.assets.immovable || 0);
  next();
});

candidateSchema.index({ name: "text", party: "text", constituency: "text" });
module.exports = mongoose.model("Candidate", candidateSchema);