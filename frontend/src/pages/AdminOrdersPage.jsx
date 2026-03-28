import React from 'react'
import { AdminOrders } from '../features/admin/components/AdminOrders'
import { AdminLayout } from '../layouts/AdminLayout'

export const AdminOrdersPage = () => {
  return (
    <AdminLayout>
      <AdminOrders/>
    </AdminLayout>
  )
}
