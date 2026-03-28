import React from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Navbar } from '../features/navigation/components/Navbar';
import { BottomNav } from '../features/navigation/components/BottomNav';
import { Footer } from '../features/footer/Footer';

export const BuyerLayout = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
            <Navbar isProductList={true} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    pb: isMobile ? '64px' : 0, // Space for bottom nav on mobile
                    transition: 'padding 0.3s ease'
                }}
            >
                {children}
            </Box>
            {!isMobile && <Footer />}
            <BottomNav />
        </Box>
    );
};
