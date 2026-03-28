const mongoose = require("mongoose")
const { Schema } = mongoose

const systemSettingsSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true, versionKey: false }
)

module.exports = mongoose.model("SystemSettings", systemSettingsSchema)
