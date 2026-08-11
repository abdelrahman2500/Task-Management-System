import { describe, it, expect, beforeEach, afterAll } from "vitest";
import prisma from "../config/prisma.js";
import {
  request,
  createTestUser,
  loginAs,
  createTestProject,
  createTestTask,
  cleanDatabase,
} from "./helpers.js";

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await cleanDatabase();
});

// ── helpers ───────────────────────────────────────────────────────────────────

async function addMember(
  projectId: number,
  userId: number,
  role: string = "MEMBER",
) {
  return prisma.projectMember.upsert({
    where: { projectId_userId: { projectId, userId } },
    create: { projectId, userId, role: role as never },
    update: { role: role as never },
  });
}

// ── GET /tasks ────────────────────────────────────────────────────────────────

describe("GET /api/v1/tasks", () => {
  it("member sees tasks from their projects", async () => {
    await createTestUser({ email: "towner@example.com" });
    const ownerToken = await loginAs("towner@example.com");
    const project = await createTestProject(ownerToken);
    await createTestTask(ownerToken, project.id, { title: "Owner task" });

    const res = await request
      .get("/api/v1/tasks")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.data)).toBe(true);
    expect(res.body.data.data.length).toBeGreaterThanOrEqual(1);
  });

  it("outsider sees no tasks from a project they don't belong to", async () => {
    await createTestUser({ email: "tpown@example.com" });
    const ownerToken = await loginAs("tpown@example.com");
    const project = await createTestProject(ownerToken);
    await createTestTask(ownerToken, project.id);

    await createTestUser({ email: "toutsider@example.com" });
    const outsiderToken = await loginAs("toutsider@example.com");

    const res = await request
      .get(`/api/v1/tasks?projectId=${project.id}`)
      .set("Authorization", `Bearer ${outsiderToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.data.length).toBe(0);
  });

  it("supports pagination params", async () => {
    await createTestUser({ email: "tpage@example.com" });
    const token = await loginAs("tpage@example.com");
    const project = await createTestProject(token);
    for (let i = 0; i < 5; i++) {
      await createTestTask(token, project.id, { title: `Task ${i}` });
    }

    const res = await request
      .get("/api/v1/tasks?page=1&limit=2")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.data.length).toBeLessThanOrEqual(2);
    expect(typeof res.body.data.total).toBe("number");
    expect(typeof res.body.data.totalPages).toBe("number");
  });
});

// ── POST /tasks ───────────────────────────────────────────────────────────────

describe("POST /api/v1/tasks", () => {
  it("project owner can create a task", async () => {
    await createTestUser({ email: "taskc@example.com" });
    const token = await loginAs("taskc@example.com");
    const project = await createTestProject(token);

    const res = await request
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "New task",
        status: "TODO",
        priority: "MEDIUM",
        projectId: project.id,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("New task");
    expect(res.body.data.projectId).toBe(project.id);
  });

  it("project member can create a task", async () => {
    await createTestUser({ email: "tpown2@example.com" });
    const ownerToken = await loginAs("tpown2@example.com");
    const project = await createTestProject(ownerToken);

    const member = await createTestUser({ email: "tmember@example.com" });
    const memberToken = await loginAs("tmember@example.com");
    await addMember(project.id, member.id, "MEMBER");

    const res = await request
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        title: "Member task",
        status: "TODO",
        priority: "LOW",
        projectId: project.id,
      });

    expect(res.status).toBe(201);
  });

  it("non-member cannot create task in project — 403", async () => {
    await createTestUser({ email: "tpown3@example.com" });
    const ownerToken = await loginAs("tpown3@example.com");
    const project = await createTestProject(ownerToken);

    await createTestUser({ email: "toutsider2@example.com" });
    const outsiderToken = await loginAs("toutsider2@example.com");

    const res = await request
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${outsiderToken}`)
      .send({
        title: "Steal task",
        status: "TODO",
        priority: "LOW",
        projectId: project.id,
      });

    expect(res.status).toBe(403);
  });

  it("returns 404 for non-existent project", async () => {
    await createTestUser({ email: "tnop@example.com" });
    const token = await loginAs("tnop@example.com");

    const res = await request
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Ghost task",
        status: "TODO",
        priority: "LOW",
        projectId: 99999,
      });

    expect(res.status).toBe(404);
  });

  it("returns 400 when assignee is not a project member", async () => {
    await createTestUser({ email: "tpown4@example.com" });
    const ownerToken = await loginAs("tpown4@example.com");
    const project = await createTestProject(ownerToken);
    const outsider = await createTestUser({ email: "tnoassign@example.com" });

    const res = await request
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        title: "Bad assignee",
        status: "TODO",
        priority: "LOW",
        projectId: project.id,
        assigneeId: outsider.id,
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_ASSIGNEE");
  });

  it("returns 422 for missing title", async () => {
    await createTestUser({ email: "tnot@example.com" });
    const token = await loginAs("tnot@example.com");
    const project = await createTestProject(token);

    const res = await request
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "TODO", priority: "LOW", projectId: project.id });

    expect(res.status).toBe(422);
  });
});

// ── GET /tasks/:taskId ────────────────────────────────────────────────────────

describe("GET /api/v1/tasks/:taskId", () => {
  it("project member can view a task", async () => {
    await createTestUser({ email: "tgown@example.com" });
    const ownerToken = await loginAs("tgown@example.com");
    const project = await createTestProject(ownerToken);
    const task = await createTestTask(ownerToken, project.id);

    const res = await request
      .get(`/api/v1/tasks/${task.id}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(task.id);
  });

  it("non-member cannot view task — 403", async () => {
    await createTestUser({ email: "tgown2@example.com" });
    const ownerToken = await loginAs("tgown2@example.com");
    const project = await createTestProject(ownerToken);
    const task = await createTestTask(ownerToken, project.id);

    await createTestUser({ email: "tgout@example.com" });
    const outsiderToken = await loginAs("tgout@example.com");

    const res = await request
      .get(`/api/v1/tasks/${task.id}`)
      .set("Authorization", `Bearer ${outsiderToken}`);

    expect(res.status).toBe(403);
  });
});

// ── PATCH /tasks/:taskId ──────────────────────────────────────────────────────

describe("PATCH /api/v1/tasks/:taskId", () => {
  it("project member can update task status", async () => {
    await createTestUser({ email: "tupown@example.com" });
    const ownerToken = await loginAs("tupown@example.com");
    const project = await createTestProject(ownerToken);
    const task = await createTestTask(ownerToken, project.id);

    const res = await request
      .patch(`/api/v1/tasks/${task.id}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ status: "IN_PROGRESS" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("IN_PROGRESS");
  });

  it("project viewer cannot update task — 403", async () => {
    await createTestUser({ email: "tupown2@example.com" });
    const ownerToken = await loginAs("tupown2@example.com");
    const project = await createTestProject(ownerToken);
    const task = await createTestTask(ownerToken, project.id);

    const viewerUser = await createTestUser({ email: "tviewer@example.com" });
    const viewerToken = await loginAs("tviewer@example.com");
    await addMember(project.id, viewerUser.id, "VIEWER");

    const res = await request
      .patch(`/api/v1/tasks/${task.id}`)
      .set("Authorization", `Bearer ${viewerToken}`)
      .send({ status: "DONE" });

    expect(res.status).toBe(403);
  });

  it("non-member cannot update task — 403", async () => {
    await createTestUser({ email: "tupown3@example.com" });
    const ownerToken = await loginAs("tupown3@example.com");
    const project = await createTestProject(ownerToken);
    const task = await createTestTask(ownerToken, project.id);

    await createTestUser({ email: "tupout@example.com" });
    const outsiderToken = await loginAs("tupout@example.com");

    const res = await request
      .patch(`/api/v1/tasks/${task.id}`)
      .set("Authorization", `Bearer ${outsiderToken}`)
      .send({ title: "Hacked" });

    expect(res.status).toBe(403);
  });
});

// ── DELETE /tasks/:taskId ─────────────────────────────────────────────────────

describe("DELETE /api/v1/tasks/:taskId", () => {
  it("project owner can delete a task", async () => {
    await createTestUser({ email: "tdpown@example.com" });
    const ownerToken = await loginAs("tdpown@example.com");
    const project = await createTestProject(ownerToken);
    const task = await createTestTask(ownerToken, project.id);

    const res = await request
      .delete(`/api/v1/tasks/${task.id}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
  });

  it("project member (non-owner) cannot delete task — 403", async () => {
    await createTestUser({ email: "tdpown2@example.com" });
    const ownerToken = await loginAs("tdpown2@example.com");
    const project = await createTestProject(ownerToken);
    const task = await createTestTask(ownerToken, project.id);

    const memberUser = await createTestUser({ email: "tdmember@example.com" });
    const memberToken = await loginAs("tdmember@example.com");
    await addMember(project.id, memberUser.id, "MEMBER");

    const res = await request
      .delete(`/api/v1/tasks/${task.id}`)
      .set("Authorization", `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
  });

  it("non-member cannot delete task — 403", async () => {
    await createTestUser({ email: "tdpown3@example.com" });
    const ownerToken = await loginAs("tdpown3@example.com");
    const project = await createTestProject(ownerToken);
    const task = await createTestTask(ownerToken, project.id);

    await createTestUser({ email: "tdout@example.com" });
    const outsiderToken = await loginAs("tdout@example.com");

    const res = await request
      .delete(`/api/v1/tasks/${task.id}`)
      .set("Authorization", `Bearer ${outsiderToken}`);

    expect(res.status).toBe(403);
  });
});
