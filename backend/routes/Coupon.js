const express = require("express")
const router = express.Router()
const couponController = require("../controllers/Coupon")
const { verifyToken } = require("../middleware/VerifyToken")
const { requireAdmin } = require("../middleware/Authz")

// admin
router.get("/admin", verifyToken, requireAdmin, couponController.listForAdmin)
router.post("/admin", verifyToken, requireAdmin, couponController.create)
router.patch("/admin/:id", verifyToken, requireAdmin, couponController.updateById)
router.delete("/admin/:id", verifyToken, requireAdmin, couponController.deleteById)

// user (logged-in) – apply coupon to current cart
router.post("/apply", verifyToken, couponController.applyForUserCart)

module.exports = router

