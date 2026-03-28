import React from 'react';
import { useSelector } from 'react-redux';
import {
  Navigate,
  Route, RouterProvider, createBrowserRouter, createRoutesFromElements, Outlet
} from "react-router-dom";
import { selectIsAuthChecked, selectLoggedInUser } from './features/auth/AuthSlice';
import { CssBaseline } from '@mui/material';
import { Logout } from './features/auth/components/Logout';
import { Protected } from './features/auth/components/Protected';
import { AdminProtected } from './features/auth/components/AdminProtected';
import { SellerProtected } from './features/auth/components/SellerProtected';
import { useAuthCheck } from "./hooks/useAuth/useAuthCheck";
import { useFetchLoggedInUserDetails } from "./hooks/useAuth/useFetchLoggedInUserDetails";
import { AddProductPage, AdminOrdersPage, CartPage, CheckoutPage, ForgotPasswordPage, HomePage, LoginPage, OrderSuccessPage, OtpVerificationPage, ProductDetailsPage, ProductUpdatePage, ResetPasswordPage, SignupPage, UserOrdersPage, UserProfilePage, WishlistPage, SellerApplyPage, SellerDashboardPage, SellerProductsPage, SellerOrdersPage, SellerEarningsPage, AdminUsersPage, AdminSellersPage, AdminAnalyticsPage, AdminApprovalsPage, AdminReturnsPage, AdminDisputesPage, BuyerDisputesPage, DisputeDetailPage, PaymentCancelPage, PaymentSuccessPage, PayPalReturnPage, AdminAuditLogsPage, AdminStaleOrdersPage, SellerReturnsPage, AdminReconciliationPage, PublicWishlistPage, SharedCartPage, ProductComparisonPage } from './pages';
import { BuyerInboxPage } from './pages/BuyerInboxPage';
import { SellerPromotionsPage } from './pages/SellerPromotionsPage';
import { SellerInboxPage } from './pages/SellerInboxPage';
import { SellerReviewsPage } from './pages/SellerReviewsPage';
import { SellerAnalyticsPage } from './pages/SellerAnalyticsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminBannersPage } from './pages/AdminBannersPage';
import { AdminCouponsPage } from './pages/AdminCouponsPage';
import { AdminCategoriesPage } from './pages/AdminCategoriesPage';
import { AdminFeaturedPage } from './pages/AdminFeaturedPage';
import { AdminSearchSettingsPage } from './pages/AdminSearchSettingsPage';
import { AdminCampaignsPage } from './pages/AdminCampaignsPage';
import { AdminNotificationsPage } from './pages/AdminNotificationsPage';
import { AdminLoyaltyPage } from './pages/AdminLoyaltyPage';
import { AdminSystemSettingsPage } from './pages/AdminSystemSettingsPage';
import { AdminPermissionsPage } from './pages/AdminPermissionsPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { BuyerLayout } from './layouts/BuyerLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { SellerLayout } from './layouts/SellerLayout';
import { GlobalAlertManager } from './features/notification/components/GlobalAlertManager';
import { ProductComparisonDrawer } from './features/products/components/ProductComparisonDrawer';

function App() {

  const isAuthChecked = useSelector(selectIsAuthChecked)
  const loggedInUser = useSelector(selectLoggedInUser)


  useAuthCheck();
  useFetchLoggedInUserDetails(loggedInUser);


  const routes = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route element={<><GlobalAlertManager /><ProductComparisonDrawer /><Outlet /></>}>
          <Route path='/signup' element={<SignupPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/admin/login' element={<LoginPage />} />
          <Route path='/seller/login' element={<LoginPage />} />
          <Route path='/verify-otp' element={<OtpVerificationPage />} />
          <Route path='/forgot-password' element={<ForgotPasswordPage />} />
          <Route path='/reset-password/:userId/:passwordResetToken' element={<ResetPasswordPage />} />
          <Route exact path='/logout' element={<Logout />} />

          {/* public commerce routes (support guest mode) */}
          <Route path='/' element={<BuyerLayout><HomePage /></BuyerLayout>} />
          <Route exact path='/product-details/:id' element={<BuyerLayout><ProductDetailsPage /></BuyerLayout>} />
          <Route path='/cart' element={<BuyerLayout><CartPage /></BuyerLayout>} />
          <Route path='/cart/shared/:shareableId' element={<SharedCartPage />} />
          <Route path='/checkout' element={<BuyerLayout><CheckoutPage /></BuyerLayout>} />
          <Route path='/compare' element={<BuyerLayout><ProductComparisonPage /></BuyerLayout>} />

          {/* payment return routes (public; may be guest) */}
          <Route path='/payment/success' element={<BuyerLayout><PaymentSuccessPage /></BuyerLayout>} />
          <Route path='/payment/cancel' element={<BuyerLayout><PaymentCancelPage /></BuyerLayout>} />
          <Route path='/payment/paypal/return' element={<BuyerLayout><PayPalReturnPage /></BuyerLayout>} />

          {/* user-protected routes */}
          <Route path='/profile' element={<Protected><BuyerLayout><UserProfilePage /></BuyerLayout></Protected>} />
          <Route path='/order-success/:id' element={<Protected><BuyerLayout><OrderSuccessPage /></BuyerLayout></Protected>} />
          <Route path='/orders' element={<Protected><BuyerLayout><UserOrdersPage /></BuyerLayout></Protected>} />
          <Route path='/wishlist' element={<Protected><BuyerLayout><WishlistPage /></BuyerLayout></Protected>} />
          <Route path='/wishlist/public/:id' element={<PublicWishlistPage />} />
          <Route path='/inbox' element={<Protected><BuyerLayout><BuyerInboxPage /></BuyerLayout></Protected>} />
          <Route path='/disputes' element={<Protected><BuyerLayout><BuyerDisputesPage /></BuyerLayout></Protected>} />
          <Route path='/dispute-details/:id' element={<Protected><BuyerLayout><DisputeDetailPage /></BuyerLayout></Protected>} />

          {/* admin routes */}
          <Route path='/admin/dashboard' element={<AdminProtected><AdminDashboardPage /></AdminProtected>} />
          <Route path='/admin/product-update/:id' element={<AdminProtected><ProductUpdatePage /></AdminProtected>} />
          <Route path='/admin/add-product' element={<AdminProtected><AddProductPage /></AdminProtected>} />
          <Route path='/admin/orders' element={<AdminProtected><AdminOrdersPage /></AdminProtected>} />
          <Route path='/admin/banners' element={<AdminProtected><AdminBannersPage /></AdminProtected>} />
          <Route path='/admin/coupons' element={<AdminProtected><AdminCouponsPage /></AdminProtected>} />
          <Route path='/admin/categories' element={<AdminProtected><AdminCategoriesPage /></AdminProtected>} />
          <Route path='/admin/featured' element={<AdminProtected><AdminFeaturedPage /></AdminProtected>} />
          <Route path='/admin/search-settings' element={<AdminProtected><AdminSearchSettingsPage /></AdminProtected>} />
          <Route path='/admin/campaigns' element={<AdminProtected><AdminCampaignsPage /></AdminProtected>} />
          <Route path='/admin/notifications' element={<AdminProtected><AdminNotificationsPage /></AdminProtected>} />
          <Route path='/admin/loyalty' element={<AdminProtected><AdminLoyaltyPage /></AdminProtected>} />
          <Route path='/admin/settings' element={<AdminProtected><AdminSystemSettingsPage /></AdminProtected>} />
          <Route path='/admin/audit-logs' element={<AdminProtected><AdminAuditLogsPage /></AdminProtected>} />
          <Route path='/admin/stale-orders' element={<AdminProtected><AdminStaleOrdersPage /></AdminProtected>} />
          <Route path='/admin/users' element={<AdminProtected><AdminUsersPage /></AdminProtected>} />
          <Route path='/admin/permissions' element={<AdminProtected><AdminPermissionsPage /></AdminProtected>} />
          <Route path='/admin/sellers' element={<AdminProtected><AdminSellersPage /></AdminProtected>} />
          <Route path='/admin/analytics' element={<AdminProtected><AdminAnalyticsPage /></AdminProtected>} />
          <Route path='/admin/approvals' element={<AdminProtected><AdminApprovalsPage /></AdminProtected>} />
          <Route path='/admin/returns' element={<AdminProtected><AdminReturnsPage /></AdminProtected>} />
          <Route path='/admin/disputes' element={<AdminProtected><AdminDisputesPage /></AdminProtected>} />
          <Route path='/admin/reconciliation' element={<AdminProtected><AdminReconciliationPage /></AdminProtected>} />
          <Route path='/admin/dispute-details/:id' element={<AdminProtected><AdminLayout><DisputeDetailPage /></AdminLayout></AdminProtected>} />

          {/* seller routes */}
          <Route path='/seller/apply' element={<Protected><SellerApplyPage /></Protected>} />
          <Route path='/seller/dashboard' element={<SellerProtected><SellerDashboardPage /></SellerProtected>} />
          <Route path='/seller/products' element={<SellerProtected><SellerProductsPage /></SellerProtected>} />
          <Route path='/seller/orders' element={<SellerProtected><SellerOrdersPage /></SellerProtected>} />
          <Route path='/seller/promotions' element={<SellerProtected><SellerPromotionsPage /></SellerProtected>} />
          <Route path='/seller/inbox' element={<SellerProtected><SellerInboxPage /></SellerProtected>} />
          <Route path='/seller/reviews' element={<SellerProtected><SellerReviewsPage /></SellerProtected>} />
          <Route path='/seller/insights' element={<SellerProtected><SellerAnalyticsPage /></SellerProtected>} />
          <Route path='/seller/earnings' element={<SellerProtected><SellerEarningsPage /></SellerProtected>} />
          <Route path='/seller/returns' element={<SellerProtected><SellerReturnsPage /></SellerProtected>} />
          <Route path='/seller/disputes' element={<SellerProtected><AdminDisputesPage isSeller /></SellerProtected>} />
          <Route path='/seller/disputes' element={<SellerProtected><AdminDisputesPage isSeller /></SellerProtected>} />
          <Route path='/seller/dispute-details/:id' element={<SellerProtected><SellerLayout><DisputeDetailPage /></SellerLayout></SellerProtected>} />

          <Route path='*' element={<NotFoundPage />} />
        </Route>

      </>
    )
  )


  return isAuthChecked ? (
    <React.Fragment>
      <CssBaseline />
      <RouterProvider router={routes} />
    </React.Fragment>
  ) : "";
}

export default App;
