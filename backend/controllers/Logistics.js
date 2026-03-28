exports.getTrackingStatus = async (req, res) => {
    try {
        const { trackingNumber } = req.params;
        
        // Mock logic: 
        // If tracking number ends in '1' -> Shipped
        // If tracking number ends in '2' -> Out for Delivery
        // If tracking number ends in '3' -> Delivered
        // Otherwise -> Confirmed
        
        let status = "Confirmed";
        if (trackingNumber.endsWith("1")) status = "Shipped";
        else if (trackingNumber.endsWith("2")) status = "Out for Delivery";
        else if (trackingNumber.endsWith("3")) status = "Delivered";
        
        const mockResponse = {
            trackingNumber,
            carrier: "EveryExp",
            status,
            estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            milestones: [
                { status: "Confirmed", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
                { status: "Processing", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
            ]
        };

        if (status === "Shipped" || status === "Out for Delivery" || status === "Delivered") {
            mockResponse.milestones.push({ status: "Shipped", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() });
        }
        if (status === "Out for Delivery" || status === "Delivered") {
            mockResponse.milestones.push({ status: "Out for Delivery", timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() });
        }
        if (status === "Delivered") {
            mockResponse.milestones.push({ status: "Delivered", timestamp: new Date().toISOString() });
        }

        res.status(200).json(mockResponse);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching tracking status" });
    }
};
