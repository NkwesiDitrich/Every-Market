const express = require("express")
const router = express.Router()
const { verifyToken } = require("../middleware/VerifyToken")
const { requireAdmin } = require("../middleware/Authz")
const featuredCollectionController = require("../controllers/FeaturedCollection")

router.get("/", featuredCollectionController.listPublic)
router.get("/admin", verifyToken, requireAdmin, featuredCollectionController.listForAdmin)
router.post("/admin", verifyToken, requireAdmin, featuredCollectionController.create)
router.patch("/admin/:id", verifyToken, requireAdmin, featuredCollectionController.updateById)
router.delete("/admin/:id", verifyToken, requireAdmin, featuredCollectionController.deleteById)

module.exports = router
