from rest_framework import serializers

from apps.membership_onboarding.models import (
    MembershipForm,
    MembershipType,
)


class PublicMembershipTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipType
        fields = ("id", "name", "slug", "description", "display_order")


class PublicMembershipFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipForm
        fields = ("id", "title", "version", "is_active")


class PublicMembershipConfigurationSerializer(serializers.Serializer):
    membership_type = PublicMembershipTypeSerializer(required=False, allow_null=True)
    form = PublicMembershipFormSerializer(allow_null=True)
    steps = serializers.ListField(child=serializers.DictField(), default=list)
    documents = serializers.ListField(child=serializers.DictField(), default=list)
