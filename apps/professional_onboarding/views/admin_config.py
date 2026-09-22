from django.shortcuts import get_object_or_404
from rest_framework import status

from common.api_listing import list_params, paginated_success
from common.responses import api_error, api_success

from apps.professional_onboarding.models import (
    Category,
    CommonField,
    Document,
    FieldOption,
    Group,
    Profession,
    ProfessionDocument,
    ProfessionField,
)
from apps.professional_onboarding.serializers import (
    CategorySerializer,
    CommonFieldSerializer,
    DocumentSerializer,
    FieldOptionSerializer,
    GroupSerializer,
    ProfessionDocumentSerializer,
    ProfessionFieldSerializer,
    ProfessionSerializer,
)
from apps.professional_onboarding.services.crud import ServiceError, create_model, update_model
from apps.professional_onboarding.services.options import sync_field_options
from apps.professional_onboarding.services.queries import (
    filter_categories,
    filter_common_fields,
    filter_documents,
    filter_field_options,
    filter_groups,
    filter_profession_documents,
    filter_profession_fields,
    filter_professions,
)
from apps.professional_onboarding.views.base import AdminConfigAPIView


def _handle_service_error(exc: ServiceError):
    return api_error(exc.message, exc.errors, status.HTTP_400_BAD_REQUEST)


def _filter_params(params: dict) -> dict:
    return {
        "search": params.get("search"),
        "is_active": params.get("is_active"),
        "ordering": params.get("ordering"),
    }


class CategoryListCreateAPIView(AdminConfigAPIView):
    def get(self, request):
        params = list_params(request)
        qs = filter_categories(
            Category.objects.select_related("visual_theme"),
            **_filter_params(params),
        )
        return paginated_success(request, qs, CategorySerializer, message="Categories retrieved.")

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            obj = create_model(Category, serializer.validated_data)
        except ServiceError as exc:
            return _handle_service_error(exc)
        return api_success(
            data=CategorySerializer(obj).data,
            message="Category created.",
            status_code=status.HTTP_201_CREATED,
        )


class CategoryDetailAPIView(AdminConfigAPIView):
    def get(self, request, pk):
        obj = get_object_or_404(Category, pk=pk)
        return api_success(data=CategorySerializer(obj).data, message="Category retrieved.")

    def patch(self, request, pk):
        obj = get_object_or_404(Category, pk=pk)
        serializer = CategorySerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            obj = update_model(obj, serializer.validated_data)
        except ServiceError as exc:
            return _handle_service_error(exc)
        return api_success(data=CategorySerializer(obj).data, message="Category updated.")

    def delete(self, request, pk):
        obj = get_object_or_404(Category, pk=pk)
        obj.delete()
        return api_success(message="Category deleted.", status_code=status.HTTP_200_OK)


class GroupListCreateAPIView(AdminConfigAPIView):
    def get(self, request, category_id=None):
        params = list_params(request)
        category_id = category_id or request.query_params.get("category")
        qs = filter_groups(
            Group.objects.select_related("category", "category__visual_theme", "visual_theme"),
            category_id=category_id,
            **_filter_params(params),
        )
        return paginated_success(request, qs, GroupSerializer, message="Groups retrieved.")

    def post(self, request, category_id=None):
        data = request.data.copy()
        if category_id:
            data["category"] = str(category_id)
        serializer = GroupSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        try:
            obj = create_model(Group, serializer.validated_data)
        except ServiceError as exc:
            return _handle_service_error(exc)
        return api_success(
            data=GroupSerializer(obj).data,
            message="Group created.",
            status_code=status.HTTP_201_CREATED,
        )


class GroupDetailAPIView(AdminConfigAPIView):
    def get(self, request, pk):
        obj = get_object_or_404(Group.objects.select_related("category"), pk=pk)
        return api_success(data=GroupSerializer(obj).data, message="Group retrieved.")

    def patch(self, request, pk):
        obj = get_object_or_404(Group, pk=pk)
        serializer = GroupSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            obj = update_model(obj, serializer.validated_data)
        except ServiceError as exc:
            return _handle_service_error(exc)
        return api_success(data=GroupSerializer(obj).data, message="Group updated.")

    def delete(self, request, pk):
        get_object_or_404(Group, pk=pk).delete()
        return api_success(message="Group deleted.")


class ProfessionListCreateAPIView(AdminConfigAPIView):
    def get(self, request, group_id=None):
        params = list_params(request)
        group_id = group_id or request.query_params.get("group")
        category_id = request.query_params.get("category")
        qs = filter_professions(
            Profession.objects.select_related(
                "group",
                "group__category",
                "group__visual_theme",
                "group__category__visual_theme",
                "visual_theme",
            ),
            group_id=group_id,
            category_id=category_id,
            **_filter_params(params),
        )
        return paginated_success(request, qs, ProfessionSerializer, message="Professions retrieved.")

    def post(self, request, group_id=None):
        data = request.data.copy()
        if group_id:
            data["group"] = str(group_id)
        serializer = ProfessionSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        try:
            obj = create_model(Profession, serializer.validated_data)
        except ServiceError as exc:
            return _handle_service_error(exc)
        return api_success(
            data=ProfessionSerializer(obj).data,
            message="Profession created.",
            status_code=status.HTTP_201_CREATED,
        )


class ProfessionDetailAPIView(AdminConfigAPIView):
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
        return api_success(data=ProfessionSerializer(obj).data, message="Profession retrieved.")

    def patch(self, request, pk):
        obj = get_object_or_404(Profession, pk=pk)
        serializer = ProfessionSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            obj = update_model(obj, serializer.validated_data)
        except ServiceError as exc:
            return _handle_service_error(exc)
        return api_success(data=ProfessionSerializer(obj).data, message="Profession updated.")

    def delete(self, request, pk):
        get_object_or_404(Profession, pk=pk).delete()
        return api_success(message="Profession deleted.")


class CommonFieldListCreateAPIView(AdminConfigAPIView):
    def get(self, request):
        params = list_params(request)
        field_type = request.query_params.get("field_type")
        qs = filter_common_fields(
            CommonField.objects.all(),
            field_type=field_type,
            **_filter_params(params),
        )
        return paginated_success(request, qs, CommonFieldSerializer, message="Common fields retrieved.")

    def post(self, request):
        serializer = CommonFieldSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            obj = create_model(CommonField, serializer.validated_data)
            if "options" in request.data:
                sync_field_options(obj, request.data.get("options"))
        except ServiceError as exc:
            return _handle_service_error(exc)
        return api_success(
            data=CommonFieldSerializer(obj).data,
            message="Common field created.",
            status_code=status.HTTP_201_CREATED,
        )


class CommonFieldDetailAPIView(AdminConfigAPIView):
    def get(self, request, pk):
        obj = get_object_or_404(CommonField, pk=pk)
        return api_success(data=CommonFieldSerializer(obj).data, message="Common field retrieved.")

    def patch(self, request, pk):
        obj = get_object_or_404(CommonField, pk=pk)
        serializer = CommonFieldSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            obj = update_model(obj, serializer.validated_data)
            if "options" in request.data:
                sync_field_options(obj, request.data.get("options"))
        except ServiceError as exc:
            return _handle_service_error(exc)
        return api_success(data=CommonFieldSerializer(obj).data, message="Common field updated.")

    def delete(self, request, pk):
        get_object_or_404(CommonField, pk=pk).delete()
        return api_success(message="Common field deleted.")


class ProfessionFieldListCreateAPIView(AdminConfigAPIView):
    def get(self, request, profession_id=None):
        params = list_params(request)
        profession_id = profession_id or request.query_params.get("profession")
        field_type = request.query_params.get("field_type")
        qs = filter_profession_fields(
            ProfessionField.objects.select_related("profession"),
            profession_id=profession_id,
            field_type=field_type,
            **_filter_params(params),
        )
        return paginated_success(request, qs, ProfessionFieldSerializer, message="Profession fields retrieved.")

    def post(self, request, profession_id=None):
        data = request.data.copy()
        if profession_id:
            data["profession"] = str(profession_id)
        serializer = ProfessionFieldSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        try:
            obj = create_model(ProfessionField, serializer.validated_data)
            if "options" in request.data:
                sync_field_options(obj, request.data.get("options"))
        except ServiceError as exc:
            return _handle_service_error(exc)
        return api_success(
            data=ProfessionFieldSerializer(obj).data,
            message="Profession field created.",
            status_code=status.HTTP_201_CREATED,
        )


class ProfessionFieldDetailAPIView(AdminConfigAPIView):
    def get(self, request, pk):
        obj = get_object_or_404(ProfessionField.objects.select_related("profession"), pk=pk)
        return api_success(data=ProfessionFieldSerializer(obj).data, message="Profession field retrieved.")

    def patch(self, request, pk):
        obj = get_object_or_404(ProfessionField, pk=pk)
        serializer = ProfessionFieldSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            obj = update_model(obj, serializer.validated_data)
            if "options" in request.data:
                sync_field_options(obj, request.data.get("options"))
        except ServiceError as exc:
            return _handle_service_error(exc)
        return api_success(data=ProfessionFieldSerializer(obj).data, message="Profession field updated.")

    def delete(self, request, pk):
        get_object_or_404(ProfessionField, pk=pk).delete()
        return api_success(message="Profession field deleted.")



class FieldOptionListCreateAPIView(AdminConfigAPIView):
    def get(self, request, parent_kind=None, parent_id=None):
        params = list_params(request)
        common_field_id = request.query_params.get("common_field")
        profession_field_id = request.query_params.get("profession_field")
        if parent_kind == "common-fields":
            common_field_id = parent_id
        if parent_kind == "profession-fields":
            profession_field_id = parent_id
        qs = filter_field_options(
            FieldOption.objects.all(),
            common_field_id=common_field_id,
            profession_field_id=profession_field_id,
            **_filter_params(params),
        )
        return paginated_success(request, qs, FieldOptionSerializer, message="Field options retrieved.")

    def post(self, request, parent_kind=None, parent_id=None):
        data = request.data.copy()
        if parent_kind == "common-fields":
            data["common_field"] = str(parent_id)
            data.pop("profession_field", None)
        elif parent_kind == "profession-fields":
            data["profession_field"] = str(parent_id)
            data.pop("common_field", None)
        serializer = FieldOptionSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        try:
            obj = create_model(FieldOption, serializer.validated_data)
        except ServiceError as exc:
            return _handle_service_error(exc)
        return api_success(
            data=FieldOptionSerializer(obj).data,
            message="Field option created.",
            status_code=status.HTTP_201_CREATED,
        )


class FieldOptionDetailAPIView(AdminConfigAPIView):
    def get(self, request, pk):
        obj = get_object_or_404(FieldOption, pk=pk)
        return api_success(data=FieldOptionSerializer(obj).data, message="Field option retrieved.")

    def patch(self, request, pk):
        obj = get_object_or_404(FieldOption, pk=pk)
        serializer = FieldOptionSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            obj = update_model(obj, serializer.validated_data)
        except ServiceError as exc:
            return _handle_service_error(exc)
        return api_success(data=FieldOptionSerializer(obj).data, message="Field option updated.")

    def delete(self, request, pk):
        get_object_or_404(FieldOption, pk=pk).delete()
        return api_success(message="Field option deleted.")


class DocumentListCreateAPIView(AdminConfigAPIView):
    def get(self, request):
        params = list_params(request)
        qs = filter_documents(Document.objects.all(), **_filter_params(params))
        return paginated_success(request, qs, DocumentSerializer, message="Documents retrieved.")

    def post(self, request):
        serializer = DocumentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            obj = create_model(Document, serializer.validated_data)
        except ServiceError as exc:
            return _handle_service_error(exc)
        return api_success(
            data=DocumentSerializer(obj).data,
            message="Document created.",
            status_code=status.HTTP_201_CREATED,
        )


class DocumentDetailAPIView(AdminConfigAPIView):
    def get(self, request, pk):
        obj = get_object_or_404(Document, pk=pk)
        return api_success(data=DocumentSerializer(obj).data, message="Document retrieved.")

    def patch(self, request, pk):
        obj = get_object_or_404(Document, pk=pk)
        serializer = DocumentSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            obj = update_model(obj, serializer.validated_data)
        except ServiceError as exc:
            return _handle_service_error(exc)
        return api_success(data=DocumentSerializer(obj).data, message="Document updated.")

    def delete(self, request, pk):
        get_object_or_404(Document, pk=pk).delete()
        return api_success(message="Document deleted.")


class ProfessionDocumentListCreateAPIView(AdminConfigAPIView):
    def get(self, request, profession_id=None):
        params = list_params(request)
        profession_id = profession_id or request.query_params.get("profession")
        document_id = request.query_params.get("document")
        qs = filter_profession_documents(
            ProfessionDocument.objects.select_related("profession", "document"),
            profession_id=profession_id,
            document_id=document_id,
            **_filter_params(params),
        )
        return paginated_success(request, qs, ProfessionDocumentSerializer, message="Profession documents retrieved.")

    def post(self, request, profession_id=None):
        data = request.data.copy()
        if profession_id:
            data["profession"] = str(profession_id)
        serializer = ProfessionDocumentSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        try:
            obj = create_model(ProfessionDocument, serializer.validated_data)
        except ServiceError as exc:
            return _handle_service_error(exc)
        return api_success(
            data=ProfessionDocumentSerializer(obj).data,
            message="Profession document created.",
            status_code=status.HTTP_201_CREATED,
        )


class ProfessionDocumentDetailAPIView(AdminConfigAPIView):
    def get(self, request, pk):
        obj = get_object_or_404(
            ProfessionDocument.objects.select_related("profession", "document"),
            pk=pk,
        )
        return api_success(data=ProfessionDocumentSerializer(obj).data, message="Profession document retrieved.")

    def patch(self, request, pk):
        obj = get_object_or_404(ProfessionDocument, pk=pk)
        serializer = ProfessionDocumentSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            obj = update_model(obj, serializer.validated_data)
        except ServiceError as exc:
            return _handle_service_error(exc)
        return api_success(data=ProfessionDocumentSerializer(obj).data, message="Profession document updated.")

    def delete(self, request, pk):
        get_object_or_404(ProfessionDocument, pk=pk).delete()
        return api_success(message="Profession document deleted.")
