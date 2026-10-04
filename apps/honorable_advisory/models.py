import uuid
from django.db import models

class HonorableAdvisoryMember(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=255, blank=True)
    qualification = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    photo_url = models.URLField(blank=True, null=True)
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=False)
    field_values = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class HonorableAdvisoryApplication(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference_id = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, default='pending')
    field_values = models.JSONField(default=dict)
    submitted_at = models.DateTimeField(auto_now_add=True)

class HonorableFormField(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    field_key = models.CharField(max_length=50, unique=True)
    label = models.CharField(max_length=100)
    field_type = models.CharField(max_length=50)
    required = models.BooleanField(default=False)
    options = models.JSONField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
