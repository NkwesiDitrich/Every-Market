import React from "react"
import { AdminLayout } from "../layouts/AdminLayout"
import { AdminUsers } from "../features/admin/components/AdminUsers"

export const AdminUsersPage = () => {
  return (
    <AdminLayout>
      <AdminUsers />
    </AdminLayout>
  )
}
