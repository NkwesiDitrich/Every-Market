const express = require("express")
const router = express.Router()
const { verifyToken } = require("../middleware/VerifyToken")
const { requireAdmin, requireAuth } = require("../middleware/Authz")
const loyaltyPointController = require("../controllers/LoyaltyPoint")

router.get("/me", verifyToken, requireAuth, loyaltyPointController.listForUser)
router.get("/balance/:userId", verifyToken, requireAdmin, loyaltyPointController.getBalance)
router.get("/admin", verifyToken, requireAdmin, loyaltyPointController.listForAdmin)
router.post("/admin/adjust", verifyToken, requireAdmin, loyaltyPointController.adminAdjust)

module.exports = router
