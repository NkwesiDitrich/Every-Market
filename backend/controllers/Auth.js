const User = require("../models/User");
const bcrypt = require('bcryptjs');
const { sendMail } = require("../utils/Emails");
const { generateOTP } = require("../utils/GenerateOtp");
const Otp = require("../models/OTP");
const { sanitizeUser } = require("../utils/SanitizeUser");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generatePasswordResetToken, generate2FAToken } = require("../utils/GenerateToken");
const PasswordResetToken = require("../models/PasswordResetToken");
const ms = require("ms");
const RefreshToken = require("../models/RefreshToken");
const { newRefreshToken, hashToken } = require("../utils/RefreshTokens");
const notificationController = require("./Notification");

const cookieBase = () => ({
    sameSite: process.env.PRODUCTION === 'true' ? "None" : 'Lax',
    httpOnly: true,
    secure: process.env.PRODUCTION === 'true' ? true : false
})

const setAuthCookies = (res, accessToken, refreshToken) => {
    const accessMaxAge = ms(process.env.ACCESS_TOKEN_EXPIRATION || "15m");
    const refreshMaxAge = ms(process.env.REFRESH_TOKEN_EXPIRATION || "30d");

    res.cookie('token', accessToken, {
        ...cookieBase(),
        maxAge: typeof accessMaxAge === "number" ? accessMaxAge : (15 * 60 * 1000),
    })

    res.cookie('refreshToken', refreshToken, {
        ...cookieBase(),
        maxAge: typeof refreshMaxAge === "number" ? refreshMaxAge : (30 * 24 * 60 * 60 * 1000),
    })
}

exports.signup = async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email })

        // if user already exists
        if (existingUser) {
            return res.status(400).json({ "message": "User already exists" })
        }

        // hashing the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        req.body.password = hashedPassword

        // creating new user
        const referredByCode = req.body?.referralCode ? String(req.body.referralCode).toUpperCase().trim() : null
        let referredBy = null
        if (referredByCode) {
            const referrer = await User.findOne({ referralCode: referredByCode }).select("_id").lean().exec()
            if (referrer) referredBy = referrer._id
        }
        const LoyaltyPoint = require("../models/LoyaltyPoint");
        const payload = { ...req.body }
        delete payload.referralCode
        const createdUser = new User(payload)
        createdUser.referralCode = "SH" + Math.random().toString(36).slice(2, 10).toUpperCase()
        if (referredBy) createdUser.referredBy = referredBy
        await createdUser.save()
        if (referredBy) {
            const REFERRAL_BONUS = 50;
            await LoyaltyPoint.create({ user: referredBy, delta: REFERRAL_BONUS, points: 0, reason: "referral" }).catch(() => { });
        }

        // getting secure user info
        const secureInfo = sanitizeUser(createdUser)

        // generating auth tokens (short-lived access + rotating refresh)
        const accessToken = generateAccessToken(secureInfo)
        const refreshToken = newRefreshToken()

        const refreshTtlMs = ms(process.env.REFRESH_TOKEN_EXPIRATION || "30d")
        await RefreshToken.create({
            user: createdUser._id,
            tokenHash: hashToken(refreshToken),
            expiresAt: new Date(Date.now() + (typeof refreshTtlMs === "number" ? refreshTtlMs : (30 * 24 * 60 * 60 * 1000))),
            userAgent: req.get("user-agent"),
            ip: req.ip
        })

        setAuthCookies(res, accessToken, refreshToken)

        // Generate and send OTP automatically
        const otp = generateOTP()
        const hashedOtp = await bcrypt.hash(otp, 10)
        const newOtp = new Otp({
            user: createdUser._id,
            otp: hashedOtp,
            expiresAt: Date.now() + parseInt(process.env.OTP_EXPIRATION_TIME || 120000)
        })
        await newOtp.save()

        sendMail(
            createdUser.email,
            `OTP Verification for Your Every Market Account`,
            `Your One-Time Password (OTP) for account verification is: <b>${otp}</b>.</br>Do not share this OTP with anyone for security reasons`
        ).catch(err => console.error("Background Email Error (signup):", err))

        // Notify Admins
        try {
            await notificationController.createNotification({
                title: "New User Registered",
                body: `A new user ${createdUser.name} (${createdUser.email}) has joined.`,
                targets: ["admins"],
                type: "system",
                urgancy: "low",
                link: "/admin/users",
                createdBy: createdUser._id
            });
        } catch (notiErr) {
            console.log("Signup admin notification error:", notiErr)
        }

        res.status(201).json(sanitizeUser(createdUser))

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error occured during signup, please try again later" })
    }
}

exports.login = async (req, res) => {
    try {
        // checking if user exists or not
        const existingUser = await User.findOne({ email: req.body.email })

        // if exists, not banned, and password matches the hash
        if (existingUser && !existingUser.isBanned && (await bcrypt.compare(req.body.password, existingUser.password))) {

            if (existingUser.twoFactorEnabled) {
                const otp = generateOTP()
                const hashedOtp = await bcrypt.hash(otp, 10)
                await Otp.findOneAndUpdate(
                    { user: existingUser._id },
                    { otp: hashedOtp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
                    { upsert: true, new: true }
                )
                sendMail(
                    existingUser.email,
                    "Every Market - Login verification code",
                    `<p>Your verification code is: <strong>${otp}</strong></p><p>It expires in 5 minutes.</p>`
                ).catch(err => console.error("Background Email Error (login 2FA):", err))
                const tempToken = generate2FAToken({ purpose: "2fa", userId: existingUser._id, email: existingUser.email })
                return res.status(200).json({ needsOtp: true, tempToken })
            }

            const secureInfo = sanitizeUser(existingUser)
            const accessToken = generateAccessToken(secureInfo)
            const refreshToken = newRefreshToken()
            const refreshTtlMs = ms(process.env.REFRESH_TOKEN_EXPIRATION || "30d")
            await RefreshToken.create({
                user: existingUser._id,
                tokenHash: hashToken(refreshToken),
                expiresAt: new Date(Date.now() + (typeof refreshTtlMs === "number" ? refreshTtlMs : (30 * 24 * 60 * 60 * 1000))),
                userAgent: req.get("user-agent"),
                ip: req.ip
            })
            setAuthCookies(res, accessToken, refreshToken)
            return res.status(200).json(sanitizeUser(existingUser))
        }

        res.clearCookie('token');
        res.clearCookie('refreshToken');
        return res.status(404).json({ message: "Invalid Credentails" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Some error occured while logging in, please try again later' })
    }
}

exports.verifyOtp = async (req, res) => {
    try {
        const userId = req.user?._id
        // checks if user id is existing in the user collection
        const isValidUserId = await User.findById(userId)

        // if user id does not exists then returns a 404 response
        if (!isValidUserId) {
            return res.status(404).json({ message: 'User not Found, for which the otp has been generated' })
        }

        // checks if otp exists by that user id
        const isOtpExisting = await Otp.findOne({ user: isValidUserId._id })

        // if otp does not exists then returns a 404 response
        if (!isOtpExisting) {
            return res.status(404).json({ message: 'Otp not found' })
        }

        // checks if the otp is expired, if yes then deletes the otp and returns response accordinly
        if (isOtpExisting.expiresAt < new Date()) {
            await Otp.findByIdAndDelete(isOtpExisting._id)
            return res.status(400).json({ message: "Otp has been expired" })
        }

        // checks if otp is there and matches the hash value then updates the user verified status to true and returns the updated user
        if (isOtpExisting && (await bcrypt.compare(String(req.body.otp), isOtpExisting.otp))) {
            await Otp.findByIdAndDelete(isOtpExisting._id)
            const verifiedUser = await User.findByIdAndUpdate(isValidUserId._id, { isVerified: true }, { new: true })
            
            // Notify User
            try {
                await notificationController.createNotification({
                    title: "Account Verified",
                    body: "Your account has been successfully verified. Welcome to Shopora!",
                    recipient: verifiedUser._id,
                    type: "security",
                    urgancy: "medium",
                    link: "/profile",
                    createdBy: verifiedUser._id
                });
            } catch (notiErr) {
                console.log("Verification notification error:", notiErr)
            }

            return res.status(200).json(sanitizeUser(verifiedUser))
        }

        return res.status(400).json({ message: 'Otp is invalid or expired' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Some Error occured" })
    }
}

exports.verify2FA = async (req, res) => {
    try {
        const { tempToken, otp } = req.body || {}
        if (!tempToken || !otp) return res.status(400).json({ message: "tempToken and otp are required" })
        const decoded = jwt.verify(tempToken, process.env.SECRET_KEY)
        if (decoded.purpose !== "2fa" || !decoded.userId) return res.status(400).json({ message: "Invalid token" })
        const user = await User.findById(decoded.userId)
        if (!user) return res.status(404).json({ message: "User not found" })
        const otpDoc = await Otp.findOne({ user: user._id })
        if (!otpDoc || otpDoc.expiresAt < new Date()) {
            if (otpDoc) await Otp.findByIdAndDelete(otpDoc._id)
            return res.status(400).json({ message: "OTP expired" })
        }
        if (!(await bcrypt.compare(String(otp), otpDoc.otp))) {
            return res.status(400).json({ message: "Invalid OTP" })
        }
        await Otp.findByIdAndDelete(otpDoc._id)
        const secureInfo = sanitizeUser(user)
        const accessToken = generateAccessToken(secureInfo)
        const refreshToken = newRefreshToken()
        const refreshTtlMs = ms(process.env.REFRESH_TOKEN_EXPIRATION || "30d")
        await RefreshToken.create({
            user: user._id,
            tokenHash: hashToken(refreshToken),
            expiresAt: new Date(Date.now() + (typeof refreshTtlMs === "number" ? refreshTtlMs : 30 * 24 * 60 * 60 * 1000)),
            userAgent: req.get("user-agent"),
            ip: req.ip,
        })
        setAuthCookies(res, accessToken, refreshToken)
        return res.status(200).json(sanitizeUser(user))
    } catch (err) {
        if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
            return res.status(400).json({ message: "Invalid or expired token" })
        }
        console.log(err)
        return res.status(500).json({ message: "Error verifying 2FA" })
    }
}

exports.resendOtp = async (req, res) => {
    try {

        const userId = req.user?._id
        const existingUser = await User.findById(userId)

        if (!existingUser) {
            return res.status(404).json({ "message": "User not found" })
        }

        if (existingUser.isVerified) {
            return res.status(400).json({ message: "User already verified" })
        }

        await Otp.deleteMany({ user: existingUser._id })

        const otp = generateOTP()
        const hashedOtp = await bcrypt.hash(otp, 10)

        const newOtp = new Otp({ user: userId, otp: hashedOtp, expiresAt: Date.now() + parseInt(process.env.OTP_EXPIRATION_TIME) })
        await newOtp.save()

        sendMail(existingUser.email, `OTP Verification for Your Every Market Account`, `Your One-Time Password (OTP) for account verification is: <b>${otp}</b>.</br>Do not share this OTP with anyone for security reasons`).catch(err => console.error("Background Email Error (resendOtp):", err))

        res.status(201).json({ 'message': "OTP sent" })
    } catch (error) {
        console.error("Resend OTP Error:", error);
        res.status(500).json({ 'message': "Some error occured while resending otp, please try again later" })
    }
}

exports.forgotPassword = async (req, res) => {
    let newToken;
    try {
        // checks if user provided email exists or not
        const isExistingUser = await User.findOne({ email: req.body.email })

        // if email does not exists returns a 404 response
        if (!isExistingUser) {
            return res.status(404).json({ message: "Provided email does not exists" })
        }

        await PasswordResetToken.deleteMany({ user: isExistingUser._id })

        // if user exists , generates a password reset token
        const passwordResetToken = generatePasswordResetToken(sanitizeUser(isExistingUser))

        // hashes the token
        const hashedToken = await bcrypt.hash(passwordResetToken, 10)

        // saves hashed token in passwordResetToken collection
        const resetTtlMs = ms(process.env.PASSWORD_RESET_TOKEN_EXPIRATION || "15m");
        newToken = new PasswordResetToken({ user: isExistingUser._id, token: hashedToken, expiresAt: Date.now() + (typeof resetTtlMs === "number" ? resetTtlMs : parseInt(process.env.OTP_EXPIRATION_TIME)) })
        await newToken.save()

        // sends the password reset link to the user's mail
        sendMail(isExistingUser.email, 'Password Reset Link for Your Every Market Account', `<p>Dear ${isExistingUser.name},

        We received a request to reset the password for your Every Market account. If you initiated this request, please use the following link to reset your password:</p>
        
        <p><a href=${process.env.ORIGIN}/reset-password/${isExistingUser._id}/${passwordResetToken} target="_blank">Reset Password</a></p>
        
        <p>This link is valid for a limited time. If you did not request a password reset, please ignore this email. Your account security is important to us.
        
        Thank you,
        The Every Market Team</p>`).catch(err => console.error("Background Email Error (forgotPassword):", err))

        res.status(200).json({ message: `Password Reset link sent to ${isExistingUser.email}` })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error occured while sending password reset mail' })
    }
}

exports.resetPassword = async (req, res) => {
    try {

        // checks if user exists or not
        const isExistingUser = await User.findById(req.body.userId)

        // if user does not exists then returns a 404 response
        if (!isExistingUser) {
            return res.status(404).json({ message: "User does not exists" })
        }

        // fetches the resetPassword token by the userId
        const isResetTokenExisting = await PasswordResetToken.findOne({ user: isExistingUser._id })

        // If token does not exists for that userid, then returns a 404 response
        if (!isResetTokenExisting) {
            return res.status(404).json({ message: "Reset Link is Not Valid" })
        }

        // if the token has expired then deletes the token, and send response accordingly
        if (isResetTokenExisting.expiresAt < new Date()) {
            await PasswordResetToken.findByIdAndDelete(isResetTokenExisting._id)
            return res.status(404).json({ message: "Reset Link has been expired" })
        }

        // if token exists and is not expired and token matches the hash, then resets the user password and deletes the token
        if (isResetTokenExisting && isResetTokenExisting.expiresAt > new Date() && (await bcrypt.compare(req.body.token, isResetTokenExisting.token))) {

            // deleting the password reset token
            await PasswordResetToken.findByIdAndDelete(isResetTokenExisting._id)

            // resets the password after hashing it
            await User.findByIdAndUpdate(isExistingUser._id, { password: await bcrypt.hash(req.body.password, 10) })
            return res.status(200).json({ message: "Password Updated Successfuly" })
        }

        return res.status(404).json({ message: "Reset Link has been expired" })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error occured while resetting the password, please try again later" })
    }
}

exports.logout = async (req, res) => {
    try {
        const rt = req.cookies?.refreshToken
        if (rt) {
            await RefreshToken.findOneAndUpdate(
                { tokenHash: hashToken(rt) },
                { revokedAt: new Date() }
            ).exec()
        }

        res.clearCookie('token', cookieBase())
        res.clearCookie('refreshToken', cookieBase())
        res.status(200).json({ message: 'Logout successful' })
    } catch (error) {
        console.log(error);
    }
}

exports.refresh = async (req, res) => {
    try {
        const rt = req.cookies?.refreshToken
        if (!rt) {
            console.log("Refresh attempt failed: Refresh token cookie missing");
            return res.status(401).json({ message: "Refresh token missing" })
        }
        const rtHash = hashToken(rt)
        const stored = await RefreshToken.findOne({ tokenHash: rtHash }).exec()
        if (!stored || stored.revokedAt) {
            console.log(`Refresh attempt failed: Token ${!stored ? 'not found in DB' : 'already revoked'}`);
            return res.status(401).json({ message: "Invalid refresh token" })
        }
        if (stored.expiresAt < new Date()) {
            console.log("Refresh attempt failed: Token expired in DB");
            return res.status(401).json({ message: "Refresh token expired" })
        }

        const user = await User.findById(stored.user)
        if (!user) {
            console.log("Refresh attempt failed: User not found for stored token");
            return res.status(401).json({ message: "User not found" })
        }
        const secureInfo = sanitizeUser(user)
        const newAccess = generateAccessToken(secureInfo)
        const newRt = newRefreshToken()
        const newRtHash = hashToken(newRt)

        const refreshTtlMs = ms(process.env.REFRESH_TOKEN_EXPIRATION || "30d")
        await RefreshToken.create({
            user: user._id,
            tokenHash: newRtHash,
            expiresAt: new Date(Date.now() + (typeof refreshTtlMs === "number" ? refreshTtlMs : (30 * 24 * 60 * 60 * 1000))),
            userAgent: req.get("user-agent"),
            ip: req.ip
        })

        await RefreshToken.findOneAndUpdate(
            { tokenHash: rtHash },
            { revokedAt: new Date(), replacedByTokenHash: newRtHash }
        ).exec()

        setAuthCookies(res, newAccess, newRt)
        return res.status(200).json(secureInfo)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error refreshing session" })
    }
}

exports.checkAuth = async (req, res) => {
    try {
        if (req.user) {
            const user = await User.findById(req.user._id)
            return res.status(200).json(sanitizeUser(user))
        }
        res.sendStatus(401)
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
}

exports.enable2FA = async (req, res) => {
    try {
        const userId = req.user?._id
        const user = await User.findById(userId)
        if (!user) return res.status(404).json({ message: "User not found" })
        const otp = generateOTP()
        const hashedOtp = await bcrypt.hash(otp, 10)
        await Otp.findOneAndUpdate(
            { user: userId },
            { otp: hashedOtp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
            { upsert: true, new: true }
        )
        sendMail(user.email, "Every Market - Enable 2FA verification", `<p>Your code to enable 2FA is: <strong>${otp}</strong></p><p>It expires in 5 minutes.</p>`).catch(err => console.error("Background Email Error (enable2FA):", err))
        return res.status(200).json({ message: "OTP sent to your email" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error sending OTP" })
    }
}

exports.confirm2FA = async (req, res) => {
    try {
        const userId = req.user?._id
        const otp = req.body?.otp
        if (!otp) return res.status(400).json({ message: "OTP is required" })
        const otpDoc = await Otp.findOne({ user: userId })
        if (!otpDoc || otpDoc.expiresAt < new Date()) {
            if (otpDoc) await Otp.findByIdAndDelete(otpDoc._id)
            return res.status(400).json({ message: "OTP expired" })
        }
        if (!(await bcrypt.compare(String(otp), otpDoc.otp))) {
            return res.status(400).json({ message: "Invalid OTP" })
        }
        await Otp.findByIdAndDelete(otpDoc._id)
        await User.findByIdAndUpdate(userId, { twoFactorEnabled: true })
        return res.status(200).json({ message: "2FA enabled" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error enabling 2FA" })
    }
}

exports.disable2FA = async (req, res) => {
    try {
        const userId = req.user?._id
        await User.findByIdAndUpdate(userId, { twoFactorEnabled: false })
        return res.status(200).json({ message: "2FA disabled" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error disabling 2FA" })
    }
}

exports.googleOAuthCallback = async (req, res) => {
    try {
        const user = req.user
        if (!user) {
            return res.redirect(`${process.env.FRONTEND_ORIGIN || process.env.ORIGIN || 'http://localhost:3000'}/login?error=oauth_failed`)
        }
        if (user.isBanned) {
            return res.redirect(`${process.env.FRONTEND_ORIGIN || process.env.ORIGIN || 'http://localhost:3000'}/login?error=banned`)
        }
        const secureInfo = sanitizeUser(user)
        const accessToken = generateAccessToken(secureInfo)
        const refreshToken = newRefreshToken()
        const refreshTtlMs = ms(process.env.REFRESH_TOKEN_EXPIRATION || "30d")
        await RefreshToken.create({
            user: user._id,
            tokenHash: hashToken(refreshToken),
            expiresAt: new Date(Date.now() + (typeof refreshTtlMs === "number" ? refreshTtlMs : (30 * 24 * 60 * 60 * 1000))),
            userAgent: req.get("user-agent"),
            ip: req.ip
        })
        setAuthCookies(res, accessToken, refreshToken)
        return res.redirect(`${process.env.FRONTEND_ORIGIN || process.env.ORIGIN || 'http://localhost:3000'}?oauth=success`)
    } catch (err) {
        console.log(err)
        return res.redirect(`${process.env.FRONTEND_ORIGIN || process.env.ORIGIN || 'http://localhost:3000'}/login?error=oauth_error`)
    }
}

exports.facebookOAuthCallback = async (req, res) => {
    try {
        const user = req.user
        if (!user) {
            return res.redirect(`${process.env.FRONTEND_ORIGIN || process.env.ORIGIN || 'http://localhost:3000'}/login?error=oauth_failed`)
        }
        if (user.isBanned) {
            return res.redirect(`${process.env.FRONTEND_ORIGIN || process.env.ORIGIN || 'http://localhost:3000'}/login?error=banned`)
        }
        const secureInfo = sanitizeUser(user)
        const accessToken = generateAccessToken(secureInfo)
        const refreshToken = newRefreshToken()
        const refreshTtlMs = ms(process.env.REFRESH_TOKEN_EXPIRATION || "30d")
        await RefreshToken.create({
            user: user._id,
            tokenHash: hashToken(refreshToken),
            expiresAt: new Date(Date.now() + (typeof refreshTtlMs === "number" ? refreshTtlMs : (30 * 24 * 60 * 60 * 1000))),
            userAgent: req.get("user-agent"),
            ip: req.ip
        })
        setAuthCookies(res, accessToken, refreshToken)
        return res.redirect(`${process.env.FRONTEND_ORIGIN || process.env.ORIGIN || 'http://localhost:3000'}?oauth=success`)
    } catch (err) {
        console.log(err)
        return res.redirect(`${process.env.FRONTEND_ORIGIN || process.env.ORIGIN || 'http://localhost:3000'}/login?error=oauth_error`)
    }
}