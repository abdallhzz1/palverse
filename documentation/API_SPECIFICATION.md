# Palverse API Specification

This document details the API endpoints, validation inputs, and JSON payloads for the Palverse Minimum Viable Product (MVP).

---

## 1. Public Endpoints

### PUB-01: List Categories
*   **Endpoint ID**: PUB-01
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/categories`
*   **Purpose**: Retrieve all business categories for browsing.
*   **Actor**: Public Visitor
*   **Authentication Requirement**: None (Guest).
*   **Query Parameters**:
    *   `per_page` (integer, optional, default: 15)
*   **Request Headers**:
    *   `Accept: application/json`
    *   `Accept-Language: ar`
*   **Success Response (HTTP 200)**:
    ```json
    {
      "success": true,
      "message": "Categories retrieved successfully.",
      "data": [
        {
          "slug": "restaurants",
          "name": "مطاعم"
        }
      ]
    }
    ```
*   **Business Rule Conflicts**: None.
*   **Side Effects**: None.
*   **Audit Log Requirement**: No.

### PUB-02: Get Category Details
*   **Endpoint ID**: PUB-02
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/categories/{slug}`
*   **Purpose**: Get details of a single category.
*   **Actor**: Public Visitor
*   **Authentication Requirement**: None.
*   **Path Parameters**:
    *   `slug` (string, required): Category slug identifier.
*   **Success Response (HTTP 200)**:
    ```json
    {
      "success": true,
      "message": "Category details retrieved successfully.",
      "data": {
        "slug": "restaurants",
        "name": "مطاعم"
      }
    }
    ```
*   **Not Found Response (HTTP 404)**: Standard RESOURCE_NOT_FOUND.

### PUB-03: List Cities
*   **Endpoint ID**: PUB-03
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/cities`
*   **Purpose**: Get list of all cities.
*   **Actor**: Public Visitor
*   **Authentication Requirement**: None.
*   **Success Response (HTTP 200)**:
    ```json
    {
      "success": true,
      "message": "Cities retrieved successfully.",
      "data": [
        {
          "id": 1,
          "name": "رام الله"
        }
      ]
    }
    ```

### PUB-04: List Zones in City
*   **Endpoint ID**: PUB-04
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/cities/{id}/zones`
*   **Purpose**: Get sub-zones for a selected city.
*   **Actor**: Public Visitor
*   **Authentication Requirement**: None.
*   **Path Parameters**:
    *   `id` (integer, required): City database ID.
*   **Success Response (HTTP 200)**:
    ```json
    {
      "success": true,
      "message": "Zones retrieved successfully.",
      "data": [
        {
          "id": 8,
          "name": "الماسيون"
        }
      ]
    }
    ```

### PUB-05: List Stores
*   **Endpoint ID**: PUB-05
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/stores`
*   **Purpose**: Browse and search stores with filters.
*   **Actor**: Public Visitor
*   **Authentication Requirement**: None.
*   **Query Parameters**:
    *   `query` (string, optional)
    *   `category` (string, optional, category slug)
    *   `city` (integer, optional, city ID)
    *   `zone` (integer, optional, zone ID)
    *   `page` (integer, optional, default: 1)
    *   `per_page` (integer, optional, default: 15)
    *   `sort` (string, optional, e.g. `name`, `newest`)
    *   `has_offers` (boolean, optional, filter stores with active deals)
*   **Success Response (HTTP 200)**:
    ```json
    {
      "success": true,
      "message": "Stores retrieved successfully.",
      "data": [
        {
          "slug": "al-yasmin-supermarket",
          "name": "سوبرماركت الياسمين",
          "logo_url": "https://storage...png",
          "category": "بقالة",
          "zone": "الماسيون"
        }
      ],
      "meta": {
        "pagination": {
          "total": 45,
          "count": 15,
          "per_page": 15,
          "current_page": 1,
          "total_pages": 3
        }
      }
    }
    ```
*   **Related Business Rules**: Only approved, active stores with valid subscriptions are returned.

### PUB-06: Get Store Profile
*   **Endpoint ID**: PUB-06
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/stores/{slug}`
*   **Purpose**: Retrieve full details of a store.
*   **Actor**: Public Visitor
*   **Authentication Requirement**: None.
*   **Path Parameters**:
    *   `slug` (string, required): Store URL slug.
*   **Success Response (HTTP 200)**:
    ```json
    {
      "success": true,
      "message": "Store profile retrieved successfully.",
      "data": {
        "slug": "al-yasmin-supermarket",
        "name": "سوبرماركت الياسمين",
        "description": "...",
        "latitude": 31.902341,
        "longitude": 35.203412,
        "logo_url": "...",
        "cover_url": "...",
        "gallery": ["..."],
        "social_links": {
          "phone": "+970599000000",
          "whatsapp": "+970599000000",
          "website": "..."
        },
        "working_hours": [
          {"day": 1, "open": "08:00:00", "close": "22:00:00", "is_closed": false}
        ]
      }
    }
    ```
*   **Error Response (HTTP 404/403)**: If the store is inactive, rejected, or subscription is expired, returns 404 or custom 403 "Store Unavailable" response (maps PV-15).

### PUB-07: Get Store Offers
*   **Endpoint ID**: PUB-07
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/stores/{slug}/offers`
*   **Purpose**: Get active offers for a specific store.
*   **Actor**: Public Visitor
*   **Path Parameters**:
    *   `slug` (string, required)
*   **Success Response (HTTP 200)**:
    ```json
    {
      "success": true,
      "message": "Store offers retrieved successfully.",
      "data": [
        {
          "uuid": "d55b85a3-8356-4226-89d7-8d076f8e79cb",
          "title": "خصم 20% على المعجنات",
          "description": "...",
          "start_date": "2026-07-14",
          "end_date": "2026-07-21"
        }
      ]
    }
    ```
*   **Related Business Rules**: Offers must be currently active (current date within start and end date boundaries).

### PUB-08: General Search
*   **Endpoint ID**: PUB-08
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/search`
*   **Purpose**: Quick search filtering across categories, zones, and stores.
*   **Actor**: Public Visitor
*   **Query Parameters**:
    *   `q` (string, required, search query text)
*   **Success Response (HTTP 200)**: returns matching store lists.

### PUB-09: Home Screen Data
*   **Endpoint ID**: PUB-09
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/home`
*   **Purpose**: Aggregated landing details (categories list, current promotions, banner configurations).
*   **Actor**: Public Visitor
*   **Success Response (HTTP 200)**: returns categories and top offers.

### PUB-10: Get Public Platform Settings
*   **Endpoint ID**: PUB-10
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/platform-settings/public`
*   **Purpose**: Get configuration parameters needed by mobile/web clients (e.g. system support contact number).
*   **Actor**: Public Visitor
*   **Success Response (HTTP 200)**: returns basic key-value settings.

---

## 2. Authentication Endpoints

### ATH-01: Login
*   **Endpoint ID**: ATH-01
*   **HTTP Method**: `POST`
*   **URL**: `/api/v1/auth/login`
*   **Purpose**: Authenticate user and issue tokens or sessions.
*   **Actor**: User (Merchant or Admin)
*   **Authentication Requirement**: None.
*   **Request Body**:
    ```json
    {
      "email": "merchant@palverse.ps",
      "password": "secure_password"
    }
    ```
*   **Validation Rules**: Email must be valid email format, password required.
*   **Success Response (HTTP 200)**:
    ```json
    {
      "success": true,
      "message": "Logged in successfully.",
      "data": {
        "token": "1|sanctum_token_value...",
        "user": {
          "uuid": "e81d4fae-7dec-11d0-a765-00a0c91e6bf6",
          "name": "Ahmed",
          "email": "merchant@palverse.ps",
          "role": "merchant"
        }
      }
    }
    ```

### ATH-02: Logout
*   **Endpoint ID**: ATH-02
*   **HTTP Method**: `POST`
*   **URL**: `/api/v1/auth/logout`
*   **Purpose**: Revoke active user session/token.
*   **Actor**: Authenticated User
*   **Authentication Requirement**: Yes (Sanctum).
*   **Success Response (HTTP 200)**:
    ```json
    {
      "success": true,
      "message": "Logged out successfully."
    }
    ```

### ATH-03: Get Me
*   **Endpoint ID**: ATH-03
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/auth/me`
*   **Purpose**: Get authenticated user profile details.
*   **Actor**: Authenticated User
*   **Success Response (HTTP 200)**: returns user details and assigned roles.

### ATH-04: Forgot Password
*   **Endpoint ID**: ATH-04
*   **HTTP Method**: `POST`
*   **URL**: `/api/v1/auth/forgot-password`
*   **Purpose**: Trigger password reset email link.
*   **Actor**: User
*   **Request Body**: `{"email": "merchant@palverse.ps"}`
*   **Success Response (HTTP 200)**: returns status message.

### ATH-05: Reset Password
*   **Endpoint ID**: ATH-05
*   **HTTP Method**: `POST`
*   **URL**: `/api/v1/auth/reset-password`
*   **Purpose**: Save new password using reset token.
*   **Actor**: User
*   **Request Body**: `{"token": "...", "email": "...", "password": "...", "password_confirmation": "..."}`
*   **Success Response (HTTP 200)**: password updated.

### ATH-06: Change Password
*   **Endpoint ID**: ATH-06
*   **HTTP Method**: `POST`
*   **URL**: `/api/v1/auth/change-password`
*   **Purpose**: Update password inside dashboard.
*   **Actor**: Authenticated User
*   **Request Body**: `{"current_password": "...", "new_password": "...", "new_password_confirmation": "..."}`
*   **Success Response (HTTP 200)**: password changed.

---

## 3. Merchant Endpoints

### MER-01: Get Merchant Dashboard Summary
*   **Endpoint ID**: MER-01
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/merchant/dashboard`
*   **Purpose**: Retrieve stats, owned stores list overview, and alert states.
*   **Actor**: Merchant
*   **Authentication Requirement**: Yes (Sanctum + Role: Merchant).
*   **Success Response (HTTP 200)**:
    ```json
    {
      "success": true,
      "message": "Dashboard data retrieved.",
      "data": {
        "stores_count": 1,
        "stores": [
          {"slug": "al-yasmin", "status": "approved", "is_active": true}
        ]
      }
    }
    ```

### MER-02: Get Owned Stores
*   **Endpoint ID**: MER-02
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/merchant/stores`
*   **Purpose**: List all stores belonging to the merchant.
*   **Actor**: Merchant
*   **Success Response (HTTP 200)**: returns owned store entities.

### MER-03: Create Store Submission
*   **Endpoint ID**: MER-03
*   **HTTP Method**: `POST`
*   **URL**: `/api/v1/merchant/stores`
*   **Purpose**: Submit a new storefront listing for moderation.
*   **Actor**: Merchant
*   **Request Body**:
    ```json
    {
      "name_ar": "سوبرماركت الياسمين",
      "name_en": "Al-Yasmin Supermarket",
      "description_ar": "محل بيع بالتجزئة للبقالة",
      "description_en": "A retail grocery store",
      "category_id": 3,
      "zone_id": 8,
      "latitude": 31.90234100,
      "longitude": 35.20341200
    }
    ```
*   **Validation Rules**: `name_ar` required, `description_ar` required, `category_id` exists, `zone_id` exists, `latitude`/`longitude` numeric.
*   **Success Response (HTTP 201)**:
    ```json
    {
      "success": true,
      "message": "Store submitted for review.",
      "data": {
        "uuid": "a3f62c8e-5b12-4c9a-8a1a-c128f9d3b411",
        "status": "pending"
      }
    }
    ```
*   **Side Effects**: Triggers creation in `stores` table with `status = 'pending'`.

### MER-04: Get Store Configuration
*   **Endpoint ID**: MER-04
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/merchant/stores/{uuid}`
*   **Purpose**: Retrieve full details of an owned store.
*   **Actor**: Merchant
*   **Path Parameters**:
    *   `uuid` (string, required): Store UUID.
*   **Authorization rules**: Policy blocks access unless `stores.owner_id == authenticated_user_id` (ME-22).
*   **Success Response (HTTP 200)**: returns detailed store config.

### MER-05: Update Store Details
*   **Endpoint ID**: MER-05
*   **HTTP Method**: `PUT`
*   **URL**: `/api/v1/merchant/stores/{uuid}`
*   **Purpose**: Edit store text fields.
*   **Actor**: Merchant
*   **Path Parameters**:
    *   `uuid` (string, required)
*   **Request Body**: same fields as create, except slug cannot be changed.
*   **Success Response (HTTP 200)**: store updated.

### MER-06: Get Store Verification Status
*   **Endpoint ID**: MER-06
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/merchant/stores/{uuid}/status`
*   **Purpose**: Get current store approval state and rejection reasons.
*   **Actor**: Merchant
*   **Success Response (HTTP 200)**:
    ```json
    {
      "success": true,
      "message": "Status retrieved.",
      "data": {
        "status": "rejected",
        "rejection_history": [
          {"reason": "Wrong coordinates set.", "created_at": "2026-07-13 18:00:00"}
        ]
      }
    }
    ```

### MER-07: Get Store Subscription Details
*   **Endpoint ID**: MER-07
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/merchant/stores/{uuid}/subscription`
*   **Purpose**: Get current manual subscription state.
*   **Actor**: Merchant
*   **Success Response (HTTP 200)**: returns active plan details, start/end dates.

### MER-08: Get QR Code Link
*   **Endpoint ID**: MER-08
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/merchant/stores/{uuid}/qr-code`
*   **Purpose**: Get QR code URL and image source paths.
*   **Actor**: Merchant
*   **Success Response (HTTP 200)**: returns slug link and generated QR image path.

### MER-09: Download QR Image File
*   **Endpoint ID**: MER-09
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/merchant/stores/{uuid}/qr-code/download`
*   **Purpose**: Download the generated high-res QR code image.
*   **Actor**: Merchant
*   **Success Response (HTTP 200)**: returns binary file download stream (PNG).

---

## 4. Merchant Media Endpoints

### MER-10: Upload Logo
*   **Endpoint ID**: MER-10
*   **HTTP Method**: `POST`
*   **URL**: `/api/v1/merchant/stores/{uuid}/logo`
*   **Purpose**: Upload logo image.
*   **Actor**: Merchant (Owner)
*   **Request Body**: form-data containing file `logo` (max 2MB, png/jpeg).
*   **Success Response (HTTP 200)**: logo updated.
*   **Side Effects**: Deletes previous logo from Laravel Storage.

### MER-11: Remove Logo
*   **Endpoint ID**: MER-11
*   **HTTP Method**: `DELETE`
*   **URL**: `/api/v1/merchant/stores/{uuid}/logo`
*   **Purpose**: Remove logo image file from store.
*   **Actor**: Merchant (Owner)
*   **Success Response (HTTP 200)**: logo removed.

### MER-12: Upload Cover
*   **Endpoint ID**: MER-12
*   **HTTP Method**: `POST`
*   **URL**: `/api/v1/merchant/stores/{uuid}/cover`
*   **Purpose**: Upload cover image banner.
*   **Actor**: Merchant (Owner)
*   **Success Response (HTTP 200)**: cover updated.

### MER-13: Remove Cover
*   **Endpoint ID**: MER-13
*   **HTTP Method**: `DELETE`
*   **URL**: `/api/v1/merchant/stores/{uuid}/cover`
*   **Purpose**: Remove cover image.
*   **Actor**: Merchant (Owner)
*   **Success Response (HTTP 200)**: cover removed.

### MER-14: Upload Gallery Images
*   **Endpoint ID**: MER-14
*   **HTTP Method**: `POST`
*   **URL**: `/api/v1/merchant/stores/{uuid}/gallery`
*   **Purpose**: Append files to store gallery list.
*   **Actor**: Merchant (Owner)
*   **Request Body**: form-data containing files array `images[]` (max 5MB each).
*   **Business Rule Constraints**: The API checks if `current_count + uploaded_count > 10`. If true, rejects with `409 Conflict` (MAX_GALLERY_LIMIT_EXCEEDED).
*   **Success Response (HTTP 200)**: images added.

### MER-15: Delete Gallery Image
*   **Endpoint ID**: MER-15
*   **HTTP Method**: `DELETE`
*   **URL**: `/api/v1/merchant/stores/{uuid}/gallery/{media_id}`
*   **Purpose**: Remove single image from gallery.
*   **Actor**: Merchant (Owner)
*   **Path Parameters**:
    *   `uuid` (string, required): Store UUID.
    *   `media_id` (integer, required): Media database ID.
*   **Success Response (HTTP 200)**: image deleted.

### MER-16: Reorder Gallery Photos
*   **Endpoint ID**: MER-16
*   **HTTP Method**: `PATCH`
*   **URL**: `/api/v1/merchant/stores/{uuid}/gallery/reorder`
*   **Purpose**: Sort gallery images order.
*   **Actor**: Merchant (Owner)
*   **Request Body**: `{"order": [12, 14, 13]}` (array of media IDs).
*   **Success Response (HTTP 200)**: order saved.

---

## 5. Merchant Working Hours Endpoints

### MER-17: Get Working Hours
*   **Endpoint ID**: MER-17
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/merchant/stores/{uuid}/working-hours`
*   **Purpose**: Retrieve working hours schedule list.
*   **Actor**: Merchant (Owner)
*   **Success Response (HTTP 200)**: returns weekly schedule details.

### MER-18: Save Working Hours
*   **Endpoint ID**: MER-18
*   **HTTP Method**: `PUT`
*   **URL**: `/api/v1/merchant/stores/{uuid}/working-hours`
*   **Purpose**: Save updated working hours list.
*   **Actor**: Merchant (Owner)
*   **Request Body**:
    ```json
    {
      "hours": [
        {"day": 0, "open": "08:00:00", "close": "22:00:00", "is_closed": false},
        {"day": 1, "open": null, "close": null, "is_closed": true}
      ]
    }
    ```
*   **Success Response (HTTP 200)**: schedule updated.

---

## 6. Merchant Offers Endpoints

### MER-19: List Store Offers
*   **Endpoint ID**: MER-19
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/merchant/stores/{uuid}/offers`
*   **Purpose**: Get all offers (active, pending, expired) posted by the store.
*   **Actor**: Merchant (Owner)
*   **Success Response (HTTP 200)**: returns list of offers.

### MER-20: Create Offer
*   **Endpoint ID**: MER-20
*   **HTTP Method**: `POST`
*   **URL**: `/api/v1/merchant/stores/{uuid}/offers`
*   **Purpose**: Add a new offer to the store.
*   **Actor**: Merchant (Owner)
*   **Request Body**:
    ```json
    {
      "title_ar": "خصم 20%",
      "title_en": "20% Discount",
      "description_ar": "العرض ساري لفترة محدودة",
      "description_en": "Limited time offer",
      "start_date": "2026-07-14",
      "end_date": "2026-07-21"
    }
    ```
*   **Success Response (HTTP 201)**: offer created.

### MER-21: Get Offer details
*   **Endpoint ID**: MER-21
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/merchant/stores/{uuid}/offers/{offer_uuid}`
*   **Purpose**: Retrieve specific offer.
*   **Actor**: Merchant (Owner)
*   **Path Parameters**:
    *   `uuid` (string, required): Store UUID.
    *   `offer_uuid` (string, required): Offer UUID.
*   **Success Response (HTTP 200)**: returns details.

### MER-22: Update Offer Details
*   **Endpoint ID**: MER-22
*   **HTTP Method**: `PUT`
*   **URL**: `/api/v1/merchant/stores/{uuid}/offers/{offer_uuid}`
*   **Purpose**: Edit details of an offer.
*   **Actor**: Merchant (Owner)
*   **Success Response (HTTP 200)**: offer updated.

### MER-23: Delete Offer
*   **Endpoint ID**: MER-23
*   **HTTP Method**: `DELETE`
*   **URL**: `/api/v1/merchant/stores/{uuid}/offers/{offer_uuid}`
*   **Purpose**: Soft-delete an offer.
*   **Actor**: Merchant (Owner)
*   **Success Response (HTTP 204)**: empty body.

---

## 7. Administration Endpoints

### ADM-01: Admin Dashboard Statistics
*   **Endpoint ID**: ADM-01
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/admin/dashboard`
*   **Purpose**: Get stats on stores, pending counts, active counts, and platform users.
*   **Actor**: Administrator
*   **Authentication Requirement**: Yes (Sanctum + Role: Admin).
*   **Success Response (HTTP 200)**: returns statistics values.

### ADM-02: List Users
*   **Endpoint ID**: ADM-02
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/admin/users`
*   **Purpose**: Search, filter, and paginate users registry list.
*   **Actor**: Administrator
*   **Query Parameters**:
    *   `role` (string, optional)
    *   `page` (integer, optional)
*   **Success Response (HTTP 200)**: returns user lists.

### ADM-03: Get User Details
*   **Endpoint ID**: ADM-03
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/admin/users/{uuid}`
*   **Purpose**: View user details and linked storefronts.
*   **Actor**: Administrator
*   **Path Parameters**:
    *   `uuid` (string, required): User UUID.
*   **Success Response (HTTP 200)**: returns details.

### ADM-04: Update User Status / Roles
*   **Endpoint ID**: ADM-04
*   **HTTP Method**: `PATCH`
*   **URL**: `/api/v1/admin/users/{uuid}/status`
*   **Purpose**: Update active/inactive state of user or switch roles.
*   **Actor**: Administrator
*   **Request Body**: `{"is_active": false}` or `{"role": "admin"}`
*   **Success Response (HTTP 200)**: user status updated.

### ADM-05: List All Stores
*   **Endpoint ID**: ADM-05
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/admin/stores`
*   **Purpose**: List all stores in system with administrative filters.
*   **Actor**: Administrator
*   **Query Parameters**:
    *   `status` (string, optional, e.g. `pending`, `rejected`)
    *   `page` (integer, optional)
*   **Success Response (HTTP 200)**: returns stores list.

### ADM-06: Get Store Admin view
*   **Endpoint ID**: ADM-06
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/admin/stores/{uuid}`
*   **Purpose**: View complete details of a store including audit logs.
*   **Actor**: Administrator
*   **Path Parameters**:
    *   `uuid` (string, required): Store UUID.
*   **Success Response (HTTP 200)**: returns details.

### ADM-07: Approve Store
*   **Endpoint ID**: ADM-07
*   **HTTP Method**: `PATCH`
*   **URL**: `/api/v1/admin/stores/{uuid}/approve`
*   **Purpose**: Approve a pending store.
*   **Actor**: Administrator
*   **Success Response (HTTP 200)**:
    ```json
    {
      "success": true,
      "message": "Store approved successfully.",
      "data": {
        "slug": "al-yasmin-supermarket",
        "status": "approved",
        "qr_code_url": "https://api.palverse.ps/storage/qrcodes/al-yasmin.png"
      }
    }
    ```
*   **Side Effects**:
    1.  Sets `status` to `approved` and logs inside `store_status_history`.
    2.  Generates and locks unique `slug`.
    3.  Generates QR code.

### ADM-08: Reject Store
*   **Endpoint ID**: ADM-08
*   **HTTP Method**: `PATCH`
*   **URL**: `/api/v1/admin/stores/{uuid}/reject`
*   **Purpose**: Reject a store submission with a reason.
*   **Actor**: Administrator
*   **Request Body**:
    ```json
    {
      "reason": "Wrong geographic location set. Please correct coordinates to Ramallah."
    }
    ```
*   **Validation Rules**: `reason` field is strictly required (`NOT NULL`).
*   **Success Response (HTTP 200)**:
    ```json
    {
      "success": true,
      "message": "Store rejected successfully."
    }
    ```
*   **Side Effects**:
    1.  Sets `status` to `rejected`.
    2.  Creates log entry in `store_rejection_reasons` and `store_status_history`.

### ADM-09: Activate Store
*   **Endpoint ID**: ADM-09
*   **HTTP Method**: `PATCH`
*   **URL**: `/api/v1/admin/stores/{uuid}/activate`
*   **Purpose**: Activate store visibility.
*   **Actor**: Administrator
*   **Success Response (HTTP 200)**: store activated.

### ADM-10: Deactivate Store
*   **Endpoint ID**: ADM-10
*   **HTTP Method**: `PATCH`
*   **URL**: `/api/v1/admin/stores/{uuid}/deactivate`
*   **Purpose**: Deactivate store visibility.
*   **Actor**: Administrator
*   **Success Response (HTTP 200)**: store deactivated.

### ADM-11: Get Store Status History
*   **Endpoint ID**: ADM-11
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/admin/stores/{uuid}/status-history`
*   **Purpose**: Retrieve moderation audit logs.
*   **Actor**: Administrator
*   **Success Response (HTTP 200)**: returns history array.

---

## 8. Category, City, & Zone Administration Endpoints

### ADM-12: List Categories (Admin)
*   **Endpoint ID**: ADM-12
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/admin/categories`

### ADM-13: Create Category
*   **Endpoint ID**: ADM-13
*   **HTTP Method**: `POST`
*   **URL**: `/api/v1/admin/categories`
*   **Request Body**: `{"name_ar": "...", "name_en": "...", "slug": "..."}`
*   **Success Response (HTTP 201)**: category created.

### ADM-14: Get Category Details (Admin)
*   **Endpoint ID**: ADM-14
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/admin/categories/{id}`

### ADM-15: Update Category
*   **Endpoint ID**: ADM-15
*   **HTTP Method**: `PUT`
*   **URL**: `/api/v1/admin/categories/{id}`

### ADM-16: Delete Category
*   **Endpoint ID**: ADM-16
*   **HTTP Method**: `DELETE`
*   **URL**: `/api/v1/admin/categories/{id}`
*   **Related Business Rules**: Restrict on delete if stores belong to category.

### ADM-17: List Cities (Admin)
*   **Endpoint ID**: ADM-17
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/admin/cities`

### ADM-18: Create City
*   **Endpoint ID**: ADM-18
*   **HTTP Method**: `POST`
*   **URL**: `/api/v1/admin/cities`
*   **Request Body**: `{"name_ar": "...", "name_en": "..."}`

### ADM-19: Get City Details (Admin)
*   **Endpoint ID**: ADM-19
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/admin/cities/{id}`

### ADM-20: Update City
*   **Endpoint ID**: ADM-20
*   **HTTP Method**: `PUT`
*   **URL**: `/api/v1/admin/cities/{id}`

### ADM-21: Delete City
*   **Endpoint ID**: ADM-21
*   **HTTP Method**: `DELETE`
*   **URL**: `/api/v1/admin/cities/{id}`

### ADM-22: List Zones (Admin)
*   **Endpoint ID**: ADM-22
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/admin/zones`

### ADM-23: Create Zone
*   **Endpoint ID**: ADM-23
*   **HTTP Method**: `POST`
*   **URL**: `/api/v1/admin/zones`
*   **Request Body**: `{"city_id": 1, "name_ar": "...", "name_en": "..."}`

### ADM-24: Get Zone Details (Admin)
*   **Endpoint ID**: ADM-24
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/admin/zones/{id}`

### ADM-25: Update Zone
*   **Endpoint ID**: ADM-25
*   **HTTP Method**: `PUT`
*   **URL**: `/api/v1/admin/zones/{id}`

### ADM-26: Delete Zone
*   **Endpoint ID**: ADM-26
*   **HTTP Method**: `DELETE`
*   **URL**: `/api/v1/admin/zones/{id}`

---

## 9. Subscription Plan Administration Endpoints

### ADM-27: List Subscription Plans
*   **Endpoint ID**: ADM-27
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/admin/subscription-plans`

### ADM-28: Create Subscription Plan
*   **Endpoint ID**: ADM-28
*   **HTTP Method**: `POST`
*   **URL**: `/api/v1/admin/subscription-plans`
*   **Request Body**: `{"name_ar": "...", "name_en": "...", "price": 150.00, "duration_days": 365}`

### ADM-29: Get Plan Details
*   **Endpoint ID**: ADM-29
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/admin/subscription-plans/{id}`

### ADM-30: Update Subscription Plan
*   **Endpoint ID**: ADM-30
*   **HTTP Method**: `PUT`
*   **URL**: `/api/v1/admin/subscription-plans/{id}`

### ADM-31: Delete Subscription Plan
*   **Endpoint ID**: ADM-31
*   **HTTP Method**: `DELETE`
*   **URL**: `/api/v1/admin/subscription-plans/{id}`

---

## 10. Manual Subscription Management Endpoints

### ADM-32: List Subscriptions
*   **Endpoint ID**: ADM-32
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/admin/subscriptions`

### ADM-33: Assign Manual Subscription to Store
*   **Endpoint ID**: ADM-33
*   **HTTP Method**: `POST`
*   **URL**: `/api/v1/admin/subscriptions`
*   **Purpose**: Create a new subscription interval manually.
*   **Actor**: Administrator
*   **Request Body**:
    ```json
    {
      "store_uuid": "a3f62c8e-5b12-4c9a-8a1a-c128f9d3b411",
      "plan_id": 1,
      "start_date": "2026-07-13",
      "end_date": "2027-07-13"
    }
    ```
*   **Success Response (HTTP 201)**: subscription created.

### ADM-34: Get Subscription details
*   **Endpoint ID**: ADM-34
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/admin/subscriptions/{id}`

### ADM-35: Update Subscription dates
*   **Endpoint ID**: ADM-35
*   **HTTP Method**: `PUT`
*   **URL**: `/api/v1/admin/subscriptions/{id}`

### ADM-36: Activate Subscription
*   **Endpoint ID**: ADM-36
*   **HTTP Method**: `PATCH`
*   **URL**: `/api/v1/admin/subscriptions/{id}/activate`
*   **Purpose**: Override subscription status to active manually.

### ADM-37: Expire Subscription
*   **Endpoint ID**: ADM-37
*   **HTTP Method**: `PATCH`
*   **URL**: `/api/v1/admin/subscriptions/{id}/expire`
*   **Purpose**: Set the end_date to current time to expire subscription.

### ADM-38: Cancel Subscription
*   **Endpoint ID**: ADM-38
*   **HTTP Method**: `PATCH`
*   **URL**: `/api/v1/admin/subscriptions/{id}/cancel`
*   **Purpose**: Terminate manual subscription logs immediately.

---

## 11. Platform Settings Administration Endpoints

### ADM-39: View Settings Config
*   **Endpoint ID**: ADM-39
*   **HTTP Method**: `GET`
*   **URL**: `/api/v1/admin/settings`

### ADM-40: Update Platform Settings
*   **Endpoint ID**: ADM-40
*   **HTTP Method**: `PUT`
*   **URL**: `/api/v1/admin/settings`
*   **Request Body**:
    ```json
    {
      "settings": [
        {"key": "media.gallery_max_images", "value": "10"},
        {"key": "system.support_phone", "value": "+970599000000"}
      ]
    }
    ```
*   **Success Response (HTTP 200)**: settings saved.
