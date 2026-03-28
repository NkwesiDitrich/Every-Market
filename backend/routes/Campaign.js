const express = require("express")
const router = express.Router()
const { verifyToken } = require("../middleware/VerifyToken")
const { requireAdmin, requireAdminOrMarketing } = require("../middleware/Authz")
const campaignController = require("../controllers/Campaign")

router.get("/admin", verifyToken, requireAdminOrMarketing, campaignController.listForAdmin)
router.post("/admin", verifyToken, requireAdminOrMarketing, campaignController.create)
router.patch("/admin/:id", verifyToken, requireAdminOrMarketing, campaignController.updateById)
router.delete("/admin/:id", verifyToken, requireAdminOrMarketing, campaignController.deleteById)

module.exports = router
