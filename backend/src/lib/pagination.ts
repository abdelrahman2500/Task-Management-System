/**
 * Pagination utilities for API responses
 */

export interface PaginationParams {
  page?: number | string;
  limit?: number | string;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
}

/**
 * Parse and validate pagination parameters
 * Default: page=1, limit=20
 * Max limit: 100
 */
export function parsePaginationParams(params: PaginationParams): {
  page: number;
  limit: number;
  skip: number;
  take: number;
} {
  let page = parseInt(String(params.page ?? 1), 10);
  let limit = parseInt(String(params.limit ?? 20), 10);

  // Validate page
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  // Validate limit
  if (isNaN(limit) || limit < 1) {
    limit = 20;
  }
  if (limit > 100) {
    limit = 100;
  }

  const skip = (page - 1) * limit;
  const take = limit;

  return { page, limit, skip, take };
}

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMetadata(
  page: number,
  limit: number,
  total: number,
): PaginationMetadata {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
): PaginatedResponse<T> {
  return {
    data,
    pagination: calculatePaginationMetadata(page, limit, total),
  };
}
