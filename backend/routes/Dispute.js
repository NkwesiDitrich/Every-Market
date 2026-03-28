const express = require("express")
const router = express.Router()
const { verifyToken } = require("../middleware/VerifyToken")
const { requireAuth, requireAdmin } = require("../middleware/Authz")
const disputeController = require("../controllers/Dispute")

// Buyer routes
router.post("/", verifyToken, requireAuth, disputeController.create)
router.get("/me", verifyToken, requireAuth, disputeController.getMyDisputes)
router.post("/:id/messages", verifyToken, requireAuth, disputeController.addMessage)
router.post("/:id/escalate", verifyToken, requireAuth, disputeController.escalate)

// Seller routes
router.get("/seller", verifyToken, requireAuth, disputeController.getSellerDisputes)
router.post("/seller/:id/messages", verifyToken, requireAuth, disputeController.addMessage)

// Admin routes
router.get("/admin", verifyToken, requireAdmin, disputeController.listForAdmin)
router.patch("/admin/:id", verifyToken, requireAdmin, disputeController.updateForAdmin)
router.post("/admin/:id/messages", verifyToken, requireAdmin, disputeController.addMessage)

module.exports = router

