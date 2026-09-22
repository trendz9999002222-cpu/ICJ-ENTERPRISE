# ICJ Enterprise — API Documentation

This document provides a comprehensive reference for all REST API endpoints provided by the ICJ Django backend.

---

## 1. Architecture & Conventions

### Base URL
```
http://localhost:8000/api/v1/
```

### Standard Response Envelope
All API endpoints follow a standardized JSON envelope structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful description.",
  "data": { ... }
}
```

**Paginated List Response:**
```json
{
  "success": true,
  "message": "Items retrieved.",
  "data": {
    "count": 42,
    "next": "http://localhost:8000/api/v1/admin/users/?page=2",
    "previous": null,
    "results": [ ... ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description message.",
  "errors": {
    "email": ["A user with this email already exists."]
  }
}
```

### Authentication & Authorization
- **Public endpoints**: No authentication required.
- **Admin endpoints**: Require JWT cookie (`icj_access_token`) or `Authorization: Bearer <token>` header. The authenticated user must have an administrative role (`admin` or `super_admin`).
- **User Roles**: `super_admin`, `admin`, `advocate`, `client`, `member`.

---

## 2. Authentication APIs (`/api/v1/auth/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login/` | Authenticate user & issue JWT cookies/tokens | No |
| `POST` | `/api/v1/auth/logout/` | Invalidate current session & clear cookies | Yes |
| `POST` | `/api/v1/auth/forgot-password/` | Request a password reset OTP/link via email | No |
| `POST` | `/api/v1/auth/reset-password/` | Reset password using verified token/OTP | No |
| `POST` | `/api/v1/auth/change-password/` | Change password for logged-in user | Yes |
| `POST` | `/api/v1/auth/refresh/` | Refresh expired access token using refresh token | Yes (Refresh Cookie) |
| `GET`  | `/api/v1/auth/me/` | Retrieve currently logged in user profile | Yes |

---

## 3. Admin User Management APIs (`/api/v1/admin/users/`)

Endpoints for administrators to view, manage, activate, block/deactivate, and delete users in the system.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/users/` | List all users (supports `search`, `role`, `status`, `page`, `page_size`, `ordering`) | Admin (`admin`/`super_admin`) |
| `GET` | `/api/v1/admin/users/<id>/` | Get detailed user profile information | Admin (`admin`/`super_admin`) |
| `PATCH` | `/api/v1/admin/users/<id>/` | Update user properties (`first_name`, `last_name`, `role`, `mobile`) | Admin (`admin`/`super_admin`) |
| `DELETE` | `/api/v1/admin/users/<id>/` | Permanently delete a user account | Admin (`admin`/`super_admin`) |
| `POST` | `/api/v1/admin/users/<id>/activate/` | Activate / unblock a user account | Admin (`admin`/`super_admin`) |
| `POST` | `/api/v1/admin/users/<id>/deactivate/` | Deactivate / block a user account | Admin (`admin`/`super_admin`) |

**Query Parameters for Listing:**
- `search`: Search across `username`, `email`, `first_name`, `last_name`, `mobile`, `reference_id`, and `profession/group/category` names
- `role`: Filter by role (`super_admin`, `admin`, `advocate`, `client`, `member`)
- `status`: Filter by status (`active`, `inactive`, `suspended`, `pending`, `blocked`)
- `category` or `category_id`: Filter users belonging to a specific Category UUID
- `group` or `group_id`: Filter users belonging to a specific Group UUID
- `profession` or `profession_id`: Filter users belonging to a specific Profession UUID
- `verified`: Filter by email verification status (`true` / `false`)
- `ordering`: Sort field, e.g. `-date_joined`, `email`, `last_name`
- `page` / `page_size`: Pagination controls (defaults: `page=1`, `page_size=20`)

---

## 4. Public Professional Onboarding APIs (`/api/v1/professional-onboarding/`)

Endpoints used by public users to navigate categories, groups, and professions, and submit their registration applications.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/professional-onboarding/categories/` | List all active onboarding categories | No |
| `GET` | `/api/v1/professional-onboarding/categories/<category_id>/groups/` | List groups under a specific category | No |
| `GET` | `/api/v1/professional-onboarding/groups/<group_id>/professions/` | List professions under a specific group | No |
| `GET` | `/api/v1/professional-onboarding/professions/<profession_id>/configuration/` | Get complete dynamic form fields, options, and document upload requirements for a profession | No |
| `POST` | `/api/v1/professional-onboarding/submissions/` | Submit onboarding registration form (JSON payload) | Optional |
| `POST` | `/api/v1/professional-onboarding/register/` | Submit multipart registration with document file attachments | Optional |
| `GET` | `/api/v1/professional-onboarding/public-professionals/` | List approved verified professionals for public directory (supports `category`, `group`, `profession`, `state`, `search`, `page`, `page_size`) | No |
| `GET` | `/api/v1/professional-onboarding/public-professionals/<id>/` | Get detailed public profile for a verified professional (by UUID or Reference ID) | No |

---

## 5. Admin Professional Onboarding APIs (`/api/v1/admin/professional-onboarding/`)

Full administrative control over registration submissions, categories, groups, professions, dynamic fields, and documents.

### A. Submissions & Application Review
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `.../registrations/` | List registrations (supports `search`, `status`, `category`, `group`, `profession`, `created_from`, `created_to`, `ordering`) |
| `GET` | `.../registrations/<uuid:id>/` | View full application payload, applicant details, dynamic form inputs, and uploaded files |
| `POST` | `.../registrations/<uuid:id>/approve/` | Approve a registration application |
| `POST` | `.../registrations/<uuid:id>/reject/` | Reject a registration application |
| `POST` | `.../registrations/<uuid:id>/under-review/` | Mark application status as `under_review` |
| `DELETE` | `.../registrations/<uuid:id>/` | Delete a registration application |

### B. Category Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET`, `POST` | `.../categories/` | List all categories / Create category |
| `GET`, `PUT`, `PATCH`, `DELETE` | `.../categories/<uuid:id>/` | Category detail / update / delete |
| `GET`, `POST`, `PUT` | `.../categories/<uuid:id>/theme/` | Category brand theme settings |
| `GET`, `POST` | `.../categories/<uuid:id>/groups/` | List or create groups under category |

### C. Group Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET`, `POST` | `.../groups/` | List all groups / Create group |
| `GET`, `PUT`, `PATCH`, `DELETE` | `.../groups/<uuid:id>/` | Group detail / update / delete |
| `GET`, `POST`, `PUT` | `.../groups/<uuid:id>/theme/` | Group brand theme settings |
| `GET`, `POST` | `.../groups/<uuid:id>/professions/` | List or create professions under group |

### D. Profession Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET`, `POST` | `.../professions/` | List all professions / Create profession |
| `GET`, `PUT`, `PATCH`, `DELETE` | `.../professions/<uuid:id>/` | Profession detail / update / delete |
| `GET`, `POST`, `PUT` | `.../professions/<uuid:id>/theme/` | Profession brand theme settings |
| `GET` | `.../professions/<uuid:id>/theme/resolved/` | Resolved cascading theme for profession |
| `GET`, `POST` | `.../professions/<uuid:id>/fields/` | List or create fields for profession |
| `GET`, `POST` | `.../professions/<uuid:id>/documents/` | List or create required documents for profession |

### E. Dynamic Fields & Options
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET`, `POST` | `.../common-fields/` | Common application fields (applies to all applicants) |
| `GET`, `PUT`, `PATCH`, `DELETE` | `.../common-fields/<uuid:id>/` | Common field detail / update / delete |
| `GET`, `POST` | `.../profession-fields/` | Profession-specific custom form fields |
| `GET`, `PUT`, `PATCH`, `DELETE` | `.../profession-fields/<uuid:id>/` | Profession field detail / update / delete |
| `GET`, `POST` | `.../field-options/` | Dropdown / select options for select fields |
| `GET`, `PUT`, `PATCH`, `DELETE` | `.../field-options/<uuid:id>/` | Field option detail / update / delete |

### F. Required Documents
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET`, `POST` | `.../documents/` | Global required document types |
| `GET`, `PUT`, `PATCH`, `DELETE` | `.../documents/<uuid:id>/` | Document type detail / update / delete |
| `GET`, `POST` | `.../profession-documents/` | Profession-specific required document mappings |
| `GET`, `PUT`, `PATCH`, `DELETE` | `.../profession-documents/<uuid:id>/` | Profession document detail / update / delete |

---

## 6. System & Health Check APIs

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health/` | Service health status and database connectivity check | No |

---

## 7. Example Workflow

### 1. Public User Onboarding:
1. `GET /api/v1/professional-onboarding/categories/` → User chooses Category.
2. `GET /api/v1/professional-onboarding/categories/<cat_id>/groups/` → User chooses Group.
3. `GET /api/v1/professional-onboarding/groups/<group_id>/professions/` → User chooses Profession.
4. `GET /api/v1/professional-onboarding/professions/<prof_id>/configuration/` → Client receives dynamic form schema and document upload checklist.
5. `POST /api/v1/professional-onboarding/register/` → Client posts applicant details and document files (multipart/form-data). Returns reference ID (e.g. `ICJ-2026-XXXX`).

### 2. Admin Review & User Management:
1. `POST /api/v1/auth/login/` → Admin logs in with credentials.
2. `GET /api/v1/admin/professional-onboarding/registrations/?status=pending` → Admin views pending registrations.
3. `GET /api/v1/admin/professional-onboarding/registrations/<id>/` → Admin reviews applicant data, form fields, and attached documents.
4. `POST /api/v1/admin/professional-onboarding/registrations/<id>/approve/` → Admin approves application.
5. `GET /api/v1/admin/users/` → Admin views all registered platform users.
6. `POST /api/v1/admin/users/<id>/deactivate/` / `POST /api/v1/admin/users/<id>/activate/` → Admin blocks or unblocks user accounts.
