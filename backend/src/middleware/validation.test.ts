import { describe, it, expect } from "vitest";
import { z } from "zod";
import { validateQuery } from "./validateQuery";
import { validateParams } from "./validateParams";
import type { Request, Response, NextFunction } from "express";

describe("Validation Middleware", () => {
  describe("validateQuery", () => {
    it("should pass valid query parameters", () => {
      const schema = z.object({
        page: z.coerce.number().int().min(1),
        limit: z.coerce.number().int().min(1).max(100),
      });

      const middleware = validateQuery(schema);
      const req = {
        query: { page: "1", limit: "20" },
      } as unknown as Request;

      const res = {} as Response;
      let nextCalled = false;

      const next = (() => {
        nextCalled = true;
      }) as NextFunction;

      middleware(req, res, next);
      expect(nextCalled).toBe(true);
      expect(req.query.page).toBe(1);
      expect(req.query.limit).toBe(20);
    });

    it("should fail with invalid page parameter", () => {
      const schema = z.object({
        page: z.coerce.number().int().min(1),
      });

      const middleware = validateQuery(schema);
      const req = {
        query: { page: "0" },
      } as unknown as Request;

      const res = {} as Response;
      let errorPassed = false;

      const next = ((error: any) => {
        if (error instanceof z.ZodError) {
          errorPassed = true;
        }
      }) as NextFunction;

      middleware(req, res, next);
      expect(errorPassed).toBe(true);
    });

    it("should fail with limit > 100", () => {
      const schema = z.object({
        limit: z.coerce.number().int().min(1).max(100),
      });

      const middleware = validateQuery(schema);
      const req = {
        query: { limit: "200" },
      } as unknown as Request;

      const res = {} as Response;
      let errorPassed = false;

      const next = ((error: any) => {
        if (error instanceof z.ZodError) {
          errorPassed = true;
        }
      }) as NextFunction;

      middleware(req, res, next);
      expect(errorPassed).toBe(true);
    });

    it("should reject unknown query fields (extra fields)", () => {
      const schema = z
        .object({
          page: z.coerce.number().int().min(1),
        })
        .strict();

      const middleware = validateQuery(schema);
      const req = {
        query: { page: "1", unknownField: "value" },
      } as unknown as Request;

      const res = {} as Response;
      let errorPassed = false;

      const next = ((error: any) => {
        if (error instanceof z.ZodError) {
          errorPassed = true;
        }
      }) as NextFunction;

      middleware(req, res, next);
      expect(errorPassed).toBe(true);
    });
  });

  describe("validateParams", () => {
    it("should pass valid URL parameters", () => {
      const schema = z.object({
        projectId: z.string().pipe(z.coerce.number().int().positive()),
      });

      const middleware = validateParams(schema);
      const req = {
        params: { projectId: "123" },
      } as unknown as Request;

      const res = {} as Response;
      let nextCalled = false;

      const next = (() => {
        nextCalled = true;
      }) as NextFunction;

      middleware(req, res, next);
      expect(nextCalled).toBe(true);
      expect(req.params.projectId).toBe(123);
    });

    it("should fail with negative projectId", () => {
      const schema = z.object({
        projectId: z.string().pipe(z.coerce.number().int().positive()),
      });

      const middleware = validateParams(schema);
      const req = {
        params: { projectId: "-5" },
      } as unknown as Request;

      const res = {} as Response;
      let errorPassed = false;

      const next = ((error: any) => {
        if (error instanceof z.ZodError) {
          errorPassed = true;
        }
      }) as NextFunction;

      middleware(req, res, next);
      expect(errorPassed).toBe(true);
    });

    it("should fail with non-numeric projectId", () => {
      const schema = z.object({
        projectId: z.string().pipe(z.coerce.number().int().positive()),
      });

      const middleware = validateParams(schema);
      const req = {
        params: { projectId: "abc" },
      } as unknown as Request;

      const res = {} as Response;
      let errorPassed = false;

      const next = ((error: any) => {
        if (error instanceof z.ZodError) {
          errorPassed = true;
        }
      }) as NextFunction;

      middleware(req, res, next);
      expect(errorPassed).toBe(true);
    });

    it("should fail with missing required parameters", () => {
      const schema = z.object({
        projectId: z.string().pipe(z.coerce.number().int().positive()),
        taskId: z.string().pipe(z.coerce.number().int().positive()),
      });

      const middleware = validateParams(schema);
      const req = {
        params: { projectId: "123" },
      } as unknown as Request;

      const res = {} as Response;
      let errorPassed = false;

      const next = ((error: any) => {
        if (error instanceof z.ZodError) {
          errorPassed = true;
        }
      }) as NextFunction;

      middleware(req, res, next);
      expect(errorPassed).toBe(true);
    });
  });

  describe("Enum validation", () => {
    it("should accept valid status enum values", () => {
      const schema = z.object({
        status: z.enum(["todo", "in_progress", "blocked", "done"]),
      });

      const middleware = validateQuery(schema);
      const req = {
        query: { status: "in_progress" },
      } as unknown as Request;

      const res = {} as Response;
      let nextCalled = false;

      const next = (() => {
        nextCalled = true;
      }) as NextFunction;

      middleware(req, res, next);
      expect(nextCalled).toBe(true);
      expect(req.query.status).toBe("in_progress");
    });

    it("should reject invalid enum values", () => {
      const schema = z.object({
        status: z.enum(["todo", "in_progress", "blocked", "done"]),
      });

      const middleware = validateQuery(schema);
      const req = {
        query: { status: "invalid_status" },
      } as unknown as Request;

      const res = {} as Response;
      let errorPassed = false;

      const next = ((error: any) => {
        if (error instanceof z.ZodError) {
          errorPassed = true;
        }
      }) as NextFunction;

      middleware(req, res, next);
      expect(errorPassed).toBe(true);
    });
  });

  describe("String field validation", () => {
    it("should accept search with max length", () => {
      const schema = z.object({
        search: z.string().max(200),
      });

      const middleware = validateQuery(schema);
      const req = {
        query: { search: "valid search query" },
      } as unknown as Request;

      const res = {} as Response;
      let nextCalled = false;

      const next = (() => {
        nextCalled = true;
      }) as NextFunction;

      middleware(req, res, next);
      expect(nextCalled).toBe(true);
    });

    it("should reject search exceeding max length", () => {
      const schema = z.object({
        search: z.string().max(200),
      });

      const middleware = validateQuery(schema);
      const oversizedSearch = "a".repeat(201);
      const req = {
        query: { search: oversizedSearch },
      } as unknown as Request;

      const res = {} as Response;
      let errorPassed = false;

      const next = ((error: any) => {
        if (error instanceof z.ZodError) {
          errorPassed = true;
        }
      }) as NextFunction;

      middleware(req, res, next);
      expect(errorPassed).toBe(true);
    });
  });
});
