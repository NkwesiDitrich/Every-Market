import React from 'react'
import { AdminDashBoard } from '../features/admin/components/AdminDashBoard'
import { AdminLayout } from '../layouts/AdminLayout'

export const AdminDashboardPage = () => {
  return (
    <AdminLayout>
      <AdminDashBoard/>
    </AdminLayout>
  )
}
