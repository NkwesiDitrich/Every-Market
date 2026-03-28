const express = require("express")
const router = express.Router()
const bannerController = require("../controllers/Banner")
const { verifyToken } = require("../middleware/VerifyToken")
const { requireAdmin } = require("../middleware/Authz")
const { upload } = require("../config/cloudinary")

// public
router.get("/", bannerController.listPublic)

// admin
router.get("/admin", verifyToken, requireAdmin, bannerController.listForAdmin)
router.post("/admin", verifyToken, requireAdmin, upload.single("image"), bannerController.create)
router.patch("/admin/:id", verifyToken, requireAdmin, upload.single("image"), bannerController.updateById)
router.delete("/admin/:id", verifyToken, requireAdmin, bannerController.deleteById)

module.exports = router

