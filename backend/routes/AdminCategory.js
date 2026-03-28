const express = require("express")
const router = express.Router()
const { verifyToken } = require("../middleware/VerifyToken")
const { requireAdmin } = require("../middleware/Authz")
const adminCategoryController = require("../controllers/AdminCategory")

router.get("/", verifyToken, requireAdmin, adminCategoryController.list)
router.post("/", verifyToken, requireAdmin, adminCategoryController.create)
router.patch("/:id", verifyToken, requireAdmin, adminCategoryController.updateById)
router.delete("/:id", verifyToken, requireAdmin, adminCategoryController.deleteById)

module.exports = router
