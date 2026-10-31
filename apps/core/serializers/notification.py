from rest_framework import serializers
from apps.core.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    created_at_formatted = serializers.SerializerMethodField()
    recipient_email = serializers.ReadOnlyField(source="recipient.email")

    class Meta:
        model = Notification
        fields = [
            "id",
            "scope",
            "notification_type",
            "title",
            "message",
            "link",
            "is_read",
            "read_at",
            "created_at",
            "created_at_formatted",
            "recipient_email",
        ]

    def get_created_at_formatted(self, obj):
        if not obj.created_at:
            return ""
        return obj.created_at.strftime("%d %b %Y, %I:%M %p")
