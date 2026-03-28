const mongoose = require("mongoose")
const { Schema } = mongoose

const notificationSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      trim: true,
    },
    targets: {
      type: String,
      enum: ["all", "buyers", "sellers", "admins", "user"],
      default: "user",
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["order", "payment", "product", "system", "dispute", "communication", "security", "finance", "marketing"],
      default: "system",
    },
    urgancy: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true, versionKey: false }
)

module.exports = mongoose.model("Notification", notificationSchema)
