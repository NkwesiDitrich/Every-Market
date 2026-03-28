const AuditLog = require("../models/AuditLog")

/**
 * Record an audit log entry for accountability.
 * @param {Object} params - The audit log parameters.
 * @param {string} params.user - The ID of the user performing the action.
 * @param {string} params.action - Short name for the action (e.g. "UPDATE_STATUS").
 * @param {string} params.targetType - Model name (e.g. "Order", "Product").
 * @param {string} [params.targetId] - ID of the target object.
 * @param {string} params.description - Human-readable description.
 * @param {Object} [params.details] - Any extra technical metadata.
 * @param {Object} [req] - Optional Express request for IP capture.
 */
exports.recordAuditLog = async ({ user, action, targetType, targetId, description, details }, req = null) => {
  try {
    const ipAddress = req?.ip || req?.headers?.["x-forwarded-for"] || null
    
    const log = new AuditLog({
      user,
      action,
      targetType,
      targetId,
      description,
      details,
      ipAddress
    })
    
    await log.save()
  } catch (error) {
    console.log("Audit log failed to save:", error)
    // We don't want to crash the main operation just because audit logging failed.
  }
}
