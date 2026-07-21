import { AppError } from "./errors/app-error.js";

export function parseRequiredId(
  value: string | string[] | undefined,
  code: string,
  message: string,
): number {
  const rawValue = Array.isArray(value) ? value.join(",") : (value ?? "");
  const id = parseInt(rawValue, 10);

  if (isNaN(id)) {
    throw new AppError(400, code, message);
  }

  return id;
}
