from rest_framework.views import exception_handler

from common.responses import api_error


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None

    message = "Request failed."
    if isinstance(response.data, dict):
        if "detail" in response.data:
            detail = response.data["detail"]
            message = str(detail) if not isinstance(detail, list) else str(detail[0])
        elif "non_field_errors" in response.data:
            message = str(response.data["non_field_errors"][0])

    errors = response.data if isinstance(response.data, dict) else {"detail": response.data}
    return api_error(message, errors=errors, status_code=response.status_code)
