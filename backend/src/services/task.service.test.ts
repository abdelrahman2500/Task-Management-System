import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../lib/prisma";
import * as taskService from "./task.service";
import * as projectService from "./project.service";
import { ForbiddenError } from "../lib/errors";

describe("Task Service - Pagination", () => {
  let projectId: number;
  let userId: number;

  beforeAll(async () => {
    // Clean up
    await prisma.task.deleteMany({});
    await prisma.projectMember.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test user
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@pagination.test",
        passwordHash: "hash",
      },
    });
    userId = user.id;

    // Create test project
    const project = await prisma.project.create({
      data: {
        name: "Test Project",
        ownerId: userId,
      },
    });
    projectId = project.id;

    // Add user as project member
    await prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role: "owner",
      },
    });

    // Create 35 test tasks
    for (let i = 1; i <= 35; i++) {
      await prisma.task.create({
        data: {
          title: `Task ${i}`,
          projectId,
          createdBy: userId,
          status: i % 2 === 0 ? "done" : "todo",
          priority: i % 3 === 0 ? "high" : "medium",
        },
      });
    }
  });

  afterAll(async () => {
    await prisma.task.deleteMany({});
    await prisma.projectMember.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe("listTasks", () => {
    it("should return paginated tasks with default pagination", async () => {
      const result = await taskService.listTasks(projectId, userId, 1, 20);

      expect(result.data).toHaveLength(20);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.total).toBe(35);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(false);
    });

    it("should return second page", async () => {
      const result = await taskService.listTasks(projectId, userId, 2, 20);

      expect(result.data).toHaveLength(15);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPreviousPage).toBe(true);
    });

    it("should handle custom limit", async () => {
      const result = await taskService.listTasks(projectId, userId, 1, 10);

      expect(result.data).toHaveLength(10);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.totalPages).toBe(4);
    });

    it("should return page beyond total", async () => {
      const result = await taskService.listTasks(projectId, userId, 100, 20);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.page).toBe(100);
      expect(result.pagination.total).toBe(35);
    });

    it("should filter by status", async () => {
      const result = await taskService.listTasks(projectId, userId, 1, 50, {
        status: "done",
      });

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.length).toBeLessThanOrEqual(20); // Half of 35 (even indices)
      expect(result.data.every((t: any) => t.status === "done")).toBe(true);
    });

    it("should filter by priority", async () => {
      const result = await taskService.listTasks(projectId, userId, 1, 50, {
        priority: "high",
      });

      expect(result.data.every((t: any) => t.priority === "high")).toBe(true);
    });

    it("should filter by search", async () => {
      const result = await taskService.listTasks(projectId, userId, 1, 50, {
        search: "Task 1",
      });

      expect(result.data.length).toBeGreaterThan(0);
      expect(
        result.data.every((t: any) => t.title.toLowerCase().includes("task 1")),
      ).toBe(true);
    });

    it("should combine filters with pagination", async () => {
      const result = await taskService.listTasks(projectId, userId, 1, 10, {
        status: "todo",
        priority: "medium",
      });

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.data.every((t: any) => t.status === "todo")).toBe(true);
      expect(result.data.every((t: any) => t.priority === "medium")).toBe(true);
    });

    it("should have correct total count with filters", async () => {
      const result = await taskService.listTasks(projectId, userId, 1, 50, {
        status: "done",
      });

      // Count how many tasks are actually 'done'
      const allDone = await prisma.task.count({
        where: { projectId, status: "done" },
      });

      expect(result.pagination.total).toBe(allDone);
    });

    it("should order by createdAt descending", async () => {
      const result = await taskService.listTasks(projectId, userId, 1, 5);

      const titles = result.data.map((t: any) => t.title);
      // Tasks are created in order, so descending should be reverse order
      expect(titles[0]).toBe("Task 35");
    });

    it("should include task relations", async () => {
      const result = await taskService.listTasks(projectId, userId, 1, 1);

      const task = result.data[0];
      expect(task).toHaveProperty("creator");
      expect(task).toHaveProperty("project");
      expect(task).toHaveProperty("_count");
    });

    it("should throw ForbiddenError on unauthorized access", async () => {
      // Create another user and project
      const otherUser = await prisma.user.create({
        data: {
          name: "Other User",
          email: "other@pagination.test",
          passwordHash: "hash",
        },
      });

      const otherProject = await prisma.project.create({
        data: {
          name: "Other Project",
          ownerId: otherUser.id,
        },
      });

      await prisma.projectMember.create({
        data: {
          projectId: otherProject.id,
          userId: otherUser.id,
          role: "owner",
        },
      });

      // Try to list other project's tasks as different user - should throw
      await expect(
        taskService.listTasks(otherProject.id, userId, 1, 50),
      ).rejects.toThrow(ForbiddenError);

      // Clean up
      await prisma.projectMember.deleteMany({
        where: { projectId: otherProject.id },
      });
      await prisma.project.deleteMany({ where: { id: otherProject.id } });
      await prisma.user.delete({ where: { id: otherUser.id } });
    });
  });
});
