const crypto = require("crypto");

exports.newRefreshToken = () => {
  // 48 bytes -> 64 chars base64url-ish after encoding
  return crypto.randomBytes(48).toString("base64url");
};

exports.hashToken = (token) => {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
};

