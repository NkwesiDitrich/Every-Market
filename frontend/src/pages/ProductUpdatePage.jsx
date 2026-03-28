import React from 'react'
import { ProductUpdate } from '../features/admin/components/ProductUpdate'
import { AdminLayout } from '../layouts/AdminLayout'

export const ProductUpdatePage = () => {
  return (
    <AdminLayout>
      <ProductUpdate/>
    </AdminLayout>
  )
}
