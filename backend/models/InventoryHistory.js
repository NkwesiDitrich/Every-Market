const mongoose = require("mongoose");
const { Schema } = mongoose;

const inventoryHistorySchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["restock", "sale", "adjustment", "return"],
        required: true
    },
    delta: {
        type: Number,
        required: true // e.g., +50 or -2
    },
    previousStock: {
        type: Number,
        required: true
    },
    newStock: {
        type: Number,
        required: true
    },
    note: {
        type: String,
        required: false
    },
    orderRef: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model("InventoryHistory", inventoryHistorySchema);
