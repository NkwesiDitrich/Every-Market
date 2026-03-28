const express = require("express");
const logisticsController = require("../controllers/Logistics");
const router = express.Router();

router.get("/track/:trackingNumber", logisticsController.getTrackingStatus);

module.exports = router;
