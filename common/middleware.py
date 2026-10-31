class MediaFrameOptionsMiddleware:
    """
    Exempts media file requests (/media/) from clickjacking X-Frame-Options: DENY
    and Content-Security-Policy restrictions so documents (e.g. PDFs, images)
    can be viewed inside inline preview modals across origins (e.g. localhost:3000 -> localhost:8000).
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.path.startswith("/media/"):
            # Remove X-Frame-Options so browser iframes/objects are not blocked
            if "X-Frame-Options" in response:
                del response["X-Frame-Options"]
            if hasattr(response, "headers") and "X-Frame-Options" in response.headers:
                try:
                    del response.headers["X-Frame-Options"]
                except KeyError:
                    pass

            response.xframe_options_exempt = True
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Methods"] = "GET, OPTIONS, HEAD"
            response["Content-Security-Policy"] = "frame-ancestors *"
        return response
