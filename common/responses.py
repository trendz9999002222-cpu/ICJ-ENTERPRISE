from rest_framework.response import Response


def api_success(message: str = "", data=None, status_code: int = 200, **extra):
    payload: dict = {"success": True, "message": message}
    if data is not None:
        payload["data"] = data
    payload.update(extra)
    return Response(payload, status=status_code)


def api_error(message: str, errors: dict | None = None, status_code: int = 400):
    payload: dict = {"success": False, "message": message, "errors": errors or {}}
    return Response(payload, status=status_code)
