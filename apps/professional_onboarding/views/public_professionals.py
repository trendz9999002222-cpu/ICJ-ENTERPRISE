"""
Public APIs for discovering and viewing verified professionals in the directory.
"""

from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from common.api_listing import list_params, paginated_success
from common.responses import api_success

from apps.professional_onboarding.models import ProfessionalRegistrationSubmission
from apps.professional_onboarding.serializers.public_professional import (
    PublicProfessionalProfileSerializer,
)


def _extract_nested_values(submission, key):
    """
    Extract all values for a given key from deeply nested profession_field_values.
    Structure: {profession_uuid: {key: value, ...}, ...}
    """
    values = []
    for _prof_id, prof_data in (submission.profession_field_values or {}).items():
        if isinstance(prof_data, dict):
            val = prof_data.get(key)
            if val and str(val).strip():
                values.append(str(val).strip())
    return values


class PublicProfessionalsListAPIView(APIView):
    """
    GET /api/v1/professional-onboarding/public-professionals/

    Public directory of verified professionals.
    Supports filtering by category, group, profession, state, city, experience, search query.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        params = list_params(request)

        qs = (
            ProfessionalRegistrationSubmission.objects
            .select_related("category", "group", "profession", "user")
            .prefetch_related("files")
        )

        # Verification / status filter
        is_verified = request.query_params.get("is_verified")
        if is_verified is not None:
            if is_verified.lower() in ("true", "1", "yes"):
                qs = qs.filter(status=ProfessionalRegistrationSubmission.Status.APPROVED)
            elif is_verified.lower() in ("false", "0", "no"):
                qs = qs.exclude(status=ProfessionalRegistrationSubmission.Status.APPROVED)
            # "all" or unknown → no filter
        else:
            status_filter = request.query_params.get("status")
            if status_filter and status_filter != "all":
                qs = qs.filter(status=status_filter)
            # Default: show all professionals (both verified and unverified)

        # Category filter (by ID or name — checks primary AND selected_category_ids)
        import uuid as uuid_lib
        category = request.query_params.get("category") or request.query_params.get("category_id")
        if category and category != "all":
            try:
                val = uuid_lib.UUID(str(category))
                qs = qs.filter(
                    Q(category_id=val)
                    | Q(selected_category_ids__contains=[str(val)])
                )
            except ValueError:
                from apps.professional_onboarding.models import Category
                matched_ids = list(Category.objects.filter(
                    Q(name__iexact=category) | Q(slug__iexact=category)
                ).values_list('id', flat=True))
                if matched_ids:
                    q_obj = Q(category_id__in=matched_ids)
                    for sid in [str(mid) for mid in matched_ids]:
                        q_obj |= Q(selected_category_ids__contains=[sid])
                    qs = qs.filter(q_obj)
                else:
                    qs = qs.none()

        # Group filter
        group = request.query_params.get("group") or request.query_params.get("group_id")
        if group and group != "all":
            try:
                val = uuid_lib.UUID(str(group))
                qs = qs.filter(
                    Q(group_id=val)
                    | Q(selected_group_ids__contains=[str(val)])
                )
            except ValueError:
                from apps.professional_onboarding.models import Group
                matched_ids = list(Group.objects.filter(
                    Q(name__iexact=group) | Q(slug__iexact=group)
                ).values_list('id', flat=True))
                if matched_ids:
                    q_obj = Q(group_id__in=matched_ids)
                    for sid in [str(mid) for mid in matched_ids]:
                        q_obj |= Q(selected_group_ids__contains=[sid])
                    qs = qs.filter(q_obj)
                else:
                    qs = qs.none()

        # Profession filter
        profession = request.query_params.get("profession") or request.query_params.get("profession_id")
        if profession and profession != "all":
            try:
                val = uuid_lib.UUID(str(profession))
                qs = qs.filter(
                    Q(profession_id=val)
                    | Q(selected_profession_ids__contains=[str(val)])
                )
            except ValueError:
                from apps.professional_onboarding.models import Profession
                matched_ids = list(Profession.objects.filter(
                    Q(name__iexact=profession) | Q(slug__iexact=profession)
                ).values_list('id', flat=True))
                if matched_ids:
                    q_obj = Q(profession_id__in=matched_ids)
                    for sid in [str(mid) for mid in matched_ids]:
                        q_obj |= Q(selected_profession_ids__contains=[sid])
                    qs = qs.filter(q_obj)
                else:
                    qs = qs.none()

        # State filter — profession_field_values is {prof_uuid: {state, city, ...}}
        # We must filter in Python since the keys are dynamic UUIDs
        state = request.query_params.get("state")
        if state and state != "All States":
            state_lower = state.lower()
            matching_ids = []
            for p in qs:
                # Check common fields
                common_state = (p.common_field_values or {}).get("state", "")
                if common_state and state_lower in common_state.lower():
                    matching_ids.append(p.pk)
                    continue
                # Check each profession's nested data
                for _k, v in (p.profession_field_values or {}).items():
                    if isinstance(v, dict):
                        nested_state = v.get("state") or v.get("practice_state", "")
                        if nested_state and state_lower in str(nested_state).lower():
                            matching_ids.append(p.pk)
                            break
            qs = qs.filter(pk__in=matching_ids)

        # City filter
        city = request.query_params.get("city")
        if city and city != "All Cities":
            city_lower = city.lower()
            matching_ids = []
            for p in qs:
                common = p.common_field_values or {}
                common_city = common.get("city") or common.get("district", "")
                if common_city and city_lower in common_city.lower():
                    matching_ids.append(p.pk)
                    continue
                for _k, v in (p.profession_field_values or {}).items():
                    if isinstance(v, dict):
                        nested_city = v.get("city") or v.get("practice_city", "")
                        if nested_city and city_lower in str(nested_city).lower():
                            matching_ids.append(p.pk)
                            break
            qs = qs.filter(pk__in=matching_ids)

        # Experience filter (min years)
        experience_min = request.query_params.get("experience_min")
        if experience_min:
            try:
                exp_min = int(experience_min)
                import datetime
                current_year = datetime.date.today().year
                matching_ids = []
                for p in qs:
                    years = None
                    for _k, v in (p.profession_field_values or {}).items():
                        if isinstance(v, dict):
                            enroll_yr = v.get("enrollment_year")
                            exp_val = v.get("experience") or v.get("experience_years")
                            if enroll_yr:
                                try:
                                    years = max(0, current_year - int(enroll_yr))
                                    break
                                except (ValueError, TypeError):
                                    pass
                            if exp_val and years is None:
                                exp_str = str(exp_val)
                                if "10" in exp_str or "15" in exp_str:
                                    years = 15
                                elif "5" in exp_str:
                                    years = 7
                                elif "3" in exp_str:
                                    years = 4
                                elif "1" in exp_str:
                                    years = 2
                    if years is not None and years >= exp_min:
                        matching_ids.append(p.pk)
                qs = qs.filter(pk__in=matching_ids)
            except ValueError:
                pass

        # Full-text search
        search = params.get("search")
        if search:
            qs = qs.filter(
                Q(reference_id__icontains=search)
                | Q(common_field_values__full_name__icontains=search)
                | Q(common_field_values__name__icontains=search)
                | Q(profession__name__icontains=search)
                | Q(group__name__icontains=search)
                | Q(category__name__icontains=search)
            )
            # Also search inside nested profession_field_values by converting to Python
            # This handles city/state search from nested JSON
            search_lower = search.lower()
            text_matched_ids = []
            for p in qs:
                for _k, v in (p.profession_field_values or {}).items():
                    if isinstance(v, dict):
                        city_val = v.get("city") or v.get("practice_city", "")
                        state_val = v.get("state", "")
                        enrollment = v.get("enrollment_number") or v.get("registration_number", "")
                        if any(
                            search_lower in str(x).lower()
                            for x in [city_val, state_val, enrollment]
                            if x
                        ):
                            text_matched_ids.append(p.pk)
                            break
            # Union with name-already-matched set
            if text_matched_ids:
                qs = qs | qs.model.objects.filter(pk__in=text_matched_ids)
                qs = qs.distinct()

        # Ordering
        ordering = params.get("ordering") or "-created_at"
        qs = qs.order_by(ordering)

        return paginated_success(
            request,
            qs,
            PublicProfessionalProfileSerializer,
            message="Public professionals retrieved.",
            context={"request": request},
        )


class PublicProfessionalsFiltersAPIView(APIView):
    """
    GET /api/v1/professional-onboarding/public-professionals/filters/

    Returns categories, professions, states and cities of professionals that
    actually exist in the system — not all active ones.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        qs = ProfessionalRegistrationSubmission.objects.select_related(
            "profession", "category", "group"
        )

        # Only categories that have at least one professional linked
        category_ids_used = set()
        for p in qs:
            if p.category_id:
                category_ids_used.add(str(p.category_id))
            for cid in (p.selected_category_ids or []):
                if cid:
                    category_ids_used.add(str(cid))

        from apps.professional_onboarding.models import Category, Profession
        categories = [{"label": "All Categories", "value": "all"}]
        for cat in Category.objects.filter(id__in=category_ids_used, is_active=True).order_by("name"):
            categories.append({"label": cat.name, "value": cat.name})

        # Only professions that have at least one professional linked
        profession_ids_used = set()
        for p in qs:
            if p.profession_id:
                profession_ids_used.add(str(p.profession_id))
            for pid in (p.selected_profession_ids or []):
                if pid:
                    profession_ids_used.add(str(pid))

        professions = [{"label": "All Practitioners", "value": "all"}]
        for prof in Profession.objects.filter(id__in=profession_ids_used, is_active=True).order_by("name"):
            professions.append({"label": prof.name, "value": prof.name})

        # Extract states and cities from nested profession_field_values
        states_set = set()
        cities_set = set()
        for p in qs:
            common = p.common_field_values or {}
            common_state = common.get("state")
            common_city = common.get("city") or common.get("district")
            if common_state and str(common_state).strip():
                states_set.add(str(common_state).strip())
            if common_city and str(common_city).strip():
                cities_set.add(str(common_city).strip())

            for _k, v in (p.profession_field_values or {}).items():
                if isinstance(v, dict):
                    st = v.get("state") or v.get("practice_state")
                    ct = v.get("city") or v.get("practice_city")
                    if st and str(st).strip():
                        states_set.add(str(st).strip())
                    if ct and str(ct).strip():
                        cities_set.add(str(ct).strip())

        states = ["All States"] + sorted(list(states_set))
        cities = ["All Cities"] + sorted(list(cities_set))

        return api_success(
            data={
                "categories": categories,
                "professions": professions,
                "states": states,
                "cities": cities,
            },
            message="Filters retrieved.",
        )


class PublicProfessionalDetailAPIView(APIView):
    """
    GET /api/v1/professional-onboarding/public-professionals/<identifier>/

    Retrieve public details for a single verified professional by UUID or Reference ID.
    """

    permission_classes = [AllowAny]

    def get(self, request, identifier):
        qs = (
            ProfessionalRegistrationSubmission.objects.select_related(
                "category", "group", "profession", "user"
            ).prefetch_related("files")
        )

        try:
            import uuid
            val = uuid.UUID(str(identifier))
            obj = get_object_or_404(qs, pk=val)
        except (ValueError, TypeError):
            obj = get_object_or_404(qs, reference_id=identifier)

        serializer = PublicProfessionalProfileSerializer(obj, context={"request": request})
        return api_success(
            data=serializer.data,
            message="Professional profile retrieved.",
        )
