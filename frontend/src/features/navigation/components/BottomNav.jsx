import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, useMediaQuery, useTheme, Badge } from '@mui/material';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartOutlined';
import PersonIcon from '@mui/icons-material/PersonOutline';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCartItems } from '../../cart/CartSlice';
import { selectActiveRole } from '../../auth/AuthSlice';

export const BottomNav = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const location = useLocation();
    const cartItems = useSelector(selectCartItems);
    const activeRole = useSelector(selectActiveRole);

    // Only show on mobile
    if (!isMobile) return null;

    const getValue = () => {
        const path = location.pathname;
        if (path === '/') return 0;
        if (path.includes('/categories')) return 1;
        if (path.includes('/search') || path.includes('/seller/dashboard')) return 2;
        if (path.includes('/cart') || path.includes('/seller/orders')) return 3;
        if (path.includes('/profile') || path.includes('/orders')) return 4;
        return 0;
    };

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                borderTop: '1px solid',
                borderColor: 'divider',
                display: { xs: 'block', sm: 'none' }
            }}
            elevation={3}
        >
            <BottomNavigation
                showLabels
                value={getValue()}
                onChange={(event, newValue) => {
                    switch (newValue) {
                        case 0: navigate('/'); break;
                        case 1: navigate(activeRole === 'buyer' ? '/categories' : '/seller/products'); break; 
                        case 2: navigate(activeRole === 'buyer' ? '/search' : '/seller/dashboard'); break; 
                        case 3: navigate(activeRole === 'buyer' ? '/cart' : '/seller/orders'); break;
                        case 4: navigate('/profile'); break;
                        default: navigate('/');
                    }
                }}
                sx={{
                    height: 64,
                    '& .MuiBottomNavigationAction-root': {
                        minWidth: 'auto',
                        padding: '6px 0',
                    },
                    '& .Mui-selected': {
                        color: 'primary.main',
                    },
                }}
            >
                <BottomNavigationAction label={activeRole === 'buyer' ? "Home" : "Dashboard"} icon={<HomeIcon />} />
                <BottomNavigationAction label={activeRole === 'buyer' ? "Categories" : "Products"} icon={<CategoryIcon />} />
                <BottomNavigationAction label={activeRole === 'buyer' ? "Search" : "Dashboard"} icon={<SearchIcon />} />
                <BottomNavigationAction
                    label={activeRole === 'buyer' ? "Cart" : "Orders"}
                    icon={
                        activeRole === 'buyer' ? (
                            <Badge badgeContent={cartItems.length} color="error">
                                <ShoppingCartIcon />
                            </Badge>
                        ) : (
                            <CategoryIcon /> // Fallback icon for seller orders
                        )
                    }
                />
                <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
            </BottomNavigation>
        </Paper>
    );
};
