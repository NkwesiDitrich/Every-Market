const mongoose = require("mongoose")
const { Schema } = mongoose

const searchSettingsSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    defaultSort: {
      type: String,
      default: "createdAt",
      trim: true,
    },
    defaultOrder: {
      type: String,
      enum: ["asc", "desc"],
      default: "desc",
    },
    boostBrandIds: [{ type: Schema.Types.ObjectId, ref: "Brand" }],
    boostCategoryIds: [{ type: Schema.Types.ObjectId, ref: "Category" }],
  },
  { timestamps: true, versionKey: false }
)

// Single-doc pattern: use key "default" for the one settings doc
module.exports = mongoose.model("SearchSettings", searchSettingsSchema)
