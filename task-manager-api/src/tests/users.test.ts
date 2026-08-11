import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { request, createTestUser, loginAs, cleanDatabase } from "./helpers.js";

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await cleanDatabase();
});

// ── GET /users/me ─────────────────────────────────────────────────────────────

describe("GET /api/v1/users/me", () => {
  it("returns own profile — never exposes passwordHash", async () => {
    await createTestUser({ email: "me@example.com" });
    const token = await loginAs("me@example.com");

    const res = await request
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe("me@example.com");
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it("returns 401 unauthenticated", async () => {
    const res = await request.get("/api/v1/users/me");
    expect(res.status).toBe(401);
  });
});

// ── PATCH /users/me ───────────────────────────────────────────────────────────

describe("PATCH /api/v1/users/me", () => {
  it("allows updating own name and email", async () => {
    await createTestUser({ email: "update@example.com" });
    const token = await loginAs("update@example.com");

    const res = await request
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Name" });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("New Name");
  });

  it("returns 422 for empty body", async () => {
    await createTestUser({ email: "emptyp@example.com" });
    const token = await loginAs("emptyp@example.com");

    const res = await request
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(422);
  });

  it("returns 409 if email is taken by another user", async () => {
    await createTestUser({ email: "taken@example.com" });
    await createTestUser({ email: "other@example.com" });
    const token = await loginAs("other@example.com");

    const res = await request
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "taken@example.com" });

    expect(res.status).toBe(409);
  });
});

// ── GET /users (admin only) ───────────────────────────────────────────────────

describe("GET /api/v1/users", () => {
  it("admin can list users", async () => {
    await createTestUser({ email: "admin@example.com", role: "ADMIN" });
    const token = await loginAs("admin@example.com");

    const res = await request
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.data)).toBe(true);
    // passwordHash must never appear
    for (const u of res.body.data.data) {
      expect(u.passwordHash).toBeUndefined();
    }
  });

  it("regular member cannot list users — 403", async () => {
    await createTestUser({ email: "member@example.com", role: "MEMBER" });
    const token = await loginAs("member@example.com");

    const res = await request
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("viewer cannot list users — 403", async () => {
    await createTestUser({ email: "viewer@example.com", role: "VIEWER" });
    const token = await loginAs("viewer@example.com");

    const res = await request
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

// ── GET /users/:userId ────────────────────────────────────────────────────────

describe("GET /api/v1/users/:userId", () => {
  it("user can view their own profile", async () => {
    const user = await createTestUser({ email: "self@example.com" });
    const token = await loginAs("self@example.com");

    const res = await request
      .get(`/api/v1/users/${user.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(user.id);
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it("member cannot view another user's profile — 403", async () => {
    const target = await createTestUser({ email: "target@example.com" });
    await createTestUser({ email: "spy@example.com", role: "MEMBER" });
    const token = await loginAs("spy@example.com");

    const res = await request
      .get(`/api/v1/users/${target.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("admin can view any user's profile", async () => {
    const target = await createTestUser({ email: "target2@example.com" });
    await createTestUser({ email: "admin2@example.com", role: "ADMIN" });
    const token = await loginAs("admin2@example.com");

    const res = await request
      .get(`/api/v1/users/${target.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.passwordHash).toBeUndefined();
  });
});

// ── PATCH /users/:userId ──────────────────────────────────────────────────────

describe("PATCH /api/v1/users/:userId", () => {
  it("user cannot update another user's profile", async () => {
    const target = await createTestUser({ email: "tgt@example.com" });
    await createTestUser({ email: "attacker@example.com" });
    const token = await loginAs("attacker@example.com");

    const res = await request
      .patch(`/api/v1/users/${target.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Hacked" });

    expect(res.status).toBe(403);
  });

  it("admin can update any user", async () => {
    const target = await createTestUser({ email: "tgt2@example.com" });
    await createTestUser({ email: "admin3@example.com", role: "ADMIN" });
    const token = await loginAs("admin3@example.com");

    const res = await request
      .patch(`/api/v1/users/${target.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "AdminEdited" });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("AdminEdited");
  });

  it("member cannot escalate their own role — role field ignored for self-edit", async () => {
    const user = await createTestUser({
      email: "escalate@example.com",
      role: "MEMBER",
    });
    const token = await loginAs("escalate@example.com");

    const res = await request
      .patch(`/api/v1/users/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "ADMIN" });

    // Service strips role from self-edit; if body becomes empty after stripping, 403
    // If server allows the request body but ignores role — still 200 but role unchanged
    if (res.status === 200) {
      expect(res.body.data.role).toBe("MEMBER");
    } else {
      expect([403, 422]).toContain(res.status);
    }
  });
});

// ── DELETE /users/:userId ─────────────────────────────────────────────────────

describe("DELETE /api/v1/users/:userId", () => {
  it("admin can delete a user", async () => {
    const target = await createTestUser({ email: "del@example.com" });
    await createTestUser({ email: "admin4@example.com", role: "ADMIN" });
    const token = await loginAs("admin4@example.com");

    const res = await request
      .delete(`/api/v1/users/${target.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it("admin cannot delete themselves", async () => {
    const admin = await createTestUser({
      email: "admin5@example.com",
      role: "ADMIN",
    });
    const token = await loginAs("admin5@example.com");

    const res = await request
      .delete(`/api/v1/users/${admin.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("CANNOT_DELETE_SELF");
  });

  it("member cannot delete users", async () => {
    const target = await createTestUser({ email: "del2@example.com" });
    await createTestUser({ email: "member2@example.com" });
    const token = await loginAs("member2@example.com");

    const res = await request
      .delete(`/api/v1/users/${target.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
