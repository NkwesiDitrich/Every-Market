const mongoose = require("mongoose")
const { Schema } = mongoose

const loyaltyPointSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    points: {
      type: Number,
      required: true,
      default: 0,
    },
    reason: {
      type: String,
      enum: ["order", "redeem", "admin_adjust", "signup_bonus", "referral"],
      trim: true,
    },
    orderRef: { type: Schema.Types.ObjectId, ref: "Order" },
    delta: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, versionKey: false }
)

loyaltyPointSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model("LoyaltyPoint", loyaltyPointSchema)
