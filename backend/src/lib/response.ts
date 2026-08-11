import type { Response } from "express";

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
  data: T[],
  nextCursor: string | null,
  hasMore: boolean,
) {
  return res.status(200).json({
    success: true,
    data,
    page: { nextCursor, hasMore },
  });
}
