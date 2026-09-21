from django.shortcuts import get_object_or_404
from rest_framework import status

from common.responses import api_success

from apps.professional_onboarding.models import Category, Group, Profession, VisualTheme
from apps.professional_onboarding.serializers.visual_theme import VisualThemeWriteSerializer
from apps.professional_onboarding.services.crud import ServiceError
from apps.professional_onboarding.services.theme import build_theme_api_payload, upsert_visual_theme
from apps.professional_onboarding.views.admin_config import _handle_service_error
from apps.professional_onboarding.views.base import AdminConfigAPIView


class CategoryThemeAPIView(AdminConfigAPIView):
    def get(self, request, pk):
        obj = get_object_or_404(Category.objects.select_related("visual_theme"), pk=pk)
        return api_success(
            data=build_theme_api_payload(owner_kind="category", owner=obj),
            message="Category theme retrieved.",
        )

    def put(self, request, pk):
        return self._upsert(request, pk)

    def patch(self, request, pk):
        return self._upsert(request, pk)

    def delete(self, request, pk):
        obj = get_object_or_404(Category, pk=pk)
        VisualTheme.objects.filter(category=obj).delete()
        return api_success(
            data=build_theme_api_payload(owner_kind="category", owner=obj),
            message="Category theme reset.",
        )

    def _upsert(self, request, pk):
        obj = get_object_or_404(Category, pk=pk)
        serializer = VisualThemeWriteSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            upsert_visual_theme(owner_kind="category", owner=obj, data=serializer.validated_data)
        except ServiceError as exc:
            return _handle_service_error(exc)
        obj = Category.objects.select_related("visual_theme").get(pk=pk)
        return api_success(
            data=build_theme_api_payload(owner_kind="category", owner=obj),
            message="Category theme saved.",
            status_code=status.HTTP_200_OK,
        )


class GroupThemeAPIView(AdminConfigAPIView):
    def get(self, request, pk):
        obj = get_object_or_404(
            Group.objects.select_related("category", "category__visual_theme", "visual_theme"),
            pk=pk,
        )
        return api_success(
            data=build_theme_api_payload(owner_kind="group", owner=obj),
            message="Group theme retrieved.",
        )

    def put(self, request, pk):
        return self._upsert(request, pk)

    def patch(self, request, pk):
        return self._upsert(request, pk)

    def delete(self, request, pk):
        obj = get_object_or_404(Group, pk=pk)
        VisualTheme.objects.filter(group=obj).delete()
        obj = Group.objects.select_related("category", "category__visual_theme", "visual_theme").get(pk=pk)
        return api_success(
            data=build_theme_api_payload(owner_kind="group", owner=obj),
            message="Group theme reset.",
        )

    def _upsert(self, request, pk):
        obj = get_object_or_404(Group, pk=pk)
        serializer = VisualThemeWriteSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            upsert_visual_theme(owner_kind="group", owner=obj, data=serializer.validated_data)
        except ServiceError as exc:
            return _handle_service_error(exc)
        obj = Group.objects.select_related("category", "category__visual_theme", "visual_theme").get(pk=pk)
        return api_success(
            data=build_theme_api_payload(owner_kind="group", owner=obj),
            message="Group theme saved.",
        )


class ProfessionThemeAPIView(AdminConfigAPIView):
    def get(self, request, pk):
        obj = get_object_or_404(
            Profession.objects.select_related(
                "group",
                "group__category",
                "group__visual_theme",
                "group__category__visual_theme",
                "visual_theme",
            ),
            pk=pk,
        )
        return api_success(
            data=build_theme_api_payload(owner_kind="profession", owner=obj),
            message="Profession theme retrieved.",
        )

    def put(self, request, pk):
        return self._upsert(request, pk)

    def patch(self, request, pk):
        return self._upsert(request, pk)

    def delete(self, request, pk):
        obj = get_object_or_404(Profession, pk=pk)
        VisualTheme.objects.filter(profession=obj).delete()
        obj = Profession.objects.select_related(
            "group",
            "group__category",
            "group__visual_theme",
            "group__category__visual_theme",
            "visual_theme",
        ).get(pk=pk)
        return api_success(
            data=build_theme_api_payload(owner_kind="profession", owner=obj),
            message="Profession theme reset.",
        )

    def _upsert(self, request, pk):
        obj = get_object_or_404(Profession, pk=pk)
        serializer = VisualThemeWriteSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            upsert_visual_theme(owner_kind="profession", owner=obj, data=serializer.validated_data)
        except ServiceError as exc:
            return _handle_service_error(exc)
        obj = Profession.objects.select_related(
            "group",
            "group__category",
            "group__visual_theme",
            "group__category__visual_theme",
            "visual_theme",
        ).get(pk=pk)
        return api_success(
            data=build_theme_api_payload(owner_kind="profession", owner=obj),
            message="Profession theme saved.",
        )


class ProfessionResolvedThemeAPIView(AdminConfigAPIView):
    """Resolved theme for onboarding preview."""

    def get(self, request, pk):
        obj = get_object_or_404(
            Profession.objects.select_related(
                "group",
                "group__category",
                "group__visual_theme",
                "group__category__visual_theme",
                "visual_theme",
            ),
            pk=pk,
        )
        payload = build_theme_api_payload(owner_kind="profession", owner=obj)
        return api_success(
            data={
                "resolved": payload["resolved"],
                "resolved_source": payload["resolved_source"],
                "use_parent_theme": payload["use_parent_theme"],
            },
            message="Resolved profession theme retrieved.",
        )
