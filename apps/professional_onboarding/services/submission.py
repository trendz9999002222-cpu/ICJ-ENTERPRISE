"""Legacy import path — use professional_registration service."""

from apps.professional_onboarding.services.professional_registration import (
    ProfessionalRegistrationSubmissionService,
    allocate_reference_id,
    create_submission,
    parse_id_list_from_request,
)

__all__ = [
    "ProfessionalRegistrationSubmissionService",
    "allocate_reference_id",
    "create_submission",
    "parse_id_list_from_request",
]
