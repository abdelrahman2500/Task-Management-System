import { describe, it, expect, beforeEach, afterAll } from "vitest";
import {
  request,
  createTestUser,
  loginAs,
  createTestProject,
  cleanDatabase,
} from "./helpers.js";

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await cleanDatabase();
});

// ── GET /projects ─────────────────────────────────────────────────────────────

describe("GET /api/v1/projects", () => {
  it("authenticated user sees their own projects", async () => {
    await createTestUser({ email: "owner@example.com" });
    const token = await loginAs("owner@example.com");
    await createTestProject(token, { name: "My Project" });

    const res = await request
      .get("/api/v1/projects")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.data.length).toBeGreaterThanOrEqual(1);
  });

  it("returns 401 without token", async () => {
    const res = await request.get("/api/v1/projects");
    expect(res.status).toBe(401);
  });

  it("supports status filter", async () => {
    await createTestUser({ email: "filter@example.com" });
    const token = await loginAs("filter@example.com");
    await createTestProject(token, { name: "Active", status: "ACTIVE" });
    await createTestProject(token, { name: "Archived", status: "ARCHIVED" });

    const res = await request
      .get("/api/v1/projects?status=ACTIVE")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    for (const p of res.body.data.data) {
      expect(p.status).toBe("ACTIVE");
    }
  });
});

// ── POST /projects ────────────────────────────────────────────────────────────

describe("POST /api/v1/projects", () => {
  it("creates project and sets creator as owner", async () => {
    await createTestUser({ email: "creator@example.com" });
    const token = await loginAs("creator@example.com");

    const res = await request
      .post("/api/v1/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Project", status: "ACTIVE" });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("New Project");
    expect(typeof res.body.data.ownerId).toBe("number");
  });

  it("returns 422 for missing name", async () => {
    await createTestUser({ email: "vld@example.com" });
    const token = await loginAs("vld@example.com");

    const res = await request
      .post("/api/v1/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "no name" });

    expect(res.status).toBe(422);
  });

  it("returns 422 when name is too short", async () => {
    await createTestUser({ email: "short@example.com" });
    const token = await loginAs("short@example.com");

    const res = await request
      .post("/api/v1/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "ab" });

    expect(res.status).toBe(422);
  });
});

// ── GET /projects/:projectId ──────────────────────────────────────────────────

describe("GET /api/v1/projects/:projectId", () => {
  it("owner can view their project", async () => {
    await createTestUser({ email: "pview@example.com" });
    const token = await loginAs("pview@example.com");
    const project = await createTestProject(token);

    const res = await request
      .get(`/api/v1/projects/${project.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(project.id);
  });

  it("non-member gets 403", async () => {
    await createTestUser({ email: "projowner@example.com" });
    const ownerToken = await loginAs("projowner@example.com");
    const project = await createTestProject(ownerToken);

    await createTestUser({ email: "outsider@example.com" });
    const outsiderToken = await loginAs("outsider@example.com");

    const res = await request
      .get(`/api/v1/projects/${project.id}`)
      .set("Authorization", `Bearer ${outsiderToken}`);

    expect(res.status).toBe(403);
  });

  it("returns 404 for non-existent project", async () => {
    await createTestUser({ email: "x@example.com" });
    const token = await loginAs("x@example.com");

    const res = await request
      .get("/api/v1/projects/99999999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

// ── PATCH /projects/:projectId ────────────────────────────────────────────────

describe("PATCH /api/v1/projects/:projectId", () => {
  it("owner can update their project", async () => {
    await createTestUser({ email: "pupdate@example.com" });
    const token = await loginAs("pupdate@example.com");
    const project = await createTestProject(token);

    const res = await request
      .patch(`/api/v1/projects/${project.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Name" });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Updated Name");
  });

  it("non-owner cannot update project — 403", async () => {
    await createTestUser({ email: "pown2@example.com" });
    const ownerToken = await loginAs("pown2@example.com");
    const project = await createTestProject(ownerToken);

    await createTestUser({ email: "intruder@example.com" });
    const intruderToken = await loginAs("intruder@example.com");

    const res = await request
      .patch(`/api/v1/projects/${project.id}`)
      .set("Authorization", `Bearer ${intruderToken}`)
      .send({ name: "Hacked" });

    expect(res.status).toBe(403);
  });

  it("admin can update any project", async () => {
    await createTestUser({ email: "pown3@example.com" });
    const ownerToken = await loginAs("pown3@example.com");
    const project = await createTestProject(ownerToken);

    await createTestUser({ email: "padmin@example.com", role: "ADMIN" });
    const adminToken = await loginAs("padmin@example.com");

    const res = await request
      .patch(`/api/v1/projects/${project.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "COMPLETED" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("COMPLETED");
  });
});

// ── DELETE /projects/:projectId ───────────────────────────────────────────────

describe("DELETE /api/v1/projects/:projectId", () => {
  it("owner can delete their project", async () => {
    await createTestUser({ email: "pdel@example.com" });
    const token = await loginAs("pdel@example.com");
    const project = await createTestProject(token);

    const res = await request
      .delete(`/api/v1/projects/${project.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("non-owner cannot delete — 403", async () => {
    await createTestUser({ email: "pdel2@example.com" });
    const ownerToken = await loginAs("pdel2@example.com");
    const project = await createTestProject(ownerToken);

    await createTestUser({ email: "pthief@example.com" });
    const thiefToken = await loginAs("pthief@example.com");

    const res = await request
      .delete(`/api/v1/projects/${project.id}`)
      .set("Authorization", `Bearer ${thiefToken}`);

    expect(res.status).toBe(403);
  });

  it("cascades: tasks and members are removed with project", async () => {
    await createTestUser({ email: "pcascade@example.com" });
    const token = await loginAs("pcascade@example.com");
    const project = await createTestProject(token);

    // Create a task in the project
    await request
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Cascade task",
        status: "TODO",
        priority: "LOW",
        projectId: project.id,
      });

    const del = await request
      .delete(`/api/v1/projects/${project.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(del.status).toBe(200);

    // Project should no longer be accessible
    const check = await request
      .get(`/api/v1/projects/${project.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(check.status).toBe(404);
  });
});
