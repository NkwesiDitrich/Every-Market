import React from "react"
import { Button, Paper, Stack, Typography } from "@mui/material"
import { Link, useSearchParams } from "react-router-dom"

export const PaymentCancelPage = () => {
  const [params] = useSearchParams()
  const provider = params.get("provider")
  const orderId = params.get("orderId")

  return (
    <Stack width="100vw" height="100vh" justifyContent="center" alignItems="center" p={2}>
      <Paper elevation={2} sx={{ p: 3, maxWidth: 520, width: "100%" }}>
        <Stack rowGap={2}>
          <Typography variant="h5" fontWeight={600}>
            Payment cancelled
          </Typography>
          <Typography color="text.secondary">
            {provider ? `Provider: ${provider}` : "Payment was cancelled."}
          </Typography>
          {orderId && (
            <Button component={Link} to={`/order-success/${orderId}`} variant="outlined">
              View order status
            </Button>
          )}
          <Button component={Link} to={"/checkout"} variant="contained">
            Back to checkout
          </Button>
        </Stack>
      </Paper>
    </Stack>
  )
}

