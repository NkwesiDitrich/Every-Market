const Product = require("../models/Product");
const InventoryHistory = require("../models/InventoryHistory");
const inventoryHelper = require("../utils/inventoryHelper");
const { recordAuditLog } = require("../utils/auditHelper");

exports.updateStock = async (req, res) => {
    try {
        const { productId } = req.params;
        const { delta, type, note, isAbsolute } = req.body;
        const userId = req.user?._id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Authorization: Only seller of the product or admin
        if (!req.user?.isAdmin && String(product.seller) !== String(userId)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const previousStock = product.stockQuantity;
        let newStock = previousStock;

        if (isAbsolute) {
            newStock = delta;
        } else {
            newStock = previousStock + delta;
        }

        if (newStock < 0) {
            return res.status(400).json({ message: "Stock cannot be negative" });
        }

        product.stockQuantity = newStock;
        await product.save();

        // Audit Log
        recordAuditLog({
            user: userId,
            action: "UPDATE_INVENTORY",
            targetType: "Inventory",
            targetId: productId,
            description: `Stock for product ${product.title} updated from ${previousStock} to ${newStock}`,
            details: { previousStock, delta, newStock, type, note, isAbsolute }
        }, req);

        // Log History
        const history = new InventoryHistory({
            product: productId,
            user: userId,
            type: type || "adjustment",
            delta: req.body.isAbsolute ? (newStock - previousStock) : delta,
            previousStock,
            newStock,
            note: note || `Manual stock update (${type || 'adjustment'})`
        });
        await history.save();

        // Check for notifications via helper
        await inventoryHelper.checkAndNotifyStock(product);

        res.status(200).json({
            message: "Stock updated successfully",
            product: {
                _id: productId,
                stockQuantity: product.stockQuantity,
                stockStatus: product.stockStatus
            },
            history
        });

    } catch (error) {
        console.error("Update stock error:", error);
        res.status(500).json({ message: "Error updating stock" });
    }
};

exports.getHistoryByProductId = async (req, res) => {
    try {
        const { productId } = req.params;
        const history = await InventoryHistory.find({ product: productId })
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: "Error fetching inventory history" });
    }
};
