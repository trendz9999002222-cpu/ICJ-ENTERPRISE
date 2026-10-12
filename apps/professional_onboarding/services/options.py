from __future__ import annotations

from typing import TYPE_CHECKING, Any

from apps.professional_onboarding.models import CommonField, FieldOption, ProfessionField


def sync_field_options(
    field: CommonField | ProfessionField,
    options_list: list[dict[str, Any] | str] | None,
) -> None:
    """Sync options for a CommonField or ProfessionField."""
    if options_list is None:
        return

    if field.field_type not in (
        CommonField.FieldType.SELECT,
        CommonField.FieldType.RADIO,
        CommonField.FieldType.CHECKBOX,
    ):
        return

    is_common = isinstance(field, CommonField)
    existing_options = {o.value: o for o in field.options.all()}
    seen_values: set[str] = set()

    for index, opt in enumerate(options_list):
        if isinstance(opt, str):
            val = opt.strip()
            lbl = opt.strip()
            order = index
            active = True
        elif isinstance(opt, dict):
            val = str(opt.get("value", "")).strip()
            lbl = str(opt.get("label", "")).strip() or val
            order = int(opt.get("display_order", index))
            active = bool(opt.get("is_active", True))
        else:
            continue

        if not val or val in seen_values:
            continue
        seen_values.add(val)

        if val in existing_options:
            item = existing_options[val]
            item.label = lbl
            item.display_order = order
            item.is_active = active
            item.save()
        else:
            if is_common:
                FieldOption.objects.create(
                    common_field=field,
                    value=val,
                    label=lbl,
                    display_order=order,
                    is_active=active,
                )
            else:
                FieldOption.objects.create(
                    profession_field=field,
                    value=val,
                    label=lbl,
                    display_order=order,
                    is_active=active,
                )
