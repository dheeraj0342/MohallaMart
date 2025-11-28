# 🔐 Admin Permissions Guide - MohallaMart

This document outlines all permissions and capabilities available to administrators in the MohallaMart platform.

---

## 📋 **Overview**

Admins have full access to manage the marketplace, including:
- User management
- Shopkeeper registrations
- Shop and product oversight
- System configuration

---

## 🔑 **Authentication & Access**

### **Admin Login**
- **Route:** `/admin/login`
- **Authentication Method:** Cookie-based session (HMAC SHA-256)
- **Environment Variables Required:**
  - `ADMIN_EMAIL` - Admin email address
  - `ADMIN_SESSION_SECRET` - Secret key for session tokens
- **Session Duration:** 8 hours
- **Security:** HTTP-only cookies, secure in production

### **Protected Routes**
All admin routes under `/admin/(protected)/` require authentication:
- `/admin` - Dashboard
- `/admin/registrations` - Registration management
- `/admin/users` - User management

---

## 👥 **User Management Permissions**

### **1. View All Users**
- **Query:** `api.users.getAllUsers`
- **Capabilities:**
  - View all registered users (customers, shop owners, admins)
  - Filter by role (customer, shop_owner, admin)
  - Search by name, email, or phone
  - Filter by status (active/inactive)
  - View user statistics (total, by role, active/inactive counts)

### **2. Change User Roles**
- **Mutation:** `api.users.updateUser` (role field)
- **Capabilities:**
  - Change user role between:
    - `customer` - Regular customer
    - `shop_owner` - Shopkeeper/seller
    - `admin` - Administrator
  - **UI Component:** `UserRoleChangeDialog`
  - **Location:** `/admin/users`

### **3. Activate/Deactivate Users**
- **Mutation:** `api.users.setUserActiveStatus`
- **API Route:** `/api/admin/toggle-shopkeeper`
- **Capabilities:**
  - Activate user accounts (enable access)
  - Deactivate user accounts (disable access)
  - Automatically updates shopkeeper application status
  - Creates audit log entries
  - Triggers Inngest events for notifications

### **4. Update User Information**
- **Mutation:** `api.users.updateUser`
- **Capabilities:**
  - Update user name
  - Update email
  - Update phone number
  - Update avatar URL
  - Update role

---

## 📝 **Shopkeeper Registration Management**

### **1. View All Registrations**
- **Query:** `api.registrations.listAllRegistrations`
- **Capabilities:**
  - View all shopkeeper registration applications
  - Filter by status:
    - `draft` - Not yet submitted
    - `submitted` - Awaiting review
    - `reviewing` - Under review
    - `approved` - Approved
    - `rejected` - Rejected
  - View detailed registration information:
    - Business information (type, name, PAN, GSTIN)
    - Identity proof (type, number)
    - Bank information (account holder, account number, IFSC)
    - Business address
    - Pickup address
    - First product information
  - **Location:** `/admin/registrations`

### **2. Update Registration Status**
- **Mutation:** `api.registrations.updateRegistrationStatus`
- **Capabilities:**
  - Change status to:
    - `reviewing` - Mark as under review
    - `approved` - Approve registration
    - `rejected` - Reject registration
  - Add optional notes/comments
  - Automatically updates user role to `shop_owner` when approved
  - **UI Component:** `RegistrationStatusDialog`
  - **Location:** `/admin/registrations`

### **3. Approve/Reject Shopkeepers**
- **Capabilities:**
  - Approve pending shopkeeper applications
  - Reject applications with reason
  - View pending applications on dashboard
  - **Location:** `/admin` (Dashboard)

---

## 🏪 **Shop Management Permissions**

### **1. View All Shops**
- **Query:** `api.shops.searchShops` (with admin access)
- **Capabilities:**
  - View all shops in the system
  - Filter by location (city, pincode, coordinates)
  - Filter by active status
  - View shop details:
    - Shop name, description
    - Address and coordinates
    - Contact information
    - Business hours
    - Categories
    - Rating and order count
    - Active/inactive status

### **2. Toggle Shop Status**
- **Capabilities:**
  - Activate shops (make visible to customers)
  - Deactivate shops (hide from customers)
  - **Note:** Currently managed through user activation

### **3. View Shopkeeper Shops**
- **Capabilities:**
  - View shops created by specific shopkeepers
  - Monitor shop performance
  - **Location:** `/admin` (Dashboard - Active Shopkeepers section)

---

## 📦 **Product Management Permissions**

### **1. View All Products**
- **Query:** `api.products.searchProducts` (with admin access)
- **Capabilities:**
  - View all products across all shops
  - Filter by category
  - Filter by shop
  - View product details:
    - Name, description, price
    - Images
    - Stock quantity
    - Category
    - Availability status

### **2. Monitor Product Quality**
- **Capabilities:**
  - Review products for compliance
  - Monitor product listings
  - **Note:** Direct product editing may require additional implementation

---

## 📊 **Dashboard & Analytics**

### **1. Admin Dashboard**
- **Location:** `/admin`
- **Capabilities:**
  - View statistics:
    - Pending applications count
    - Active shopkeepers count
    - Total shopkeepers count
  - Quick actions:
    - View registrations
    - Manage users
  - Monitor pending shopkeepers
  - Monitor active shopkeepers
  - Quick approve/disable actions

### **2. Statistics Available**
- Total users
- Customers count
- Shop owners count
- Admins count
- Active users count
- Inactive users count
- Pending registrations
- Active shopkeepers

---

## 🔍 **Search & Filter Capabilities**

### **User Management**
- Search by name
- Search by email
- Search by phone
- Filter by role (customer, shop_owner, admin)
- Filter by status (active, inactive)

### **Registration Management**
- Filter by status (draft, submitted, reviewing, approved, rejected)
- View detailed registration information
- Expandable cards for full details

---

## 🔐 **Security & Audit**

### **1. Audit Logs**
- **Table:** `admin_audit_logs`
- **Tracked Actions:**
  - Shopkeeper approvals
  - Shopkeeper deactivations
  - User role changes
  - Registration status changes
- **Information Stored:**
  - Action type
  - Target user ID
  - Performed by (admin identifier)
  - Metadata (previous status, etc.)
  - Timestamp

### **2. Session Management**
- Secure cookie-based authentication
- HTTP-only cookies (prevents XSS)
- Secure flag in production
- 8-hour session timeout
- Manual session management via `/admin/login`

---

## 🚫 **Current Limitations**

### **Not Yet Implemented:**
1. **Direct Shop Editing** - Admins cannot directly edit shop details
2. **Direct Product Editing** - Admins cannot directly edit products
3. **Order Management** - No admin interface for order management yet
4. **Category Management** - No admin UI for managing categories
5. **Bulk Operations** - No bulk approve/reject functionality
6. **Email Notifications** - Registration status changes don't send emails yet (TODO in code)
7. **Advanced Analytics** - Limited analytics beyond basic counts
8. **Content Moderation** - No content moderation tools for products/shops

---

## 📝 **Recommended Additional Permissions**

Consider implementing:

1. **Shop Management:**
   - Edit shop details
   - Delete shops
   - Feature shops
   - Manage shop categories

2. **Product Management:**
   - Edit products
   - Delete products
   - Feature products
   - Bulk product operations

3. **Order Management:**
   - View all orders
   - Cancel orders
   - Refund orders
   - Update order status

4. **Category Management:**
   - Create/edit/delete categories
   - Manage category hierarchy
   - Set category images

5. **Content Moderation:**
   - Review and approve product images
   - Review shop descriptions
   - Flag inappropriate content

6. **Analytics:**
   - Sales reports
   - User growth metrics
   - Shop performance metrics
   - Revenue analytics

7. **System Configuration:**
   - Manage platform settings
   - Configure delivery radius
   - Manage payment methods
   - Configure notification templates

---

## 🔧 **Environment Setup**

To enable admin access, ensure these environment variables are set:

```env
ADMIN_EMAIL=admin@mohallamart.com
ADMIN_SESSION_SECRET=your-secret-key-here
```

---

## 📚 **API Endpoints**

### **Admin API Routes:**
- `POST /api/admin/toggle-shopkeeper` - Activate/deactivate shopkeepers
  - Requires: Admin authentication
  - Body: `{ id: string, makeActive: boolean }`

### **Convex Queries (Admin Access):**
- `api.users.getAllUsers` - Get all users
- `api.users.listShopkeepers` - List shopkeepers
- `api.users.listPendingShopkeeperApplications` - List pending applications
- `api.registrations.listAllRegistrations` - List all registrations

### **Convex Mutations (Admin Access):**
- `api.users.updateUser` - Update user information
- `api.users.setUserActiveStatus` - Activate/deactivate users
- `api.registrations.updateRegistrationStatus` - Update registration status

---

## ⚠️ **Important Notes**

1. **Admin authentication is separate from user authentication** - Uses cookie-based sessions
2. **All admin actions are logged** - Check `admin_audit_logs` table
3. **Approving registrations automatically grants shop_owner role** - No manual role assignment needed
4. **Deactivating a user affects their shop visibility** - Shops become inactive
5. **Admin pages do not support dark mode** - Light mode only for admin interface

---

## 🎯 **Quick Reference**

| Action | Location | Query/Mutation |
|--------|----------|----------------|
| View Users | `/admin/users` | `api.users.getAllUsers` |
| Change User Role | `/admin/users` | `api.users.updateUser` |
| Activate/Deactivate User | `/admin` | `api.users.setUserActiveStatus` |
| View Registrations | `/admin/registrations` | `api.registrations.listAllRegistrations` |
| Approve Registration | `/admin/registrations` | `api.registrations.updateRegistrationStatus` |
| Reject Registration | `/admin/registrations` | `api.registrations.updateRegistrationStatus` |
| View Dashboard | `/admin` | Multiple queries |

---

**Last Updated:** Based on current codebase analysis
**Version:** 1.0

