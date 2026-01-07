<!-- # MERN E-commerce Backend — Use Cases (Node/Express)

This document lists **backend use cases** for a full MERN e-commerce website. These describe what your Node/Express server (APIs + business logic) should support.

---

## 1) Auth & User Management

- Register user (hash password, create user)
- Login user (verify password, issue JWT/access token)
- Logout (optional: invalidate refresh token)
- Refresh token (if using refresh tokens)
- Email verification (send code/link, verify)
- Forgot password (generate reset token, email it)
- Reset password (validate token, update password)
- Get current user profile (`/me`)
- Update profile (name/phone/password)
- Address management (add/edit/delete/set default)
- Role/permissions:
  - Normal user vs admin/staff
  - Middleware: `auth`, `isAdmin`, `hasRole`

---

## 2) Product Catalog

### 2.1 Products
- Create product (admin)
- Update product (admin)
- Delete product (admin) (soft delete recommended)
- Get product list (public)
  - pagination
  - search by keyword
  - filters: category, brand, price range, rating, inStock
  - sorting: price, newest, popularity
- Get product details by slug/id (public)
- Manage product variants (size/color) and prices
- Upload product images (Cloudinary/S3)
- Featured products / banner products endpoint (optional)

### 2.2 Categories / Brands
- CRUD categories (admin)
- CRUD brands (admin)
- Category tree (parent/child optional)

---

## 3) Cart (Server-side Recommended)

- Get user cart
- Add item to cart
- Update item quantity
- Remove item from cart
- Merge guest cart → user cart on login
- Validate stock when adding/updating cart

> If you store the cart only in the frontend, the backend must still validate stock at checkout.

---

## 4) Checkout & Orders

### 4.1 Order Creation
- Create order from cart
  - re-check stock for all items
  - lock/reserve or reduce stock
  - calculate totals (subtotal, discount, shipping, tax)
  - store a snapshot of product name/price at purchase time
- Generate order number (human readable)

### 4.2 Order Retrieval
- Get my orders (customer)
- Get order details (customer)
- Get all orders (admin)

### 4.3 Order State Updates (Admin/System)
- Update status: Processing → Packed → Shipped → Delivered
- Add tracking number + carrier
- Cancel order (rules: allow only if not shipped)
- Refund order (if payment captured)

### 4.4 Post-order
- Invoice generation endpoint (PDF) (optional)
- Email notifications: order placed / shipped / delivered

---

## 5) Payments (Stripe Recommended)

- Create payment intent (Stripe)
- Confirm payment (via webhook)
- Handle webhook events:
  - payment success → mark paid
  - payment failed → release reserved stock / cancel order
- Save payment record (provider, id, amount, status)
- COD flow (mark payment method = COD, mark as unpaid until delivered/confirmed)

---

## 6) Reviews & Ratings

- Create review (only if user purchased the product)
- Update review (optional)
- Delete review (optional)
- Recalculate product rating stats (avg rating, count)
- Admin moderation (hide/delete)

---

## 7) Promotions / Coupons

- Create coupon (admin)
- Update/disable coupon (admin)
- Validate coupon at checkout:
  - expiry
  - minimum order value
  - usage limits per user / global
- Apply coupon and compute discount
- Track coupon usage

---

## 8) Inventory Management

- Reduce stock when order placed (or reserve stock first)
- Prevent overselling (atomic updates / transactions)
- Restore stock on cancel/refund/payment failure
- Low-stock alerts (admin list endpoint)
- Inventory log (optional): who changed stock and why

---

## 9) Admin Dashboard / Analytics APIs

- Sales summary:
  - revenue, orders count, customers count
  - sales by day/week/month
- Top selling products
- Low stock products
- Export orders CSV endpoint (optional)

---

## 10) System / Cross-cutting Backend Concerns

- Input validation (Joi/Zod/express-validator)
- Central error handler (standard JSON errors)
- Rate limiting (login, password reset, search endpoints)
- Security headers (Helmet)
- Sanitization (NoSQL injection protection)
- Logging (morgan + winston)
- File upload protection (size/type limits)
- Pagination + indexing strategy for MongoDB
- Background jobs (optional): emails, token cleanup, report generation

---

## 11) Typical Backend Route Map (Quick View)

- `/api/auth/*` register/login/refresh/forgot/reset
- `/api/users/*` profile, addresses, admin list users
- `/api/products/*` list/detail + admin CRUD
- `/api/categories/*` CRUD
- `/api/cart/*` get/add/update/remove
- `/api/orders/*` create/my-orders/detail/admin/all/status
- `/api/payments/*` create-intent/webhook
- `/api/reviews/*` create/update/delete
- `/api/coupons/*` CRUD + validate/apply -->

# ✅ MERN Restaurant Backend Checklist (Tick as you complete)

> Use `- [ ]` for not done, `- [x]` for done.

---

## 0) Project Setup

- [ ] Create Node/Express project structure
- [ ] Setup environment variables (`.env`)
- [ ] Connect MongoDB (Mongoose)
- [ ] Add base middleware (CORS, JSON, error handler)
- [ ] Add logging (morgan/winston) (optional)

---

## 1) Auth & Users

- [ ] User model created (roles: customer/cashier/waiter/kitchen/admin)
- [ ] Register API
- [ ] Login API (JWT)
- [ ] Auth middleware (verify token)
- [ ] Role middleware (isAdmin/hasRole)
- [ ] Get my profile (`/me`)
- [ ] Update profile
- [ ] (Optional) Forgot password / Reset password

---

## 2) Menu Management

### Categories

- [ ] Category model created
- [ ] Create category (admin)
- [ ] Update category (admin)
- [ ] Delete/Disable category (admin)
- [ ] List categories (public)

### Menu Items

- [ ] MenuItem model created
- [ ] Create menu item (admin)
- [ ] Update menu item (admin)
- [ ] Delete/Disable menu item (admin)
- [ ] List menu items (public)
- [ ] Search + filter menu items (category, tags, price)
- [ ] Set availability (`isAvailable`)
- [ ] Upload images (Cloudinary/S3) (optional)

### Modifiers (Add-ons)

- [ ] ModifierGroup model created
- [ ] Create modifier group (admin)
- [ ] Update modifier group (admin)
- [ ] Delete/Disable modifier group (admin)
- [ ] Attach modifiers to menu item

---

## 3) Table Management (Dine-in)

- [ ] Table model created
- [ ] Create table (admin)
- [ ] Update table (admin)
- [ ] Delete/Disable table (admin)
- [ ] Update table status (available/occupied/reserved)
- [ ] (Optional) QR code ordering value saved

---

## 4) Orders (Core)

- [ ] Order model created (orderNumber, type, status, pricing, items snapshots)
- [ ] Create order (dine-in/takeaway/delivery)
- [ ] Add items to order (with modifiers)
- [ ] Update items (qty/remove) with rules (before cooking)
- [ ] Calculate totals server-side (subtotal/tax/discount/serviceCharge/total)
- [ ] Get single order details
- [ ] List orders (admin/staff)
- [ ] Customer: list my orders (optional if you support accounts)
- [ ] Update order status flow:
  - [ ] pending → confirmed
  - [ ] confirmed → preparing
  - [ ] preparing → ready
  - [ ] ready → served (dine-in)
  - [ ] served → completed
  - [ ] cancel order (with rules)

---

## 5) Kitchen Flow (KDS)

- [ ] Kitchen queue endpoint (orders to prepare)
- [ ] Update item kitchenStatus (queued/cooking/done)
- [ ] Auto mark order ready when all items done (optional)

---

## 6) Payments & Billing

- [ ] Payment model created
- [ ] Create payment record for an order
- [ ] Mark paid (cash/card)
- [ ] (Optional) Online payments (Stripe)
  - [ ] Create payment intent
  - [ ] Webhook verify payment
- [ ] Receipt/invoice endpoint (optional PDF)
- [ ] Refund handling (optional)

---

## 7) Delivery (Optional)

- [ ] DeliveryAddress model created (or store inside User)
- [ ] Create/update delivery address
- [ ] Delivery order flow
- [ ] Update delivery status (packed/out_for_delivery/delivered) (optional)

---

## 8) Promotions (Optional)

- [ ] Coupon model created
- [ ] Create coupon (admin)
- [ ] Validate coupon at checkout
- [ ] Apply discount and track usage

---

## 9) Reports / Admin Dashboard

- [ ] Sales summary (daily/weekly/monthly)
- [ ] Orders count by status
- [ ] Top selling items
- [ ] Low availability items (optional)
- [ ] Export orders CSV (optional)

---

## 10) Security & Quality

- [ ] Input validation (Joi/Zod/express-validator)
- [ ] Central error handler (standard JSON errors)
- [ ] Rate limiting (login/OTP)
- [ ] Security headers (Helmet)
- [ ] NoSQL injection + sanitization protection
- [ ] Pagination on list endpoints
- [ ] MongoDB indexes added:
  - [ ] User email/phone unique
  - [ ] Table tableNumber unique
  - [ ] Order orderNumber unique
  - [ ] MenuItem category index

---

## 11) Testing & Deployment

- [ ] Postman/Insomnia collection created
- [ ] Seed script (categories/menu items/tables/admin user)
- [ ] Basic unit/integration tests (optional)
- [ ] Deploy backend (Render/Railway/Vercel serverless/etc.)
- [ ] Setup production env variables
