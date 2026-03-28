import React from "react"
import { AdminLayout } from "../layouts/AdminLayout"
import { SellerLayout } from "../layouts/SellerLayout"
import { AdminDisputes } from "../features/admin/components/AdminDisputes"

export const AdminDisputesPage = ({ isSeller = false }) => {
  const Layout = isSeller ? SellerLayout : AdminLayout;
  return (
    <Layout>
      <AdminDisputes isSeller={isSeller} />
    </Layout>
  )
}

