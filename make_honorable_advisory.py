import os

base = "c:/Users/pcz/ICJPROJECT/ICJFULLStack/backend/apps/honorable_advisory"
os.makedirs(os.path.join(base, "migrations"), exist_ok=True)

with open(os.path.join(base, "migrations", "__init__.py"), "w") as f:
    pass
with open(os.path.join(base, "__init__.py"), "w") as f:
    pass

apps_py = """from django.apps import AppConfig

class HonorableAdvisoryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.honorable_advisory'
"""
with open(os.path.join(base, "apps.py"), "w") as f:
    f.write(apps_py)

models_py = """import uuid
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
"""
with open(os.path.join(base, "models.py"), "w") as f:
    f.write(models_py)

views_py = """import uuid
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import HonorableAdvisoryMember, HonorableAdvisoryApplication, HonorableFormField

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_members(request):
    members = HonorableAdvisoryMember.objects.filter(is_active=True).order_by('display_order', '-created_at')
    data = []
    for m in members:
        data.append({
            'id': str(m.id),
            'name': m.name,
            'role': m.role,
            'qualification': m.qualification,
            'bio': m.bio,
            'photo_url': m.photo_url,
            'display_order': m.display_order,
        })
    return Response({'success': True, 'data': {'results': data}})

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_form_fields(request):
    fields = HonorableFormField.objects.filter(is_active=True).order_by('display_order')
    data = []
    for f in fields:
        data.append({
            'field_key': f.field_key,
            'label': f.label,
            'field_type': f.field_type,
            'required': f.required,
            'options': f.options,
        })
    return Response({'success': True, 'data': {'fields': data}})

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def public_apply(request):
    ref_id = "HAB" + str(uuid.uuid4())[:8].upper()
    app = HonorableAdvisoryApplication.objects.create(
        reference_id=ref_id,
        field_values=request.data.get('field_values', {})
    )
    return Response({'success': True, 'data': {'reference_id': app.reference_id, 'status': app.status}})

# Admin APIs
@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAdminUser])
def admin_members(request):
    if request.method == 'POST':
        name = request.data.get('name')
        if not name:
            return Response({'error': 'Name is required'}, status=400)
        m = HonorableAdvisoryMember.objects.create(
            name=name,
            role=request.data.get('role', ''),
            qualification=request.data.get('qualification', ''),
            bio=request.data.get('bio', ''),
            display_order=int(request.data.get('display_order', 0)),
            is_active=request.data.get('is_published', 'false').lower() == 'true',
        )
        return Response({'success': True, 'id': str(m.id)})
    return Response({'success': True})

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_applications(request):
    apps = HonorableAdvisoryApplication.objects.all().order_by('-submitted_at')
    data = []
    for a in apps:
        data.append({
            'id': str(a.id),
            'reference_id': a.reference_id,
            'status': a.status,
            'submitted_at': a.submitted_at.isoformat()
        })
    return Response({'success': True, 'data': {'results': data}})

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def admin_approve(request, pk):
    app = HonorableAdvisoryApplication.objects.get(id=pk)
    app.status = 'approved'
    app.save()
    
    # Optionally create member
    HonorableAdvisoryMember.objects.create(
        name=app.field_values.get('name', 'Unknown'),
        is_active=True
    )
    
    return Response({'success': True})

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_form_fields(request):
    fields = HonorableFormField.objects.all().order_by('display_order')
    data = []
    for f in fields:
        data.append({
            'id': str(f.id),
            'field_key': f.field_key,
            'label': f.label,
            'field_type': f.field_type,
            'required': f.required,
            'is_active': f.is_active,
            'display_order': f.display_order,
        })
    return Response({'success': True, 'data': {'results': data}})
"""
with open(os.path.join(base, "views.py"), "w") as f:
    f.write(views_py)

urls_py = """from django.urls import path
from . import views

urlpatterns = [
    path('public/members/', views.public_members),
    path('public/form/', views.public_form_fields),
    path('public/apply/', views.public_apply),
    path('admin/members/', views.admin_members),
    path('admin/applications/', views.admin_applications),
    path('admin/applications/<uuid:pk>/approve/', views.admin_approve),
    path('admin/form-fields/', views.admin_form_fields),
]
"""
with open(os.path.join(base, "urls.py"), "w") as f:
    f.write(urls_py)

print("Files created")
