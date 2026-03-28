const express = require("express")
const router = express.Router()
const { verifyToken } = require("../middleware/VerifyToken")
const { requireAdmin } = require("../middleware/Authz")
const searchSettingsController = require("../controllers/SearchSettings")

router.get("/", verifyToken, requireAdmin, searchSettingsController.get)
router.patch("/", verifyToken, requireAdmin, searchSettingsController.update)

module.exports = router
