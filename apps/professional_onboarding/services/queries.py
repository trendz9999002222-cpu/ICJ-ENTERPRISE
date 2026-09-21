from common.listing import apply_is_active, apply_ordering, apply_search


def filter_categories(qs, *, search=None, is_active=None, ordering=None):
    qs = apply_search(qs, search, "name", "slug")
    qs = apply_is_active(qs, is_active)
    return apply_ordering(qs, ordering)


def filter_groups(qs, *, category_id=None, search=None, is_active=None, ordering=None):
    if category_id:
        qs = qs.filter(category_id=category_id)
    qs = apply_search(qs, search, "name", "slug")
    qs = apply_is_active(qs, is_active)
    return apply_ordering(qs, ordering)


def filter_professions(qs, *, group_id=None, category_id=None, search=None, is_active=None, ordering=None):
    if group_id:
        qs = qs.filter(group_id=group_id)
    if category_id:
        qs = qs.filter(group__category_id=category_id)
    qs = apply_search(qs, search, "name", "slug")
    qs = apply_is_active(qs, is_active)
    return apply_ordering(qs, ordering)


def filter_common_fields(qs, *, search=None, is_active=None, field_type=None, ordering=None):
    if field_type:
        qs = qs.filter(field_type=field_type)
    qs = apply_search(qs, search, "name", "field_key", "label")
    qs = apply_is_active(qs, is_active)
    return apply_ordering(qs, ordering)


def filter_profession_fields(qs, *, profession_id=None, search=None, is_active=None, field_type=None, ordering=None):
    if profession_id:
        qs = qs.filter(profession_id=profession_id)
    if field_type:
        qs = qs.filter(field_type=field_type)
    qs = apply_search(qs, search, "name", "field_key", "label")
    qs = apply_is_active(qs, is_active)
    return apply_ordering(qs, ordering)


def filter_field_options(qs, *, common_field_id=None, profession_field_id=None, is_active=None, ordering=None):
    if common_field_id:
        qs = qs.filter(common_field_id=common_field_id)
    if profession_field_id:
        qs = qs.filter(profession_field_id=profession_field_id)
    qs = apply_is_active(qs, is_active)
    return apply_ordering(qs, ordering)


def filter_documents(qs, *, search=None, is_active=None, ordering=None):
    qs = apply_search(qs, search, "name", "document_key")
    qs = apply_is_active(qs, is_active)
    return apply_ordering(qs, ordering)


def filter_profession_documents(
    qs,
    *,
    profession_id=None,
    document_id=None,
    search=None,
    is_active=None,
    ordering=None,
):
    if profession_id:
        qs = qs.filter(profession_id=profession_id)
    if document_id:
        qs = qs.filter(document_id=document_id)
    qs = apply_search(qs, search, "document__name", "document__document_key", "instructions")
    qs = apply_is_active(qs, is_active)
    return apply_ordering(qs, ordering)
