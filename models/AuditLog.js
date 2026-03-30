const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  action:      { type: String, enum: ["CREATE","UPDATE","DELETE","REPLY"], required: true },
  entity:      { type: String, required: true },   // e.g. "Candidate", "Party", "Report"
  entityId:    { type: String, default: "" },
  entityName:  { type: String, default: "" },      // human-readable label
  details:     { type: String, default: "" },       // short description of what changed
  performedBy: { type: String, default: "Admin" }
}, {
  timestamps: true    // createdAt = the log timestamp
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
