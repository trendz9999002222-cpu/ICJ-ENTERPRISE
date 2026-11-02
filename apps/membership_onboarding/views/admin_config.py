from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status

from common.responses import api_error, api_success

from apps.membership_onboarding.models import (
    MembershipForm,
    MembershipType,
)
from apps.membership_onboarding.serializers.admin import (
    MembershipFormSerializer,
    MembershipTypeSerializer,
)
from apps.membership_onboarding.views.base import AdminMembershipConfigAPIView
from apps.professional_onboarding.services.crud import ServiceError, create_model, update_model


def _handle(exc: ServiceError):
    return api_error(exc.message, exc.errors, status.HTTP_400_BAD_REQUEST)


class MembershipTypeListCreateAPIView(AdminMembershipConfigAPIView):
    def get(self, request):
        qs = MembershipType.objects.all().order_by("display_order", "name")
        return api_success(data={"results": MembershipTypeSerializer(qs, many=True).data}, message="Types retrieved.")

    def post(self, request):
        serializer = MembershipTypeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            obj = create_model(MembershipType, serializer.validated_data)
        except ServiceError as exc:
            return _handle(exc)
        return api_success(data=MembershipTypeSerializer(obj).data, message="Type created.", status_code=status.HTTP_201_CREATED)


class MembershipTypeDetailAPIView(AdminMembershipConfigAPIView):
    def patch(self, request, pk):
        obj = get_object_or_404(MembershipType, pk=pk)
        serializer = MembershipTypeSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            obj = update_model(obj, serializer.validated_data)
        except ServiceError as exc:
            return _handle(exc)
        return api_success(data=MembershipTypeSerializer(obj).data, message="Type updated.")

    def delete(self, request, pk):
        obj = get_object_or_404(MembershipType, pk=pk)
        if obj.applications.exists():
            return api_error("Cannot delete membership type with existing applications.", status_code=status.HTTP_400_BAD_REQUEST)
        obj.delete()
        return api_success(message="Type deleted.")


class MembershipFormListCreateAPIView(AdminMembershipConfigAPIView):
    def get(self, request):
        qs = MembershipForm.objects.all().order_by("-version")
        return api_success(data={"results": MembershipFormSerializer(qs, many=True).data}, message="Forms retrieved.")

    def post(self, request):
        serializer = MembershipFormSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            obj = create_model(MembershipForm, serializer.validated_data)
        except ServiceError as exc:
            return _handle(exc)
        return api_success(data=MembershipFormSerializer(obj).data, message="Form created.", status_code=status.HTTP_201_CREATED)


class MembershipFormDetailAPIView(AdminMembershipConfigAPIView):
    def patch(self, request, pk):
        obj = get_object_or_404(MembershipForm, pk=pk)
        serializer = MembershipFormSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            obj = update_model(obj, serializer.validated_data)
        except ServiceError as exc:
            return _handle(exc)
        return api_success(data=MembershipFormSerializer(obj).data, message="Form updated.")


# Deprecated endpoints preserved for URL stability
class MembershipStepListCreateAPIView(AdminMembershipConfigAPIView):
    def get(self, request, *args, **kwargs):
        return api_success(data={"results": []}, message="Steps retrieved.")
    def post(self, request, *args, **kwargs):
        return api_success(data={}, message="Form steps are now static.")


class MembershipStepDetailAPIView(AdminMembershipConfigAPIView):
    def get(self, request, *args, **kwargs):
        return api_success(data={}, message="Step retrieved.")
    def patch(self, request, *args, **kwargs):
        return api_success(data={}, message="Step updated.")
    def delete(self, request, *args, **kwargs):
        return api_success(message="Step deleted.")


class MembershipStepFieldListCreateAPIView(AdminMembershipConfigAPIView):
    def get(self, request, *args, **kwargs):
        return api_success(data={"results": []}, message="Fields retrieved.")
    def post(self, request, *args, **kwargs):
        return api_success(data={}, message="Step fields are now static.")


class MembershipStepFieldDetailAPIView(AdminMembershipConfigAPIView):
    def get(self, request, *args, **kwargs):
        return api_success(data={}, message="Field retrieved.")
    def patch(self, request, *args, **kwargs):
        return api_success(data={}, message="Field updated.")
    def delete(self, request, *args, **kwargs):
        return api_success(message="Field deleted.")


class MembershipFieldOptionListCreateAPIView(AdminMembershipConfigAPIView):
    def get(self, request, *args, **kwargs):
        return api_success(data={"results": []}, message="Options retrieved.")
    def post(self, request, *args, **kwargs):
        return api_success(data={}, message="Field options are now static.")


class MembershipFieldOptionDetailAPIView(AdminMembershipConfigAPIView):
    def get(self, request, *args, **kwargs):
        return api_success(data={}, message="Option retrieved.")
    def patch(self, request, *args, **kwargs):
        return api_success(data={}, message="Option updated.")
    def delete(self, request, *args, **kwargs):
        return api_success(message="Option deleted.")


class MembershipDocumentListCreateAPIView(AdminMembershipConfigAPIView):
    def get(self, request, *args, **kwargs):
        return api_success(data={"results": []}, message="Documents retrieved.")
    def post(self, request, *args, **kwargs):
        return api_success(data={}, message="Documents are now static.")


class MembershipDocumentDetailAPIView(AdminMembershipConfigAPIView):
    def get(self, request, *args, **kwargs):
        return api_success(data={}, message="Document retrieved.")
    def patch(self, request, *args, **kwargs):
        return api_success(data={}, message="Document updated.")
    def delete(self, request, *args, **kwargs):
        return api_success(message="Document deleted.")
