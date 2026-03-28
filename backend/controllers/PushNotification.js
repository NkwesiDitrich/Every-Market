const PushSubscription = require("../models/PushSubscription");

exports.subscribe = async (req, res) => {
    try {
        const userId = req.user._id;
        const { subscription, deviceType } = req.body;

        // Check if subscription already exists for this user/device
        const existing = await PushSubscription.findOne({ user: userId, "subscription.endpoint": subscription.endpoint });
        if (existing) {
            return res.status(200).json({ message: "Already subscribed" });
        }

        const newSub = new PushSubscription({
            user: userId,
            subscription,
            deviceType
        });
        await newSub.save();
        res.status(201).json({ message: "Successfully subscribed" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error subscribing to push notifications" });
    }
};

exports.unsubscribe = async (req, res) => {
    try {
        const { endpoint } = req.body;
        await PushSubscription.findOneAndDelete({ "subscription.endpoint": endpoint });
        res.status(200).json({ message: "Successfully unsubscribed" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error unsubscribing" });
    }
};
