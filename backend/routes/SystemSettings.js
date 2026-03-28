const express = require("express")
const router = express.Router()
const { verifyToken } = require("../middleware/VerifyToken")
const { requireAdmin } = require("../middleware/Authz")
const systemSettingsController = require("../controllers/SystemSettings")

router.get("/", verifyToken, requireAdmin, systemSettingsController.get)
router.patch("/", verifyToken, requireAdmin, systemSettingsController.update)

module.exports = router
