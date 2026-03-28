const express = require('express');
const router = express.Router();
const inventoryController = require("../controllers/Inventory");
const { verifyToken } = require("../middleware/VerifyToken");

// Update stock (manual restock or adjustment)
router.patch("/:productId/update", verifyToken, inventoryController.updateStock);

// Get history for a product
router.get("/:productId/history", verifyToken, inventoryController.getHistoryByProductId);

module.exports = router;
