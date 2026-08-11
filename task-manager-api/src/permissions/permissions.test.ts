import { describe, it, expect } from "vitest";
import { can } from "./index.js";
import type { SafeUser } from "../repositories/auth.repository.js";

// ── helpers ──────────────────────────────────────────────────────────────────

function makeUser(overrides: Partial<SafeUser> = {}): SafeUser {
  return {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    role: "MEMBER",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

const owner = makeUser({ role: "OWNER" });
const admin = makeUser({ role: "ADMIN", id: 2 });
const member = makeUser({ role: "MEMBER", id: 3 });
const viewer = makeUser({ role: "VIEWER", id: 4 });
const inactive = makeUser({ role: "ADMIN", isActive: false, id: 5 });

// ── inactive user ─────────────────────────────────────────────────────────────

describe("inactive user", () => {
  it("cannot do anything", () => {
    expect(can(inactive, "read", "users")).toBe(false);
    expect(can(inactive, "manage", "users")).toBe(false);
    expect(can(inactive, "read", "projects")).toBe(false);
  });
});

// ── users resource ────────────────────────────────────────────────────────────

describe("users resource", () => {
  it("OWNER/ADMIN can manage users", () => {
    expect(can(owner, "manage", "users")).toBe(true);
    expect(can(admin, "manage", "users")).toBe(true);
  });

  it("MEMBER/VIEWER cannot manage users", () => {
    expect(can(member, "manage", "users")).toBe(false);
    expect(can(viewer, "manage", "users")).toBe(false);
  });

  it("any active user can read users", () => {
    expect(can(member, "read", "users")).toBe(true);
    expect(can(viewer, "read", "users")).toBe(true);
  });

  it("user can update themselves", () => {
    expect(can(member, "update", "users", { ownerId: member.id })).toBe(true);
  });

  it("user cannot update another user without admin", () => {
    expect(can(member, "update", "users", { ownerId: viewer.id })).toBe(false);
  });

  it("admin can update any user", () => {
    expect(can(admin, "update", "users", { ownerId: member.id })).toBe(true);
  });

  it("only admin can delete users", () => {
    expect(can(owner, "delete", "users")).toBe(true);
    expect(can(admin, "delete", "users")).toBe(true);
    expect(can(member, "delete", "users")).toBe(false);
    expect(can(viewer, "delete", "users")).toBe(false);
  });
});

// ── profile / settings ────────────────────────────────────────────────────────

describe("profile resource", () => {
  it("user can access their own profile", () => {
    expect(can(member, "read", "profile", { ownerId: member.id })).toBe(true);
    expect(can(member, "update", "profile", { ownerId: member.id })).toBe(true);
  });

  it("user cannot access another user's profile", () => {
    expect(can(member, "read", "profile", { ownerId: viewer.id })).toBe(false);
  });
});

describe("settings resource", () => {
  it("user can access their own settings", () => {
    expect(can(member, "read", "settings", { ownerId: member.id })).toBe(true);
  });

  it("user cannot access another user's settings", () => {
    expect(can(member, "read", "settings", { ownerId: viewer.id })).toBe(false);
  });
});

// ── projects resource ─────────────────────────────────────────────────────────

describe("projects resource", () => {
  it("any authenticated user can create a project", () => {
    expect(can(member, "create", "projects")).toBe(true);
    expect(can(viewer, "create", "projects")).toBe(true);
  });

  it("global admin can read/update/delete any project", () => {
    expect(can(admin, "read", "projects")).toBe(true);
    expect(can(admin, "update", "projects")).toBe(true);
    expect(can(admin, "delete", "projects")).toBe(true);
  });

  it("project owner role can update and delete", () => {
    expect(
      can(member, "update", "projects", { projectMemberRole: "OWNER" }),
    ).toBe(true);
    expect(
      can(member, "delete", "projects", { projectMemberRole: "OWNER" }),
    ).toBe(true);
  });

  it("MEMBER project role cannot update/delete project", () => {
    expect(
      can(member, "update", "projects", { projectMemberRole: "MEMBER" }),
    ).toBe(false);
    expect(
      can(member, "delete", "projects", { projectMemberRole: "MEMBER" }),
    ).toBe(false);
  });

  it("VIEWER project role can only read", () => {
    expect(
      can(viewer, "read", "projects", { projectMemberRole: "VIEWER" }),
    ).toBe(true);
    expect(
      can(viewer, "update", "projects", { projectMemberRole: "VIEWER" }),
    ).toBe(false);
    expect(
      can(viewer, "delete", "projects", { projectMemberRole: "VIEWER" }),
    ).toBe(false);
  });
});

// ── tasks resource ────────────────────────────────────────────────────────────

describe("tasks resource", () => {
  it("global admin can do everything", () => {
    expect(can(admin, "create", "tasks")).toBe(true);
    expect(can(admin, "update", "tasks")).toBe(true);
    expect(can(admin, "delete", "tasks")).toBe(true);
  });

  it("project MEMBER can create and update tasks", () => {
    expect(
      can(member, "create", "tasks", { projectMemberRole: "MEMBER" }),
    ).toBe(true);
    expect(
      can(member, "update", "tasks", { projectMemberRole: "MEMBER" }),
    ).toBe(true);
  });

  it("project MEMBER cannot delete tasks", () => {
    expect(
      can(member, "delete", "tasks", { projectMemberRole: "MEMBER" }),
    ).toBe(false);
  });

  it("project VIEWER cannot create/update/delete tasks", () => {
    expect(
      can(viewer, "create", "tasks", { projectMemberRole: "VIEWER" }),
    ).toBe(false);
    expect(
      can(viewer, "update", "tasks", { projectMemberRole: "VIEWER" }),
    ).toBe(false);
    expect(
      can(viewer, "delete", "tasks", { projectMemberRole: "VIEWER" }),
    ).toBe(false);
  });

  it("project OWNER/ADMIN can delete tasks", () => {
    expect(can(member, "delete", "tasks", { projectMemberRole: "OWNER" })).toBe(
      true,
    );
    expect(can(member, "delete", "tasks", { projectMemberRole: "ADMIN" })).toBe(
      true,
    );
  });

  it("non-member cannot read tasks", () => {
    expect(can(member, "read", "tasks")).toBe(false);
  });

  it("project member can read tasks", () => {
    expect(can(member, "read", "tasks", { projectMemberRole: "VIEWER" })).toBe(
      true,
    );
  });
});
