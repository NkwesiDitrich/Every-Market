import React from "react"
import { AdminLayout } from "../layouts/AdminLayout"
import { AdminCampaigns } from "../features/admin/components/AdminCampaigns"

export const AdminCampaignsPage = () => (
  <AdminLayout>
    <AdminCampaigns />
  </AdminLayout>
)
