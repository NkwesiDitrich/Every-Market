require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRATION || "15m",
  });
};

exports.generatePasswordResetToken = (payload) => {
  return jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: process.env.PASSWORD_RESET_TOKEN_EXPIRATION || "15m",
  });
};

exports.generate2FAToken = (payload) => {
  return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "5m" });
};