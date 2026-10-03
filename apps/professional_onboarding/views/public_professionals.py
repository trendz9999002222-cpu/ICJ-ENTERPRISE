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


class PublicProfessionalsListAPIView(APIView):
    """
    GET /api/v1/professional-onboarding/public-professionals/
    
    Public directory of verified professionals.
    Supports filtering by category, group, profession, state, search query.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        params = list_params(request)
        # By default only show approved professionals on the public directory
        status_filter = request.query_params.get("status") or ProfessionalRegistrationSubmission.Status.APPROVED
        
        qs = (
            ProfessionalRegistrationSubmission.objects.filter(status=status_filter)
            .select_related("category", "group", "profession", "user")
            .prefetch_related("files")
        )

        # Category filter (by ID or name)
        category = request.query_params.get("category") or request.query_params.get("category_id")
        if category and category != "all":
            import uuid
            try:
                uuid.UUID(str(category))
                is_uuid = True
            except ValueError:
                is_uuid = False
                
            if is_uuid:
                qs = qs.filter(
                    Q(category_id=category)
                    | Q(selected_category_ids__contains=[str(category)])
                )
            else:
                qs = qs.filter(
                    Q(category__name__iexact=category)
                    | Q(category__slug__iexact=category)
                    | Q(selected_category_ids__contains=[str(category)])
                )

        # Group filter
        group = request.query_params.get("group") or request.query_params.get("group_id")
        if group and group != "all":
            try:
                uuid.UUID(str(group))
                is_uuid = True
            except ValueError:
                is_uuid = False
                
            if is_uuid:
                qs = qs.filter(
                    Q(group_id=group)
                    | Q(selected_group_ids__contains=[str(group)])
                )
            else:
                qs = qs.filter(
                    Q(group__name__iexact=group)
                    | Q(group__slug__iexact=group)
                    | Q(selected_group_ids__contains=[str(group)])
                )

        # Profession filter
        profession = request.query_params.get("profession") or request.query_params.get("profession_id")
        if profession and profession != "all":
            try:
                uuid.UUID(str(profession))
                is_uuid = True
            except ValueError:
                is_uuid = False
                
            if is_uuid:
                qs = qs.filter(
                    Q(profession_id=profession)
                    | Q(selected_profession_ids__contains=[str(profession)])
                )
            else:
                qs = qs.filter(
                    Q(profession__name__iexact=profession)
                    | Q(profession__slug__iexact=profession)
                    | Q(selected_profession_ids__contains=[str(profession)])
                )

        # State filter
        state = request.query_params.get("state")
        if state and state != "All States":
            qs = qs.filter(
                Q(common_field_values__state__icontains=state)
                | Q(profession_field_values__state__icontains=state)
            )

        # Search query
        search = params.get("search")
        if search:
            qs = qs.filter(
                Q(reference_id__icontains=search)
                | Q(common_field_values__full_name__icontains=search)
                | Q(common_field_values__name__icontains=search)
                | Q(common_field_values__city__icontains=search)
                | Q(common_field_values__state__icontains=search)
                | Q(profession__name__icontains=search)
                | Q(group__name__icontains=search)
                | Q(category__name__icontains=search)
                | Q(profession_field_values__practice_city__icontains=search)
                | Q(profession_field_values__bar_council__icontains=search)
                | Q(profession_field_values__enrollment_number__icontains=search)
            )

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
    
    Returns distinct states and professions available among approved professionals.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        qs = ProfessionalRegistrationSubmission.objects.filter(
            status=ProfessionalRegistrationSubmission.Status.APPROVED
        ).select_related("profession")

        # Get unique professions (label and value)
        professions_set = set()
        for p in qs:
            if p.profession:
                professions_set.add((p.profession.name, p.profession.name))
        
        professions = [{"label": "All Practitioners", "value": "all"}]
        for label, value in sorted(list(professions_set)):
            professions.append({"label": label, "value": value})

        # Get unique states
        states_set = set()
        for p in qs:
            state1 = p.common_field_values.get("state")
            state2 = p.profession_field_values.get("state")
            if state1:
                states_set.add(state1)
            if state2:
                states_set.add(state2)
        
        states = ["All States"] + sorted(list(states_set))

        return api_success(
            data={"professions": professions, "states": states},
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
