const mongoose = require("mongoose")
const { Schema } = mongoose

const auditLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ["Order", "Product", "User", "Inventory", "Seller", "System"],
      required: true,
    },
    targetId: {
      type: Schema.Types.Mixed,
      required: false,
    },
    details: {
      type: Schema.Types.Mixed,
      required: false,
    },
    description: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("AuditLog", auditLogSchema)
