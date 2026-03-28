const express = require("express")
const router = express.Router()
const { verifyToken } = require("../middleware/VerifyToken")
const conversationController = require("../controllers/Conversation")

router.post("/", verifyToken, conversationController.createOrSend)
router.get("/me", verifyToken, conversationController.getMyConversations)
router.get("/:conversationId/messages", verifyToken, conversationController.getMessages)
router.post("/:conversationId/messages", verifyToken, conversationController.sendMessage)

module.exports = router
