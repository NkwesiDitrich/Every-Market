const express = require("express")
const router = express.Router()
const { verifyToken } = require("../middleware/VerifyToken")
const { requireAdmin, requireSeller } = require("../middleware/Authz")
const sellerController = require("../controllers/Seller")
const sellerCouponController = require("../controllers/SellerCoupon")
const sellerBundleController = require("../controllers/SellerBundle")
const sellerMessageController = require("../controllers/SellerMessage")
const sellerReviewController = require("../controllers/SellerReview")

// Onboarding / profile
router.post("/apply", verifyToken, sellerController.apply)
router.get("/me", verifyToken, requireSeller, sellerController.getMyProfile)

// Seller products
router.get("/products", verifyToken, requireSeller, sellerController.listSellerProducts)
router.post("/products", verifyToken, requireSeller, sellerController.createSellerProduct)
router.patch("/products/:id", verifyToken, requireSeller, sellerController.updateSellerProduct)
router.delete("/products/:id", verifyToken, requireSeller, sellerController.deleteSellerProduct)

// Seller orders and analytics
router.get("/orders", verifyToken, requireSeller, sellerController.listSellerOrders)
router.get("/analytics/summary", verifyToken, requireSeller, sellerController.analyticsSummary)
router.get("/analytics/funnel", verifyToken, requireSeller, sellerController.analyticsFunnel)
router.get("/analytics/cohorts", verifyToken, requireSeller, sellerController.analyticsCohorts)

// Seller coupons (store coupons)
router.get("/coupons", verifyToken, requireSeller, sellerCouponController.listForSeller)
router.post("/coupons", verifyToken, requireSeller, sellerCouponController.createForSeller)
router.patch("/coupons/:id", verifyToken, requireSeller, sellerCouponController.updateForSeller)
router.delete("/coupons/:id", verifyToken, requireSeller, sellerCouponController.deleteForSeller)

// Seller bundles
router.get("/bundles", verifyToken, requireSeller, sellerBundleController.listForSeller)
router.post("/bundles", verifyToken, requireSeller, sellerBundleController.createForSeller)
router.patch("/bundles/:id", verifyToken, requireSeller, sellerBundleController.updateForSeller)
router.delete("/bundles/:id", verifyToken, requireSeller, sellerBundleController.deleteForSeller)

// Seller messaging (inbox)
router.get("/conversations", verifyToken, requireSeller, sellerMessageController.listConversations)
router.get("/conversations/:conversationId/messages", verifyToken, requireSeller, sellerMessageController.getMessages)
router.post("/conversations/:conversationId/messages", verifyToken, requireSeller, sellerMessageController.sendMessage)

// Seller reviews
router.get("/reviews", verifyToken, requireSeller, sellerReviewController.listForSeller)
router.patch("/reviews/:id/reply", verifyToken, requireSeller, sellerReviewController.replyToReview)

// Admin seller management
router.get("/admin", verifyToken, requireAdmin, sellerController.listForAdmin)
router.patch("/admin/:id", verifyToken, requireAdmin, sellerController.updateForAdmin)

module.exports = router

