const mongoose = require("mongoose")
const { Schema } = mongoose

const bannerSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    linkUrl: {
      type: String,
    },
    priority: {
      type: Number,
      default: 0,
      index: true,
    },
    startsAt: {
      type: Date,
    },
    endsAt: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
)

module.exports = mongoose.model("Banner", bannerSchema)

