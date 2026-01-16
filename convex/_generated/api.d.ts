/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as cart from "../cart.js";
import type * as categories from "../categories.js";
import type * as coupons from "../coupons.js";
import type * as favorites from "../favorites.js";
import type * as files from "../files.js";
import type * as logs from "../logs.js";
import type * as notifications from "../notifications.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as registrations from "../registrations.js";
import type * as reviews from "../reviews.js";
import type * as riders from "../riders.js";
import type * as settings from "../settings.js";
import type * as shops from "../shops.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  cart: typeof cart;
  categories: typeof categories;
  coupons: typeof coupons;
  favorites: typeof favorites;
  files: typeof files;
  logs: typeof logs;
  notifications: typeof notifications;
  orders: typeof orders;
  products: typeof products;
  registrations: typeof registrations;
  reviews: typeof reviews;
  riders: typeof riders;
  settings: typeof settings;
  shops: typeof shops;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
