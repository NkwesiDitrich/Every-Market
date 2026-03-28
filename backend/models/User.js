const mongoose = require("mongoose")
const { Schema } = mongoose

const generateReferralCode = () =>
    "SH" + Math.random().toString(36).slice(2, 10).toUpperCase()

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: function () { return !this.googleId && !this.facebookId }
    },
    googleId: { type: String, sparse: true, unique: true },
    facebookId: { type: String, sparse: true, unique: true },
    role: {
        type: String,
        enum: ['buyer', 'seller', 'admin', 'support', 'marketing'],
        default: 'buyer'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    referralCode: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    referredBy: { type: Schema.Types.ObjectId, ref: "User" },
    twoFactorEnabled: { type: Boolean, default: false },
    profilePicture: { type: String, default: null }
})

module.exports = mongoose.model("User", userSchema)