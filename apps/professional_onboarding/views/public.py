import json

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from common.responses import api_error, api_success

from apps.professional_onboarding.models import Category, Group, Profession
from apps.professional_onboarding.serializers.public import (
    PublicCategorySerializer,
    PublicGroupSerializer,
    PublicCommonFieldSerializer,
    PublicProfessionDocumentSerializer,
    PublicProfessionFieldSerializer,
    PublicProfessionSerializer,
)
from apps.professional_onboarding.services.crud import ServiceError
from apps.professional_onboarding.services.public_config import build_profession_configuration
from apps.professional_onboarding.services.professional_registration import (
    ProfessionalRegistrationSubmissionService,
    parse_id_list_from_request,
)


class PublicCategoryListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = Category.objects.filter(is_active=True).select_related("visual_theme").order_by("display_order", "name")
        return api_success(
            data={"results": PublicCategorySerializer(qs, many=True).data},
            message="Categories retrieved.",
        )


class PublicCategoryGroupsAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, category_id):
        get_object_or_404(Category, pk=category_id, is_active=True)
        qs = (
            Group.objects.filter(category_id=category_id, is_active=True)
            .select_related("category", "category__visual_theme", "visual_theme")
            .order_by("display_order", "name")
        )
        return api_success(
            data={"results": PublicGroupSerializer(qs, many=True).data},
            message="Groups retrieved.",
        )


class PublicGroupProfessionsAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, group_id):
        get_object_or_404(Group, pk=group_id, is_active=True)
        qs = (
            Profession.objects.filter(group_id=group_id, is_active=True)
            .select_related(
                "group",
                "group__category",
                "group__visual_theme",
                "group__category__visual_theme",
                "visual_theme",
            )
            .order_by("display_order", "name")
        )
        return api_success(
            data={"results": PublicProfessionSerializer(qs, many=True).data},
            message="Professions retrieved.",
        )


class PublicProfessionConfigurationAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, profession_id):
        profession = get_object_or_404(Profession, pk=profession_id, is_active=True)
        config = build_profession_configuration(profession)
        colors = config["theme"]["resolved"]
        return api_success(
            data={
                "category": config["category"],
                "group": config["group"],
                "profession": config["profession"],
                "theme": {
                    "color": colors["primary_color"],
                    "bg": colors["background_color"],
                    "border": colors["border_color"],
                    "resolved": colors,
                    "resolved_source": config["theme"]["resolved_source"],
                },
                "common_fields": PublicCommonFieldSerializer(config["common_fields"], many=True).data,
                "profession_fields": PublicProfessionFieldSerializer(config["profession_fields"], many=True).data,
                "documents": PublicProfessionDocumentSerializer(config["documents"], many=True).data,
            },
            message="Profession configuration retrieved.",
        )


def _submit_professional_registration(request):
    category_ids = parse_id_list_from_request(request.data, "category_ids", "category_id")
    group_ids = parse_id_list_from_request(request.data, "group_ids", "group_id")
    profession_ids = parse_id_list_from_request(request.data, "profession_ids", "profession_id")

    category_id = request.data.get("category_id")
    group_id = request.data.get("group_id")
    profession_id = request.data.get("profession_id")

    try:
        common_field_values = json.loads(request.data.get("common_field_values") or "{}")
        profession_field_values = json.loads(request.data.get("profession_field_values") or "{}")
    except json.JSONDecodeError:
        return api_error("Invalid JSON in field values.", status_code=status.HTTP_400_BAD_REQUEST)

    uploaded_files = {}
    for key, file in request.FILES.items():
        if key.startswith("document__"):
            uploaded_files[key.removeprefix("document__")] = file

    user = request.user if getattr(request.user, "is_authenticated", False) else None
    idempotency_key = (
        request.headers.get("Idempotency-Key")
        or request.headers.get("HTTP_IDEMPOTENCY_KEY")
        or request.data.get("idempotency_key")
    )

    try:
        submission = ProfessionalRegistrationSubmissionService.submit(
            category_ids=category_ids,
            group_ids=group_ids,
            profession_ids=profession_ids,
            category_id=category_id,
            group_id=group_id,
            profession_id=profession_id,
            common_field_values=common_field_values,
            profession_field_values=profession_field_values,
            uploaded_files=uploaded_files,
            user=user,
            idempotency_key=idempotency_key,
            new_password=request.data.get("new_password"),
            confirm_password=request.data.get("confirm_password"),
        )
    except ServiceError as exc:
        return api_error(exc.message, exc.errors, status.HTTP_400_BAD_REQUEST)

    return api_success(
        data={
            "reference_id": submission.reference_id,
            "status": submission.status,
            "submitted_at": submission.created_at.isoformat(),
        },
        message="Professional registration submitted successfully.",
        status_code=status.HTTP_201_CREATED,
    )


class PublicSubmissionCreateAPIView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        return _submit_professional_registration(request)


class PublicProfessionalRegisterAPIView(APIView):
    """Alias endpoint: POST /professional-onboarding/register/"""

    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        return _submit_professional_registration(request)
