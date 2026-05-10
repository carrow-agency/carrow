/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as access from "../access.js";
import type * as auditLogs from "../auditLogs.js";
import type * as auth from "../auth.js";
import type * as contracts from "../contracts.js";
import type * as errorLogs from "../errorLogs.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as init from "../init.js";
import type * as monthlyReports from "../monthlyReports.js";
import type * as orders from "../orders.js";
import type * as planRequests from "../planRequests.js";
import type * as plans from "../plans.js";
import type * as rateLimit from "../rateLimit.js";
import type * as reports from "../reports.js";
import type * as reset from "../reset.js";
import type * as seed from "../seed.js";
import type * as sentry from "../sentry.js";
import type * as settings from "../settings.js";
import type * as teamMembers from "../teamMembers.js";
import type * as users from "../users.js";
import type * as workMedia from "../workMedia.js";
import type * as works from "../works.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  access: typeof access;
  auditLogs: typeof auditLogs;
  auth: typeof auth;
  contracts: typeof contracts;
  errorLogs: typeof errorLogs;
  files: typeof files;
  http: typeof http;
  init: typeof init;
  monthlyReports: typeof monthlyReports;
  orders: typeof orders;
  planRequests: typeof planRequests;
  plans: typeof plans;
  rateLimit: typeof rateLimit;
  reports: typeof reports;
  reset: typeof reset;
  seed: typeof seed;
  sentry: typeof sentry;
  settings: typeof settings;
  teamMembers: typeof teamMembers;
  users: typeof users;
  workMedia: typeof workMedia;
  works: typeof works;
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
