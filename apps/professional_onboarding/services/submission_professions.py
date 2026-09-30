from __future__ import annotations

from typing import Any

from apps.professional_onboarding.models import Category, Group, Profession


def _is_uuid_key(key: str) -> bool:
    parts = key.split("-")
    return len(parts) == 5 and len(key) >= 32


def profession_field_blocks(profession_field_values: dict[str, Any] | None, profession_ids: list[str]) -> dict[str, dict[str, Any]]:
    """Map profession_id -> flat field dict from stored JSON."""
    raw = profession_field_values or {}
    if not raw:
        return {pid: {} for pid in profession_ids}

    if profession_ids and all(pid in raw and isinstance(raw.get(pid), dict) for pid in profession_ids):
        return {pid: dict(raw[pid]) for pid in profession_ids}

    if len(profession_ids) == 1:
        pid = profession_ids[0]
        if pid in raw and isinstance(raw[pid], dict):
            return {pid: dict(raw[pid])}
        nested_keys = [k for k in raw if _is_uuid_key(k)]
        if nested_keys:
            return {k: dict(v) for k, v in raw.items() if isinstance(v, dict) and k in profession_ids}
        return {pid: dict(raw)}

    blocks: dict[str, dict[str, Any]] = {}
    for key, value in raw.items():
        if _is_uuid_key(key) and isinstance(value, dict):
            blocks[key] = dict(value)
    for pid in profession_ids:
        blocks.setdefault(pid, {})
    return blocks


def expand_submission_professions(submission) -> list[dict[str, Any]]:
    """One row per selected profession with resolved names and field values."""
    ids = list(submission.selected_profession_ids or [])
    if not ids and submission.profession_id:
        ids = [str(submission.profession_id)]

    if not ids:
        return []

    blocks = profession_field_blocks(submission.profession_field_values, ids)
    rows = Profession.objects.filter(pk__in=ids).select_related("group", "group__category")
    by_id = {str(r.id): r for r in rows}

    out: list[dict[str, Any]] = []
    for pid in ids:
        prof = by_id.get(pid)
        out.append(
            {
                "profession_id": pid,
                "profession_name": prof.name if prof else pid,
                "group_id": str(prof.group_id) if prof else "",
                "group_name": prof.group.name if prof else "",
                "category_id": str(prof.group.category_id) if prof else "",
                "category_name": prof.group.category.name if prof else "",
                "field_values": blocks.get(pid, {}),
            }
        )
    return out
