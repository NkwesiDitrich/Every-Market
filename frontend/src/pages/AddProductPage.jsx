import React from 'react'
import { AddProduct } from '../features/admin/components/AddProduct'
import { AdminLayout } from '../layouts/AdminLayout'

export const AddProductPage = () => {
  return (
    <AdminLayout>
      <AddProduct/>
    </AdminLayout>
  )
}
