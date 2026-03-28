import React from "react"
import { Button, Paper, Stack, Typography } from "@mui/material"
import { Link, useSearchParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { selectLoggedInUser } from "../features/auth/AuthSlice"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import HourglassTopIcon from "@mui/icons-material/HourglassTop"

const getProviderLabel = (p) => {
  if (p === "cod") return "Cash on Delivery"
  if (p === "mobile_money" || p === "MOBILE_MONEY") return "Mobile Money"
  if (p === "orange_money" || p === "ORANGE_MONEY") return "Orange Money"
  if (p === "flutterwave") return "Mobile Money"
  if (p === "stripe") return "Card (Stripe)"
  if (p === "paypal") return "PayPal"
  return p
}

export const PaymentSuccessPage = () => {
  const [params] = useSearchParams()
  const provider = params.get("provider")
  const orderId = params.get("orderId")
  const status = params.get("status") || "success"
  const loggedInUser = useSelector(selectLoggedInUser)

  const isMobileMoney = ["mobile_money", "MOBILE_MONEY", "orange_money", "ORANGE_MONEY", "flutterwave"].includes(provider)
  const isPending = status === "pending"

  return (
    <Stack width="100vw" height="100vh" justifyContent="center" alignItems="center" p={2}>
      <Paper elevation={2} sx={{ p: 4, maxWidth: 520, width: "100%", borderRadius: 4 }}>
        <Stack rowGap={2} alignItems="center" textAlign="center">
          {isPending ? (
            <HourglassTopIcon color="warning" sx={{ fontSize: 56 }} />
          ) : (
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 56 }} />
          )}
          
          <Typography variant="h5" fontWeight={700}>
            {isPending && isMobileMoney
              ? "Complete Payment on Your Phone"
              : isPending
                ? "Payment Processing..."
                : "Payment Received!"}
          </Typography>
          
          <Typography color="text.secondary">
            {isPending && isMobileMoney
              ? "Please check your phone and confirm the payment via the prompt from your mobile money provider."
              : isPending
                ? `Your ${getProviderLabel(provider) || "payment"} is being processed. You'll receive a notification once confirmed.`
                : provider
                  ? `Paid via ${getProviderLabel(provider)}. Thank you for your order!`
                  : "Your payment has been received. Thank you!"}
          </Typography>

          {orderId && loggedInUser && (
            <Button component={Link} to={`/order-success/${orderId}`} variant="contained" fullWidth sx={{ mt: 2, borderRadius: 3, py: 1.5, fontWeight: 700 }}>
              View Order Details
            </Button>
          )}

          {loggedInUser && (
            <Button component={Link} to={"/orders"} variant="outlined" fullWidth sx={{ borderRadius: 3, py: 1.5, fontWeight: 700 }}>
              Go to My Orders
            </Button>
          )}

          {!loggedInUser && (
            <Button component={Link} to={"/"} variant="contained" fullWidth sx={{ mt: 2, borderRadius: 3, py: 1.5, fontWeight: 700 }}>
              Continue Shopping
            </Button>
          )}
        </Stack>
      </Paper>
    </Stack>
  )
}
