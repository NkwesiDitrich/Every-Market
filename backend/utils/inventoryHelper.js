const notificationController = require("../controllers/Notification");

/**
 * Checks product stock status and triggers notifications to the seller if stock is low or out.
 * This should be called AFTER the product stock has been updated in the database.
 * @param {Object} product - The populated product document.
 */
exports.checkAndNotifyStock = async (product) => {
    try {
        if (!product || !product.seller) return;

        // Note: The product status should already be updated by the pre-save hook 
        // if it was saved via product.save(). If not, we use the logic below.
        
        const status = product.stockQuantity <= 0 ? "out_of_stock" 
                     : product.stockQuantity <= product.lowStockThreshold ? "low_stock" 
                     : "in_stock";

        if (status === "out_of_stock") {
            await notificationController.createNotification({
                title: "⚠️ Out of Stock Alert",
                body: `Your product "${product.title}" is now out of stock. Immediate action needed.`,
                recipient: product.seller,
                type: "inventory",
                urgancy: "high",
                link: "/seller/products"
            });
        } else if (status === "low_stock") {
            await notificationController.createNotification({
                title: "⚠️ Low Stock Alert",
                body: `Only ${product.stockQuantity} items left for "${product.title}". Consider restocking soon.`,
                recipient: product.seller,
                type: "inventory",
                urgancy: "medium",
                link: "/seller/products"
            });
        }
    } catch (error) {
        console.error("Stock notification error:", error);
    }
};

/**
 * Atomically decrements stock and logs the movement in InventoryHistory.
 * @param {string} productId - ID of the product.
 * @param {number} quantity - Quantity being sold.
 * @param {Object} order - The Order object (used for reference).
 * @param {Object} session - Mongoose session for transaction.
 */
exports.decrementStockAndLog = async (productId, quantity, order, session) => {
    const Product = require("../models/Product");
    const InventoryHistory = require("../models/InventoryHistory");

    const updated = await Product.findOneAndUpdate(
        { _id: productId, isDeleted: false, stockQuantity: { $gte: quantity } },
        { $inc: { stockQuantity: -quantity } },
        { new: true, session }
    ).exec();

    if (!updated) {
        throw new Error("Insufficient stock");
    }

    const history = new InventoryHistory({
        product: productId,
        user: updated.seller,
        type: "sale",
        delta: -quantity,
        previousStock: updated.stockQuantity + quantity,
        newStock: updated.stockQuantity,
        note: `Order #${order._id.toString().slice(-6).toUpperCase()} sale`,
        orderRef: order._id
    });
    await history.save({ session });

    // Trigger notifications (non-blocking)
    exports.checkAndNotifyStock(updated).catch(e => console.error("Stock notification error:", e));

    return updated;
};
