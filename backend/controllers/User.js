const User = require("../models/User")

exports.getById = async (req, res) => {
    try {
        const { id } = req.params
        let user = await User.findById(id).exec()
        if (!user) return res.status(404).json({ message: "User not found" })
        if (!user.referralCode) {
            user.referralCode = "SH" + Math.random().toString(36).slice(2, 10).toUpperCase()
            await user.save()
        }
        const result = user.toObject()
        delete result.password
        res.status(200).json(result)

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error getting your details, please try again later' })
    }
}
exports.updateById = async (req, res) => {
    try {
        const { id } = req.params
        // Only allow safe self-service updates.
        // Admin promotion / verification should never be allowed from this endpoint.
        const allowedUpdates = {}
        if (typeof req.body?.name === "string") allowedUpdates.name = req.body.name
        if (typeof req.body?.email === "string") allowedUpdates.email = req.body.email
        if (typeof req.body?.profilePicture === "string") allowedUpdates.profilePicture = req.body.profilePicture

        const updated = (await User.findByIdAndUpdate(id, allowedUpdates, { new: true })).toObject()
        delete updated.password
        res.status(200).json(updated)

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error getting your details, please try again later' })
    }
}