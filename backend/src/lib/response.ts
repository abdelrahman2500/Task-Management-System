import type { Response } from "express";
import type { PaginatedResponse } from "./pagination";

export function sendSuccess<T>(res: Response, data: T, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

export function sendCreated<T>(res: Response, data: T) {
  return sendSuccess(res, data, 201);
}

export function sendMessage(res: Response, message: string, statusCode = 200) {
  return res.status(statusCode).json({ success: true, message });
}

export function sendPaginated<T>(
  res: Response,
  paginatedData: PaginatedResponse<T>,
  statusCode = 200,
) {
  return res.status(statusCode).json({
    success: true,
    data: paginatedData.data,
    pagination: paginatedData.pagination,
  });
}
