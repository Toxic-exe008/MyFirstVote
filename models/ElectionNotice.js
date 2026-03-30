const mongoose = require("mongoose");

const electionNoticeSchema = new mongoose.Schema({
  title:        { type: String, required: true },   // e.g. "Maharashtra Vidhan Sabha 2024"
  electionDate: { type: String, required: true },   // stored as string e.g. "20 November 2024"
  votingStart:  { type: String, default: "7:00 AM" },
  votingEnd:    { type: String, default: "6:00 PM" },
  description:  { type: String, default: "" },
  constituency: { type: String, default: "Mumbai Suburban" },
  resultDate:   { type: String, default: "" },
  isActive:     { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("ElectionNotice", electionNoticeSchema);