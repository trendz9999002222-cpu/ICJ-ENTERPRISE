from rest_framework import serializers

from apps.membership_onboarding.models import (
    MembershipApplication,
    MembershipDocument,
    MembershipFieldOption,
    MembershipForm,
    MembershipStep,
    MembershipStepField,
    MembershipType,
)


class MembershipTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipType
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class MembershipFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipForm
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class MembershipStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipStep
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class MembershipStepFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipStepField
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class MembershipFieldOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipFieldOption
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class MembershipDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipDocument
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class MembershipApplicationListSerializer(serializers.ModelSerializer):
    person_name = serializers.CharField(source="person.full_name", read_only=True, default="")
    email = serializers.CharField(source="person.email", read_only=True, default="")
    mobile = serializers.CharField(source="person.mobile", read_only=True, default="")
    membership_type_name = serializers.CharField(source="membership_type.name", read_only=True, default="")
    membership_id = serializers.SerializerMethodField()

    class Meta:
        model = MembershipApplication
        fields = (
            "id",
            "reference_id",
            "membership_id",
            "person_name",
            "email",
            "mobile",
            "membership_type_name",
            "status",
            "submitted_at",
            "created_at",
            "updated_at",
        )

    def get_membership_id(self, obj) -> str | None:
        record = getattr(obj, "membership_record", None)
        return record.membership_id if record else None


class MembershipApplicationDetailSerializer(serializers.ModelSerializer):
    person_name = serializers.CharField(source="person.full_name", read_only=True, default="")
    email = serializers.CharField(source="person.email", read_only=True, default="")
    mobile = serializers.CharField(source="person.mobile", read_only=True, default="")
    membership_type_name = serializers.CharField(source="membership_type.name", read_only=True, default="")
    membership_id = serializers.SerializerMethodField()
    documents = serializers.SerializerMethodField()
    history = serializers.SerializerMethodField()

    class Meta:
        model = MembershipApplication
        fields = (
            "id",
            "reference_id",
            "membership_id",
            "person_name",
            "email",
            "mobile",
            "membership_type_name",
            "status",
            "field_values",
            "declaration_accepted",
            "declaration_date",
            "submitted_at",
            "reviewed_at",
            "approved_at",
            "rejected_at",
            "rejection_reason",
            "documents",
            "history",
            "created_at",
            "updated_at",
        )

    def get_membership_id(self, obj) -> str | None:
        record = getattr(obj, "membership_record", None)
        return record.membership_id if record else None

    def get_documents(self, obj):
        request = self.context.get("request")
        return [
            {
                "document_key": d.document_key,
                "document_type": d.document_type,
                "original_name": d.original_name,
                "verification_status": d.verification_status,
                "url": request.build_absolute_uri(d.file.url) if request and d.file else None,
            }
            for d in obj.documents.all()
        ]

    def get_history(self, obj):
        return [
            {"action": h.action, "created_at": h.created_at.isoformat(), "metadata": h.metadata}
            for h in obj.history.all()[:50]
        ]
