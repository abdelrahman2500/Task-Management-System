export type ErrorDetail = {
  field: string;
  message: string;
};

export class AppError extends Error {
  public details: ErrorDetail[] | undefined;

  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  withDetails(details: ErrorDetail[]): this {
    this.details = details;
    return this;
  }
}
