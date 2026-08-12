import { describe, it, expect } from "vitest";
import {
  parsePaginationParams,
  calculatePaginationMetadata,
  createPaginatedResponse,
} from "./pagination";

describe("Pagination", () => {
  describe("parsePaginationParams", () => {
    it("should use defaults when no params provided", () => {
      const result = parsePaginationParams({});
      expect(result).toEqual({ page: 1, limit: 20, skip: 0, take: 20 });
    });

    it("should parse valid page and limit", () => {
      const result = parsePaginationParams({ page: 2, limit: 10 });
      expect(result).toEqual({ page: 2, limit: 10, skip: 10, take: 10 });
    });

    it("should handle string params", () => {
      const result = parsePaginationParams({ page: "3", limit: "15" });
      expect(result).toEqual({ page: 3, limit: 15, skip: 30, take: 15 });
    });

    it("should default page to 1 if invalid", () => {
      const result = parsePaginationParams({ page: 0 });
      expect(result.page).toBe(1);
    });

    it("should default page to 1 if negative", () => {
      const result = parsePaginationParams({ page: -5 });
      expect(result.page).toBe(1);
    });

    it("should default page to 1 if NaN", () => {
      const result = parsePaginationParams({ page: "invalid" });
      expect(result.page).toBe(1);
    });

    it("should default limit to 20 if invalid", () => {
      const result = parsePaginationParams({ limit: 0 });
      expect(result.limit).toBe(20);
    });

    it("should default limit to 20 if negative", () => {
      const result = parsePaginationParams({ limit: -10 });
      expect(result.limit).toBe(20);
    });

    it("should cap limit at 100", () => {
      const result = parsePaginationParams({ limit: 200 });
      expect(result.limit).toBe(100);
      expect(result.take).toBe(100);
    });

    it("should calculate skip correctly", () => {
      const result = parsePaginationParams({ page: 5, limit: 20 });
      expect(result.skip).toBe(80); // (5 - 1) * 20
    });

    it("should handle page 1 with skip 0", () => {
      const result = parsePaginationParams({ page: 1, limit: 20 });
      expect(result.skip).toBe(0);
    });
  });

  describe("calculatePaginationMetadata", () => {
    it("should calculate metadata for first page", () => {
      const metadata = calculatePaginationMetadata(1, 10, 25);
      expect(metadata).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });

    it("should calculate metadata for middle page", () => {
      const metadata = calculatePaginationMetadata(2, 10, 25);
      expect(metadata).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });

    it("should calculate metadata for last page", () => {
      const metadata = calculatePaginationMetadata(3, 10, 25);
      expect(metadata).toEqual({
        page: 3,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNextPage: false,
        hasPreviousPage: true,
      });
    });

    it("should calculate totalPages correctly", () => {
      const result = calculatePaginationMetadata(1, 20, 55);
      expect(result.totalPages).toBe(3);
    });

    it("should handle exact division", () => {
      const result = calculatePaginationMetadata(1, 10, 30);
      expect(result.totalPages).toBe(3);
    });

    it("should handle single page", () => {
      const result = calculatePaginationMetadata(1, 50, 30);
      expect(result.totalPages).toBe(1);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(false);
    });

    it("should handle zero results", () => {
      const result = calculatePaginationMetadata(1, 20, 0);
      expect(result.totalPages).toBe(0);
      expect(result.hasNextPage).toBe(false);
    });
  });

  describe("createPaginatedResponse", () => {
    it("should create paginated response", () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = createPaginatedResponse(data, 1, 20, 2);

      expect(response.data).toEqual(data);
      expect(response.pagination.page).toBe(1);
      expect(response.pagination.limit).toBe(20);
      expect(response.pagination.total).toBe(2);
      expect(response.pagination.totalPages).toBe(1);
    });

    it("should include pagination metadata", () => {
      const response = createPaginatedResponse([], 2, 10, 50);

      expect(response.pagination).toHaveProperty("page");
      expect(response.pagination).toHaveProperty("limit");
      expect(response.pagination).toHaveProperty("total");
      expect(response.pagination).toHaveProperty("totalPages");
      expect(response.pagination).toHaveProperty("hasNextPage");
      expect(response.pagination).toHaveProperty("hasPreviousPage");
    });
  });
});
