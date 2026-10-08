from django.urls import path

from apps.services.views.professional import (
    ProfessionalAvailableCasesAPIView,
    ProfessionalTakeCaseAPIView,
    ProfessionalMyCasesAPIView,
    ProfessionalCaseDetailAPIView,
)

urlpatterns = [
    path("cases/available/", ProfessionalAvailableCasesAPIView.as_view(), name="professional-available-cases"),
    path("cases/my/", ProfessionalMyCasesAPIView.as_view(), name="professional-my-cases"),
    path("cases/<uuid:pk>/take/", ProfessionalTakeCaseAPIView.as_view(), name="professional-take-case"),
    path("cases/<uuid:pk>/", ProfessionalCaseDetailAPIView.as_view(), name="professional-case-detail"),
]
