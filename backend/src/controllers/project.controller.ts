import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types";
import * as projectService from "../services/project.service";
import {
  sendSuccess,
  sendCreated,
  sendMessage,
  sendPaginated,
} from "../lib/response";
import { parsePaginationParams } from "../lib/pagination";

export async function listProjects(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { page, limit } = parsePaginationParams({
      page: req.query.page as string | undefined,
      limit: req.query.limit as string | undefined,
    });

    const result = await projectService.listProjects(
      req.user!.userId,
      page,
      limit,
    );
    sendPaginated(res, result);
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
    const { page, limit } = parsePaginationParams({
      page: req.query.page as string | undefined,
      limit: req.query.limit as string | undefined,
    });

    const result = await projectService.listMembers(
      projectId,
      req.user!.userId,
      page,
      limit,
    );
    sendPaginated(res, result);
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
