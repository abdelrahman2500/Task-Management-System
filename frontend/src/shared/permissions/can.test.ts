import { describe, it, expect } from "vitest";
import { can } from "./can";
import type { CurrentUser } from "../../features/auth/types";

const owner: CurrentUser = {
  id: 1,
  name: "Owner",
  email: "owner@example.com",
  role: "OWNER",
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const admin: CurrentUser = {
  id: 2,
  name: "Admin",
  email: "admin@example.com",
  role: "ADMIN",
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const member: CurrentUser = {
  id: 3,
  name: "Member",
  email: "member@example.com",
  role: "MEMBER",
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const viewer: CurrentUser = {
  id: 4,
  name: "Viewer",
  email: "viewer@example.com",
  role: "VIEWER",
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const inactive: CurrentUser = {
  ...admin,
  isActive: false,
};

describe("can function", () => {
  describe("inactive users", () => {
    it("cannot do anything", () => {
      expect(can(inactive, "read", "users")).toBe(false);
      expect(can(inactive, "manage", "users")).toBe(false);
      expect(can(inactive, "read", "projects")).toBe(false);
    });
  });

  describe("null/undefined user", () => {
    it("cannot do anything", () => {
      expect(can(null, "read", "users")).toBe(false);
      expect(can(undefined, "read", "users")).toBe(false);
    });
  });

  describe("users resource", () => {
    it("OWNER/ADMIN can manage users", () => {
      expect(can(owner, "manage", "users")).toBe(true);
      expect(can(admin, "manage", "users")).toBe(true);
      expect(can(member, "manage", "users")).toBe(false);
      expect(can(viewer, "manage", "users")).toBe(false);
    });

    it("any active user can read users", () => {
      expect(can(owner, "read", "users")).toBe(true);
      expect(can(admin, "read", "users")).toBe(true);
      expect(can(member, "read", "users")).toBe(true);
      expect(can(viewer, "read", "users")).toBe(true);
    });

    it("user can update themselves", () => {
      expect(
        can(member, "update", "users", {
          ownerId: member.id,
          currentUserId: member.id,
        }),
      ).toBe(true);
      expect(
        can(member, "update", "users", {
          ownerId: viewer.id,
          currentUserId: member.id,
        }),
      ).toBe(false);
    });

    it("admin can update any user", () => {
      expect(
        can(admin, "update", "users", {
          ownerId: member.id,
          currentUserId: admin.id,
        }),
      ).toBe(true);
    });

    it("only admin can delete users", () => {
      expect(can(owner, "delete", "users")).toBe(true);
      expect(can(admin, "delete", "users")).toBe(true);
      expect(can(member, "delete", "users")).toBe(false);
      expect(can(viewer, "delete", "users")).toBe(false);
    });
  });

  describe("projects resource", () => {
    it("any active user can create projects", () => {
      expect(can(owner, "create", "projects")).toBe(true);
      expect(can(admin, "create", "projects")).toBe(true);
      expect(can(member, "create", "projects")).toBe(true);
      expect(can(viewer, "create", "projects")).toBe(true);
    });

    it("global admin can manage any project", () => {
      expect(can(admin, "update", "projects")).toBe(true);
      expect(can(admin, "delete", "projects")).toBe(true);
    });

    it("project owner can update/delete", () => {
      expect(
        can(member, "update", "projects", {
          ownerId: member.id,
          currentUserId: member.id,
        }),
      ).toBe(true);
      expect(
        can(member, "delete", "projects", {
          ownerId: member.id,
          currentUserId: member.id,
        }),
      ).toBe(true);
    });

    it("non-owner cannot update/delete projects", () => {
      expect(
        can(member, "update", "projects", {
          ownerId: viewer.id,
          currentUserId: member.id,
        }),
      ).toBe(false);
      expect(
        can(member, "delete", "projects", {
          ownerId: viewer.id,
          currentUserId: member.id,
        }),
      ).toBe(false);
    });
  });

  describe("tasks resource", () => {
    it("global admin can do everything", () => {
      expect(can(admin, "create", "tasks")).toBe(true);
      expect(can(admin, "update", "tasks")).toBe(true);
      expect(can(admin, "delete", "tasks")).toBe(true);
    });

    it("project member can create/update tasks", () => {
      expect(
        can(member, "create", "tasks", { projectMemberRole: "MEMBER" }),
      ).toBe(true);
      expect(
        can(member, "update", "tasks", { projectMemberRole: "MEMBER" }),
      ).toBe(true);
    });

    it("project viewer cannot create/update/delete tasks", () => {
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

    it("only project owner/admin can delete tasks", () => {
      expect(
        can(member, "delete", "tasks", { projectMemberRole: "OWNER" }),
      ).toBe(true);
      expect(
        can(member, "delete", "tasks", { projectMemberRole: "ADMIN" }),
      ).toBe(true);
      expect(
        can(member, "delete", "tasks", { projectMemberRole: "MEMBER" }),
      ).toBe(false);
    });
  });

  describe("settings and profile", () => {
    it("user can manage their own settings", () => {
      expect(
        can(member, "read", "settings", {
          ownerId: member.id,
          currentUserId: member.id,
        }),
      ).toBe(true);
      expect(
        can(member, "update", "settings", {
          ownerId: member.id,
          currentUserId: member.id,
        }),
      ).toBe(true);
    });

    it("user cannot manage other users' settings", () => {
      expect(
        can(member, "read", "settings", {
          ownerId: viewer.id,
          currentUserId: member.id,
        }),
      ).toBe(false);
      expect(
        can(member, "update", "settings", {
          ownerId: viewer.id,
          currentUserId: member.id,
        }),
      ).toBe(false);
    });

    it("admin can manage any user's settings", () => {
      expect(
        can(admin, "read", "settings", {
          ownerId: member.id,
          currentUserId: admin.id,
        }),
      ).toBe(true);
      expect(
        can(admin, "update", "settings", {
          ownerId: member.id,
          currentUserId: admin.id,
        }),
      ).toBe(true);
    });
  });

  describe("profile resource", () => {
    it("user can manage their own profile", () => {
      expect(
        can(member, "read", "profile", {
          ownerId: member.id,
          currentUserId: member.id,
        }),
      ).toBe(true);
      expect(
        can(member, "update", "profile", {
          ownerId: member.id,
          currentUserId: member.id,
        }),
      ).toBe(true);
    });

    it("user cannot manage other users' profiles", () => {
      expect(
        can(member, "read", "profile", {
          ownerId: viewer.id,
          currentUserId: member.id,
        }),
      ).toBe(false);
      expect(
        can(member, "update", "profile", {
          ownerId: viewer.id,
          currentUserId: member.id,
        }),
      ).toBe(false);
    });
  });
});
