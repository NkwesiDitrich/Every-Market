const mongoose = require("mongoose");
const { Schema } = mongoose;

const pushSubscriptionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subscription: {
        type: Schema.Types.Mixed, // The subscription object from the browser
        required: true
    },
    deviceType: {
        type: String,
        enum: ["mobile", "desktop", "tablet"],
        default: "desktop"
    }
}, { timestamps: true });

module.exports = mongoose.model("PushSubscription", pushSubscriptionSchema);
