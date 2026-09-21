from rest_framework.request import Request

from common.listing import apply_is_active, apply_ordering, apply_search, parse_bool_query
from common.pagination import StandardResultsPagination
from common.responses import api_success


def list_params(request: Request) -> dict:
    return {
        "search": request.query_params.get("search"),
        "is_active": parse_bool_query(request.query_params.get("is_active")),
        "ordering": request.query_params.get("ordering"),
        "page": request.query_params.get("page"),
        "page_size": request.query_params.get("page_size"),
    }


def paginated_success(request: Request, queryset, serializer_class, message: str = "OK"):
    paginator = StandardResultsPagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = serializer_class(page, many=True)
    return api_success(
        message=message,
        data={
            "results": serializer.data,
            "count": paginator.page.paginator.count,
            "next": paginator.get_next_link(),
            "previous": paginator.get_previous_link(),
        },
    )
