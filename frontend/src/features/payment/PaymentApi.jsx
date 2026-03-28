import { axiosi } from "../../config/axios"

export const createStripeCheckoutSession = async ({ addressId, couponCode, loyaltyPointsToRedeem }) => {
  const res = await axiosi.post("/payments/stripe/create-checkout-session", { addressId, couponCode, loyaltyPointsToRedeem })
  return res.data
}

export const createStripeCheckoutSessionGuest = async ({ guestEmail, address, items }) => {
  const res = await axiosi.post("/payments/stripe/guest/create-checkout-session", { guestEmail, address, items })
  return res.data
}

export const createPayPalOrder = async ({ addressId, couponCode, loyaltyPointsToRedeem }) => {
  const res = await axiosi.post("/payments/paypal/create-order", { addressId, couponCode, loyaltyPointsToRedeem })
  return res.data
}

export const createPayPalOrderGuest = async ({ guestEmail, address, items }) => {
  const res = await axiosi.post("/payments/paypal/guest/create-order", { guestEmail, address, items })
  return res.data
}

export const capturePayPalOrder = async ({ orderId }) => {
  const res = await axiosi.post("/payments/paypal/capture", { orderId })
  return res.data
}

export const capturePayPalOrderGuest = async ({ orderId }) => {
  const res = await axiosi.post("/payments/paypal/guest/capture", { orderId })
  return res.data
}

export const createFlutterwavePayment = async ({ addressId, method, couponCode, loyaltyPointsToRedeem }) => {
  const res = await axiosi.post("/payments/flutterwave/create-payment", { addressId, method, couponCode, loyaltyPointsToRedeem })
  return res.data
}

export const createFlutterwavePaymentGuest = async ({ guestEmail, address, items, method }) => {
  const res = await axiosi.post("/payments/flutterwave/guest/create-payment", { guestEmail, address, items, method })
  return res.data
}

