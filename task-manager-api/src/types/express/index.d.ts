import type { Logger } from "pino";
import type { SafeUser } from "../../repositories/auth.repository.js";

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
      requestId?: string;
      log: Logger;
    }
  }
}

export {};
