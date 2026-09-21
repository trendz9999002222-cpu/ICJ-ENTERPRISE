# Professional Registration API

Public professional onboarding submissions (`/join`) and admin review.

## Public submit

- `POST /api/v1/professional-onboarding/register/` (alias: `.../submissions/`)
- Auth: optional (`AllowAny`). If JWT/session user is present, linked on `ProfessionalRegistrationSubmission.user`.
- Content-Type: `multipart/form-data`

### Form fields

| Field | Description |
|--------|-------------|
| `category_ids` | JSON array string of UUIDs |
| `group_ids` | JSON array string |
| `profession_ids` | JSON array string |
| `common_field_values` | JSON object |
| `profession_field_values` | JSON object keyed by profession UUID |
| `document__{document_key}` | File uploads |

### Headers

- `Idempotency-Key` (optional): with authenticated user, duplicate key returns the same submission.

### Success

```json
{
  "success": true,
  "message": "Professional registration submitted successfully.",
  "data": {
    "reference_id": "PRO-2026-000001",
    "status": "pending",
    "submitted_at": "2026-09-20T18:00:00+00:00"
  }
}
```

Reference IDs are allocated server-side via per-year atomic counter (`PRO-{year}-{6-digit}`).

## Admin

- `GET /api/v1/admin/professional-onboarding/registrations/` — paginated list
- `GET /api/v1/admin/professional-onboarding/registrations/{id}/` — detail

Query: `search`, `status`, `category`, `group`, `profession`, `ordering`, `page`, `page_size`.

Requires admin JWT + `IsAdminRole`.

## Data model

One `ProfessionalRegistrationSubmission` per submit:

- `selected_*_ids` — full multi-select
- `common_field_values` — once per person
- `profession_field_values` — `{ profession_id: { field_key: value } }`
- `ProfessionalRegistrationSubmissionFile` — one row per document key (deduped)

Approval → future `ProfessionalProfile` (not implemented in this phase).
