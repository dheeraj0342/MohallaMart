---
description: Shopkeeper Onboarding Workflow
---

# Shopkeeper Onboarding Flow

This document outlines the step-by-step process for a user to become a shopkeeper on MohallaMart.

## 1. Application Entry Point

- **URL**: `/shopkeeper/apply`
- **User State**: Guest or Logged In
- **Action**:
  - If **Guest**: User is presented with "Sign In" or "Create Account" options.
    - Links redirect to `/shopkeeper/login?next=/shopkeeper/apply` or `/shopkeeper/signup?next=/shopkeeper/apply`.
  - If **Logged In**: User sees a "Submit Application" button.

## 2. Authentication (if Guest)

- **Signup** (`/shopkeeper/signup`):
  - User creates an account via Email or Google.
  - **System Action**:
    - Creates Supabase user.
    - Syncs to Convex `users` table with `role: "shop_owner"`.
    - Redirects back to `/shopkeeper/apply`.
- **Login** (`/shopkeeper/login`):
  - User logs in.
  - **System Action**:
    - Syncs to Convex `users` table, ensuring `role: "shop_owner"`.
    - Redirects back to `/shopkeeper/apply`.

## 3. Application Submission

- **URL**: `/shopkeeper/apply`
- **Action**: User clicks "Submit Application".
- **System Action**:
  - Calls `api.users.requestShopkeeperRole`.
  - Updates `users` table: `role` = "shop_owner", `is_active` = `false`.
  - Creates/Updates `shopkeeper_applications` record with `status: "pending"`.
  - Redirects user to `/shopkeeper/registration`.

## 4. Seller Registration

- **URL**: `/shopkeeper/registration`
- **Action**: User fills out detailed business information.
  - **Tax & ID**: PAN, GSTIN (optional), Identity Proof (Aadhaar, etc.).
  - **Bank Details**: Account number, IFSC.
  - **Address**: Business address, Pickup address (with location picker).
  - **Business Info**: Type (Individual, Company, etc.), Name.
- **System Action**:
  - Saves data to `seller_registrations` table.
  - Status transitions: `draft` -> `submitted`.
  - Once submitted, user sees a "Under Review" status page.

## 5. Admin Review (Manual Step)

- **Actor**: Admin
- **Action**: detailed review of `shopkeeper_applications` and `seller_registrations`.
- **System Action**:
  - Admin calls `api.users.setUserActiveStatus`.
  - If **Approved**:
    - `users.is_active` set to `true`.
    - `shopkeeper_applications.status` set to `approved`.
    - `seller_registrations.status` set to `approved`.
  - If **Rejected**:
    - Application status set to `rejected`.

## 6. Shop Creation

- **URL**: `/shopkeeper/shop/create`
- **Pre-requisite**: User is `active` and `shop_owner`.
- **Action**: User creates their shop profile (Name, Description, Categories, etc.).
- **System Action**: Creates record in `shops` table.

## 7. Dashboard Access

- **URL**: `/shopkeeper/dashboard` (or similar)
- **Action**: Shopkeeper manages products, orders, etc.
