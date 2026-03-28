const mongoose = require("mongoose")
const { Schema } = mongoose

const productEventSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ["view", "add_to_cart", "purchase"],
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    sessionId: {
      type: String,
      default: null,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
)

productEventSchema.index({ product: 1, eventType: 1, createdAt: -1 })

module.exports = mongoose.model("ProductEvent", productEventSchema)
