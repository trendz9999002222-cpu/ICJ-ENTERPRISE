# Admin Professional Onboarding Configuration API

Base: `/api/v1/admin/professional-onboarding/`

**Auth:** Bearer JWT + `password_change_required=false` + role `admin` or `super_admin`.

**List response envelope:**

```json
{
  "success": true,
  "message": "...",
  "data": {
    "results": [],
    "count": 0,
    "next": null,
    "previous": null
  }
}
```

**Query params (lists):** `search`, `is_active`, `ordering`, `page`, `page_size`

## Resources

| Resource | List/Create | Detail |
|----------|-------------|--------|
| Categories | `categories/` | `categories/<uuid>/` |
| Groups | `groups/`, `categories/<uuid>/groups/` | `groups/<uuid>/` |
| Professions | `professions/`, `groups/<uuid>/professions/` | `professions/<uuid>/` |
| Common fields | `common-fields/` | `common-fields/<uuid>/` |
| Common field options | `common-fields/<uuid>/options/` | `field-options/<uuid>/` |
| Profession fields | `profession-fields/`, `professions/<uuid>/fields/` | `profession-fields/<uuid>/` |
| Profession field options | `profession-fields/<uuid>/options/` | `field-options/<uuid>/` |
| Documents | `documents/` | `documents/<uuid>/` |
| Profession documents | `profession-documents/`, `professions/<uuid>/documents/` | `profession-documents/<uuid>/` |
| Visual themes | `categories/<uuid>/theme/`, `groups/<uuid>/theme/`, `professions/<uuid>/theme/` | same (GET/PATCH/PUT/DELETE) |
| Resolved profession theme | `professions/<uuid>/theme/resolved/` | — |

Theme fields: `use_parent_theme`, `primary_color`, `secondary_color`, `accent_color`, `background_color`, `text_color`, `border_color`, `icon_color` (HEX). Groups/professions may set `use_parent_theme` to inherit resolved parent colors without duplicating stored parent values.

Filter examples: `groups/?category=<uuid>`, `professions/?group=<uuid>`, `field-options/?common_field=<uuid>`

## Tests

```bash
pytest apps/professional_onboarding/tests/test_admin_config_api.py
```
