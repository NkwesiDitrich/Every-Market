const express = require("express")
const router = express.Router()
const productController = require("../controllers/Product")
const { verifyToken } = require("../middleware/VerifyToken")
const { requireAdmin } = require("../middleware/Authz")

router.get("/", verifyToken, requireAdmin, productController.getAllAdmin)

module.exports = router

