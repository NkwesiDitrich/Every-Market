import React, { useEffect, useState } from "react"
import { Paper, Stack, Typography } from "@mui/material"
import { useNavigate, useSearchParams } from "react-router-dom"
import { capturePayPalOrder, capturePayPalOrderGuest } from "../features/payment/PaymentApi"
import { useSelector } from "react-redux"
import { selectLoggedInUser } from "../features/auth/AuthSlice"

export const PayPalReturnPage = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const orderId = params.get("orderId")
  const [error, setError] = useState(null)
  const loggedInUser = useSelector(selectLoggedInUser)

  useEffect(() => {
    const run = async () => {
      if (!orderId) {
        setError("Missing orderId")
        return
      }
      try {
        if(loggedInUser){
          await capturePayPalOrder({ orderId })
          navigate(`/order-success/${orderId}`, { replace: true })
        }else{
          await capturePayPalOrderGuest({ orderId })
          navigate(`/payment/success?provider=paypal&orderId=${orderId}`, { replace: true })
        }
      } catch (e) {
        setError("Error capturing PayPal payment")
      }
    }
    run()
  }, [orderId, loggedInUser, navigate])

  return (
    <Stack width="100vw" height="100vh" justifyContent="center" alignItems="center" p={2}>
      <Paper elevation={2} sx={{ p: 3, maxWidth: 520, width: "100%" }}>
        <Stack rowGap={1}>
          <Typography variant="h6" fontWeight={600}>
            Finalizing PayPal payment…
          </Typography>
          {error && <Typography color="error">{error}</Typography>}
          {!error && <Typography color="text.secondary">Please wait.</Typography>}
        </Stack>
      </Paper>
    </Stack>
  )
}

