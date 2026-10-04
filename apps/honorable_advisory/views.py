import uuid
import os
import re
from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import HonorableAdvisoryMember, HonorableAdvisoryApplication, HonorableFormField

def handle_file_upload(uploaded_file, folder):
    if not uploaded_file:
        return None
    ext = os.path.splitext(uploaded_file.name)[1]
    file_name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(folder, file_name)
    saved_path = default_storage.save(path, uploaded_file)
    return default_storage.url(saved_path)

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
            'photo_url': request.build_absolute_uri(m.photo_url) if m.photo_url else None,
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
    import json
    ref_id = "HAB" + str(uuid.uuid4())[:8].upper()
    
    # Process files
    field_values = request.data.get('field_values', {})
    if isinstance(field_values, str):
        field_values = json.loads(field_values)
        
    for key, file in request.FILES.items():
        if key.startswith('file__'):
            field_key = key.split('__', 1)[1]
            file_url = handle_file_upload(file, 'honorable_advisory/applications/')
            if file_url:
                field_values[field_key] = file_url
                
    app = HonorableAdvisoryApplication.objects.create(
        reference_id=ref_id,
        field_values=field_values
    )
    return Response({'success': True, 'data': {'reference_id': app.reference_id, 'status': app.status}})

# Admin APIs
@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAdminUser])
def admin_members(request):
    if request.method == 'POST':
        import json
        field_values = request.data.get('field_values', '{}')
        if isinstance(field_values, str):
            field_values = json.loads(field_values)
            
        name = field_values.get('name') or request.data.get('name')
        if not name:
            return Response({'error': 'Name is required'}, status=400)
            
        photo_url = handle_file_upload(request.FILES.get('photo'), 'honorable_advisory/members/')
        if not photo_url and 'profile_picture' in request.FILES:
            photo_url = handle_file_upload(request.FILES.get('profile_picture'), 'honorable_advisory/members/')
            
        # Process any other file uploads dynamically
        for key, file in request.FILES.items():
            if key.startswith('file__'):
                field_key = key.split('__', 1)[1]
                f_url = handle_file_upload(file, 'honorable_advisory/members/')
                if f_url:
                    field_values[field_key] = f_url
            
        m = HonorableAdvisoryMember.objects.create(
            name=name,
            role=field_values.get('role', request.data.get('role', '')),
            qualification=field_values.get('qualification', request.data.get('qualification', '')),
            bio=field_values.get('bio', request.data.get('bio', '')),
            display_order=int(request.data.get('display_order', 0)),
            is_active=True,
            photo_url=photo_url,
            field_values=field_values
        )
        return Response({'success': True, 'id': str(m.id)})
        
    # GET method
    members = HonorableAdvisoryMember.objects.all().order_by('display_order', '-created_at')
    data = []
    for m in members:
        data.append({
            'id': str(m.id),
            'name': m.name,
            'role': m.role,
            'qualification': m.qualification,
            'bio': m.bio,
            'photo_url': request.build_absolute_uri(m.photo_url) if m.photo_url else None,
            'display_order': m.display_order,
            'is_active': m.is_active,
            'created_at': m.created_at.isoformat()
        })
    return Response({'success': True, 'data': {'results': data}})

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def admin_member_toggle_status(request, pk):
    try:
        member = HonorableAdvisoryMember.objects.get(pk=pk)
        member.is_active = not member.is_active
        member.save()
        return Response({'success': True, 'is_active': member.is_active})
    except HonorableAdvisoryMember.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

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
    
    # Check if a profile picture was uploaded
    photo_url = app.field_values.get('profile_picture')
    
    # Optionally create member
    HonorableAdvisoryMember.objects.create(
        name=app.field_values.get('name', 'Unknown'),
        role=app.field_values.get('role', ''),
        qualification=app.field_values.get('qualification', ''),
        bio=app.field_values.get('bio', ''),
        photo_url=photo_url,
        is_active=True
    )
    
    return Response({'success': True})

@api_view(['GET', 'POST', 'PUT'])
@permission_classes([permissions.IsAdminUser])
def admin_form_fields(request):
    if request.method == 'PUT':
        field_id = request.data.get('id')
        f = HonorableFormField.objects.get(id=field_id)
        f.label = request.data.get('label', f.label)
        f.field_type = request.data.get('field_type', f.field_type)
        f.required = str(request.data.get('required', f.required)).lower() == 'true'
        f.display_order = int(request.data.get('display_order', f.display_order))
        f.is_active = str(request.data.get('is_active', f.is_active)).lower() == 'true'
        f.save()
        return Response({'success': True})

    if request.method == 'POST':
        label = request.data.get('label', '')
        if not label:
            return Response({'error': 'Label is required'}, status=400)
            
        field_type = request.data.get('field_type', 'text')
        required = str(request.data.get('required', 'false')).lower() == 'true'
        display_order = int(request.data.get('display_order', 0))
        
        base_key = re.sub(r'[^a-z0-9]', '_', label.lower())
        base_key = re.sub(r'_+', '_', base_key).strip('_')
        
        # Ensure uniqueness
        field_key = base_key
        counter = 1
        while HonorableFormField.objects.filter(field_key=field_key).exists():
            field_key = f"{base_key}_{counter}"
            counter += 1
            
        f = HonorableFormField.objects.create(
            field_key=field_key,
            label=label,
            field_type=field_type,
            required=required,
            display_order=display_order,
            is_active=True
        )
        return Response({'success': True, 'id': str(f.id)})

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
