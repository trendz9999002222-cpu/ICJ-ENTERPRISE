from django.db.models import Q, QuerySet

from apps.professional_onboarding.models import ProfessionalRegistrationSubmission


def filter_registrations(
    qs: QuerySet,
    *,
    search: str | None = None,
    status: str | None = None,
    category_id: str | None = None,
    group_id: str | None = None,
    profession_id: str | None = None,
    created_from=None,
    created_to=None,
    ordering: str | None = None,
) -> QuerySet:
    if status:
        qs = qs.filter(status=status)
    if category_id:
        cid = str(category_id).strip()
        qs = qs.filter(
            Q(category_id=cid)
            | Q(selected_category_ids__contains=[cid])
            | Q(selected_category_ids__contains=cid)
        )
    if group_id:
        gid = str(group_id).strip()
        qs = qs.filter(
            Q(group_id=gid)
            | Q(selected_group_ids__contains=[gid])
            | Q(selected_group_ids__contains=gid)
        )
    if profession_id:
        pid = str(profession_id).strip()
        qs = qs.filter(
            Q(profession_id=pid)
            | Q(selected_profession_ids__contains=[pid])
            | Q(selected_profession_ids__contains=pid)
        )
    if created_from:
        qs = qs.filter(created_at__gte=created_from)
    if created_to:
        qs = qs.filter(created_at__lte=created_to)

    if search:
        term = search.strip()
        if term:
            qs = qs.filter(
                Q(reference_id__icontains=term)
                | Q(common_field_values__full_name__icontains=term)
                | Q(common_field_values__name__icontains=term)
                | Q(common_field_values__email__icontains=term)
                | Q(common_field_values__mobile_number__icontains=term)
                | Q(common_field_values__mobile__icontains=term)
            )

    if ordering:
        allowed = {"created_at", "-created_at", "status", "-status", "reference_id", "-reference_id"}
        parts = [o.strip() for o in ordering.split(",") if o.strip() in allowed]
        if parts:
            return qs.order_by(*parts)
    return qs.order_by("-created_at")
