import React from "react"
import { AdminLayout } from "../layouts/AdminLayout"
import { AdminPermissions } from "../features/admin/components/AdminPermissions"

export const AdminPermissionsPage = () => {
  return (
    <AdminLayout>
      <AdminPermissions />
    </AdminLayout>
  )
}
