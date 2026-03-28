import React from "react"
import { AdminLayout } from "../layouts/AdminLayout"
import { AdminApprovals } from "../features/admin/components/AdminApprovals"

export const AdminApprovalsPage = () => {
  return (
    <AdminLayout>
      <AdminApprovals />
    </AdminLayout>
  )
}

