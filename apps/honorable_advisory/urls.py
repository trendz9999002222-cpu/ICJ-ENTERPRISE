from django.urls import path
from . import views

urlpatterns = [
    path('public/members/', views.public_members),
    path('public/form/', views.public_form_fields),
    path('public/apply/', views.public_apply),
    path('admin/members/', views.admin_members),
    path('admin/members/<uuid:pk>/toggle-status/', views.admin_member_toggle_status),
    path('admin/applications/', views.admin_applications),
    path('admin/applications/<uuid:pk>/approve/', views.admin_approve),
    path('admin/form-fields/', views.admin_form_fields),
]
