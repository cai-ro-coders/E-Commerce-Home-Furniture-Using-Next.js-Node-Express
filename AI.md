AI 

E-Commerce Home Furniture Using Next.js Node Express

Build a Complete Admin E-Commerce Home Furniture 
TypeScript,TailwindCSS, Node.js,Express.js,REST API,CORS,Environment variables using .env,MySQL for database operations, SweetAlert2, Chart.js, FullCalendar
DataTables, Chart.js 

MySQL database : 
database name : ecommerce_nextjsDB
username : root
password : root

E-Commerce Home Furniture Database Schema

users
    `role` enum('admin','customer', 'staff') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',

categories
    id (PK)
    parent_id (FK → categories.id, nullable)
    name
    slug
    image
    description
    status
    created_at
    updated_at
brands
    id (PK)
    name
    slug
    logo
    description
    status
    created_at
    updated_at
products
    id (PK)
    category_id (FK → categories.id)
    brand_id (FK → brands.id)
    sku (unique)
    name
    slug
    short_description
    description
    price
    sale_price
    cost_price
    weight
    dimensions
    stock_quantity
    minimum_stock
    featured
    status
    created_at
    updated_at
product_images
    id (PK)
    product_id (FK → products.id)
    image
    is_primary
    sort_order
    created_at
    updated_at
product_specifications
    id (PK)
    product_id (FK → products.id)
    attribute_name
    attribute_value
    created_at
    updated_at
addresses
    id (PK)
    user_id (FK → users.id)
    full_name
    phone
    address_line_1
    address_line_2
    city
    province
    postal_code
    country
    is_default
    created_at
    updated_at
carts
    id (PK)
    user_id (FK → users.id)
    created_at
    updated_at
cart_items
    id (PK)
    cart_id (FK → carts.id)
    product_id (FK → products.id)
    quantity
    price
    created_at
    updated_at
wishlists
    id (PK)
    user_id (FK → users.id)
    product_id (FK → products.id)
    created_at
    updated_at
orders
    id (PK)
    user_id (FK → users.id)
    order_number
    subtotal
    discount
    shipping_fee
    tax
    grand_total
    payment_method
    payment_status
    order_status
    shipping_address_id (FK → addresses.id)
    notes
    created_at
    updated_at
Order Status
    Pending
    Processing
    Shipped
    Delivered
    Cancelled
    Returned
Payment Status
    Pending
    Paid
    Failed
    Refunded
order_items
    id (PK)
    order_id (FK → orders.id)
    product_id (FK → products.id)
    product_name
    sku
    quantity
    price
    total
    created_at
    updated_at
payments
    id (PK)
    order_id (FK → orders.id)
    transaction_id
    payment_gateway
    amount
    currency
    status
    paid_at
    created_at
    updated_at
reviews
    id (PK)
    product_id (FK → products.id)
    user_id (FK → users.id)
    rating
    title
    comment
    status
    created_at
    updated_at
coupons
    id (PK)
    code
    type
    value
    minimum_order
    maximum_discount
    usage_limit
    used_count
    start_date
    end_date
    status
    created_at
    updated_at
Coupon Types
    percentage
    fixed
coupon_usages
    id (PK)
    coupon_id (FK → coupons.id)
    user_id (FK → users.id)
    order_id (FK → orders.id)
    discount_amount
    created_at
    updated_at
inventory_logs
    id (PK)
    product_id (FK → products.id)
    type
    quantity
    reference
    remarks
    created_at
    updated_at
Inventory Types
    stock_in
    stock_out
    adjustment
    return
settings
    id (PK)
    key
    value
    created_at
    updated_at
Common Settings
    site_name
    site_logo
    support_email
    support_phone
    currency
    tax_rate
    shipping_fee
settings
    id (PK)
    key
    group
    value
    created_at
    updated_at
data
    1
        key: stripe_publishable_key
        group: payment
        value: pk_test
    2
        key: stripe_secret_key
        group: payment
        value: sk_test
    3
        key: paypal_client_id
        group: payment
        value: test
    4
        key: paypal_client_secret
        group: payment
        value: test
site_name
site_logo
support_email
support_phone
currency
tax_rate
shipping_fee

Relationships Overview
Category
 └── hasMany Products

Brand
 └── hasMany Products

Product
 ├── belongsTo Category
 ├── belongsTo Brand
 ├── hasMany ProductImages
 ├── hasMany ProductSpecifications
 ├── hasMany Reviews
 └── hasMany OrderItems

User
 ├── hasMany Addresses
 ├── hasMany Orders
 ├── hasMany Reviews
 ├── hasMany Wishlist
 └── hasOne Cart

Order
 ├── belongsTo User
 ├── hasMany OrderItems
 ├── hasOne Payment
 └── belongsTo Address

Theme:

Modern
Professional
Mobile Friendly

Generate Realistic Data 50 records
===========================================
expressjs
API Architecture
Use the following structure:
backend/
src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── validators/
├── types/
├── app.ts
└── server.ts

Next js Frontend Architecture
Use:
frontend/
├── app/
│   ├── page.tsx
│   ├── products/
│   ├── categories/
│   ├── cart/
│   ├── checkout/
│   ├── account/
│   ├── wishlist/
│   └── admin/
├── components/
├── hooks/
├── lib/
├── services/
├── types/
├── utils/
└── public/

├── database/ 
│   ├── migrations/ 
│   └── seeds/

http://localhost:3000/admin/login
==============================================
Authentication Module

REST API
Create a clean REST API using Express.js.
Example endpoints:
Authentication
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET /api/auth/me

Implement:

- Login
- Logout
- Remember Me
- Forgot Password
- Reset Password
- Change Password
- Role Based Access Control (RBAC)
- Login History
- Secure Login
- User Profile Management
- Use secure password hashing such as bcrypt   
- CSRF protection
- XSS Protection
- Session management
- SQL injection protection using PDO prepared statements
- Input validation and sanitization

Dashboard http://localhost:3000/admin/dashboard
Create an attractive Bootstrap dashboard showing:

Features:
Display real-time statistics:
Total Revenue
Net Earning
Today Order
active products
Yesterday Orders
Total Order
Weekly Sales
Sales Analytic
Best Selling Products
Recent Order in table with photo of product
Use charts (Chart.js) for dashboard stats
Use Chart.js for all charts.
------------------------------------
User Management

- CRUD Users
- Roles
- Permissions
- User Activity Log
- User Status
- User Profile Picture
------------------------------------
Products Management Module
Rest API Products
GET /api/products
GET /api/products/:id
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id

Features:
header dashboard (total products, active listing, draft products, out of stock, inventory units)
Products (Manage your products inventory)
-export (export to CSV, export to json)
View all Products (paginated, searchable)
Add Products (new page, upload photo,text editor)
Edit Products details (update photo)
View Product (Product Details page, photo large left right information with edit button)
Delete Products (delete photo)  
------------------------------------
Orders Management Module
Features:
Manage customer orders - Download all orders in csv file
header dashboard (Total Orders, open orders, paid orders, total revenue, average order value)
View all Orders (order, customer, date, payment, Fullfillment, items, net sale, action, paginated, searchable)
Edit Order
Orders details
Order Tracking
Delete Orders
print receipt

Rest API Orders
POST /api/orders
GET /api/orders
GET /api/orders/:id
PUT /api/orders/:id/status

Rest API Cart
GET /api/cart
POST /api/cart/items
PUT /api/cart/items/:id
DELETE /api/cart/items/:id
DELETE /api/cart
------------------------------------
Customers Management Module
Features:
View all Customers (paginated, searchable)
Create new Customers
Edit Customers details
view (new page Customer Order List table)
Delete Customers
------------------------------------
Category Management Module
Rest API Categories
GET /api/categories
GET /api/categories/:id
POST /api/categories
PUT /api/categories/:id
DELETE /api/categories/:id

Features:
View all categories (paginated, searchable)
Create new categories
Edit categories details
Delete categories
====================================
Brands Management Module
Features:
View all brands (paginated, searchable)
Create new brands
Edit brands details
Delete brands
=====================================
Coupons Management Module
Features:
View all coupons (paginated, searchable)
Create new coupons
Edit coupons details
Delete coupons
======================================
Settings Management Module
Features:
View all settings (paginated, searchable)
Create new settings
Edit settings details
Delete settings
=======================================
Reviews Management Module
Rest API Reviews
GET /api/products/:productId/reviews
POST /api/products/:productId/reviews
PUT /api/reviews/:id
DELETE /api/reviews/:id

Features:
View all reviews (paginated, searchable)
Edit reviews details
Delete reviews
======================================
Notification System
Toast Notifications
Email Notifications
SMS Ready
In-app Notifications
------------------------------------
File Manager
Upload Documents
Images
Contracts
Invoices
Customer Files
------------------------------------
Settings Module
Company Settings
SMTP Settings
Currency
Language
Timezone
Theme
Logo
Backup
------------------------------------
Rest API Wishlist
GET /api/wishlist
POST /api/wishlist
DELETE /api/wishlist/:productId
------------------------------------
Database
Generate normalized MySQL database.
Include:
- Foreign Keys
- Indexes
- Constraints
- Seed Data
------------------------------------
Professional Admin Dashboard
Responsive
Mobile Friendly
Dark Mode Ready
Loading Spinners
Skeleton Loaders
Modern Cards
Beautiful Tables
Animations
Hover Effects
Bootstrap Modals
------------------------------------
DataTables
Include:
Server-side Processing
Sorting
Searching
Filtering
Export Buttons
Print
CSV
Excel
PDF
------------------------------------
SweetAlert2
Use for:
Delete Confirmation
Success Messages
Errors
Warnings
Confirmations
-----------------------------------------------------------------------
Create a premium E-Commerce Home Furniture homepage http://localhost:3000/

- Sticky transparent header
- Mega menu navigation
- Wishlist
- Sign in with account icon
- Cart drawer

Sections:
Navigation Structure
Top Navigation
    Home
    All Categories (dropdown category menu with icon)
    Collections
    Brand
    About
    Contact
Right Side Icons
    Search
    Wishlist
    Account (photo - welcome then name)
    Cart
Search
    Full screen overlay
    Live product suggestions
    Search by category
Wishlist
    Heart icon
    Hover counter
    Saved products
Sign In
    Login
    Register
    Account dashboard
Cart
    Slide drawer    
    Product preview
    Quantity controls
    Checkout CTA
Mega Menu
Dropdown animation: opacity, translateY, 300ms duration.

1. hero section
   - background large image
   - luxury headline

2. Feature icons row
   - Free Shipping
   - Easy Returns
   - Secure Checkout

3. Shop By Category
   - 6 category cards
   - image zoom hover

4. Products on Sale
   - 4 column product grid
   - wishlist
   - quick view
   - hover image swap

5. Promotional Banner
   - split layout
   - premium storytelling section

6. New Arrivals
   - modern ecommerce cards

7. Top Deals
   - countdown timer
   - featured product card
   - add to cart
   - variant selector

8. Featured Products
   - luxury banner
   - CTA buttons

9. SHOP BY BRAND

10. Customer Reviews
   - auto sliding testimonials

11. Large Footer
   - 4 columns
   - newsletter
   - social icons

Animations:
- smooth fade-up on scroll
- image zoom hover
- cart drawer slide
- mega menu dropdown animation
- button hover transitions

search icon opens a full-width dropdown with:
- "What are you looking for?" placeholder text
- Search icon inside the input
- Search button to submit
- X icon to close the dropdown
- Closes on Escape key or clicking outside
==================================================
Create a customer login signup page for customer http://localhost:3000/login and http://localhost:3000/register
==================================================
after login and signup redirect to my account page 
Create a customer my account http://localhost:3000/account
with landing-navigation and landing-footer 
Dashboard
    -overview (Total Orders, Pending Orders, Wishlist items,total spent, Recent Orders datatable)
    -my order (My Orders, track and manage your orders)
    -notifications
    -my cart 
    -wishlist
Settings   
    -profile
    -billing address 
    -security 
Sign Out  
===================================================
Create product collections page 
all collections http://localhost:3000/products
categories collections http://localhost:3000/products/nordic-sleeper-sofa nordic-sleeper-sofa is slug database category

1 Design Style:
    Subtle shadows and soft borders
    Smooth hover animations and transitions

    Main Layout Structure:

    Use a two-column layout
    Left sidebar for filters
    Right content area for products

 2  Sidebar Filter Section:
    Include:

    Product categories
    Price range slider
    Brand filters
    Sort By (most popular,best rating,newest,price low - hight,price high -low) chekbox
    Ratings filter

    Sidebar Design:

    cards with soft shadow
    Sticky sidebar on desktop
    Accordion sections
    Thin dividers
    Modern checkbox styling
    Minimal icon usage

    Top Toolbar Section:
    Include:

    Product count text
    Sorting dropdown
    Grid/list toggle buttons
    Search input optional
    Clean horizontal alignment
    Subtle bottom border

    Product Grid:

    3 or 4-column responsive card layout
    Equal card heights
    Consistent spacing and alignment
    Masonry-like visual rhythm without actual masonry

3 Product Card Design:
    Each card should include:

    Product image
    Hover image swap
    Sale badge / discount badge
    Wishlist icon
    Quick view button
    Product category
    Product title
    Star ratings
    Current price
    Old price
    Add to cart button

    Card UI:

    Rounded corners
    Soft shadow
    Hover lift animation
    Image zoom on hover
    Buttons fade in on hover
    Clean typography
    Modern ecommerce interactions
4. url link http://localhost:3000/products/{slug} product slug    
===================================================
Create a product page details http://localhost:3000/products/nordicaline-aurora-hybrid-mattress {slug} from products database 

1. Product Showcase Section
Two-column responsive layout
Large product gallery on the left
Product information panel on the right
Sticky product image gallery behavior on scroll
Vertical thumbnail gallery beside main image
Smooth image switching interaction
Light zoom-on-hover effect
Large clean product imagery with soft gray background container

2. Product Information Area
Include:
Product category label
Large bold product title
Rating stars with review count
Pricing layout with sale price + original price
Short product description paragraph
Quantity selector with plus/minus buttons
Large primary “Add to Cart” button
Secondary “Buy Now” button
Wishlist and compare icons
SKU/meta information
Social sharing icons
chat with store

3. Product Details Tabs Section
Tabbed content layout with:
Description
Specifications
Reviews

Tab Design:

Minimal horizontal tab navigation
Active tab underline animation
Smooth content transitions
Large readable content spacing

5. Related Products Section (You may also like)
Grid layout with 4 related products
Card-based design
Hover image swap effect
Floating action buttons on hover
Product badges like “Sale” or “New”
Consistent product card spacing
Minimal typography hierarchy  
=================================================
payment 
install https://docs.stripe.com/get-started/development-environment?lang=node stripe 
install https://developer.paypal.com/sdk/payouts PayPal Checkout (REST API)