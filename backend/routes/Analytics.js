const express = require("express")
const router = express.Router()
const { verifyToken } = require("../middleware/VerifyToken")
const { requireAdmin, requireSeller } = require("../middleware/Authz")
const analyticsController = require("../controllers/Analytics")

router.get("/overview", verifyToken, requireAdmin, analyticsController.overview)
router.get("/sales", verifyToken, requireAdmin, analyticsController.sales)
router.get("/top-products", verifyToken, requireAdmin, analyticsController.topProducts)
router.get("/top-sellers", verifyToken, requireAdmin, analyticsController.topSellers)

// Advanced Analytics (Phase 3)
router.get("/advanced-stats", verifyToken, requireAdmin, analyticsController.getAdvancedAdminStats)
router.get("/reconciliation", verifyToken, requireAdmin, analyticsController.getReconciliationReport)
router.get("/seller-marketing", verifyToken, requireSeller, analyticsController.getSellerMarketingStats)

module.exports = router
