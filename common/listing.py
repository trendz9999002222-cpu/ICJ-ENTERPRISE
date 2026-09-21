from django.db.models import Q


def parse_bool_query(value: str | None) -> bool | None:
    if value is None or value == "":
        return None
    return value.lower() in ("1", "true", "yes")


def apply_search(qs, search: str | None, *fields: str):
    if not search or not fields:
        return qs
    term = search.strip()
    if not term:
        return qs
    q = Q()
    for field in fields:
        q |= Q(**{f"{field}__icontains": term})
    return qs.filter(q)


def apply_is_active(qs, is_active: bool | None):
    if is_active is None:
        return qs
    return qs.filter(is_active=is_active)


def apply_ordering(qs, ordering: str | None, default: str = "display_order"):
    if ordering:
        return qs.order_by(*[o.strip() for o in ordering.split(",") if o.strip()])
    return qs.order_by(default)
