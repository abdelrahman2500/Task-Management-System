import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types";
import * as projectService from "../services/project.service";
import { sendSuccess, sendCreated, sendMessage } from "../lib/response";

export async function listProjects(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const projects = await projectService.listProjects(req.user!.userId);
    sendSuccess(res, projects);
  } catch (error) {
    next(error);
  }
}

export async function getProject(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const projectId = Number(req.params.projectId);
    const project = await projectService.getProject(
      projectId,
      req.user!.userId,
    );
    sendSuccess(res, project);
  } catch (error) {
    next(error);
  }
}

export async function createProject(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const project = await projectService.createProject(
      req.body,
      req.user!.userId,
    );
    sendCreated(res, project);
  } catch (error) {
    next(error);
  }
}

export async function updateProject(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const projectId = Number(req.params.projectId);
    const project = await projectService.updateProject(
      projectId,
      req.body,
      req.user!.userId,
    );
    sendSuccess(res, project);
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const projectId = Number(req.params.projectId);
    const result = await projectService.deleteProject(
      projectId,
      req.user!.userId,
    );
    sendMessage(res, result.message);
  } catch (error) {
    next(error);
  }
}

// Members
export async function listMembers(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const projectId = Number(req.params.projectId);
    const members = await projectService.listMembers(
      projectId,
      req.user!.userId,
    );
    sendSuccess(res, members);
  } catch (error) {
    next(error);
  }
}

export async function addMember(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const projectId = Number(req.params.projectId);
    const member = await projectService.addMember(
      projectId,
      req.body,
      req.user!.userId,
    );
    sendCreated(res, member);
  } catch (error) {
    next(error);
  }
}

export async function updateMember(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const projectId = Number(req.params.projectId);
    const memberId = Number(req.params.memberId);
    const member = await projectService.updateMember(
      projectId,
      memberId,
      req.body,
      req.user!.userId,
    );
    sendSuccess(res, member);
  } catch (error) {
    next(error);
  }
}

export async function removeMember(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const projectId = Number(req.params.projectId);
    const memberId = Number(req.params.memberId);
    const result = await projectService.removeMember(
      projectId,
      memberId,
      req.user!.userId,
    );
    sendMessage(res, result.message);
  } catch (error) {
    next(error);
  }
}
