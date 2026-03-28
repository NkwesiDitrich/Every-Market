const mongoose = require("mongoose")
const { Schema } = mongoose

const sellerProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    storeName: {
      type: String,
      required: true,
      trim: true,
    },
    logoUrl: {
      type: String,
    },
    description: {
      type: String,
      default: "",
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
    },
    contactPhone: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    commissionRate: {
      type: Number,
      default: 10, // percent
    },
  },
  { timestamps: true, versionKey: false }
)

module.exports = mongoose.model("SellerProfile", sellerProfileSchema)

