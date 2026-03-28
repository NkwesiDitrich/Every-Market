const express = require("express")
const router = express.Router()
const { verifyToken } = require("../middleware/VerifyToken")
const { requireAdmin } = require("../middleware/Authz")
const adminUserController = require("../controllers/AdminUser")

router.get("/", verifyToken, requireAdmin, adminUserController.list)
router.patch("/:id", verifyToken, requireAdmin, adminUserController.update)

module.exports = router

