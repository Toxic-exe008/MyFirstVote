const mongoose = require("mongoose");

const partySchema = new mongoose.Schema({
  name:         { type: String, required: true },
  slug:         { type: String, unique: true, required: true },
  abbreviation: { type: String, required: true },  // e.g. "BJP", "SS"
  type: {
    type: String,
    enum: ["National","State","Regional","Alliance"],
    required: true
  },
  foundedYear:  Number,
  foundedBy:    String,
  ideology:     String,
  symbol:       String,    // election symbol name
  headquarters: String,
  colour:       { type: String, default: "#1e3a8a" },  // hex for UI badge
  description:  String,
  electionHistory: [{
    year:       Number,
    election:   String,    // e.g. "Maharashtra Assembly"
    seatsWon:   Number,
    totalSeats: Number,
    notes:      String
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

partySchema.index({ name: "text", abbreviation: "text" });
module.exports = mongoose.model("Party", partySchema);