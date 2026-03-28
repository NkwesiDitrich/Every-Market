import React from "react"
import { AdminLayout } from "../layouts/AdminLayout"
import { AdminFeaturedCollections } from "../features/admin/components/AdminFeaturedCollections"

export const AdminFeaturedPage = () => (
  <AdminLayout>
    <AdminFeaturedCollections />
  </AdminLayout>
)
