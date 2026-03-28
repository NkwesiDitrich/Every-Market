import React, { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  Box, Drawer, List, ListItemButton, ListItemText, Stack, Toolbar, AppBar,
  Typography, IconButton, useMediaQuery, useTheme, Avatar, Badge, Tooltip,
  Divider, InputBase, alpha, Chip, ListItemIcon, Collapse
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import MenuOpenIcon from "@mui/icons-material/MenuOpen"
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"
import LogoutIcon from "@mui/icons-material/Logout"
import DashboardIcon from "@mui/icons-material/Dashboard"
import InventoryIcon from "@mui/icons-material/Inventory"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import LocalOfferIcon from "@mui/icons-material/LocalOffer"
import ChatIcon from "@mui/icons-material/Chat"
import StarIcon from "@mui/icons-material/Star"
import BarChartIcon from "@mui/icons-material/BarChart"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import SettingsIcon from "@mui/icons-material/Settings"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import LightModeIcon from "@mui/icons-material/LightMode"
import DarkModeIcon from "@mui/icons-material/DarkMode"
import SearchIcon from "@mui/icons-material/Search"
import GavelIcon from "@mui/icons-material/Gavel"
import { selectLoggedInUser } from "../features/auth/AuthSlice"
import { useThemeMode } from "../context/ThemeModeContext"
import { motion, AnimatePresence } from "framer-motion"
import { LanguageSwitcher } from "../features/navigation/components/LanguageSwitcher"
import { useTranslation } from 'react-i18next'
import { useDispatch } from "react-redux"
import { fetchNotificationsAsync, selectNotifications, selectUnreadCount } from "../features/notification/NotificationSlice"
import { NotificationCenter } from "../features/notification/components/NotificationCenter"
import { toast } from "react-toastify"

const drawerWidth = 260
const miniDrawerWidth = 72

const navGroups = [
  {
    label: "Business",
    items: [
      { label: "Overview", path: "/seller/dashboard", icon: <DashboardIcon fontSize="small" /> },
      { label: "Insights", path: "/seller/insights", icon: <BarChartIcon fontSize="small" /> },
    ],
  },
  {
    label: "Inventory",
    items: [
      { label: "My Products", path: "/seller/products", icon: <InventoryIcon fontSize="small" /> },
      { label: "Orders", path: "/seller/orders", icon: <ShoppingCartIcon fontSize="small" /> },
    ],
  },
  {
    label: "Growth",
    items: [
      { label: "Promotions", path: "/seller/promotions", icon: <LocalOfferIcon fontSize="small" /> },
      { label: "Earnings", path: "/seller/earnings", icon: <AccountBalanceWalletIcon fontSize="small" /> },
    ],
  },
  {
    label: "Customer",
    items: [
      { label: "Inbox", path: "/seller/inbox", icon: <ChatIcon fontSize="small" /> },
      { label: "Reviews", path: "/seller/reviews", icon: <StarIcon fontSize="small" /> },
      { label: "Returns", path: "/seller/returns", icon: <InventoryIcon fontSize="small" /> },
      { label: "Disputes", path: "/seller/disputes", icon: <GavelIcon fontSize="small" /> },
    ],
  },
  {
    label: "Store",
    items: [
      { label: "Settings", path: "/seller/settings", icon: <SettingsIcon fontSize="small" /> },
      { label: "Help Center", path: "/seller/help", icon: <HelpOutlineIcon fontSize="small" /> },
    ],
  },
]

const NavGroup = ({ group, collapsed, location, onNavigate }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(true)
  const isActive = (path) => location.pathname === path

  if (collapsed) {
    return (
      <Box>
        {group.items.map(item => (
          <Tooltip key={item.path} title={item.label} placement="right">
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => onNavigate(item.path)}
              sx={{
                justifyContent: "center",
                px: 0,
                py: 1.2,
                mx: 0.5,
                borderRadius: 2,
                color: isActive(item.path) ? "primary.main" : "text.secondary",
                "&.Mui-selected": { bgcolor: "primary.main", color: "white", "& svg": { color: "white" } },
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              {item.icon}
            </ListItemButton>
          </Tooltip>
        ))}
      </Box>
    )
  }

  return (
    <Box>
      <ListItemButton
        onClick={() => setOpen(!open)}
        sx={{ py: 0.5, px: 2, opacity: 0.5 }}
      >
        <ListItemText
          primary={t(group.label).toUpperCase()}
          primaryTypographyProps={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: 1 }}
        />
        {open ? <ExpandLessIcon sx={{ fontSize: 14 }} /> : <ExpandMoreIcon sx={{ fontSize: 14 }} />}
      </ListItemButton>
      <Collapse in={open}>
        {group.items.map(item => (
          <ListItemButton
            key={item.path}
            selected={isActive(item.path)}
            onClick={() => onNavigate(item.path)}
            sx={{
              borderRadius: 2,
              mx: 1,
              my: 0.25,
              py: 0.9,
              color: isActive(item.path) ? "primary.main" : "text.secondary",
              "&.Mui-selected": {
                bgcolor: alpha("#6366f1", 0.12),
                color: "primary.main",
                "& .MuiListItemIcon-root": { color: "primary.main" },
                fontWeight: 600,
              },
              "&:hover": { bgcolor: "action.hover", color: "text.primary" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={t(item.label)}
              primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: isActive(item.path) ? 600 : 400 }}
            />
          </ListItemButton>
        ))}
      </Collapse>
    </Box>
  )
}

export const SellerLayout = ({ children }) => {
  const { t } = useTranslation()
  const loggedInUser = useSelector(selectLoggedInUser)
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { mode, toggleMode } = useThemeMode()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const dispatch = useDispatch()
  const unreadCount = useSelector(selectUnreadCount)

  React.useEffect(() => {
    if (loggedInUser) {
      dispatch(fetchNotificationsAsync())
      const interval = setInterval(() => {
        dispatch(fetchNotificationsAsync())
      }, 20000)
      return () => clearInterval(interval)
    }
  }, [dispatch, loggedInUser])

  const notifications = useSelector(selectNotifications)
  const prevUnreadCount = useRef(unreadCount)

  useEffect(() => {
    if (unreadCount > prevUnreadCount.current) {
      const latest = notifications[0]
      if (latest && !latest.isRead) {
        toast.info(latest.message || "New activity detected", {
          position: "top-right",
          autoClose: 5000,
          onClick: () => setIsNotificationOpen(true)
        })
      }
    }
    prevUnreadCount.current = unreadCount
  }, [unreadCount, notifications])

  const effectiveWidth = sidebarCollapsed ? miniDrawerWidth : drawerWidth

  const handleNavClick = (path) => {
    navigate(path)
    if (isMobile) setMobileOpen(false)
  }

  const currentPageLabel = navGroups
    .flatMap(g => g.items)
    .find(i => i.path === location.pathname)?.label || "Seller Portal"

  const drawer = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", bgcolor: "background.paper" }}>
      {/* Brand */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5, minHeight: 64 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: 2, bgcolor: "primary.main",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
        }}>
          <Typography fontWeight={800} color="white" fontSize="1.2rem">E</Typography>
        </Box>
        {!sidebarCollapsed && (
          <Box>
            <Typography fontWeight={800} fontSize="1.1rem" lineHeight={1}>Every Market</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>SELLER CENTER</Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ opacity: 0.5 }} />

      {/* Nav groups */}
      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", py: 2 }}>
        <List disablePadding>
          {navGroups.map((group) => (
            <Box key={group.label} mb={1}>
              <NavGroup
                group={group}
                collapsed={sidebarCollapsed && !isMobile}
                location={location}
                onNavigate={handleNavClick}
              />
            </Box>
          ))}
        </List>
      </Box>

      <Divider sx={{ opacity: 0.5 }} />

      {/* Bottom Profile */}
      <Box sx={{ p: 2 }}>
        {sidebarCollapsed && !isMobile ? (
          <Tooltip title={loggedInUser?.name} placement="right">
            <Avatar
              sx={{ width: 40, height: 40, bgcolor: "primary.main", mx: "auto", cursor: "pointer", boxShadow: 1 }}
              src={loggedInUser?.profilePicture}
            >
              {loggedInUser?.name?.[0]?.toUpperCase()}
            </Avatar>
          </Tooltip>
        ) : (
          <Stack spacing={2}>
            <Box sx={{
              p: 1.5, borderRadius: 3, bgcolor: "action.hover",
              display: "flex", alignItems: "center", gap: 1.5
            }}>
              <Avatar
                sx={{ width: 36, height: 36, bgcolor: "primary.main", boxShadow: 1 }}
                src={loggedInUser?.profilePicture}
              >
                {loggedInUser?.name?.[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ overflow: "hidden" }}>
                <Typography variant="body2" fontWeight={700} noWrap>{loggedInUser?.name || "Seller"}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>Verified Merchant</Typography>
              </Box>
            </Box>
            <ListItemButton
              onClick={() => navigate("/logout")}
              sx={{ borderRadius: 2, color: "error.main", "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.08) } }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}><LogoutIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary={t('Logout')} primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 600 }} />
            </ListItemButton>
          </Stack>
        )}
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: effectiveWidth }, flexShrink: { md: 0 }, transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }}
      >
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: isMobile ? drawerWidth : effectiveWidth,
              transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              overflowX: "hidden",
              borderRight: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Header */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "background.paper",
            color: "text.primary",
            borderBottom: "1px solid",
            borderColor: "divider",
            zIndex: theme.zIndex.drawer - 1,
          }}
        >
          <Toolbar sx={{ gap: 2, px: { xs: 2, md: 4 }, minHeight: "64px !important" }}>
            {/* Sidebar Toggle */}
            <IconButton
              onClick={isMobile ? () => setMobileOpen(true) : () => setSidebarCollapsed(v => !v)}
              size="small"
              sx={{ bgcolor: "action.hover", "&:hover": { bgcolor: "action.selected" } }}
            >
              {sidebarCollapsed && !isMobile ? <MenuIcon /> : <MenuOpenIcon />}
            </IconButton>

            {/* Breadcrumb / Title */}
            <Typography variant="h6" fontWeight={800} sx={{ display: { xs: "none", sm: "block" }, letterSpacing: -0.5 }}>
              {currentPageLabel}
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            {/* Actions */}
            <Stack direction="row" alignItems="center" spacing={1.5}>
              {/* Search */}
              <Box sx={{
                display: { xs: "none", lg: "flex" }, alignItems: "center",
                bgcolor: "action.hover", borderRadius: "12px", px: 2, py: 0.75, width: 240,
                border: "1px solid transparent", "&:focus-within": { borderColor: "primary.main", bgcolor: "background.paper" }
              }}>
                <SearchIcon sx={{ color: "text.secondary", fontSize: 18, mr: 1 }} />
                <InputBase placeholder="Search orders..." sx={{ fontSize: "0.85rem", width: "100%" }} />
              </Box>

              <Tooltip title="Switch to Shop">
                <IconButton
                  onClick={() => navigate("/")}
                  sx={{ bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" }, width: 40, height: 40 }}
                >
                  <ShoppingBagIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Notifications">
                <IconButton onClick={() => setIsNotificationOpen(true)} sx={{ bgcolor: "action.hover", width: 40, height: 40 }}>
                  <Badge badgeContent={unreadCount} color="error" variant={unreadCount > 0 ? "standard" : "dot"}>
                    <NotificationsNoneIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>

              <NotificationCenter open={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />

              <Tooltip title={mode === "dark" ? "Light Mode" : "Dark Mode"}>
                <IconButton onClick={toggleMode} sx={{ bgcolor: "action.hover", width: 40, height: 40 }}>
                  {mode === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                </IconButton>
              </Tooltip>

              <LanguageSwitcher />

              <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: "center" }} />

              <Stack direction="row" alignItems="center" spacing={1} sx={{ cursor: "pointer" }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: "0.85rem", fontWeight: 700 }}>
                  {loggedInUser?.name?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                  <Typography variant="caption" fontWeight={700} display="block" lineHeight={1}>
                    {loggedInUser?.name?.split(" ")[0]}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                    PRO SELLER
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Dynamic Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, md: 4 },
            bgcolor: mode === "dark" ? alpha(theme.palette.background.default, 0.5) : alpha("#F8FAFC", 1),
            overflow: "auto",
          }}
        >
          <Box sx={{ maxWidth: 1600, mx: "auto" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Stack spacing={4}>
                  {children}
                </Stack>
              </motion.div>
            </AnimatePresence>
          </Box>
        </Box>

        {/* Minimal Footer */}
        <Box sx={{ px: 4, py: 2, bgcolor: "background.paper", borderTop: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            © {new Date().getFullYear()} Every Market Seller Center · All Rights Reserved
          </Typography>
          <Stack direction="row" spacing={3}>
            <Typography variant="caption" color="text.secondary" sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}>Privacy Policy</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}>Terms of Service</Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}
