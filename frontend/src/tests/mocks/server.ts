import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

const baseURL = "http://localhost:3000/api/v1";

const handlers = [
  // Auth
  http.post(`${baseURL}/auth/login`, async ({ request }) => {
    const { email, password } = (await request.json()) as {
      email: string;
      password: string;
    };

    if (email === "test@example.com" && password === "Password1!") {
      return HttpResponse.json({
        success: true,
        data: {
          token: "mock-jwt-token",
          user: {
            id: 1,
            name: "Test User",
            email: "test@example.com",
            role: "member",
            isActive: true,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          },
        },
      });
    }

    return HttpResponse.json(
      {
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" },
      },
      { status: 401 },
    );
  }),

  http.get(`${baseURL}/users/me`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        role: "member",
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
    });
  }),

  // Projects
  http.get(`${baseURL}/projects`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        data: [
          {
            id: 1,
            name: "Test Project",
            description: "A test project",
            status: "active",
            ownerId: 1,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
            _count: { tasks: 5, members: 2 },
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  }),

  http.post(`${baseURL}/projects`, async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      description?: string;
      status?: string;
    };
    return HttpResponse.json(
      {
        success: true,
        data: {
          id: Date.now(),
          ...body,
          ownerId: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  }),

  // Tasks
  http.get(`${baseURL}/tasks`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        data: [
          {
            id: 1,
            title: "Test Task",
            description: "A test task",
            status: "todo",
            priority: "medium",
            projectId: 1,
            createdBy: 1,
            assigneeId: null,
            dueDate: null,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
            creator: { id: 1, name: "Test User", email: "test@example.com" },
            project: { id: 1, name: "Test Project", status: "active" },
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  }),

  // Users (admin endpoints)
  http.get(`${baseURL}/users`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        data: [
          {
            id: 1,
            name: "Test User",
            email: "test@example.com",
            role: "admin",
            isActive: true,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  }),

  // Catch-all for unhandled requests
  http.all("*", ({ request }) => {
    console.warn(`Unhandled ${request.method} ${request.url}`);
    return HttpResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Not found" } },
      { status: 404 },
    );
  }),
];

export const server = setupServer(...handlers);
