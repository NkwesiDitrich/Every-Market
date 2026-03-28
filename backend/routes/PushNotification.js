const express = require("express");
const pushController = require("../controllers/PushNotification");
const router = express.Router();
const { verifyToken } = require("../middleware/VerifyToken");

router.post("/subscribe", verifyToken, pushController.subscribe);
router.post("/unsubscribe", pushController.unsubscribe);

module.exports = router;
