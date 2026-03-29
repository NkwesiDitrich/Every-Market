import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import { Link, useNavigate } from 'react-router-dom';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import { Badge, Button, Chip, Stack, useMediaQuery, useTheme, Box, Divider } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useThemeMode } from '../../../context/ThemeModeContext';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserInfo } from '../../user/UserSlice';
import { selectCartItems } from '../../cart/CartSlice';
import { selectLoggedInUser, selectActiveRole } from '../../auth/AuthSlice';
import { selectWishlistItems } from '../../wishlist/WishlistSlice';
import { selectProductIsFilterOpen, toggleFilters, selectSearchQuery, setSearchQuery } from '../../products/ProductSlice';
import { selectSellerProfile } from '../../seller/SellerSlice';
import { NotificationCenter } from '../../notification/components/NotificationCenter';
import { fetchNotificationsAsync, selectUnreadCount } from '../../notification/NotificationSlice';
import { LanguageSwitcher } from './LanguageSwitcher';
import { RoleSwitcher } from './RoleSwitcher';




export const Navbar = ({ isProductList = false }) => {
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const userInfo = useSelector(selectUserInfo)
  const cartItems = useSelector(selectCartItems)
  const loggedInUser = useSelector(selectLoggedInUser)
  const searchQuery = useSelector(selectSearchQuery)
  const activeRole = useSelector(selectActiveRole)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { mode, toggleMode, fontScale, setFontSize } = useThemeMode()
  const { t, i18n } = useTranslation()

  const wishlistItems = useSelector(selectWishlistItems)
  const isProductFilterOpen = useSelector(selectProductIsFilterOpen)
  const sellerProfile = useSelector(selectSellerProfile)

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleToggleFilters = () => {
    dispatch(toggleFilters())
  }

  React.useEffect(() => {
    if (loggedInUser) {
      dispatch(fetchNotificationsAsync())
      // Optional: Poll every 60 seconds
      const interval = setInterval(() => {
        dispatch(fetchNotificationsAsync())
      }, 20000)
      return () => clearInterval(interval)
    }
  }, [dispatch, loggedInUser])

  const unreadCount = useSelector(selectUnreadCount)

  const settings = [
    { name: t('Home'), to: "/" },
    { name: t('Profile'), to: "/profile" },
    ...(activeRole === 'buyer' ? [
      { name: t('Orders'), to: "/orders" },
      { name: t('Inbox'), to: "/inbox" },
      { name: t('My Disputes'), to: "/disputes" },
      ...(loggedInUser?.role === 'seller' || sellerProfile?.status === 'approved'
        ? [] // Switcher handled separately, or maybe add a "Go to Dashboard" shortcut
        : loggedInUser?.role === 'admin'
          ? []
          : [{ name: t('Become a Seller'), to: "/seller/apply" }]
      )
    ] : [
      ...(loggedInUser?.role === 'seller' || sellerProfile?.status === 'approved'
        ? [{ name: t('Seller Dashboard'), to: "/seller/dashboard" }, { name: t('My Products'), to: "/seller/products" }]
        : loggedInUser?.role === 'admin'
          ? [{ name: t('Admin Dashboard'), to: "/admin/dashboard" }]
          : []
      )
    ]),
    { name: t('Logout'), to: "/logout" },
  ];

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "background.paper",
        boxShadow: "0px 1px 3px rgba(0,0,0,0.05)",
        color: "text.primary",
        borderBottom: mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F0F0F0',
        zIndex: theme.zIndex.appBar
      }}
    >
      <Toolbar sx={{ px: { xs: 1, md: 3 }, height: "72px", display: "flex", gap: 2 }}>

        {/* Brand Logo */}
        <Typography
          variant="h5"
          noWrap
          component={Link}
          to="/"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'primary.main',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          EVERY MARKET
        </Typography>

        {/* Desktop Search Bar - Prominent */}
        {!isMobile && (
          <Box
            sx={{
              flex: 1,
              maxWidth: 600,
              bgcolor: 'background.default',
              borderRadius: 2,
              px: 2,
              py: 0.5,
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #E0E0E0',
              ml: 4
            }}
          >
            <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            <Box sx={{ mr: 1, display: { xs: 'none', lg: 'block' } }}>
              <Chip 
                label={activeRole === 'admin' ? t('Admin Mode') : activeRole === 'seller' ? t('Seller Mode') : t('Shopping Mode')} 
                size="small" 
                color={activeRole === 'admin' ? 'secondary' : activeRole === 'seller' ? 'success' : 'primary'} 
                variant={activeRole === 'buyer' ? 'outlined' : 'filled'}
                sx={{ 
                  fontWeight: 700, 
                  borderRadius: 1,
                  color: (activeRole === 'admin' || activeRole === 'seller') ? '#fff' : undefined
                }}
              />
            </Box>
            <InputBase
              fullWidth
              placeholder={t('Search')}
              value={searchQuery || ''}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              sx={{ fontSize: '0.95rem' }}
            />
            {isProductList && (
              <IconButton onClick={handleToggleFilters} size="small" sx={{ ml: 1 }}>
                <TuneIcon fontSize="small" color={isProductFilterOpen ? "primary" : "inherit"} />
              </IconButton>
            )}
          </Box>
        )}

        {/* Empty space for mobile to push icons to right */}
        {isMobile && <Box sx={{ flexGrow: 1 }} />}

        {/* Global Utilities */}
        <Stack direction="row" spacing={1} alignItems="center">
          
          {/* Role Switcher - Desktop */}
          {!isMobile && <RoleSwitcher />}

          {/* Notifications */}
          <IconButton onClick={() => setIsNotificationOpen(true)} size="medium" sx={{ color: 'text.primary' }}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>

          <NotificationCenter open={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />

          {/* Desktop Cart & Wishlist */}
          {!isMobile && (
            <Stack direction="row" spacing={1}>
              {loggedInUser?.role !== 'admin' && (
                <Badge badgeContent={wishlistItems?.length} color='secondary'>
                  <IconButton component={Link} to="/wishlist" sx={{ color: 'text.primary' }}>
                    <FavoriteBorderIcon />
                  </IconButton>
                </Badge>
              )}
              <Badge badgeContent={cartItems?.length} color='secondary'>
                <IconButton onClick={() => navigate("/cart")} sx={{ color: 'text.primary' }}>
                  <ShoppingCartOutlinedIcon />
                </IconButton>
              </Badge>
            </Stack>
          )}

          {/* Theme Toggle */}
          <IconButton onClick={toggleMode} sx={{ color: 'text.primary' }}>
            {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>

          {/* Language Switcher */}
          <LanguageSwitcher />

          <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24, alignSelf: 'center' }} />

          {/* User Menu */}
          <Stack direction="row" alignItems="center" spacing={1.5} onClick={handleOpenUserMenu} sx={{ cursor: 'pointer', pl: 0.5 }}>
            <Avatar
              alt={userInfo?.name}
              src={userInfo?.profilePicture || "null"}
              sx={{ width: 36, height: 36, border: '2px solid #F0F0F0' }}
            />
            {!isMobile && (
              <Box>
                <Typography variant='body2' fontWeight={600} sx={{ lineHeight: 1 }}>
                  {userInfo?.name?.split(" ")[0] || 'User'}
                </Typography>
                <Typography variant='caption' color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {loggedInUser?.role || t('Account')}
                </Typography>
              </Box>
            )}
          </Stack>

          <Menu
            sx={{ mt: '45px' }}
            id="user-menu"
            anchorEl={anchorElUser}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            {isMobile && (loggedInUser?.role === 'seller' || loggedInUser?.role === 'admin' || loggedInUser?.isAdmin) && (
              <Box sx={{ px: 2, pt: 1, pb: 1 }}>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {t('Switch Mode')}
                </Typography>
                <Box sx={{ mt: 1 }}>
                   <RoleSwitcher />
                </Box>
                <Divider sx={{ my: 1 }} />
              </Box>
            )}
            {settings.map((setting) => (
              <MenuItem key={setting.to} component={Link} to={setting.to} onClick={handleCloseUserMenu}>
                <Typography variant="body2">{setting.name}</Typography>
              </MenuItem>
            ))}
          </Menu>

        </Stack>
      </Toolbar>
    </AppBar>
  );
}
