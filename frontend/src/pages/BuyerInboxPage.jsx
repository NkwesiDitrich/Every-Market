import React from "react"
import { Typography, Box, Stack, Container } from "@mui/material"
import { Inbox } from "../features/messaging/components/Inbox"

export const BuyerInboxPage = () => {
    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Stack spacing={4}>
                <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -1 }}>
                        Support Inbox
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Messages from sellers and support regarding your orders.
                    </Typography>
                </Box>
                <Inbox role="buyer" />
            </Stack>
        </Container>
    )
}
