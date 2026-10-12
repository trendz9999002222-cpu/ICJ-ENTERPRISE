from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status

from common.responses import api_error, api_success

from apps.membership_onboarding.models import (
    MembershipDocument,
    MembershipFieldOption,
    MembershipForm,
    MembershipStep,
    MembershipStepField,
    MembershipType,
)
from apps.membership_onboarding.serializers.admin import (
    MembershipDocumentSerializer,
    MembershipFieldOptionSerializer,
    MembershipFormSerializer,
    MembershipStepFieldSerializer,
    MembershipStepSerializer,
    MembershipTypeSerializer,
)
from apps.membership_onboarding.services.public_config import ensure_default_membership_type
from apps.membership_onboarding.views.base import AdminMembershipConfigAPIView
from apps.professional_onboarding.services.crud import ServiceError, create_model, update_model


def _handle(exc: ServiceError):
    return api_error(exc.message, exc.errors, status.HTTP_400_BAD_REQUEST)


def _touch_form_for_step(step: MembershipStep):
    if step and step.form:
        step.form.updated_at = timezone.now()
        step.form.save(update_fields=["updated_at"])


def _touch_form_for_field(field: MembershipStepField):
    if field and field.step and field.step.form:
        field.step.form.updated_at = timezone.now()
        field.step.form.save(update_fields=["updated_at"])


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


class MembershipFormListCreateAPIView(AdminMembershipConfigAPIView):
    def get(self, request):
        qs = MembershipForm.objects.select_related("membership_type").order_by("-version", "-updated_at")
        type_id = request.query_params.get("membership_type_id")
        if type_id:
            qs = qs.filter(membership_type_id=type_id)
        return api_success(data={"results": MembershipFormSerializer(qs, many=True).data}, message="Forms retrieved.")

    def post(self, request):
        data = {**request.data}
        if not data.get("membership_type"):
            data["membership_type"] = str(ensure_default_membership_type().id)
        mtype_id = data["membership_type"]
        if not data.get("version"):
            last = MembershipForm.objects.filter(membership_type_id=mtype_id).order_by("-version").first()
            data["version"] = (last.version + 1) if last else 1
        if data.get("is_active", True):
            MembershipForm.objects.update(is_active=False)
        serializer = MembershipFormSerializer(data=data)
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


class MembershipStepListCreateAPIView(AdminMembershipConfigAPIView):
    def get(self, request, form_id=None):
        qs = MembershipStep.objects.select_related("form")
        if form_id:
            qs = qs.filter(form_id=form_id)
        qs = qs.order_by("display_order", "name")
        return api_success(data={"results": MembershipStepSerializer(qs, many=True).data}, message="Steps retrieved.")

    def post(self, request, form_id=None):
        data = {**request.data}
        if form_id:
            data["form"] = str(form_id)
        serializer = MembershipStepSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        try:
            obj = create_model(MembershipStep, serializer.validated_data)
            _touch_form_for_step(obj)
        except ServiceError as exc:
            return _handle(exc)
        return api_success(data=MembershipStepSerializer(obj).data, message="Step created.", status_code=status.HTTP_201_CREATED)


class MembershipStepDetailAPIView(AdminMembershipConfigAPIView):
    def patch(self, request, pk):
        obj = get_object_or_404(MembershipStep, pk=pk)
        serializer = MembershipStepSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            obj = update_model(obj, serializer.validated_data)
            _touch_form_for_step(obj)
        except ServiceError as exc:
            return _handle(exc)
        return api_success(data=MembershipStepSerializer(obj).data, message="Step updated.")

    def delete(self, request, pk):
        obj = get_object_or_404(MembershipStep, pk=pk)
        _touch_form_for_step(obj)
        if MembershipStepField.objects.filter(step=obj).exists() and obj.form and obj.form.applications.exists():
            obj.is_active = False
            obj.save(update_fields=["is_active"])
            return api_success(message="Step deactivated (has historical data).")
        obj.delete()
        return api_success(message="Step deleted.")


class MembershipStepFieldListCreateAPIView(AdminMembershipConfigAPIView):
    def get(self, request, step_id=None):
        qs = MembershipStepField.objects.select_related("step")
        if step_id:
            qs = qs.filter(step_id=step_id)
        qs = qs.order_by("display_order", "name")
        return api_success(data={"results": MembershipStepFieldSerializer(qs, many=True).data}, message="Fields retrieved.")

    def post(self, request, step_id=None):
        data = {**request.data}
        if step_id:
            data["step"] = str(step_id)
        serializer = MembershipStepFieldSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        try:
            obj = create_model(MembershipStepField, serializer.validated_data)
            _touch_form_for_field(obj)
        except ServiceError as exc:
            return _handle(exc)
        return api_success(data=MembershipStepFieldSerializer(obj).data, message="Field created.", status_code=status.HTTP_201_CREATED)


class MembershipStepFieldDetailAPIView(AdminMembershipConfigAPIView):
    def patch(self, request, pk):
        obj = get_object_or_404(MembershipStepField, pk=pk)
        serializer = MembershipStepFieldSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            obj = update_model(obj, serializer.validated_data)
            _touch_form_for_field(obj)
        except ServiceError as exc:
            return _handle(exc)
        return api_success(data=MembershipStepFieldSerializer(obj).data, message="Field updated.")

    def delete(self, request, pk):
        obj = get_object_or_404(MembershipStepField, pk=pk)
        obj.is_active = False
        obj.save(update_fields=["is_active"])
        _touch_form_for_field(obj)
        return api_success(message="Field deactivated.")


class MembershipFieldOptionListCreateAPIView(AdminMembershipConfigAPIView):
    def get(self, request, field_id=None):
        qs = MembershipFieldOption.objects.select_related("step_field")
        if field_id:
            qs = qs.filter(step_field_id=field_id)
        return api_success(data={"results": MembershipFieldOptionSerializer(qs, many=True).data}, message="Options retrieved.")

    def post(self, request, field_id=None):
        data = {**request.data}
        if field_id:
            data["step_field"] = str(field_id)
        serializer = MembershipFieldOptionSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        try:
            obj = create_model(MembershipFieldOption, serializer.validated_data)
        except ServiceError as exc:
            return _handle(exc)
        return api_success(data=MembershipFieldOptionSerializer(obj).data, message="Option created.", status_code=status.HTTP_201_CREATED)


class MembershipFieldOptionDetailAPIView(AdminMembershipConfigAPIView):
    def patch(self, request, pk):
        obj = get_object_or_404(MembershipFieldOption, pk=pk)
        serializer = MembershipFieldOptionSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            obj = update_model(obj, serializer.validated_data)
        except ServiceError as exc:
            return _handle(exc)
        return api_success(data=MembershipFieldOptionSerializer(obj).data, message="Option updated.")


class MembershipDocumentListCreateAPIView(AdminMembershipConfigAPIView):
    def get(self, request, form_id=None):
        qs = MembershipDocument.objects.select_related("form")
        if form_id:
            qs = qs.filter(form_id=form_id)
        return api_success(data={"results": MembershipDocumentSerializer(qs, many=True).data}, message="Documents retrieved.")

    def post(self, request, form_id=None):
        data = {**request.data}
        if form_id:
            data["form"] = str(form_id)
        serializer = MembershipDocumentSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        try:
            obj = create_model(MembershipDocument, serializer.validated_data)
        except ServiceError as exc:
            return _handle(exc)
        return api_success(data=MembershipDocumentSerializer(obj).data, message="Document created.", status_code=status.HTTP_201_CREATED)


class MembershipDocumentDetailAPIView(AdminMembershipConfigAPIView):
    def patch(self, request, pk):
        obj = get_object_or_404(MembershipDocument, pk=pk)
        serializer = MembershipDocumentSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            obj = update_model(obj, serializer.validated_data)
        except ServiceError as exc:
            return _handle(exc)
        return api_success(data=MembershipDocumentSerializer(obj).data, message="Document updated.")
