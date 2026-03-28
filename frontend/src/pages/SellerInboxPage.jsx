import React from "react"
import { Typography, Box, Stack } from "@mui/material"
import { SellerLayout } from "../layouts/SellerLayout"
import { Inbox } from "../features/messaging/components/Inbox"

export const SellerInboxPage = () => {
  return (
    <SellerLayout>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -1 }}>
            Customer Support Inbox
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Direct communication with your buyers regarding orders and inquiries.
          </Typography>
        </Box>
        <Inbox role="seller" />
      </Stack>
    </SellerLayout>
  )
}
