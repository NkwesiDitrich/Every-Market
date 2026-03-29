import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, useMediaQuery, useTheme, Badge } from '@mui/material';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartOutlined';
import PersonIcon from '@mui/icons-material/PersonOutline';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptIcon from '@mui/icons-material/ReceiptLongOutlined';
import AnalyticsIcon from '@mui/icons-material/AnalyticsOutlined';
import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import ListAltIcon from '@mui/icons-material/ListAltOutlined';
import BannersIcon from '@mui/icons-material/ViewCarouselOutlined';

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

    if (!isMobile) return null;

    const navItems = {
        buyer: [
            { label: "Home", icon: <HomeIcon />, path: "/" },
            { label: "Search", icon: <SearchIcon />, path: "/search" },
            { 
                label: "Cart", 
                icon: (
                    <Badge badgeContent={cartItems.length} color="error">
                        <ShoppingCartIcon />
                    </Badge>
                ), 
                path: "/cart" 
            },
            { label: "Orders", icon: <ListAltIcon />, path: "/orders" },
            { label: "Profile", icon: <PersonIcon />, path: "/profile" },
        ],
        seller: [
            { label: "Dashboard", icon: <DashboardIcon />, path: "/seller/dashboard" },
            { label: "Products", icon: <InventoryIcon />, path: "/seller/products" },
            { label: "Orders", icon: <ReceiptIcon />, path: "/seller/orders" },
            { label: "Analytics", icon: <AnalyticsIcon />, path: "/seller/insights" },
            { label: "Profile", icon: <PersonIcon />, path: "/profile" },
        ],
        admin: [
            { label: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
            { label: "Orders", icon: <ReceiptIcon />, path: "/admin/orders" },
            { label: "Users", icon: <PeopleIcon />, path: "/admin/users" },
            { label: "Banners", icon: <BannersIcon />, path: "/admin/banners" },
            { label: "Profile", icon: <PersonIcon />, path: "/profile" },
        ]
    };

    const currentNav = navItems[activeRole] || navItems.buyer;

    const getSelectedIndex = () => {
        const path = location.pathname;
        const index = currentNav.findIndex(item => item.path === path);
        if (index !== -1) return index;
        
        // Fallback for subpaths
        if (path.startsWith('/seller')) {
             if (path.includes('/products')) return 1;
             if (path.includes('/orders')) return 2;
             if (path.includes('/insights')) return 3;
             return 0;
        }
        if (path.startsWith('/admin')) {
             if (path.includes('/orders')) return 1;
             if (path.includes('/users')) return 2;
             if (path.includes('/banners')) return 3;
             return 0;
        }
        return 0;
    };

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: theme.zIndex.appBar + 100,
                borderTop: '1px solid',
                borderColor: 'divider',
                display: { xs: 'block', sm: 'none' }
            }}
            elevation={8}
        >
            <BottomNavigation
                showLabels
                value={getSelectedIndex()}
                onChange={(event, newValue) => {
                    navigate(currentNav[newValue].path);
                }}
                sx={{
                    height: 70,
                    pb: 1, 
                    '& .MuiBottomNavigationAction-root': {
                        minWidth: 'auto',
                        padding: '8px 0',
                    },
                    '& .Mui-selected': {
                        color: 'primary.main',
                    },
                    '& .MuiBottomNavigationAction-label': {
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        mt: 0.5
                    }
                }}
            >
                {currentNav.map((item, index) => (
                    <BottomNavigationAction 
                        key={index} 
                        label={item.label} 
                        icon={item.icon} 
                    />
                ))}
            </BottomNavigation>
        </Paper>
    );
};
