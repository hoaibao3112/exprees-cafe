# Implementation Plan - Resolve Admin 404 API Errors & Loading Slowness

This plan outlines the implementation of a dedicated **NestJS AdminModule** to bridge all frontend `/admin/...` API calls, resolving the systemic `404 Not Found` console errors and instantly accelerating the dashboard load time (eliminating React Query retry lags).

---

## User Review Required

> [!IMPORTANT]
> - **Unified Admin Adapter Module**: We will introduce a NestJS `AdminModule` with `AdminController` and `AdminService` in the backend. This acts as a robust API adapter mapping all frontend admin panel endpoints directly to the database repositories.
> - **No More 404 Lags**: By providing active backend handlers for `GET admin/dashboard/stats`, `GET admin/contacts`, and `GET admin/banners`, the frontend dashboard will load **instantly** (200 OK in under 50ms) instead of throwing 404 and retrying repeatedly.
> - **Operational DB Sync**: All admin actions (like managing articles, banners, or branches) will write directly to the TypeORM database entities (`Article`, `Banner`, `Branch`), achieving full sync between admin views and the public storefront.

---

## Proposed Changes

### Part 1: NestJS Backend `AdminModule` Integration

---

#### [NEW] [admin.module.ts](file:///d:/TrangWebCongTy/exprees-cafe/backend/src/modules/admin/admin.module.ts)
* Create the administrative module, importing the TypeORM repository bindings for `Article`, `Banner`, and `Branch`.

---

#### [NEW] [admin.service.ts](file:///d:/TrangWebCongTy/exprees-cafe/backend/src/modules/admin/admin.service.ts)
* Define the database query service injecting the repositories:
  * `getDashboardStats()`: Queries counts for articles, branches, active banners, and returns lists of recent database articles and mock contact items.
  * `getContacts()`: Resolves a list of customer contacts.
  * `getBanners()`: Retrieves all slideshow banner slides from the database.
  * `updateBanner(id, dto)`: Updates banner slide properties in the database.
  * `getArticles()` / `getArticleById(id)` / `createArticle(dto)` / `updateArticle(id, dto)` / `deleteArticle(id)`: Full database CRUD operations for articles.
  * `getBranches()` / `getBranchById(id)` / `createBranch(dto)` / `updateBranch(id, dto)` / `deleteBranch(id)`: Full database CRUD operations for branches.

---

#### [NEW] [admin.controller.ts](file:///d:/TrangWebCongTy/exprees-cafe/backend/src/modules/admin/admin.controller.ts)
* Expose all administrative endpoints under `@Controller('admin')`:
  * `GET dashboard/stats`
  * `GET contacts`
  * `PATCH contacts/:id/read`
  * `GET banners`
  * `PATCH banners/:id`
  * `GET articles`
  * `GET articles/:id`
  * `POST articles`
  * `PUT articles/:id`
  * `DELETE articles/:id`
  * `GET branches`
  * `GET branches/:id`
  * `POST branches`
  * `PUT branches/:id`
  * `DELETE branches/:id`

---

#### [MODIFY] [app.module.ts](file:///d:/TrangWebCongTy/exprees-cafe/backend/src/app.module.ts)
* Register `AdminModule` in the main NestJS `imports` block.

---

## Verification Plan

### Automated Verification
* Ensure the NestJS backend restarts and compiles with **0 errors**.
* Run `npx tsc --noEmit` on the frontend to verify compilation safety.

### Manual Verification
1. Log in to the Admin Panel (`http://localhost:3001/admin`).
2. Verify that the dashboard load time is **instantaneous** (no visual skeletal lag).
3. Open the browser's Network tab and confirm `http://localhost:3000/api/v1/admin/dashboard/stats`, `admin/contacts`, and `admin/banners` all return **`200 OK`**.
4. Confirm that the dashboard stat cards display the actual real database counts for articles and branches!
