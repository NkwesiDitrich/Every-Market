# Shopora Platform: Enhancement Roadmap (remake.md)

This document outlines the 3-phase plan to implement the requested improvements and advanced features for the Shopora platform, enhancing the experience for Admins, Sellers, Buyers, and Guests.

---

## Phase 1: Core Automation & Communication (The Essentials)
*Focus: Improving real-time awareness and basic self-service options.*

### Admin
- **Critical Alert System**: Implement a notification dashboard for "Critical Issues" such as orders pending for > X days and system-wide low stock alerts.
- **Enhanced Notifications**: Basic email/system alerts to admins for major platform events.

### Seller
- **Real-time Order Alerts**: Implement push notifications or instant in-app alerts for new orders and new disputes.
- **Stock Notifications**: Automated alerts when a product reaches the low-stock threshold.

### Buyer
- **Direct Order Cancellation**: Allow buyers to cancel an order directly from their dashboard *if* it is still in the "Pending" state (before seller processing).
- **Persistent Cart**: Automatically merge the guest cart into the user's account upon login/signup.

### Guest / Public
- **Advanced Filtering & Sorting**: Refine the homepage and search results with more granular filters (Rating, Availability, Newest).
- **Persistent Cart Foundation**: Enable adding to cart as a guest with prompt to login for persistence.

---

## Phase 2: Operational Excellence & Logistics (Scaling)
*Focus: Deepening logistics integration, accountability, and user convenience.*

### Admin
- **Seller Automation**: Implement a system that alerts or auto-escalates orders if a seller hasn't updated the status within a defined timeframe.
- **Audit Logs**: A dedicated admin screen to track all administrative changes (product edits, role changes, settings updates) for accountability.

### Seller
- **Advanced Returns Management**: Add a dedicated "Returns" dashboard for sellers to approve/reject return requests, manage restocking, and update return inventory.
- **Basic Shipping Tracking**: Allow sellers to manually input tracking numbers from major carriers (FedEx, DHL, etc.) that link to external tracking sites.

### Buyer
- **Self-Service Returns flow**: A guided UI flow for requesting returns, allowing users to select the reason and upload images without starting a full "Dispute" initially.
- **PDF Payment Receipts**: Automated generation and download of PDF invoices/receipts for every successful order.
- **Multi-Address Support**: Allow users to save and choose from multiple shipping/billing addresses during checkout.

### Guest / Public
- **Quick View / Comparison**: Enable a "Quick View" modal for products to see details without leaving the search/homepage, and a basic "Compare" tool for side-by-side specs.

---

## Phase 3: Advanced Analytics & Premium Experience (The Edge)
*Focus: Data-driven insights, financial precision, and social engagement.*

### Admin
- **Advanced Analytics Suite**: Granular reports on Churn Rate, Abandoned Cart frequency, Top Customers by LTV (Lifetime Value), and Repeat Purchase rates.
- **Payment Reconciliation**: A finance module to track total payouts to sellers, platform commission fees, and net profit tracking.

### Seller
- **Marketing Analytics**: Provide sellers with conversion rates per product, traffic source breakdowns (referral, direct, search), and abandoned cart insights for their specific store.
- **Logistics API Integration**: Direct integration with logistics providers (e.g., FedEx API) to pull real-time tracking status into the Shopora dashboard.

### Buyer
- **Push Notification Engine**: Real-time delivery updates, restock alerts for wishlisted items, and personalized promotional notifications.
- **Social Sharing**: Enable buyers to share their Wishlist or Cart with others via a unique link.

### Guest / Public
- **Social Login Integration**: Implement "Sign in with Google" and "Sign in with Facebook" for friction-less onboarding.
