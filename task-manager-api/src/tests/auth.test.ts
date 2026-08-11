import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { request, createTestUser, cleanDatabase } from "./helpers.js";

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await cleanDatabase();
});

// ── POST /auth/register ───────────────────────────────────────────────────────

describe("POST /api/v1/auth/register", () => {
  it("registers a new user and returns 201 without passwordHash", async () => {
    const res = await request.post("/api/v1/auth/register").send({
      name: "Alice",
      email: "alice@example.com",
      password: "Password1!",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toMatchObject({
      name: "Alice",
      email: "alice@example.com",
    });
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

  it("returns 409 when email already exists", async () => {
    await createTestUser({ email: "dup@example.com" });

    const res = await request.post("/api/v1/auth/register").send({
      name: "Dup",
      email: "dup@example.com",
      password: "Password1!",
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("EMAIL_ALREADY_EXISTS");
  });

  it("returns 422 for invalid email", async () => {
    const res = await request.post("/api/v1/auth/register").send({
      name: "Bob",
      email: "not-an-email",
      password: "Password1!",
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });

  it("returns 422 for weak password", async () => {
    const res = await request.post("/api/v1/auth/register").send({
      name: "Weak",
      email: "weak@example.com",
      password: "short",
    });

    expect(res.status).toBe(422);
  });
});

// ── POST /auth/login ──────────────────────────────────────────────────────────

describe("POST /api/v1/auth/login", () => {
  it("returns 200 with token on valid credentials", async () => {
    await createTestUser({
      email: "login@example.com",
      password: "Password1!",
    });

    const res = await request.post("/api/v1/auth/login").send({
      email: "login@example.com",
      password: "Password1!",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.token).toBe("string");
    expect(res.body.data.user.email).toBe("login@example.com");
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it("returns 401 on wrong password", async () => {
    await createTestUser({ email: "wrong@example.com" });

    const res = await request.post("/api/v1/auth/login").send({
      email: "wrong@example.com",
      password: "WrongPassword1!",
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 401 on unknown email (same message — no user enumeration)", async () => {
    const res = await request.post("/api/v1/auth/login").send({
      email: "ghost@example.com",
      password: "Password1!",
    });

    expect(res.status).toBe(401);
    // Must use the same message as wrong password to prevent enumeration
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 401 for inactive user", async () => {
    await createTestUser({
      email: "inactive@example.com",
      isActive: false,
    });

    const res = await request.post("/api/v1/auth/login").send({
      email: "inactive@example.com",
      password: "Password1!",
    });

    expect(res.status).toBe(401);
  });
});

// ── GET /auth/me ──────────────────────────────────────────────────────────────

describe("GET /api/v1/auth/me", () => {
  it("returns current user with valid token", async () => {
    await createTestUser({ email: "me@example.com" });
    const loginRes = await request.post("/api/v1/auth/login").send({
      email: "me@example.com",
      password: "Password1!",
    });
    const token = loginRes.body.data.token;

    const res = await request
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe("me@example.com");
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it("returns 401 without token", async () => {
    const res = await request.get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 with malformed token", async () => {
    const res = await request
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer not.a.valid.jwt");
    expect(res.status).toBe(401);
  });
});
