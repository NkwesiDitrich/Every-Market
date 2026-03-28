const mongoose = require("mongoose")
const { Schema } = mongoose

const disputeSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    itemIndex: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    evidence: {
      type: [String], // URLs to images/videos
      default: [],
    },
    messages: [
      {
        sender: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["buyer", "seller", "admin"],
          required: true,
        },
        body: {
          type: String,
          required: true,
          trim: true,
        },
        attachments: [String],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["open", "responded", "escalated", "under_review", "resolved", "closed"],
      default: "open",
      index: true,
    },
    resolution: {
      type: String,
      enum: ["refund", "replacement", "partial_refund", "other", null],
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
)

module.exports = mongoose.model("Dispute", disputeSchema)

