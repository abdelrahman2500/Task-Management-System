import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { request, createTestUser, loginAs, cleanDatabase } from "./helpers.js";

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await cleanDatabase();
});

// ── GET /settings/profile ─────────────────────────────────────────────────────

describe("GET /api/v1/settings/profile", () => {
  it("returns own profile without sensitive fields", async () => {
    await createTestUser({ email: "sprof@example.com" });
    const token = await loginAs("sprof@example.com");

    const res = await request
      .get("/api/v1/settings/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe("sprof@example.com");
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it("requires authentication", async () => {
    const res = await request.get("/api/v1/settings/profile");
    expect(res.status).toBe(401);
  });
});

// ── PATCH /settings/profile ───────────────────────────────────────────────────

describe("PATCH /api/v1/settings/profile", () => {
  it("updates profile name", async () => {
    await createTestUser({ email: "supdate@example.com" });
    const token = await loginAs("supdate@example.com");

    const res = await request
      .patch("/api/v1/settings/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Name" });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Updated Name");
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it("rejects empty body", async () => {
    await createTestUser({ email: "sempty@example.com" });
    const token = await loginAs("sempty@example.com");

    const res = await request
      .patch("/api/v1/settings/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(422);
  });
});

// ── PATCH /settings/security/password ────────────────────────────────────────

describe("PATCH /api/v1/settings/security/password", () => {
  it("changes password successfully", async () => {
    await createTestUser({
      email: "spass@example.com",
      password: "OldPassword1!",
    });
    const token = await loginAs("spass@example.com", "OldPassword1!");

    const res = await request
      .patch("/api/v1/settings/security/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "OldPassword1!",
        newPassword: "NewPassword2@",
        confirmNewPassword: "NewPassword2@",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("rejects wrong current password", async () => {
    await createTestUser({
      email: "swrong@example.com",
      password: "Correct1!",
    });
    const token = await loginAs("swrong@example.com", "Correct1!");

    const res = await request
      .patch("/api/v1/settings/security/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "WrongPassword1!",
        newPassword: "NewPassword2@",
        confirmNewPassword: "NewPassword2@",
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_CURRENT_PASSWORD");
  });

  it("rejects mismatched confirmation", async () => {
    await createTestUser({ email: "smismatch@example.com" });
    const token = await loginAs("smismatch@example.com");

    const res = await request
      .patch("/api/v1/settings/security/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "Password1!",
        newPassword: "NewPassword2@",
        confirmNewPassword: "DifferentPassword2@",
      });

    expect(res.status).toBe(422);
  });

  it("rejects weak new password", async () => {
    await createTestUser({ email: "sweak@example.com" });
    const token = await loginAs("sweak@example.com");

    const res = await request
      .patch("/api/v1/settings/security/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "Password1!",
        newPassword: "weak",
        confirmNewPassword: "weak",
      });

    expect(res.status).toBe(422);
  });

  it("never returns password in response", async () => {
    await createTestUser({
      email: "snoleak@example.com",
      password: "OldSafe1!",
    });
    const token = await loginAs("snoleak@example.com", "OldSafe1!");

    const res = await request
      .patch("/api/v1/settings/security/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "OldSafe1!",
        newPassword: "NewSafe2@",
        confirmNewPassword: "NewSafe2@",
      });

    expect(res.status).toBe(200);
    const body = JSON.stringify(res.body);
    expect(body).not.toContain("passwordHash");
    expect(body).not.toContain("OldSafe1!");
    expect(body).not.toContain("NewSafe2@");
  });
});

// ── GET /settings/preferences ─────────────────────────────────────────────────

describe("GET /api/v1/settings/preferences", () => {
  it("returns default preferences if none set", async () => {
    await createTestUser({ email: "sprefs@example.com" });
    const token = await loginAs("sprefs@example.com");

    const res = await request
      .get("/api/v1/settings/preferences")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      theme: "light",
      language: "en",
      emailNotifications: true,
      taskNotifications: true,
      projectNotifications: true,
    });
  });
});

// ── PATCH /settings/preferences ──────────────────────────────────────────────

describe("PATCH /api/v1/settings/preferences", () => {
  it("saves theme preference", async () => {
    await createTestUser({ email: "sprefup@example.com" });
    const token = await loginAs("sprefup@example.com");

    const res = await request
      .patch("/api/v1/settings/preferences")
      .set("Authorization", `Bearer ${token}`)
      .send({ theme: "dark" });

    expect(res.status).toBe(200);
    expect(res.body.data.theme).toBe("dark");
  });

  it("toggles notification preferences", async () => {
    await createTestUser({ email: "sprefnotif@example.com" });
    const token = await loginAs("sprefnotif@example.com");

    const res = await request
      .patch("/api/v1/settings/preferences")
      .set("Authorization", `Bearer ${token}`)
      .send({ emailNotifications: false, taskNotifications: false });

    expect(res.status).toBe(200);
    expect(res.body.data.emailNotifications).toBe(false);
    expect(res.body.data.taskNotifications).toBe(false);
  });

  it("rejects empty body", async () => {
    await createTestUser({ email: "sprefempty@example.com" });
    const token = await loginAs("sprefempty@example.com");

    const res = await request
      .patch("/api/v1/settings/preferences")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(422);
  });
});

// ── GET /settings/account ─────────────────────────────────────────────────────

describe("GET /api/v1/settings/account", () => {
  it("returns account info including project count", async () => {
    await createTestUser({ email: "saccount@example.com" });
    const token = await loginAs("saccount@example.com");

    const res = await request
      .get("/api/v1/settings/account")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(typeof res.body.data.ownedProjectsCount).toBe("number");
    expect(res.body.data.passwordHash).toBeUndefined();
  });
});
