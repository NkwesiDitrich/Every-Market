import React, { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  Box, Drawer, List, ListItemButton, ListItemText, Stack, Toolbar, AppBar,
  Typography, IconButton, useMediaQuery, useTheme, Avatar, Badge, Tooltip,
  Divider, InputBase, alpha, Chip, ListItemIcon, Collapse
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import MenuOpenIcon from "@mui/icons-material/MenuOpen"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import SearchIcon from "@mui/icons-material/Search"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"
import LogoutIcon from "@mui/icons-material/Logout"
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag"
import DashboardIcon from "@mui/icons-material/Dashboard"
import BarChartIcon from "@mui/icons-material/BarChart"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import CategoryIcon from "@mui/icons-material/Category"
import StarIcon from "@mui/icons-material/Star"
import TuneIcon from "@mui/icons-material/Tune"
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn"
import GavelIcon from "@mui/icons-material/Gavel"
import CampaignIcon from "@mui/icons-material/Campaign"
import LocalOfferIcon from "@mui/icons-material/LocalOffer"
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard"
import NotificationsIcon from "@mui/icons-material/Notifications"
import DiamondIcon from "@mui/icons-material/Diamond"
import PeopleIcon from "@mui/icons-material/People"
import SecurityIcon from "@mui/icons-material/Security"
import StoreIcon from "@mui/icons-material/Store"
import SettingsIcon from "@mui/icons-material/Settings"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import LightModeIcon from "@mui/icons-material/LightMode"
import DarkModeIcon from "@mui/icons-material/DarkMode"
import { selectLoggedInUser } from "../features/auth/AuthSlice"
import { useThemeMode } from "../context/ThemeModeContext"
import { Link } from "react-router-dom"
import { LanguageSwitcher } from "../features/navigation/components/LanguageSwitcher"
import { useDispatch } from "react-redux"
import { fetchNotificationsAsync, selectUnreadCount } from "../features/notification/NotificationSlice"
import { NotificationCenter } from "../features/notification/components/NotificationCenter"

const drawerWidth = 260
const miniDrawerWidth = 72

const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", path: "/admin/dashboard", icon: <DashboardIcon fontSize="small" /> },
      { label: "Analytics", path: "/admin/analytics", icon: <BarChartIcon fontSize="small" /> },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Orders", path: "/admin/orders", icon: <ShoppingCartIcon fontSize="small" /> },
      { label: "Catalog Approvals", path: "/admin/approvals", icon: <CheckCircleOutlineIcon fontSize="small" /> },
      { label: "Returns", path: "/admin/returns", icon: <AssignmentReturnIcon fontSize="small" /> },
      { label: "Stale Orders", path: "/admin/stale-orders", icon: <ErrorOutlineIcon fontSize="small" /> },
      { label: "Disputes", path: "/admin/disputes", icon: <GavelIcon fontSize="small" /> },
    ],
  },
  {
    label: "Catalog",
    items: [
      { label: "Categories", path: "/admin/categories", icon: <CategoryIcon fontSize="small" /> },
      { label: "Featured", path: "/admin/featured", icon: <StarIcon fontSize="small" /> },
      { label: "Search Settings", path: "/admin/search-settings", icon: <TuneIcon fontSize="small" /> },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Banners", path: "/admin/banners", icon: <CampaignIcon fontSize="small" /> },
      { label: "Coupons", path: "/admin/coupons", icon: <LocalOfferIcon fontSize="small" /> },
      { label: "Campaigns", path: "/admin/campaigns", icon: <CardGiftcardIcon fontSize="small" /> },
      { label: "Notifications", path: "/admin/notifications", icon: <NotificationsIcon fontSize="small" /> },
      { label: "Loyalty", path: "/admin/loyalty", icon: <DiamondIcon fontSize="small" /> },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Users", path: "/admin/users", icon: <PeopleIcon fontSize="small" /> },
      { label: "Roles & Permissions", path: "/admin/permissions", icon: <SecurityIcon fontSize="small" /> },
      { label: "Sellers", path: "/admin/sellers", icon: <StoreIcon fontSize="small" /> },
    ],
  },
  {
    label: "System",
    items: [
      { label: "System Settings", path: "/admin/settings", icon: <SettingsIcon fontSize="small" /> },
      { label: "Audit Logs", path: "/admin/audit-logs", icon: <AssignmentReturnIcon fontSize="small" /> },
    ],
  },
]

const NavGroup = ({ group, collapsed, location, onNavigate }) => {
  const [open, setOpen] = useState(true)
  const isActive = (path) => location.pathname === path
  const hasActive = group.items.some(i => isActive(i.path))

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
        sx={{ py: 0.5, px: 2, opacity: 0.5, fontSize: "0.7rem" }}
      >
        <ListItemText
          primary={group.label.toUpperCase()}
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
              primary={item.label}
              primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: isActive(item.path) ? 600 : 400 }}
            />
          </ListItemButton>
        ))}
      </Collapse>
    </Box>
  )
}

export const AdminLayout = ({ children }) => {
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

  const effectiveWidth = sidebarCollapsed ? miniDrawerWidth : drawerWidth

  const handleNavClick = (path) => {
    navigate(path)
    if (isMobile) setMobileOpen(false)
  }

  const currentPageLabel = navGroups
    .flatMap(g => g.items)
    .find(i => i.path === location.pathname)?.label || "Admin"

  const drawer = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Logo */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5, minHeight: 64 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: 2, bgcolor: "primary.main",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
        }}>
          <Typography fontWeight={800} color="white" fontSize="1rem">E</Typography>
        </Box>
        {!sidebarCollapsed && (
          <Box>
            <Typography fontWeight={800} fontSize="1rem" lineHeight={1}>Every Market</Typography>
            <Typography variant="caption" color="text.secondary">Admin Console</Typography>
          </Box>
        )}
      </Box>

      <Divider />

      {/* Nav groups */}
      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", py: 1 }}>
        <List disablePadding>
          {navGroups.map((group) => (
            <Box key={group.label} mb={0.5}>
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

      <Divider />

      {/* Bottom profile strip */}
      <Box sx={{ p: 1.5 }}>
        {sidebarCollapsed && !isMobile ? (
          <Tooltip title={loggedInUser?.email} placement="right">
            <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", mx: "auto", cursor: "pointer" }}>
              {loggedInUser?.name?.[0]?.toUpperCase() || "A"}
            </Avatar>
          </Tooltip>
        ) : (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: "0.85rem" }}>
              {loggedInUser?.name?.[0]?.toUpperCase() || "A"}
            </Avatar>
            <Box flex={1} minWidth={0}>
              <Typography variant="body2" fontWeight={600} noWrap>{loggedInUser?.name || "Admin"}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>{loggedInUser?.email}</Typography>
            </Box>
            <Tooltip title="Logout">
              <IconButton size="small" onClick={() => navigate("/logout")} sx={{ color: "text.secondary" }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
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
        sx={{ width: { md: effectiveWidth }, flexShrink: { md: 0 }, transition: "width 0.25s ease" }}
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
              transition: "width 0.25s ease",
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

      {/* Main content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, transition: "all 0.25s ease" }}>
        {/* Top AppBar */}
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
          <Toolbar sx={{ gap: 1.5, px: { xs: 1.5, md: 3 }, minHeight: "56px !important" }}>
            {/* Mobile menu toggle */}
            {isMobile ? (
              <IconButton onClick={() => setMobileOpen(true)} size="small">
                <MenuIcon />
              </IconButton>
            ) : (
              <Tooltip title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
                <IconButton onClick={() => setSidebarCollapsed(v => !v)} size="small">
                  {sidebarCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
                </IconButton>
              </Tooltip>
            )}

            {/* Page title */}
            <Typography variant="h6" fontWeight={700} sx={{ display: { xs: "none", sm: "block" } }}>
              {currentPageLabel}
            </Typography>

            {/* Search bar */}
            <Box sx={{
              flex: 1, maxWidth: 400, mx: 2,
              display: { xs: "none", md: "flex" }, alignItems: "center",
              bgcolor: "action.hover", borderRadius: 2, px: 2, py: 0.5,
            }}>
              <SearchIcon sx={{ color: "text.secondary", mr: 1, fontSize: "1.1rem" }} />
              <InputBase
                placeholder="Search anything..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                sx={{ flex: 1, fontSize: "0.875rem" }}
              />
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Right actions */}
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
                <IconButton size="small" onClick={toggleMode} sx={{ color: "text.secondary" }}>
                  {mode === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                </IconButton>
              </Tooltip>

              <LanguageSwitcher />

              <Tooltip title="Switch to Shop">
                <IconButton
                  onClick={() => navigate("/")}
                  sx={{ bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" }, width: 36, height: 36 }}
                >
                  <ShoppingBagIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Notifications">
                <IconButton onClick={() => setIsNotificationOpen(true)} size="small" sx={{ color: "text.secondary" }}>
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsNoneIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>

              <NotificationCenter open={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />

              <Chip
                avatar={<Avatar sx={{ bgcolor: "primary.main", width: 24, height: 24 }}>
                  {loggedInUser?.name?.[0]?.toUpperCase() || "A"}
                </Avatar>}
                label={loggedInUser?.name?.split(" ")[0] || "Admin"}
                size="small"
                variant="outlined"
                sx={{ ml: 0.5, fontWeight: 600 }}
              />
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, md: 3 },
            overflow: "auto",
          }}
        >
          <Stack spacing={3}>{children}</Stack>
        </Box>

        {/* Footer */}
        <Box sx={{ px: 3, py: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary">
            Every Market Admin Console · {new Date().getFullYear()}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
