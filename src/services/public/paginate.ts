import type { PublicPaginatedResponse } from "@/types/public";

/**
 * Reusable in-memory pagination utility that shapes responses identically
 * to Django REST Framework's PageNumberPagination format.
 */
export function paginateArray<T>(
  items: T[],
  page = 1,
  pageSize = 12
): PublicPaginatedResponse<T> {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, Math.min(pageSize, 100));
  const totalCount = items.length;
  const totalPages = Math.ceil(totalCount / safePageSize) || 1;

  const startIndex = (safePage - 1) * safePageSize;
  const endIndex = startIndex + safePageSize;
  const results = items.slice(startIndex, endIndex);

  return {
    count: totalCount,
    next: safePage < totalPages ? `?page=${safePage + 1}&pageSize=${safePageSize}` : null,
    previous: safePage > 1 ? `?page=${safePage - 1}&pageSize=${safePageSize}` : null,
    results,
  };
}
