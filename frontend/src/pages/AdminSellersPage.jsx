import React from "react"
import { AdminLayout } from "../layouts/AdminLayout"
import { AdminSellers } from "../features/admin/components/AdminSellers"

export const AdminSellersPage = () => {
  return (
    <AdminLayout>
      <AdminSellers />
    </AdminLayout>
  )
}
