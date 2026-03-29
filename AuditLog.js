const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  action:     { type: String, required: true },  // CREATE, UPDATE, DELETE, REPLY
  entity:     { type: String, required: true },  // Candidate, Party, Report, ElectionNotice
  entityId:   { type: String, default: "" },
  entityName: { type: String, default: "" },
  details:    { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("AuditLog", auditLogSchema);