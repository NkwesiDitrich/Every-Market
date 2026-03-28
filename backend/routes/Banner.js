const express = require("express")
const router = express.Router()
const bannerController = require("../controllers/Banner")
const { verifyToken } = require("../middleware/VerifyToken")
const { requireAdmin } = require("../middleware/Authz")

// public
router.get("/", bannerController.listPublic)

// admin
router.get("/admin", verifyToken, requireAdmin, bannerController.listForAdmin)
router.post("/admin", verifyToken, requireAdmin, bannerController.create)
router.patch("/admin/:id", verifyToken, requireAdmin, bannerController.updateById)
router.delete("/admin/:id", verifyToken, requireAdmin, bannerController.deleteById)

module.exports = router

