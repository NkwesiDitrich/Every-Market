const express = require("express")
const router = express.Router()
const { verifyToken } = require("../middleware/VerifyToken")
const { requireAdmin } = require("../middleware/Authz")
const auditLogController = require("../controllers/AuditLog")

router.get("/", verifyToken, requireAdmin, auditLogController.getAll)

module.exports = router
