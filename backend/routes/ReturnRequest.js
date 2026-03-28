const express = require("express")
const router = express.Router()
const { verifyToken } = require("../middleware/VerifyToken")
const { requireAdmin, requireAuth } = require("../middleware/Authz")
const returnRequestController = require("../controllers/ReturnRequest")

// Buyer routes
router.post("/", verifyToken, requireAuth, returnRequestController.create)
router.get("/me", verifyToken, requireAuth, returnRequestController.getMyReturns)

// Admin routes
router.get("/admin", verifyToken, requireAdmin, returnRequestController.listForAdmin)
router.patch("/admin/:id", verifyToken, requireAdmin, returnRequestController.updateForAdmin)

// Seller routes
const { requireSeller } = require("../middleware/Authz")
router.get("/seller", verifyToken, requireSeller, returnRequestController.listForSeller)
router.patch("/seller/:id", verifyToken, requireSeller, returnRequestController.updateForSeller)

module.exports = router
