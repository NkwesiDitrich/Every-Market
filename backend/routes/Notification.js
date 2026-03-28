const express = require("express")
const router = express.Router()
const { verifyToken } = require("../middleware/VerifyToken")
const { requireAdmin, requireAdminOrMarketing } = require("../middleware/Authz")
const notificationController = require("../controllers/Notification")

router.get("/me", verifyToken, notificationController.getByUser)
router.patch("/me/:id", verifyToken, notificationController.markAsRead)
router.patch("/me/all/mark-read", verifyToken, notificationController.markAllAsRead)

router.get("/admin", verifyToken, requireAdminOrMarketing, notificationController.getByUser) // Admins see their own too, or we can add a specific listForAdmin if needed
router.post("/admin", verifyToken, requireAdminOrMarketing, notificationController.create)
router.delete("/admin/:id", verifyToken, requireAdminOrMarketing, notificationController.deleteById)

module.exports = router
