const mongoose = require("mongoose")
const { Schema } = mongoose

const conversationSchema = new Schema(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
)

conversationSchema.index({ buyer: 1, seller: 1 }, { unique: true })

module.exports = mongoose.model("Conversation", conversationSchema)
