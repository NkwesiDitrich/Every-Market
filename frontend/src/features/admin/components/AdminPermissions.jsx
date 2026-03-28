import React from "react"
import { Card, CardContent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"

const PERMISSION_MATRIX = [
  { area: "Users", admin: true, support: true, marketing: false, desc: "List, update roles, ban, verify" },
  { area: "Orders", admin: true, support: true, marketing: false, desc: "View and manage orders" },
  { area: "Products & catalog", admin: true, support: false, marketing: false, desc: "Add, edit, approve products" },
  { area: "Categories", admin: true, support: false, marketing: false, desc: "CRUD categories" },
  { area: "Banners", admin: true, support: false, marketing: true, desc: "Manage home banners" },
  { area: "Featured collections", admin: true, support: false, marketing: true, desc: "Manage featured sections" },
  { area: "Search settings", admin: true, support: false, marketing: false, desc: "Default sort, boost brands/categories" },
  { area: "Returns & refunds", admin: true, support: true, marketing: false, desc: "Approve/deny return requests" },
  { area: "Disputes", admin: true, support: true, marketing: false, desc: "View and resolve buyer-seller disputes" },
  { area: "Coupons", admin: true, support: false, marketing: true, desc: "Create and manage promo codes" },
  { area: "Campaigns", admin: true, support: false, marketing: true, desc: "Create campaigns, attach to banners" },
  { area: "Notifications", admin: true, support: false, marketing: true, desc: "Send notifications to users" },
  { area: "Loyalty points", admin: true, support: false, marketing: true, desc: "Configure and adjust loyalty" },
  { area: "Sellers", admin: true, support: false, marketing: false, desc: "Approve sellers, commission, health" },
  { area: "Analytics", admin: true, support: false, marketing: false, desc: "Revenue, orders, top products/sellers" },
  { area: "System settings", admin: true, support: false, marketing: false, desc: "Currency, tax, payment, legal" },
]

const CellIcon = ({ has }) =>
  has ? (
    <CheckIcon color="success" fontSize="small" />
  ) : (
    <CloseIcon color="disabled" fontSize="small" />
  )

export const AdminPermissions = () => {
  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" fontWeight={600}>
          Roles & permissions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Permission matrix showing what each staff role can access. Assign roles to users in the Users page.
        </Typography>
      </Stack>

      <Card>
        <CardContent>
          <TableContainer>
            <Table size="small" sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Area</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Admin</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Support</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Marketing</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {PERMISSION_MATRIX.map((row) => (
                  <TableRow key={row.area} hover>
                    <TableCell>{row.area}</TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {row.desc}
                    </TableCell>
                    <TableCell align="center">
                      <CellIcon has={row.admin} />
                    </TableCell>
                    <TableCell align="center">
                      <CellIcon has={row.support} />
                    </TableCell>
                    <TableCell align="center">
                      <CellIcon has={row.marketing} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ bgcolor: "action.hover" }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Summary
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div">
            <strong>Admin:</strong> Full access to all areas.
            <br />
            <strong>Support:</strong> Users, orders, returns, disputes — for customer support workflows.
            <br />
            <strong>Marketing:</strong> Banners, featured, coupons, campaigns, notifications, loyalty — no system config.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  )
}
