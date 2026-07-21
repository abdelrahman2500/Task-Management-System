import type { User } from "@prisma/client";
import type { Logger } from "pino";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      requestId?: string;
      log: Logger;
    }
  }
}

export {};
