const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/VerifyToken");
const payments = require("../controllers/Payments");

// Authenticated payment initiation (uses server-side cart)
router
  .post("/stripe/create-checkout-session", verifyToken, payments.createStripeCheckoutSession)
  .post("/stripe/guest/create-checkout-session", payments.createStripeCheckoutSessionGuest)
  .post("/paypal/create-order", verifyToken, payments.createPayPalOrder)
  .post("/paypal/guest/create-order", payments.createPayPalOrderGuest)
  .post("/paypal/capture", verifyToken, payments.capturePayPalOrder)
  .post("/paypal/guest/capture", payments.capturePayPalOrderGuest)
  .post("/flutterwave/create-payment", verifyToken, payments.createFlutterwavePayment);
router.post("/flutterwave/guest/create-payment", payments.createFlutterwavePaymentGuest);

module.exports = router;

