const mongoose = require("mongoose")
const { Schema } = mongoose

const productBundleSchema = new Schema(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    productIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    bundlePrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
)

productBundleSchema.index({ seller: 1 })

module.exports = mongoose.model("ProductBundle", productBundleSchema)
