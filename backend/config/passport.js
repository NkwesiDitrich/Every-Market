const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const User = require('../models/User')
const { sanitizeUser } = require('../utils/SanitizeUser')

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, sanitizeUser(user))
  } catch (err) {
    done(err, null)
  }
})

// Google OAuth Strategy – only register if credentials are set (allows running without OAuth in dev)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL || process.env.ORIGIN || 'http://localhost:5000'}/auth/google/callback`
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value
      if (!email) return done(new Error('Google profile has no email'), null)
      let user = await User.findOne({ email })
      if (user) {
        if (!user.googleId) {
          user.googleId = profile.id
          await user.save()
        }
        return done(null, user)
      }
      user = new User({
        name: profile.displayName,
        email,
        googleId: profile.id,
        isVerified: true,
        password: null
      })
      if (!user.referralCode) {
        user.referralCode = "SH" + Math.random().toString(36).slice(2, 10).toUpperCase()
      }
      await user.save()
      return done(null, user)
    } catch (err) {
      return done(err, null)
    }
  }))
}

// Facebook OAuth Strategy – only register if credentials are set
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${process.env.BACKEND_URL || process.env.ORIGIN || 'http://localhost:5000'}/auth/facebook/callback`,
    profileFields: ['id', 'displayName', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value
      if (!email) {
        return done(new Error('Facebook account must have an email'), null)
      }
      let user = await User.findOne({ email })
      if (user) {
        if (!user.facebookId) {
          user.facebookId = profile.id
          await user.save()
        }
        return done(null, user)
      }
      user = new User({
        name: profile.displayName,
        email,
        facebookId: profile.id,
        isVerified: true,
        password: null
      })
      if (!user.referralCode) {
        user.referralCode = "SH" + Math.random().toString(36).slice(2, 10).toUpperCase()
      }
      await user.save()
      return done(null, user)
    } catch (err) {
      return done(err, null)
    }
  }))
}

module.exports = passport
