import supertest from "supertest";
import bcrypt from "bcrypt";
import app from "../app.js";
import prisma from "../config/prisma.js";

export const request = supertest(app);

// ── seed helpers ──────────────────────────────────────────────────────────────

export async function createTestUser(
  overrides: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    isActive?: boolean;
  } = {},
) {
  const passwordHash = await bcrypt.hash(
    overrides.password ?? "Password1!",
    4, // Low rounds for test speed
  );
  return prisma.user.create({
    data: {
      name: overrides.name ?? "Test User",
      email: overrides.email ?? `user_${Date.now()}@example.com`,
      passwordHash,
      role: (overrides.role as never) ?? "MEMBER",
      isActive: overrides.isActive ?? true,
    },
  });
}

export async function loginAs(email: string, password = "Password1!") {
  const res = await request
    .post("/api/v1/auth/login")
    .send({ email, password });
  return res.body.data.token as string;
}

export async function createTestProject(
  token: string,
  overrides: { name?: string; description?: string; status?: string } = {},
) {
  const res = await request
    .post("/api/v1/projects")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: overrides.name ?? "Test Project",
      description: overrides.description ?? "A test project",
      status: overrides.status ?? "ACTIVE",
    });
  return res.body.data as { id: number; name: string; ownerId: number };
}

export async function createTestTask(
  token: string,
  projectId: number,
  overrides: {
    title?: string;
    status?: string;
    priority?: string;
  } = {},
) {
  const res = await request
    .post("/api/v1/tasks")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: overrides.title ?? "Test Task",
      status: overrides.status ?? "TODO",
      priority: overrides.priority ?? "MEDIUM",
      projectId,
    });
  return res.body.data as { id: number; title: string };
}

// ── cleanup ───────────────────────────────────────────────────────────────────

export async function cleanDatabase() {
  // Delete in FK-safe order
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.user.deleteMany();
}
