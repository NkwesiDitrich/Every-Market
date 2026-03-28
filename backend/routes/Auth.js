const express=require('express')
const router=express.Router()
const authController=require("../controllers/Auth")
const { verifyToken } = require('../middleware/VerifyToken')
const rateLimit = require("express-rate-limit")
const { validateBody } = require("../middleware/Validate")
const { schemas } = require("../validation/schemas")
const passport = require('../config/passport')

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again later." },
})

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many OTP requests. Please try again later." },
})

const passwordLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
})

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100, // Increased limit for refreshing
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many refresh attempts. Please try again later." },
})

router
    .post("/signup",validateBody(schemas.auth.signup),authController.signup)
    .post('/login',loginLimiter,validateBody(schemas.auth.login),authController.login)
    .post("/verify-otp",verifyToken,otpLimiter,validateBody(schemas.auth.verifyOtp),authController.verifyOtp)
    .post("/verify-2fa",otpLimiter,validateBody(schemas.auth.verify2FA),authController.verify2FA)
    .post("/enable-2fa",verifyToken,otpLimiter,authController.enable2FA)
    .post("/confirm-2fa",verifyToken,otpLimiter,validateBody(schemas.auth.confirm2FA),authController.confirm2FA)
    .post("/disable-2fa",verifyToken,authController.disable2FA)
    .post("/resend-otp",verifyToken,otpLimiter,validateBody(schemas.auth.resendOtp),authController.resendOtp)
    .post("/forgot-password",passwordLimiter,validateBody(schemas.auth.forgotPassword),authController.forgotPassword)
    .post("/reset-password",passwordLimiter,validateBody(schemas.auth.resetPassword),authController.resetPassword)
    .post("/refresh",refreshLimiter,authController.refresh)
    .get("/check-auth",verifyToken,authController.checkAuth)
    .get('/logout',authController.logout)
    .get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
    .get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_ORIGIN || process.env.ORIGIN || 'http://localhost:3000'}/login?error=oauth_failed` }), authController.googleOAuthCallback)
    .get('/facebook', passport.authenticate('facebook', { scope: ['email'] }))
    .get('/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: `${process.env.FRONTEND_ORIGIN || process.env.ORIGIN || 'http://localhost:3000'}/login?error=oauth_failed` }), authController.facebookOAuthCallback)


module.exports=router