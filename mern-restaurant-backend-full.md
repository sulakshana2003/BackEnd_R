# MERN Restaurant Backend — Full Feature Set (Models + Use Cases + API Map)

This is a **full backend feature list** for a Restaurant / POS-style MERN project. It goes beyond basic menu CRUD and covers real restaurant workflows (kitchen, tables, payments, reporting, etc.).

---

## 1) Core Models (Recommended)

### 1.1 User

**Purpose:** customers + staff/admin accounts.

**Fields**

- `name`
- `email` (unique, optional if phone login)
- `phone` (unique if OTP/login)
- `passwordHash` (if email/password)
- `role`: `customer | cashier | waiter | kitchen | manager | admin`
- `permissions` (optional fine-grained permissions array)
- `isActive`
- timestamps

---

### 1.2 Category

**Purpose:** menu grouping.

**Fields**

- `name`
- `description`
- `image` (optional)
- `isActive`
- `sortOrder`
- timestamps

---

### 1.3 MenuItem (Expanded)

**Purpose:** food/drink item definition (this is where most features live).

**Fields**

- `name`
- `slug` (unique, for URLs)
- `category` (ref → Category)
- `description`
- `images` (array)
- `basePrice` (number)
- `pricingMode`: `fixed | variants` _(fixed = one price, variants = sizes/portion prices)_
- `variants` (optional array)
  - `name` (Small/Medium/Large)
  - `price`
  - `isAvailable`
- `taxCategory` (optional, ref or string)
- `isAvailable` (global toggle)
- `availabilitySchedule` (optional)
  - `daysOfWeek` (0-6)
  - `startTime` / `endTime`
- `prepTimeMinutes` (optional)
- `kitchenStation` (optional): `grill | fryer | bar | dessert | main` _(for routing)_
- `tags` (popular, spicy, chef-special)
- `allergens` (optional array: nuts, dairy, gluten)
- `spiceLevel` (optional 0-5)
- `calories` (optional)
- `costPrice` (optional, for profit reports)
- `sku` (optional)
- `sortOrder`
- timestamps

> **Best practice:** keep `costPrice` optional (not visible to customers), use it for admin profit reports.

---

### 1.4 ModifierGroup (Expanded Add-ons / Options)

**Purpose:** add-ons and customizations (extras, toppings, doneness, sugar level).

**Fields**

- `name`
- `menuItem` (ref → MenuItem) OR `isGlobal` (boolean)
- `type`: `single | multiple`
- `isRequired`
- `minSelect`, `maxSelect` (for multiple)
- `options`: array of
  - `name`
  - `priceDelta`
  - `isAvailable`
  - `defaultSelected` (optional)
- timestamps

---

### 1.5 Combo / Bundle (Optional but strong feature)

**Purpose:** meal deals (Burger + Fries + Coke).

**Fields**

- `name`
- `description`
- `image`
- `items` (array of refs → MenuItem with qty)
- `bundlePrice`
- `isAvailable`
- timestamps

---

### 1.6 Table

**Purpose:** dine-in tracking.

**Fields**

- `tableNumber` (unique)
- `seats`
- `status`: `available | occupied | reserved`
- `currentOrder` (ref → Order, optional)
- `location` (indoor/outdoor/floor)
- `qrCodeValue` (optional)
- timestamps

---

### 1.7 Order (Expanded)

**Purpose:** dine-in / takeaway / delivery orders.

**Fields**

- `orderNumber` (unique)
- `customer` (ref → User, optional for walk-in)
- `type`: `dine_in | takeaway | delivery`
- `table` (ref → Table, only dine-in)
- `status`: `pending | confirmed | preparing | ready | served | completed | cancelled | voided`
- `items` (embedded snapshots)
  - `menuItem` (ref)
  - `nameSnapshot`
  - `variantSnapshot` (optional)
  - `priceSnapshot`
  - `quantity`
  - `modifiersSnapshot` (selected options + prices)
  - `notes` (e.g., “no onions”)
  - `kitchenStatus`: `queued | cooking | done`
  - `itemTotal`
- `pricing`
  - `subtotal`
  - `discount`
  - `tax`
  - `serviceCharge` (optional)
  - `tip` (optional)
  - `total`
- `coupon` (optional ref/code snapshot)
- `notes` (order-level notes)
- `createdBy` (ref → User staff)
- timestamps

**Extra restaurant flows**

- `splitGroupId` (optional: for split bills)
- `isPrinted` (optional: receipt printed flag)
- `kitchenTicketNumber` (optional)

> **Snapshot rule:** store name/price/modifiers as snapshots so bills never change after menu edits.

---

### 1.8 Payment

**Purpose:** order payments (supports split payments).

**Fields**

- `order` (ref → Order)
- `method`: `cash | card | online`
- `status`: `pending | paid | failed | refunded | partial`
- `amount`
- `transactionId` (optional)
- `paidAt`
- `receivedBy` (ref → User staff)
- timestamps

---

## 2) Optional Models (Choose what you need)

### 2.1 Reservation

- `customer` (ref → User)
- `table` (ref → Table, optional until assigned)
- `dateTime`
- `guestsCount`
- `status`: `pending | confirmed | cancelled | no_show`
- `notes`

### 2.2 DeliveryAddress

- `user` (ref → User)
- `label` (Home/Office)
- `addressLine1`, `addressLine2`, `city`
- `location` (lat/lng optional)
- `isDefault`

### 2.3 Coupon / Discount

- `code` (unique)
- `type`: `fixed | percent`
- `value`
- `minOrderTotal`
- `startAt`, `endAt`
- `usageLimit`, `perUserLimit`
- `isActive`
- timestamps

### 2.4 Review / Feedback

- `customer` (ref → User)
- `order` (ref → Order, optional but ideal)
- `rating` (1–5)
- `comment`
- `isPublic`
- timestamps

### 2.5 AuditLog (Very useful for admin tracing)

- `actor` (ref → User)
- `action` (string, e.g. `MENU_UPDATE`, `ORDER_VOID`)
- `entityType` (e.g., `MenuItem`, `Order`)
- `entityId`
- `before` (object snapshot)
- `after` (object snapshot)
- timestamps

### 2.6 Shift / Cash Register (POS-style)

- `openedBy` (ref → User)
- `openedAt`
- `closedAt`
- `openingCash`
- `closingCash`
- `expectedCash`
- `difference`
- `notes`

---

## 3) Backend Features & Use Cases (Full List)

## 3.1 Authentication & Roles

- Register/login (customer)
- Staff accounts created by admin/manager
- JWT auth middleware
- Role-based access control:
  - **Admin/Manager:** full access
  - **Cashier:** payments, orders
  - **Waiter:** tables + dine-in orders
  - **Kitchen:** kitchen queue updates only
- Account disable/enable

---

## 3.2 Menu Management (Beyond Basic CRUD)

### MenuItem advanced features

- Create/update/delete/soft-disable menu items
- Upload multiple images
- Search + filter:
  - category, tags, availability, price range
- Sorting:
  - popularity (based on sales), newest, price
- Variants (sizes/portions):
  - add/update/disable a variant
- Availability schedule:
  - breakfast/lunch/dinner timing
- Allergen + spice level + nutrition fields
- Kitchen station routing (grill/fryer/bar)
- Bulk operations:
  - bulk price update by category
  - bulk availability toggle
  - CSV import/export (optional)
- Prevent delete if item is used in active orders (soft delete recommended)

### Modifier (add-on) features

- Create global modifiers (e.g., “Spice level”) reusable across items
- Required modifiers (must choose 1)
- Multi-select modifiers (choose up to N)
- Default selected options
- Disable a single option without deleting the group

### Combos/Bundles (optional)

- Create/update combos
- Validate combo items exist & available
- Combo price calculations + snapshots in order

---

## 3.3 Table & Dine-in Features

- CRUD tables
- Change table status
- Open a table (creates a dine-in order)
- Add items to a table order
- Transfer order from one table to another
- Merge tables/orders (optional)
- Split bill:
  - split by items
  - split by amount
- Reserve table (optional reservation feature)
- QR ordering support:
  - table QR token validation
  - customer creates order linked to table

---

## 3.4 Order Lifecycle (Restaurant workflow)

- Create orders:
  - walk-in takeaway
  - dine-in (table required)
  - delivery (address required)
- Order status flow (recommended):
  - `pending → confirmed → preparing → ready → served → completed`
- Cancel order rules:
  - allowed before `preparing` (or manager override)
- Void order (manager/admin only) with audit log
- Edit rules:
  - allow edits only until kitchen starts cooking
- Notes:
  - item-level notes (no onions)
  - order-level notes (birthday, rush)

---

## 3.5 Kitchen (KDS / KOT) Features

- Kitchen queue endpoint (orders in `confirmed/preparing`)
- Kitchen station filtering (grill only, bar only)
- Update per-item kitchen status:
  - `queued → cooking → done`
- Auto mark order `ready` when all items done
- Re-print kitchen ticket (optional)
- Time tracking:
  - time since order confirmed (for performance)

---

## 3.6 Payments, Receipts, Refunds

- Support split payments (multiple payments per order)
- Cash payments (mark paid + who received)
- Card payments (manual status if no gateway)
- Online payment (optional):
  - create payment intent
  - webhook verify payment
- Tip + service charge support
- Refund (manager/admin):
  - full refund
  - partial refund (optional)
- Receipt/invoice generation:
  - endpoint that returns printable receipt data (or PDF optional)
- End-of-day cash summary (if you implement shifts)

---

## 3.7 Discounts & Coupons (Optional)

- Create/update/disable coupon
- Validate coupon at checkout:
  - date validity, min total, usage limits
- Apply coupon to order and snapshot discount
- Audit coupon usage per order/customer

---

## 3.8 Reporting & Analytics (Admin Dashboard)

- Sales totals (today/week/month/custom range)
- Orders by status
- Peak hours (orders per hour)
- Top selling items (by qty and by revenue)
- Category performance
- Profit estimate (if you store `costPrice`)
- Staff performance (orders handled by cashier/waiter)
- Export:
  - orders CSV
  - payments CSV

---

## 3.9 System Quality & Security

- Input validation (Joi/Zod/express-validator)
- Central error handler (consistent JSON format)
- Rate limiting (login + public endpoints)
- Helmet security headers
- Sanitization against NoSQL injection
- Pagination for lists
- MongoDB indexes:
  - `User.email`, `User.phone` unique
  - `Table.tableNumber` unique
  - `Order.orderNumber` unique
  - `MenuItem.slug` unique
  - `MenuItem.category` index
  - `Order.status`, `Order.createdAt` index
- Audit logs for sensitive actions (void/refund/menu price changes)
- Soft delete for menu items (preserve history)

---

## 3.10 Real-time Updates (Optional but modern)

- WebSockets (Socket.IO) events:
  - new order → kitchen screen
  - status updates → waiter/cashier screens
  - table status changes
- Server emits events on:
  - order created
  - kitchen item done
  - order ready/served/completed

---

## 4) Suggested API Route Map (Full)

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET  /api/auth/me`
- `POST /api/auth/logout` (optional)

### Users (admin/manager)

- `GET  /api/users`
- `POST /api/users` (create staff)
- `PATCH /api/users/:id` (role/disable)

### Categories

- `GET  /api/categories`
- `POST /api/categories`
- `PATCH /api/categories/:id`
- `DELETE /api/categories/:id` (or soft-disable)

### Menu Items

- `GET  /api/menu-items` (search/filter/pagination)
- `GET  /api/menu-items/:id`
- `POST /api/menu-items`
- `PATCH /api/menu-items/:id`
- `DELETE /api/menu-items/:id` (soft-disable)
- `PATCH /api/menu-items/:id/availability` (quick toggle)
- `PATCH /api/menu-items/bulk` (bulk update optional)

### Modifiers

- `GET  /api/modifiers`
- `POST /api/modifiers`
- `PATCH /api/modifiers/:id`
- `DELETE /api/modifiers/:id`

### Combos (optional)

- `GET  /api/combos`
- `POST /api/combos`
- `PATCH /api/combos/:id`
- `DELETE /api/combos/:id`

### Tables

- `GET  /api/tables`
- `POST /api/tables`
- `PATCH /api/tables/:id`
- `DELETE /api/tables/:id`
- `PATCH /api/tables/:id/status`
- `POST /api/tables/:id/open-order` (creates dine-in order)

### Orders

- `POST /api/orders` (create)
- `GET  /api/orders` (filters: status/type/date range)
- `GET  /api/orders/:id`
- `PATCH /api/orders/:id` (edit items before cooking)
- `PATCH /api/orders/:id/status`
- `POST /api/orders/:id/cancel`
- `POST /api/orders/:id/void` (manager/admin)
- `POST /api/orders/:id/transfer-table` (optional)
- `POST /api/orders/:id/split` (optional)

### Kitchen

- `GET  /api/kitchen/queue`
- `PATCH /api/kitchen/orders/:orderId/items/:itemId/status`
- `PATCH /api/kitchen/orders/:orderId/ready`

### Payments

- `POST /api/payments` (create payment record)
- `GET  /api/payments?orderId=...`
- `POST /api/payments/:id/refund` (optional)
- `POST /api/payments/webhook` (optional online payments)

### Coupons (optional)

- `GET  /api/coupons`
- `POST /api/coupons`
- `PATCH /api/coupons/:id`
- `DELETE /api/coupons/:id`
- `POST /api/coupons/validate`

### Reports

- `GET /api/reports/sales`
- `GET /api/reports/top-items`
- `GET /api/reports/peak-hours`
- `GET /api/reports/export/orders` (optional)
- `GET /api/reports/export/payments` (optional)

---

## 5) Recommended Folder Structure (Backend)

- `src/`
  - `config/` (db, env)
  - `models/`
  - `controllers/`
  - `routes/`
  - `middleware/` (auth, roles, error)
  - `services/` (pricing, coupons, payments)
  - `utils/`
  - `validators/`
  - `jobs/` (optional background jobs)
  - `sockets/` (optional real-time)

---

## 6) Pricing & Validation Rules (Important)

- Server calculates totals (never trust client totals)
- Validate:
  - menu item exists & available
  - variant exists & available (if used)
  - modifier options are valid and within min/max selections
- Editing orders:
  - allow edits only before `preparing` (or manager override)
- Void/refund actions logged in `AuditLog`

---

If you want, next I can generate **actual Mongoose schema code** for all models above (copy-paste ready) + a clean Express route/controller skeleton.

# Menu Item Backend Design (Restaurant MERN)

This section defines a production-ready backend design for **Menu Items** including CRUD, images, search/filter/sort, variants, schedules, kitchen routing, bulk operations, CSV import/export, and safe delete rules.

---

## 1) Data Model (MongoDB/Mongoose)

### MenuItem

**Purpose:** Defines a food/drink item with pricing, availability, routing, and customer info.

**Fields**

- `_id`
- `name` (string, required)
- `slug` (string, required, unique) — URL-friendly ID
- `category` (ObjectId ref `Category`, required)
- `description` (string, optional)
- `images` (array of objects, optional)
  - `url` (string)
  - `publicId` (string, optional, if Cloud storage)
  - `alt` (string, optional)
- `pricingMode` (enum: `fixed | variants`, default `fixed`)
- `basePrice` (number, required if `pricingMode=fixed`)
- `variants` (array, optional; used when `pricingMode=variants`)
  - `_id`
  - `name` (string, e.g., Small/Medium/Large)
  - `price` (number)
  - `isAvailable` (boolean, default true)
  - `sortOrder` (number, optional)
- `taxRate` (number, optional) — or `taxCategory` ref
- `isActive` (boolean, default true) — soft delete flag
- `isAvailable` (boolean, default true) — manual availability toggle
- `availabilitySchedule` (object, optional)
  - `enabled` (boolean, default false)
  - `daysOfWeek` (array of int 0–6) — 0=Sun
  - `startTime` (string "HH:mm")
  - `endTime` (string "HH:mm") — supports overnight windows
- `prepTimeMinutes` (number, optional)
- `kitchenStation` (enum: `grill | fryer | bar | dessert | main`, optional)
- `tags` (array of string, optional) — `popular`, `spicy`, etc.
- `allergens` (array of string, optional) — `nuts`, `dairy`, `gluten`, etc.
- `spiceLevel` (number 0–5, optional)
- `nutrition` (object, optional)
  - `calories` (number)
  - `protein` (number)
  - `carbs` (number)
  - `fat` (number)
- `salesCount` (number, default 0) — for popularity sorting
- `sortOrder` (number, optional)
- `deletedAt` (date, optional)
- `createdAt`, `updatedAt`

**Indexes**

- `slug` unique
- `category` index
- `isActive`, `isAvailable` index
- `salesCount` index (optional)
- text index (optional): `name`, `description`, `tags`

---

## 2) Core Rules & Calculations

### 2.1 Effective Availability

A menu item is shown as available only if:

- `isActive === true`
- `isAvailable === true`
- AND schedule is either disabled or currently within schedule window.

**Effective rule:**

- `effectiveAvailable = isActive && isAvailable && (scheduleOk || !schedule.enabled)`

**Overnight schedule**
If `startTime > endTime`, treat schedule as crossing midnight (e.g., 18:00–02:00).

### 2.2 Pricing Rules

- If `pricingMode=fixed` → use `basePrice`.
- If `pricingMode=variants` → `basePrice` is ignored for billing; use chosen variant price.
- Sorting/filtering by price should use:
  - fixed: `basePrice`
  - variants: `minVariantPrice` (computed in query or stored as denormalized field)

### 2.3 Snapshots in Orders (Required)

When adding items to an order, store snapshots in `Order.items[]`:

- `nameSnapshot`
- `priceSnapshot`
- `variantSnapshot` (if used)
- `modifiersSnapshot`
- `kitchenStationSnapshot`

This prevents old bills changing if the menu changes later.

---

## 3) API Endpoints (REST)

### 3.1 CRUD (Admin)

- `POST   /api/menu-items`
- `PATCH  /api/menu-items/:id`
- `DELETE /api/menu-items/:id` _(soft-disable)_
- `PATCH  /api/menu-items/:id/restore` _(optional)_

**Soft-disable behavior**

- Set: `isActive=false`, `deletedAt=now`
- Never hard delete in production (recommended)

### 3.2 Public Listing & Detail

- `GET /api/menu-items`
- `GET /api/menu-items/:id` _(or by slug: `/api/menu-items/slug/:slug`)_

**Query params for `GET /api/menu-items`**

- `q` (keyword search)
- `category` (categoryId)
- `tags` (comma-separated)
- `available` (`true|false`) — uses `effectiveAvailable`
- `minPrice`, `maxPrice`
- `station` (kitchenStation)
- `sort` (`newest | price_asc | price_desc | popularity`)
- `page`, `limit`

**Server-side always applies**

- `isActive=true` for public requests

### 3.3 Image Uploads (Admin)

- `POST  /api/menu-items/:id/images` _(append)_
- `PUT   /api/menu-items/:id/images` _(replace all)_
- `DELETE /api/menu-items/:id/images/:imageId` _(remove one)_

**Validation**

- max images (e.g., 6)
- allowed types (jpg/png/webp)
- max size (e.g., 2–5MB)

### 3.4 Variants (Admin)

- `POST  /api/menu-items/:id/variants` _(add)_
- `PATCH /api/menu-items/:id/variants/:variantId` _(update)_
- `PATCH /api/menu-items/:id/variants/:variantId/disable` _(set isAvailable=false)_
- `PATCH /api/menu-items/:id/variants/:variantId/enable` _(set isAvailable=true)_

**Validation**

- variant names unique per item
- variant price > 0

### 3.5 Availability Toggle & Schedule (Admin)

- `PATCH /api/menu-items/:id/availability` _(toggle `isAvailable`)_
- `PATCH /api/menu-items/:id/schedule` _(set schedule fields)_

### 3.6 Bulk Operations (Admin/Manager)

- `PATCH /api/menu-items/bulk/price`
- `PATCH /api/menu-items/bulk/availability`

**Bulk price update payload examples**

- by category: `{ "categoryId": "...", "mode": "percent", "value": 10 }`
- rounding optional: `{ "roundTo": 10 }`

**Bulk availability payload example**

- `{ "categoryId": "...", "isAvailable": false }`

**Audit**

- record bulk ops in `AuditLog` (recommended)

### 3.7 CSV Import/Export (Optional)

- `GET  /api/menu-items/export/csv`
- `POST /api/menu-items/import/csv`

**Import behavior**

- supports create/update by `slug` or `sku`
- returns report: created/updated/failed rows with error messages

---

## 4) Scenarios (Backend Behavior)

### 4.1 Create Menu Item (Admin)

**Request:** create item with fixed price or variants  
**Validations:**

- category exists
- slug unique
- if `fixed` → `basePrice` required and > 0
- if `variants` → at least 1 variant, each price > 0  
  **Result:** item created and returned.

### 4.2 Safe Delete (Soft-disable)

**If item is referenced in active orders**

- never hard delete
- soft-disable only  
  **Active statuses example**
- `pending, confirmed, preparing, ready, served`

### 4.3 Popularity Sorting

**Update `salesCount`**

- increment only when an order becomes `completed`
- do not count cancelled/voided orders  
  **Sort by popularity**
- `sort=popularity` uses `salesCount DESC`

### 4.4 Availability Schedule

**Public listing**

- compute `effectiveAvailable` using server time and schedule
- supports overnight schedules

### 4.5 Kitchen Routing

**Kitchen screen**

- filter by `kitchenStation`
- return only items assigned to that station (optional enhancement)

---

## 5) Permissions (Recommended)

- Admin/Manager: full menu access
- Staff: optionally only toggle availability
- Public: read-only endpoints only

---

## 6) Minimum Test Cases

- Create fixed item (valid/invalid)
- Create variant item (valid/invalid)
- Search/filter/sort combinations
- Schedule window in/out + overnight window
- Soft-disable item used in active order
- Price sort works for variants using minVariantPrice logic
- Bulk update affects correct set and writes audit log
- Image upload limits enforced
