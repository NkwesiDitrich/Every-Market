# Shopora Platform: Roles and Actions Documentation

This document outlines all the functionalities and actions available to the different user roles in the Shopora MERN E-commerce platform.

---

## 1. Admin Capabilities (Super Administrator)

The Admin has full control over the platform's operations, users, and content.

### Dashboard & Analytics
- **Strategic Overview**: Monitor platform-wide KPIs: Total Revenue, Total Orders, Active Users, and Registered Sellers.
- **Performance Tracking**: View interactive charts for Revenue Growth and Order Volume.
- **Inventory Insights**: Identify Top Selling Products and Top Performing Categories.
- **User Activity**: Monitor recent platform registrations and high-value orders.

### User & Seller Management
- **User Directory**: View list of all registered accounts (Admins, Sellers, Buyers).
- **Account Control**: Update user roles, change account status (Active/Blocked), and manage user profiles.
- **Seller Approvals**: Review pending seller applications and approve or reject based on documentation.
- **Seller Oversight**: Monitor individual seller performance, product counts, and overall revenue.

### Platform Operations
- **Universal Order Management**: Search and filter any order on the platform, view detailed timelines, and update order statuses.
- **Universal Product Control**: Edit or delete any product listing to ensure content quality and compliance.
- **Dispute Mediation**: Official "judge" role in buyer-seller conflicts. Review evidence, chat with both parties, and issue definitive resolutions (Refund/Return/Reject).
- **Return Processing**: Oversee platform-wide return requests and ensure merchant compliance.

### Content & Marketing
- **Banner Management**: Create, update, and schedule homepage hero banners.
- **Category & Brand Logic**: Create product category hierarchies and manage brand listings.
- **Featured Collections**: Group products into curated "Collections" (e.g., "Summer Essentials") for the homepage.
- **Coupon System**: Create platform-wide discount codes and manage validity periods.
- **Campaign Engine**: Orchestrate site-wide marketing events or flash sales.

### Configuration & Security
- **RBAC (Permissions)**: Define granular access rights for different administrative roles.
- **Search Tuning**: Configure search algorithm weights, filters, and priority ranking.
- **Loyalty Program**: Setup and manage reward point systems and referral bonuses.
- **System Settings**: Manage API keys, payment gateway credentials, and global site metadata.
- **Global Alerts**: Send push/system notifications to all users or specific segments.

---

## 2. Seller Capabilities (Merchant/Vendor)

Sellers manage their own professional storefront and commercial activities.

### Store Management
- **Merchant Dashboard**: Monitor store-specific revenue, sales volume, and product performance.
- **Business Insights**: Detailed funnel analysis (Product views → Add-to-cart → Order conversion).
- **Review Management**: View all product reviews and post official merchant responses.

### Inventory & Catalog
- **Product Creation**: Multi-step listing tool for adding products with media, pricing, variations (Size/Color), and SEO metadata.
- **Bulk Management**: View product list with real-time stock status, bulk update prices, or manage inventory levels.
- **Draft Mode**: Save product listings to "Draft" status before making them public.
- **Visuals**: Primary thumbnail and multi-image gallery management.

### Order Fulfillment
- **Order Queue**: Track sales specific to the store, filter by status (Pending, Shipped, Delivered).
- **Logistics Control**: Update order status to "Shipped" or "Delivered" and view buyer delivery instructions.
- **Invoice Management**: Generate and review order invoices for accounting.

### Marketing & Growth
- **Merchant Coupons**: Create store-specific discount codes for targeted promotions.
- **Product Bundles**: Group items into bundles for higher Average Order Value (AOV).
- **Sales Participation**: Nominate products for platform-wide flash sales or seasonal campaigns.

### Communication & Finance
- **Buyer Inbox**: Real-time chat with buyers regarding order status or product questions.
- **Merchant Disputes**: Defend against buyer disputes by providing shipping proof and product evidence.
- **Earnings Tracking**: Monitor total balance, requested payouts, and upcoming settlements.
- **Onboarding**: Apply for seller status, submit documentation, and manage storefront profile.

---

## 3. Buyer Capabilities (Customer)

Buyers interact with the platform to discover, purchase, and manage their orders.

### Discovery & Shopping
- **Advanced Search**: Search for products with auto-suggestions and advanced filters (Price, Category, Rating).
- **Dynamic Homepage**: Browse personalized recommendations, featured collections, and active flash sales.
- **Product Details**: View high-resolution image galleries, product specifications, verified reviews, and related items.
- **Variants**: Select specific product attributes (e.g., Size: XL, Color: Blue).

### Transactional
- **Cart Management**: Add items to cart, adjust quantities, and see real-time price totals with taxes.
- **Wishlist**: Save favorite products for later purchase.
- **Checkout Flow**: Secure multi-payment gateway selection (Card, PayPal, etc.) and shipping address selection.

### Post-Purchase
- **Order Dashboard**: View entire order history, track status for each item, and download invoices.
- **Dispute Management**: Report problems with an order (e.g., "Item not received" or "Wrong item") and participate in the mediation process.
- **Social Reviewing**: Rate products and upload text reviews with feedback.

### Profile & Support
- **Account Security**: Manage profile details, update password, and handle OTP (One-Time Password) verification.
- **Chat Support**: Message sellers directly through the integrated inbox for inquiries.
- **In-App Notifications**: Receive alerts for order shipments, price drops, or promotional offers.

---

## 4. Public / Guest Capabilities

Users who are not logged in can still interact with the platform's public surface.

- **Browse Catalog**: View all public products, categories, and homepage content.
- **Global Search**: Search for specific products using the search engine.
- **View Product Info**: Access product descriptions, prices, and public reviews.
- **Registration**: Join the platform as a Buyer or Apply as a Seller.
