const mongoose = require("mongoose")
const { Schema } = mongoose

const campaignSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: true,
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
    },
    targetAudience: {
      type: String,
      enum: ["all", "new", "returning"],
      default: "all",
    },
    bannerId: { type: Schema.Types.ObjectId, ref: "Banner" },
    featuredCollectionId: { type: Schema.Types.ObjectId, ref: "FeaturedCollection" },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
)

module.exports = mongoose.model("Campaign", campaignSchema)
