import React from 'react'
import { AdminLayout } from '../layouts/AdminLayout'
import { AdminCoupons } from '../features/admin/components/AdminCoupons'

export const AdminCouponsPage = () => {
  return (
    <AdminLayout>
      <AdminCoupons/>
    </AdminLayout>
  )
}

