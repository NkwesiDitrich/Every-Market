const SystemSettings = require("../models/SystemSettings")

const WELL_KNOWN_KEYS = [
  "defaultCurrency",
  "allowedCurrencies",
  "taxRate",
  "shippingFee",
  "paymentGateway",
  "termsUrl",
  "privacyUrl",
]

const getAllAsObject = async () => {
  const docs = await SystemSettings.find({}).lean().exec()
  const obj = {}
  for (const d of docs) {
    obj[d.key] = d.value
  }
  return obj
}

exports.get = async (req, res) => {
  try {
    const settings = await getAllAsObject()
    return res.status(200).json(settings)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching system settings" })
  }
}

exports.update = async (req, res) => {
  try {
    const body = req.body || {}
    for (const key of Object.keys(body)) {
      if (!WELL_KNOWN_KEYS.includes(key)) continue
      await SystemSettings.findOneAndUpdate(
        { key },
        { key, value: body[key] },
        { upsert: true, new: true }
      ).exec()
    }
    const settings = await getAllAsObject()
    return res.status(200).json(settings)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error updating system settings" })
  }
}
