import re
from typing import Any

from apps.professional_onboarding.models.common_field import CommonField

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^\+?[\d\s\-()]{7,20}$")


def _is_empty(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, str) and not value.strip():
        return True
    if isinstance(value, (list, tuple)) and len(value) == 0:
        return True
    return False


def validate_configured_field_value(field_type: str, value: Any, options: list[dict] | None) -> str | None:
    """Return an error message if invalid, else None."""
    if _is_empty(value):
        return None

    option_values = {o.get("value") for o in (options or []) if o.get("value") is not None}

    if field_type == CommonField.FieldType.EMAIL:
        if not isinstance(value, str) or not EMAIL_RE.match(value.strip()):
            return "Enter a valid email address."
    elif field_type == CommonField.FieldType.PHONE:
        if not isinstance(value, str) or not PHONE_RE.match(value.strip()):
            return "Enter a valid phone number."
    elif field_type == CommonField.FieldType.NUMBER:
        if isinstance(value, bool) or not isinstance(value, (int, float, str)):
            return "Enter a valid number."
        if isinstance(value, str) and not value.strip().replace(".", "", 1).isdigit():
            return "Enter a valid number."
    elif field_type in (CommonField.FieldType.SELECT, CommonField.FieldType.RADIO):
        if option_values and str(value) not in option_values:
            return "Selected value is not allowed."
    elif field_type == CommonField.FieldType.CHECKBOX:
        if option_values:
            if isinstance(value, list):
                for item in value:
                    if str(item) not in option_values:
                        return "One or more selected values are not allowed."
            elif str(value) not in option_values:
                return "Selected value is not allowed."
    elif field_type in (CommonField.FieldType.TEXT, CommonField.FieldType.TEXTAREA):
        if not isinstance(value, str):
            return "Enter valid text."

    return None
